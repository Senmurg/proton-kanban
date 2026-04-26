export type ProjectRole = 'owner' | 'manager' | 'member' | 'viewer';

export interface ProjectPermissions {
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_manage_members: boolean;
}

export interface ProjectMemberUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export interface ProjectMember {
  id: string;
  role: ProjectRole;
  user: ProjectMemberUser;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  current_user_role: ProjectRole;
  permissions: ProjectPermissions;
  created_at: string;
  updated_at: string;
}

export interface ProjectPayload {
  name: string;
  slug: string;
  description?: string | null;
}

export interface ProjectMemberPayload {
  email: string;
  role: Exclude<ProjectRole, 'owner'>;
}

export interface ProjectMemberRolePayload {
  role: Exclude<ProjectRole, 'owner'>;
}
