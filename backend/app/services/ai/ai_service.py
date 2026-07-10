"""
AI Team Assistant service.

Uses the strategy pattern to interact with LLMs.
Uses VectorService to implement a production-grade RAG pipeline.
Provides:
- Team summary generator: aggregates submitted reports for a week and creates a summary.
- RAG Conversational Chat: queries the Pinecone vector database for relevant report context.
"""

import logging
from datetime import date, timedelta

from app.core.enums import ReportStatus
from app.models.user import User
from app.repositories.report_repository import ReportRepository
from app.services.ai.llm_strategy import LLMStrategy
from app.services.ai.vector_service import VectorService

logger = logging.getLogger(__name__)


class AIService:
    """
    Orchestrates LLM strategies and vector report context to answer queries.
    """

    def __init__(
        self,
        llm: LLMStrategy,
        report_repo: ReportRepository,
        vector_service: VectorService,
    ) -> None:
        self._llm = llm
        self._report_repo = report_repo
        self._vector_service = vector_service

    def _format_reports_for_llm(self, reports) -> str:
        """
        Helper to format database reports into structured markdown text for the LLM context.
        """
        if not reports:
            return "No report submissions found for this period."

        formatted_lines = []
        for r in reports:
            formatted_lines.append(f"### Report from {r.user.full_name} for Project '{r.project.name}'")
            formatted_lines.append(f"- **Week starting:** {r.week_start}")
            formatted_lines.append(f"- **Submission Status:** {r.status.value}")
            formatted_lines.append(f"- **Hours Worked:** {r.hours_worked if r.hours_worked is not None else 'N/A'}")
            
            # Tasks Completed
            completed_tasks = [t.description for t in r.tasks if t.task_type.value == "COMPLETED" or t.task_type == "COMPLETED"]
            formatted_lines.append("  - **Completed Tasks:**")
            if completed_tasks:
                for t in completed_tasks:
                    formatted_lines.append(f"    - {t}")
            else:
                formatted_lines.append("    - None reported")

            # Tasks Planned
            planned_tasks = [t.description for t in r.tasks if t.task_type.value == "PLANNED" or t.task_type == "PLANNED"]
            formatted_lines.append("  - **Planned Tasks:**")
            if planned_tasks:
                for t in planned_tasks:
                    formatted_lines.append(f"    - {t}")
            else:
                formatted_lines.append("    - None reported")

            # Blockers
            formatted_lines.append("  - **Blockers / Challenges:**")
            if r.blockers:
                for b in r.blockers:
                    status = "Resolved" if b.is_resolved else "UNRESOLVED"
                    formatted_lines.append(f"    - [{status}] {b.description}")
            else:
                formatted_lines.append("    - None reported")

            if r.notes:
                formatted_lines.append(f"  - **Notes:** {r.notes}")
            formatted_lines.append("")  # Empty spacer line

        return "\n".join(formatted_lines)

    async def generate_team_summary(self, week_start: date) -> str:
        """
        Aggregate submitted reports for the given week and generate an executive summary.
        """
        # Ensure week_start is normalized to Monday
        monday = week_start - timedelta(days=week_start.weekday())

        # Retrieve reports for exactly this week
        reports, _ = await self._report_repo.get_team_reports(
            week_start=monday,
            week_end=monday,
            limit=500,  # Safe limit for a single week's reports
        )

        # Exclude draft reports from executive summary
        submitted_reports = [r for r in reports if r.status != ReportStatus.DRAFT]

        # Format context
        context_data = self._format_reports_for_llm(submitted_reports)

        system_prompt = (
            "You are an expert AI Technical Lead and project management assistant.\n"
            "Your task is to analyze the weekly reports submitted by the team and write "
            "a professional, highly structured executive weekly summary for the manager.\n\n"
            "The summary must include the following sections:\n"
            "1. **Executive Overview**: A 3-4 sentence high-level summary of the week's overall progress.\n"
            "2. **Completed Milestones by Project**: Group completed tasks by project category and summarize key accomplishments.\n"
            "3. **Blockers & Risk Analysis**: List all UNRESOLVED blockers, who is impacted, and potential risks to timelines.\n"
            "4. **Resource Allocation & Hours**: A brief summary of workload distribution and hours worked.\n"
            "5. **Upcoming Plans**: Key objectives and planned tasks for next week.\n\n"
            "Keep the tone professional, objective, and action-oriented. Use clear markdown formatting."
        )

        user_message = (
            f"Here are the team report submissions for the week starting on {monday}:\n\n"
            f"{context_data}\n\n"
            f"Please generate the executive summary based on this data."
        )

        logger.info("Generating AI weekly summary for week starting %s", monday)
        return await self._llm.generate(system_prompt, user_message)

    async def chat(self, query: str, manager: User) -> str:
        """
        Answer questions about team reports using RAG semantic retrieval from VectorService.
        """
        # 1. Retrieve semantically matching reports from Pinecone / Local cache
        similar_docs = await self._vector_service.query_similar(query, limit=8)
        
        if similar_docs:
            # Construct context from semantic matches
            context_blocks = []
            for doc in similar_docs:
                meta = doc["metadata"]
                context_blocks.append(
                    f"--- SEMANTIC MATCH (Report ID: {doc['id']}, Score: {doc.get('score', 1.0):.2f}) ---\n"
                    f"Report author: {meta.get('user_name', 'Unknown')}\n"
                    f"Project category: {meta.get('project_name', 'Uncategorized')}\n"
                    f"Week starting: {meta.get('week_start', '')}\n"
                    f"Content:\n{doc['text']}\n"
                )
            context_data = "\n".join(context_blocks)
            logger.info("RAG Context generated from %s semantic vector matches", len(similar_docs))
        else:
            # 2. Database Fallback (if vector cache is clean or Pinecone is not indexing yet)
            logger.warning("RAG vector index returned no matches. Falling back to direct database retrieval.")
            reports, _ = await self._report_repo.get_team_reports(
                status=None,
                limit=30,
            )
            submitted_reports = [r for r in reports if r.status != ReportStatus.DRAFT]
            context_data = self._format_reports_for_llm(submitted_reports)

        system_prompt = (
            "You are 'Antigravity AI Assistant', an expert team coordination assistant.\n"
            "You help managers analyze team reports, task items, workload, and blocker metrics.\n\n"
            "Guidelines:\n"
            "- You have access to recent report submissions from the team in the RAG context below.\n"
            "- Answer the user's question accurately, citing specific team members or projects where relevant.\n"
            "- Keep answers concise, factual, and formatted in clear markdown.\n"
            "- If the query asks about information not present in the provided reports, "
            "politely state that the current reports do not contain that information.\n"
            "- Never disclose password hashes or personal auth details."
        )

        user_message = (
            f"Here is the context of recent team reports retrieved for this query:\n\n"
            f"{context_data}\n\n"
            f"User Query: {query}\n\n"
            f"Please answer the query using the context above."
        )

        logger.info("Processing AI Chat query by manager: %s", manager.email)
        return await self._llm.generate(system_prompt, user_message)
