import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, CreateAccountRequest, AccountStatusUpdate } from '../models/account.model';
import { API_CONFIG } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private http: HttpClient) {}

  getAccountByUserId(userId: number): Observable<Account> {
    return this.http.get<Account>(`${API_CONFIG.accounts}/${userId}`);
  }

  getAccountsByUserId(userId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${API_CONFIG.accounts}/user/${userId}`);
  }

  getAccountByNumber(accountNumber: string): Observable<Account> {
    const params = new HttpParams().set('accountNumber', accountNumber);
    return this.http.get<Account>(API_CONFIG.accounts, { params });
  }

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${API_CONFIG.accounts}/all`);
  }

  createAccount(request: CreateAccountRequest): Observable<any> {
    return this.http.post<any>(API_CONFIG.accounts, request);
  }

  updateStatus(accountNumber: string, status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'CLOSED'): Observable<any> {
    const params = new HttpParams().set('accountNumber', accountNumber);
    const body: AccountStatusUpdate = { accountStatus: status };
    return this.http.patch<any>(API_CONFIG.accounts, body, { params });
  }

  getBalance(accountNumber: string): Observable<string> {
    const params = new HttpParams().set('accountNumber', accountNumber);
    return this.http.get(`${API_CONFIG.accounts}/balance`, { params, responseType: 'text' });
  }

  closeAccount(accountNumber: string): Observable<any> {
    const params = new HttpParams().set('accountNumber', accountNumber);
    return this.http.put<any>(`${API_CONFIG.accounts}/closure`, {}, { params });
  }
}