export type UserType = 'Employee' | 'Customer' | 'Institution' | 1 | 2 | 3;
export interface PersonName { firstNames: string; paternalLastName: string; maternalLastName?: string | null; fullName: string; }
export interface User {
  id: string; name: PersonName; fullName: string; email: string;
  roleId: string; roleName: string; userType: UserType;
  profileId?: string | null; accountCategory: string;
  relatedProfileName?: string | null; relatedProfileType?: string | null;
  isActive: boolean; isEmailConfirmed: boolean; twoFactorEnabled: boolean;
  failedLoginAttempts: number; lockoutEnd?: string | null; lastLoginAt?: string | null; createdAt: string;
}
