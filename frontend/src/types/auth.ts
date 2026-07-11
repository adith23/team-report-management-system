// Auth Types — User entity and authentication request/response shapes

import { UserRole } from "./common";

/** User entity as returned by the API */
export interface User {
  id: string; // UUID
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string; // ISO 8601 datetime
}

/** POST /auth/login request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/register request body */
export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
}
