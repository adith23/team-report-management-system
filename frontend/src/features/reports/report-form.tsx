// ──────────────────────────────────────────────────────────────────────────────
// ReportForm — Create and edit weekly report form component
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Save, Send, ArrowLeft } from "lucide-react";
import {
  useReport,
  useCreateReport,
  useUpdateReport,
  useSubmitReport,
} from "@/hooks/use-reports";
import { useProjects } from "@/hooks/use-projects";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { WeekPicker } from "@/components/forms/week-picker";
import { ProjectSelect } from "@/components/forms/project-select";
import { DynamicFieldList, type DynamicFieldItem } from "@/components/forms/dynamic-field-list";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { getCurrentWeekStart } from "@/lib/date-utils";
import { ROUTES } from "@/lib/constants";
import { TaskType, ReportStatus } from "@/types/common";
import type { ReportCreate, ReportUpdate } from "@/types";

// ── Zod Validation Schema ────────────────────────────────────────────────────
const reportSchema = zod.object({
  week_start: zod.string().min(1, "Week selection is required"),
  project_id: zod.string().min(1, "Project selection is required"),
  hours_worked: zod
    .number({ message: "Hours worked must be a number" })
    .min(0, "Hours worked cannot be negative")
    .max(168, "Hours worked cannot exceed weekly limit")
    .nullable()
    .optional(),
  notes: zod.string().nullable().optional(),
});

type ReportFormValues = zod.infer<typeof reportSchema>;

interface ReportFormProps {
  mode: "create" | "edit";
  reportId?: string;
}

