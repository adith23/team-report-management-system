// ──────────────────────────────────────────────────────────────────────────────
// AIChatPage — Conversational Q&A panel and weekly summaries generator
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { startOfWeek, endOfWeek, format, subWeeks } from "date-fns";
import { useAIChat, useWeeklySummary } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getCurrentWeekStart } from "@/lib/date-utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What did the design team work on last week?",
  "Summarize the blockers related to Client Portal Redesign.",
  "Who completed the most tasks and logged how many hours?",
  "Are there any unresolved blocker challenges?",
];

// Custom formatting logic for LLM Markdown output without extra libraries
function renderMarkdownContent(text: string) {
  if (!text) return null;

  return text.split("\n").map((line, idx) => {
    let content = line;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Resolve **bold** tags inline
    while ((match = boldRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {match[1]}
        </strong>,
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    const inlineContent = parts.length > 0 ? parts : content;

    // Bullet Lists
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const cleanText = line.trim().substring(2);
      return (
        <li
          key={idx}
          className="ml-4 list-disc text-slate-350 pl-1 py-0.5 text-xs sm:text-sm"
        >
          {parts.length > 0 ? parts : cleanText}
        </li>
      );
    }

    // Numbered Lists
    if (/^\d+\.\s/.test(line.trim())) {
      const matchNum = line.trim().match(/^(\d+)\.\s(.*)/);
      const cleanText = matchNum ? matchNum[2] : line;
      return (
        <li
          key={idx}
          className="ml-4 list-decimal text-slate-350 pl-1 py-0.5 text-xs sm:text-sm"
        >
          {parts.length > 0 ? parts : cleanText}
        </li>
      );
    }

    // Sub-headings (H4)
    if (line.trim().startsWith("### ")) {
      return (
        <h4
          key={idx}
          className="text-xs font-bold text-slate-200 mt-4 mb-1.5 uppercase tracking-wider"
        >
          {line.trim().substring(4)}
        </h4>
      );
    }

    // Main headings (H3)
    if (line.trim().startsWith("## ")) {
      return (
        <h3
          key={idx}
          className="text-sm font-bold text-slate-100 mt-5 mb-2 border-b border-[#21222d] pb-1"
        >
          {line.trim().substring(3)}
        </h3>
      );
    }

    // Empty Lines
    if (line.trim() === "") {
      return <div key={idx} className="h-2" />;
    }

    // Normal paragraph text
    return (
      <p
        key={idx}
        className="text-xs sm:text-sm text-slate-300 leading-relaxed py-0.5"
      >
        {inlineContent}
      </p>
    );
  });
}

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🤖 **Welcome to Antigravity AI Assistant!**\n\nI can retrieve, analyze, and query your team's weekly reports using semantic vector search. Try asking a question or generate an AI executive summary on the side panel.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [summaryWeek, setSummaryWeek] = useState(getCurrentWeekStart());

  const chatMutation = useAIChat();
  const {
    data: summaryData,
    isLoading: loadingSummary,
    isRefetching: refetchingSummary,
    refetch: refetchSummary,
  } = useWeeklySummary(summaryWeek);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest chat item
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  // Submit chat query
  const handleSend = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;

    const newMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");

    chatMutation.mutate(
      { message: text },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response },
          ]);
        },
        onError: (err) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `❌ **Error querying AI:** ${err.message || "Failed to retrieve response."}`,
            },
          ]);
        },
      },
    );
  };

  // Generate week ranges dropdown list (last 8 weeks)
  const weekOptions = (() => {
    const options = [];
    const today = new Date();
    const currentMonday = startOfWeek(today, { weekStartsOn: 1 });
    for (let i = 0; i < 8; i++) {
      const monday = subWeeks(currentMonday, i);
      const sunday = endOfWeek(monday, { weekStartsOn: 1 });
      const isoString = format(monday, "yyyy-MM-dd");
      const label = `${format(monday, "MMM d")} - ${format(sunday, "MMM d, yyyy")}`;
      options.push({ value: isoString, label });
    }
    return options;
  })();

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 p-6 space-y-6 flex flex-col">
      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center justify-between border-b border-[#21222d] pb-4">
        <div>
          <nav className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span>Member Workspace</span>
            <span>/</span>
            <span className="text-slate-300">AI Assistant</span>
          </nav>
        </div>
      </div>

      {/* Main Grid: Chat Box (Left) & Summary Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
        {/* LEFT COLUMN: RAG Chat Assistant (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-[#15161e] border border-[#21222d] rounded-2xl overflow-hidden h-[600px]">
          {/* Box Header */}
          <div className="px-6 py-4 border-b border-[#21222d] flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Conversational Q&A Assistant
            </h3>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={index}
                  className={`flex gap-3.5 ${isAssistant ? "items-start" : "items-start justify-end"}`}
                >
                  {isAssistant && (
                    <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/25 text-blue-500 shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm ${
                      isAssistant
                        ? "bg-[#1c1d26] border border-[#2c2d3c] text-slate-200"
                        : "bg-blue-600 text-white rounded-tr-none shadow-md font-medium"
                    }`}
                  >
                    <div className="space-y-1.5">
                      {renderMarkdownContent(msg.content)}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300 shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI responding typing loader */}
            {chatMutation.isPending && (
              <div className="flex gap-3.5 items-start">
                <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/25 text-blue-500 shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-[#1c1d26] border border-[#2c2d3c] rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-slate-400">
                    Assistant is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          {messages.length === 1 && (
            <div className="px-6 py-2 bg-[#1a1b24]/40 border-t border-[#21222d] space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Try Asking:
              </p>
              <div className="flex flex-wrap gap-2 pb-1">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[10px] font-semibold bg-[#1c1d26] hover:bg-blue-600 text-slate-400 hover:text-white border border-[#2c2d3c] hover:border-blue-600 rounded-full px-3 py-1.5 transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input text form */}
          <div className="p-4 border-t border-[#21222d] bg-[#171821]/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask questions about team activity, blockers, or workload..."
                disabled={chatMutation.isPending}
                className="flex-1 bg-[#1c1d26] border border-[#2c2d3c] text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || chatMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 px-4 rounded-xl shrink-0 cursor-pointer transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Executive Summary Widget (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-[#15161e] border border-[#21222d] rounded-2xl overflow-hidden h-[600px]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#21222d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Executive Summary
              </h3>
            </div>
            {(loadingSummary || refetchingSummary) && <Spinner size="sm" />}
          </div>

          {/* Selector filters */}
          <div className="px-6 py-3 border-b border-[#21222d] bg-[#1a1b24]/40 flex items-center justify-between gap-2">
            <select
              value={summaryWeek}
              onChange={(e) => setSummaryWeek(e.target.value)}
              className="bg-[#1c1d26] border border-[#2c2d3c] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer flex-1"
            >
              {weekOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => refetchSummary()}
              disabled={loadingSummary || refetchingSummary}
              className="h-7 w-7 rounded-lg border border-[#2c2d3c] hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Regenerate summary"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loadingSummary || refetchingSummary ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Markdown Content Panel */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {loadingSummary && !refetchingSummary ? (
              <div className="space-y-4">
                <div className="h-4 bg-slate-800 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-slate-800 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-800 rounded w-5/6 animate-pulse" />
                <div className="h-3 bg-slate-800 rounded w-4/5 animate-pulse" />
                <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse pt-6" />
                <div className="h-3 bg-slate-800 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-800 rounded w-full animate-pulse" />
              </div>
            ) : !summaryData?.summary ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <FileText className="h-10 w-10 text-slate-600" />
                <p className="text-xs">
                  No reports submitted for this week range.
                </p>
              </div>
            ) : (
              <div className="space-y-2 select-text selection:bg-blue-500/40">
                {renderMarkdownContent(summaryData.summary)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
