// Report Types — Weekly report entity and related CRUD shapes

import { ReportStatus, TaskType } from "./common";

/** A single task entry within a report */
export interface TaskItem {
  description: string;
  task_type: TaskType;
}

/** A single blocker entry within a report */
export interface BlockerItem {
  description: string;
  is_resolved: boolean;
}

/** Full report entity as returned by the API */
export interface Report {
  id: string;
  user_id: string;
  user_full_name: string;
  project_id: string;
  project_name: string;
  week_start: string; // ISO date (YYYY-MM-DD)
  week_end: string;
  status: ReportStatus;
  tasks_completed: TaskItem[];
  tasks_planned: TaskItem[];
  blockers: BlockerItem[];
  hours_worked: number | null;
  notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** POST /reports request body */
export interface ReportCreate {
  project_id: string;
  week_start: string;
  tasks_completed: TaskItem[];
  tasks_planned: TaskItem[];
  blockers: BlockerItem[];
  hours_worked?: number | null;
  notes?: string | null;
}

/** PUT /reports/:id request body — all fields optional */
export interface ReportUpdate extends Partial<ReportCreate> {
  status?: ReportStatus;
}

/** Query parameters for filtering team reports (manager view) */
export interface ReportFilters {
  week_start?: string;
  week_end?: string;
  user_id?: string;
  project_id?: string;
  status?: ReportStatus;
  page?: number;
  page_size?: number;
}
