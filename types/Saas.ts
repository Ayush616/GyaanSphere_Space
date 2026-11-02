export interface LibraryBranch {
  id: string;
  name: string; // e.g., "GyaanSphere Library - Main Branch"
  ownerName: string; // e.g., "Ayush Jaiswal"
  ownerEmail: string;
  mobile: string;
  address: string;
  city: string;
  totalSeats: number;
  operatingHours: string;
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
}

export interface SaaSUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'library_owner' | 'library_staff';
  libraryId?: string; // Links owner/staff to their specific library
}

export interface LibraryMember {
  id: string;
  libraryId: string; // Multi-tenant isolation
  name: string;
  aadhaarId: string;
  mobile: string;
  email: string;
  planId: string;
  seatNumber: number;
  startDate: string;
  expiryDate: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  feesPaid: number;
}

export interface StaffUser {
  id: string;
  libraryId: string;
  name: string; // e.g. "Umesh Sahu"
  email: string;
  mobile: string;
  role: 'library_staff';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface LibraryOwner {
  id: string;
  libraryId: string;
  name: string; // e.g. "Ayush Jaiswal"
  email: string;
  mobile: string;
  role: 'library_owner';
}