// ──────────────────────────────────────────────────────────────────────────────
// ProjectsPage — Manager dashboard to audit and handle project categories
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, FolderKanban } from "lucide-react";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-display/data-table";
import { ProjectFormModal } from "./project-form-modal";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { formatDate } from "@/lib/date-utils";
import { toast } from "@/components/ui/toast";
import type { Project } from "@/types";

export function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const deleteMutation = useDeleteProject();

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

  // Define table columns
  const columns = [
    {
      key: "name",
      header: "Project / Category Name",
      sortable: true,
      cellClassName: "font-medium text-slate-900 dark:text-slate-100",
    },
    {
      key: "description",
      header: "Description",
      render: (project: Project) => (
        <span className="text-slate-500 dark:text-slate-400 max-w-xs block truncate" title={project.description || ""}>
          {project.description || "—"}
        </span>
      ),
    },
    {
      key: "color_hex",
      header: "Color Tag",
      render: (project: Project) => (
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-black/10 shrink-0"
            style={{ backgroundColor: project.color_hex }}
          />
          <span className="text-xs font-mono font-medium uppercase text-slate-500">
            {project.color_hex}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created Date",
      sortable: true,
      render: (project: Project) => <span>{formatDate(project.created_at)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cellClassName: "text-right",
      headerClassName: "text-right",
      render: (project: Project) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(project)}
            className="text-slate-500 hover:text-indigo-600 h-8 w-8 p-0"
            title="Edit project"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(project.id)}
            className="text-slate-500 hover:text-red-600 h-8 w-8 p-0"
            title="Delete project"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Project Categories"
        subtitle="Manage and define color-tagged project categories for weekly report tracking."
        action={
          <Button variant="primary" onClick={handleAddClick} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </Button>
        }
      />

      {/* Projects Table */}
      <DataTable
        columns={columns}
        data={(projects as any) || []}
        keyExtractor={(p) => p.id}
        loading={isLoading}
        emptyTitle="No project categories"
        emptyDescription="Create project categories so team members can assign weekly reports to specific projects."
        emptyAction={
          <Button variant="primary" onClick={handleAddClick} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            Add First Project
          </Button>
        }
      />

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
