export interface InstitutionDashboard { institution:{id:string;name:string;institutionType:string}; orders:number;licenses:number;availableLicenses:number;devices:number;members:number;groups:number; }
export interface InstitutionGroup {id:string;name:string;description?:string|null;teacherMemberId?:string|null;teacherName?:string|null;isActive:boolean;}
export interface InstitutionMember {id:string;memberType:'Student'|'Teacher';fullName:string;email:string;enrollmentOrEmployeeNumber?:string|null;groupId?:string|null;groupName?:string|null;isActive:boolean;}
export interface VoltsDevice {id:string;serialNumber:string;productName:string;productImageUrl?:string|null;assemblyMode:'ReadyToUse'|'DiyKit'|'WorkshopAssist';status:string;licenseId:string;assignedMemberId?:string|null;assignedMemberName?:string|null;createdAt:string;}


