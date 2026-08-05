import { UserRole } from './auth.model';

export interface BackofficeMenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  permission?: string;
  exact?: boolean;
}

export interface BackofficeMenuGroup {
  title: string;
  items: BackofficeMenuItem[];
}
