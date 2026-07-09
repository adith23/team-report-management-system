// ──────────────────────────────────────────────────────────────────────────────
// ProjectFormModal — Modal form to create or edit a project
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { toast } from "@/components/ui/toast";
import type { Project } from "@/types";

// ── Zod Validation Schema ────────────────────────────────────────────────────
const projectFormSchema = zod.object({
  name: zod.string().min(1, "Project name is required").max(50, "Name must be under 50 characters"),
  description: zod.string().max(200, "Description must be under 200 characters").nullable().optional(),
  color_hex: zod
    .string()
    .min(4, "Invalid color format")
    .max(7, "Invalid color format")
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code (e.g. #4f46e5)"),
});

type ProjectFormValues = zod.infer<typeof projectFormSchema>;

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass project in edit mode */
  project?: Project | null;
}

const DEFAULT_COLORS = [
  "#4f46e5", // Indigo
  "#0d9488", // Teal
  "#0ea5e9", // Sky
  "#e11d48", // Rose
  "#d97706", // Amber
  "#2563eb", // Blue
  "#16a34a", // Green
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#4b5563", // Gray
];

export function ProjectFormModal({ open, onClose, project }: ProjectFormModalProps) {
  const isEdit = !!project;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(project?.id || "");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color_hex: "#4f46e5",
    },
  });

  // Reset form when project changes or modal opens
  useEffect(() => {
    if (open) {
      if (project) {
        reset({
          name: project.name,
          description: project.description || "",
          color_hex: project.color_hex || "#4f46e5",
        });
      } else {
        // Pick a random default color for new projects
        const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
        reset({
          name: "",
          description: "",
          color_hex: randomColor,
        });
      }
    }
  }, [open, project, reset]);

  const onSubmit = (data: ProjectFormValues) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      color_hex: data.color_hex,
    };

    if (isEdit && project) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Project updated successfully!");
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update project.");
        },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Project created successfully!");
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to create project.");
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Project" : "Add Project"}
      description={isEdit ? "Update this project's information" : "Create a new project category for weekly reports"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Project Name */}
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormField label="Project Name" error={errors.name?.message} required>
              <Input
                placeholder="e.g. Client A / System Engineering"
                disabled={isSubmitting}
                {...field}
              />
            </FormField>
          )}
        />

        {/* Project Description */}
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormField label="Description (optional)" error={errors.description?.message}>
              <Textarea
                placeholder="Briefly describe the purpose of this project category..."
                disabled={isSubmitting}
                rows={3}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </FormField>
          )}
        />

        {/* Project Color Hex */}
        <Controller
          control={control}
          name="color_hex"
          render={({ field }) => (
            <FormField label="Theme Color" error={errors.color_hex?.message} required>
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  {/* Hex text input */}
                  <Input
                    placeholder="#4f46e5"
                    disabled={isSubmitting}
                    className="w-32 uppercase font-mono"
                    {...field}
                  />
                  {/* Visual color preview picker */}
                  <div
                    className="h-10 w-10 rounded-lg border border-[hsl(var(--border))] shadow-inner"
                    style={{ backgroundColor: field.value }}
                  />
                </div>

                {/* Color swatches presets */}
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className="h-7 w-7 rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-sm shrink-0"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </FormField>
          )}
        />

        {/* Modal Actions footer */}
        <ModalFooter className="px-0 pb-0 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            {isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
