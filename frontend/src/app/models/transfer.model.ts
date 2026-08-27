export interface FundTransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
}

export interface FundTransferResponse {
  transactionId: string;
  message: string;
}

export interface FundTransfer {
  fundTransferId: number;
  transactionReference: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transferType: 'INTERNAL' | 'EXTERNAL';
  transferredOn: string;
}