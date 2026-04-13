export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectPayload {
  name: string;
  slug: string;
  description?: string | null;
}
