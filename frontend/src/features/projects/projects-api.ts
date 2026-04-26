import { apiRequestWithToken } from '../../lib/api';
import type {
  Project,
  ProjectMember,
  ProjectMemberPayload,
  ProjectMemberRolePayload,
  ProjectPayload,
} from './project-types';

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

export function listProjectMembers(token: string, projectId: string): Promise<ProjectMember[]> {
  return apiRequestWithToken<ProjectMember[]>(`/api/v1/projects/${projectId}/members`, token);
}

export function addProjectMember(token: string, projectId: string, payload: ProjectMemberPayload): Promise<ProjectMember> {
  return apiRequestWithToken<ProjectMember>(`/api/v1/projects/${projectId}/members`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProjectMemberRole(
  token: string,
  projectId: string,
  memberId: string,
  payload: ProjectMemberRolePayload,
): Promise<ProjectMember> {
  return apiRequestWithToken<ProjectMember>(`/api/v1/projects/${projectId}/members/${memberId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function removeProjectMember(token: string, projectId: string, memberId: string): Promise<void> {
  return apiRequestWithToken<void>(`/api/v1/projects/${projectId}/members/${memberId}`, token, {
    method: 'DELETE',
  });
}
