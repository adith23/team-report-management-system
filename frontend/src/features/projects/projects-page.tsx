// ──────────────────────────────────────────────────────────────────────────────
// ProjectsPage — Manager dashboard to audit and handle project categories
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { useTeamReports } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { ProjectFormModal } from "./project-form-modal";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { Project } from "@/types";

export function ProjectsPage() {
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: reportsData } = useTeamReports({ limit: 1000 });
  const deleteMutation = useDeleteProject();

  const reports = reportsData?.items || [];

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Confirm Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddClick = () => {
    setSelectedProject(null);
    setModalOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;

    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Project deleted successfully!");
        setDeleteId(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete project.");
      },
    });
  };

  // Helper to count submitted reports linked to a project
  const countLinkedReports = (projectId: string) => {
    return reports.filter(
      (r) =>
        r.project_id === projectId &&
        (r.status === "SUBMITTED" || r.status === "LATE"),
    ).length;
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 p-6 space-y-6">
      {/* Title Header Row (Add Project aligned on right) */}
      <div className="flex items-center justify-between border-b border-[#21222d] pb-4">
        <h2 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          Active Projects / Categories
        </h2>
        <Button
          variant="secondary"
          onClick={handleAddClick}
          className="bg-transparent border border-[#2c2d3c] hover:bg-slate-800 text-slate-300 hover:text-white text-xs px-3 py-1.5 h-8 rounded-lg cursor-pointer transition-colors"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Project
        </Button>
      </div>

      {/* Project Cards Grid */}
      {loadingProjects ? (
        <div className="py-24 flex justify-center">
          <Spinner />
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="bg-[#15161e] border border-[#21222d] rounded-2xl p-12 text-center text-slate-500">
          <p className="text-sm">No project categories found.</p>
          <Button
            variant="primary"
            onClick={handleAddClick}
            className="mt-4 bg-[#5c59f0] hover:bg-[#4b48d9] text-white text-xs"
          >
            Add First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const reportCount = countLinkedReports(project.id);
            return (
              <div
                key={project.id}
                className="group relative bg-[#15161e] border border-[#21222d] hover:border-slate-700/60 rounded-2xl p-7 transition-all duration-200 shadow-sm flex flex-col justify-between h-[190px]"
              >
                {/* Edit & Delete hover icons */}
                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEditClick(project)}
                    className="h-6 w-6 rounded bg-[#1c1d26] border border-[#2c2d3c] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Edit project"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(project.id)}
                    className="h-6 w-6 rounded bg-[#1c1d26] border border-[#2c2d3c] text-slate-400 hover:text-red-500 flex items-center justify-center cursor-pointer transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Top Section: Name and Dot */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 pr-12">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color_hex }}
                    />
                    <h3
                      className="font-semibold text-sm text-slate-100 truncate"
                      title={project.name}
                    >
                      {project.name}
                    </h3>
                  </div>

                  {/* Middle Section: Description */}
                  <p className="text-xs text-slate-400 font-medium line-clamp-4 leading-relaxed">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                {/* Bottom Section: Submission counter */}
                <div className="pt-4 border-t border-[#21222d]/40">
                  <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                    {reportCount} submitted report{reportCount !== 1 ? "s" : ""}{" "}
                    linked
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        project={selectedProject}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project Category"
        description="Are you sure you want to delete this project category? This will soft-delete the project category but will keep all historical report references."
        destructive
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
