export interface UserProfile {
  userProfileId?: number;
  firstName: string;
  lastName: string;
}

export interface User {
  userId: number;
  emailId: string;
  contactNo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  authId?: string;
  identificationNumber?: string;
  userProfile?: UserProfile;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  emailId: string;
  contactNumber: string;
  password: string;
}

export interface LoginRequest {
  emailId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  emailId: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  authId: string;
  identificationNumber: string;
}

export interface UserUpdateStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}