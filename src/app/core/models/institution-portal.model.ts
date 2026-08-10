export interface InstitutionDashboard {
  institution: { id: string; name: string; institutionType: string };
  orders: number;
  licenses: number;
  availableLicenses: number;
  assignedLicenses: number;
  devices: number;
  assignedDevices: number;
  members: number;
  groups: number;
}

export interface InstitutionGroup {
  id: string;
  name: string;
  description?: string | null;
  teacherMemberId?: string | null;
  teacherName?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface InstitutionMember {
  id: string;
  memberType: 'Student' | 'Teacher';
  fullName: string;
  email: string;
  enrollmentOrEmployeeNumber?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface VoltsDevice {
  id: string;
  serialNumber: string;
  productId?: string;
  productName: string;
  productImageUrl?: string | null;
  assemblyMode: 'ReadyToUse' | 'DiyKit' | 'WorkshopAssist';
  status: string;
  licenseId: string;
  assignedMemberId?: string | null;
  assignedMemberName?: string | null;
  assignedAt?: string | null;
  createdAt: string;
}
