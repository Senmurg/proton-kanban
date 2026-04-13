import { apiRequestWithToken } from '../../lib/api';
import type { Project, ProjectPayload } from './project-types';

export function listProjects(token: string): Promise<Project[]> {
  return apiRequestWithToken<Project[]>('/api/v1/projects', token);
}

export function getProject(token: string, projectId: string): Promise<Project> {
  return apiRequestWithToken<Project>(`/api/v1/projects/${projectId}`, token);
}

export function createProject(token: string, payload: ProjectPayload): Promise<Project> {
  return apiRequestWithToken<Project>('/api/v1/projects', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProject(token: string, projectId: string, payload: Partial<ProjectPayload>): Promise<Project> {
  return apiRequestWithToken<Project>(`/api/v1/projects/${projectId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteProject(token: string, projectId: string): Promise<void> {
  return apiRequestWithToken<void>(`/api/v1/projects/${projectId}`, token, {
    method: 'DELETE',
  });
}
