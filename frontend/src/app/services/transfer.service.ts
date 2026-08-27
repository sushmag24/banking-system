import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FundTransferRequest, FundTransferResponse, FundTransfer } from '../models/transfer.model';
import { API_CONFIG } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  constructor(private http: HttpClient) {}

  fundTransfer(request: FundTransferRequest): Observable<FundTransferResponse> {
    return this.http.post<FundTransferResponse>(API_CONFIG.transfers, request);
  }

  getTransferByReference(referenceId: string): Observable<FundTransfer> {
    return this.http.get<FundTransfer>(`${API_CONFIG.transfers}/${referenceId}`);
  }

  getTransfersByAccountId(accountId: string): Observable<FundTransfer[]> {
    const params = new HttpParams().set('accountId', accountId);
    return this.http.get<FundTransfer[]>(API_CONFIG.transfers, { params });
  }
}