export function ReportForm({ mode, reportId }: ReportFormProps) {
  const router = useRouter();
  const { data: projectList } = useProjects();

  // API query (edit mode)
  const { data: existingReport, isLoading: isReportLoading } = useReport(reportId || "");

  // Mutations
  const createMutation = useCreateReport();
  const updateMutation = useUpdateReport(reportId || "");
  const submitMutation = useSubmitReport();

  // Dynamic field states (not bound directly to simple inputs)
  const [tasksCompleted, setTasksCompleted] = useState<DynamicFieldItem[]>([{ value: "" }]);
  const [tasksPlanned, setTasksPlanned] = useState<DynamicFieldItem[]>([{ value: "" }]);
  const [blockers, setBlockers] = useState<DynamicFieldItem[]>([]);

  // Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      week_start: getCurrentWeekStart(),
      project_id: "",
      hours_worked: null,
      notes: "",
    },
  });

  // ── Populate form state on edit mode load ──────────────────────────────────
  useEffect(() => {
    if (mode === "edit" && existingReport) {
      // Set simple fields
      reset({
        week_start: existingReport.week_start,
        project_id: existingReport.project_id,
        hours_worked: existingReport.hours_worked,
        notes: existingReport.notes || "",
      });

      // Set completed tasks, planned tasks, and blockers asynchronously
      // to avoid React 19 cascading renders lint warnings.
      setTimeout(() => {
        setTasksCompleted(
          existingReport.tasks_completed.length > 0
            ? existingReport.tasks_completed.map((t) => ({ value: t.description }))
            : [{ value: "" }]
        );

        setTasksPlanned(
          existingReport.tasks_planned.length > 0
            ? existingReport.tasks_planned.map((t) => ({ value: t.description }))
            : [{ value: "" }]
        );

        setBlockers(
          existingReport.blockers.map((b) => ({
            value: b.description,
            meta: { is_resolved: b.is_resolved },
          }))
        );
      }, 0);
    }
  }, [mode, existingReport, reset]);

  // ── Transform form states into API DTO structure ──────────────────────────
  const preparePayload = (data: ReportFormValues): ReportCreate => {
    return {
      project_id: data.project_id,
      week_start: data.week_start,
      tasks_completed: tasksCompleted
        .filter((t) => t.value.trim() !== "")
        .map((t) => ({
          description: t.value.trim(),
          task_type: TaskType.COMPLETED,
        })),
      tasks_planned: tasksPlanned
        .filter((t) => t.value.trim() !== "")
        .map((t) => ({
          description: t.value.trim(),
          task_type: TaskType.PLANNED,
        })),
      blockers: blockers
        .filter((b) => b.value.trim() !== "")
        .map((b) => ({
          description: b.value.trim(),
          is_resolved: !!b.meta?.is_resolved,
        })),
      hours_worked: data.hours_worked || null,
      notes: data.notes || null,
    };
  };

  // ── Validation checks ──────────────────────────────────────────────────────
  const validateDynamicLists = (): boolean => {
    const activeCompleted = tasksCompleted.filter((t) => t.value.trim() !== "");
    const activePlanned = tasksPlanned.filter((t) => t.value.trim() !== "");

    if (activeCompleted.length === 0) {
      toast.error("Please add at least one completed task.");
      return false;
    }
    if (activePlanned.length === 0) {
      toast.error("Please add at least one planned task for next week.");
      return false;
    }
    return true;
  };

  // ── Action: Save as Draft ────────────────────────────────────────────────
  const onSaveDraft = async (formValues: ReportFormValues) => {
    if (!validateDynamicLists()) return;
    const payload = preparePayload(formValues);

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: (newReport) => {
          toast.success("Draft saved successfully!");
          router.push(ROUTES.REPORT_EDIT(newReport.id));
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save draft.");
        },
      });
    } else {
      updateMutation.mutate(payload as ReportUpdate, {
        onSuccess: () => {
          toast.success("Draft updated successfully!");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update draft.");
        },
      });
    }
  };

  // ── Action: Submit Report ────────────────────────────────────────────────
  const onSubmitReport = async (formValues: ReportFormValues) => {
    if (!validateDynamicLists()) return;
    const payload = preparePayload(formValues);

    const performSubmission = (id: string) => {
      submitMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Report submitted successfully!");
          router.push(ROUTES.REPORTS);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to submit report.");
        },
      });
    };

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: (newReport) => {
          performSubmission(newReport.id);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save draft before submission.");
        },
      });
    } else {
      updateMutation.mutate(payload as ReportUpdate, {
        onSuccess: (updatedReport) => {
          performSubmission(updatedReport.id);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save changes before submission.");
        },
      });
    }
  };

  // Show loading spinner if fetching report details
  if (mode === "edit" && isReportLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || submitMutation.isPending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header and Back Link */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <PageHeader
        title={mode === "create" ? "Create Weekly Report" : "Edit Weekly Report"}
        subtitle="Report your weekly metrics, tasks, planned activities, and blocker details."
      />

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6 shadow-sm">
        {/* Row: Week Range & Project Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Week Selector */}
          <Controller
            control={control}
            name="week_start"
            render={({ field }) => (
              <FormField
                label="Week / Date Range"
                error={errors.week_start?.message}
                required
              >
                <WeekPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting || mode === "edit"} // Lock week change on editing to maintain integrity
                />
              </FormField>
            )}
          />

          {/* Project Dropdown */}
          <Controller
            control={control}
            name="project_id"
            render={({ field }) => (
              <ProjectSelect
                label="Project / Category"
                error={errors.project_id?.message}
                disabled={isSubmitting}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Dynamic List: Tasks Completed */}
        <div className="border-t border-[hsl(var(--border))] pt-6 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider">
              Tasks Completed
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Highlight the main features or fixes implemented this week.
            </p>
          </div>
          <DynamicFieldList
            items={tasksCompleted}
            onChange={setTasksCompleted}
            placeholder="Describe what you completed..."
            addLabel="Add Task"
            minItems={1}
            disabled={isSubmitting}
          />
        </div>

        {/* Dynamic List: Tasks Planned */}
        <div className="border-t border-[hsl(var(--border))] pt-6 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider">
              Tasks Planned for Next Week
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Specify your core focuses and planned tasks for next week.
            </p>
          </div>
          <DynamicFieldList
            items={tasksPlanned}
            onChange={setTasksPlanned}
            placeholder="Describe planned task..."
            addLabel="Add Task"
            minItems={1}
            disabled={isSubmitting}
          />
        </div>

        {/* Dynamic List: Blockers */}
        <div className="border-t border-[hsl(var(--border))] pt-6 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider">
              Blockers / Challenges
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Detail any blockers, dependency challenges, or issues requiring assistance.
            </p>
          </div>
          <DynamicFieldList
            items={blockers}
            onChange={setBlockers}
            placeholder="Describe the blocker..."
            addLabel="Add Blocker"
            showCheckbox
            checkboxLabel="Resolved"
            checkboxMetaKey="is_resolved"
            disabled={isSubmitting}
          />
        </div>

        {/* Optionals: Hours Worked & Notes */}
        <div className="border-t border-[hsl(var(--border))] pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Controller
              control={control}
              name="hours_worked"
              render={({ field }) => (
                <FormField
                  label="Hours Worked (optional)"
                  error={errors.hours_worked?.message}
                >
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 40"
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? null : parseFloat(e.target.value);
                      field.onChange(val);
                    }}
                  />
                </FormField>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <FormField
                  label="Notes / Links (optional)"
                  error={errors.notes?.message}
                >
                  <Textarea
                    placeholder="Provide context, pull request links, or deploy URLs..."
                    maxCharacters={500}
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormField>
              )}
            />
          </div>
        </div>

        {/* Footer Submit / Save actions */}
        <div className="border-t border-[hsl(var(--border))] pt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit(onSaveDraft)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit(onSubmitReport)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Send className="h-4 w-4" />
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
}
