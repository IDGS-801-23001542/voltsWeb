export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface PermissionDefinition {
  code: string;
  group: string;
  label: string;
  description: string;
  allowedRoleNames: string[];
}
