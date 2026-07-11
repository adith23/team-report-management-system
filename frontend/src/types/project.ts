// Project Types — Project/category entity and CRUD shapes

import { User } from "./auth";

/** Project entity as returned by the API */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  color_hex: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_users?: User[];
}

/** POST /projects request body */
export interface ProjectCreate {
  name: string;
  description?: string | null;
  color_hex?: string;
  assigned_user_ids?: string[];
}

/** PUT /projects/:id request body — all fields optional */
export interface ProjectUpdate extends Partial<ProjectCreate> {}

/** POST /projects/:id/assign request body */
export interface ProjectAssignmentRequest {
  user_ids: string[];
}
