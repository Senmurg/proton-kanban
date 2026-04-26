import type { ProjectRole } from './project-types';

const ownerManagedRoles: Exclude<ProjectRole, 'owner'>[] = ['manager', 'member', 'viewer'];
const managerManagedRoles: Exclude<ProjectRole, 'owner'>[] = ['member', 'viewer'];

export function getAssignableRoles(role: ProjectRole | undefined): Exclude<ProjectRole, 'owner'>[] {
  if (role === 'owner') {
    return ownerManagedRoles;
  }
  if (role === 'manager') {
    return managerManagedRoles;
  }
  return [];
}

export function canManageMemberRole(actorRole: ProjectRole | undefined, targetRole: ProjectRole): boolean {
  if (actorRole === 'owner') {
    return targetRole !== 'owner';
  }
  if (actorRole === 'manager') {
    return targetRole === 'member' || targetRole === 'viewer';
  }
  return false;
}

export function canRemoveMember(
  actorRole: ProjectRole | undefined,
  targetRole: ProjectRole,
  isSelf: boolean,
): boolean {
  if (isSelf && targetRole !== 'owner') {
    return true;
  }
  return canManageMemberRole(actorRole, targetRole);
}
