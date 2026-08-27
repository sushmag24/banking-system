import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransactionSummary, AddTransactionRequest } from '../models/transaction.model';
import { API_CONFIG } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private http: HttpClient) {}

  getTransactions(accountId: string): Observable<Transaction[]> {
    const params = new HttpParams().set('accountId', accountId);
    return this.http.get<Transaction[]>(API_CONFIG.transactions, { params });
  }

  filterTransactions(
    accountId: string,
    startDate?: string,
    endDate?: string,
    type?: string,
    status?: string
  ): Observable<Transaction[]> {
    let params = new HttpParams().set('accountId', accountId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (type && type !== 'ALL') params = params.set('type', type);
    if (status && status !== 'ALL') params = params.set('status', status);

    return this.http.get<Transaction[]>(API_CONFIG.transactions, { params });
  }

  getAccountSummary(accountId: string): Observable<TransactionSummary> {
    return this.http.get<TransactionSummary>(`${API_CONFIG.transactions}/${accountId}/summary`);
  }

  addTransaction(request: AddTransactionRequest): Observable<any> {
    return this.http.post<any>(API_CONFIG.transactions, request);
  }
}