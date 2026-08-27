export interface Beneficiary {
  id: number;
  userId: number;
  sourceAccountNumber: string;
  beneficiaryAccountNumber: string;
  beneficiaryName: string;
  bankName?: string;
  ifscCode?: string;
  accountType?: string;
  email?: string;
  createdAt?: string;
}

export interface CreateBeneficiaryRequest {
  userId: number;
  sourceAccountNumber: string;
  beneficiaryAccountNumber: string;
  beneficiaryName: string;
  bankName?: string;
  ifscCode?: string;
  accountType?: string;
  email?: string;
}