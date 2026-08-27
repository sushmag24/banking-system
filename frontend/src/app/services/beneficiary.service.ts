import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Beneficiary, CreateBeneficiaryRequest } from '../models/beneficiary.model';
import { API_CONFIG } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  constructor(private http: HttpClient) {}

  getBeneficiariesByUser(userId: number): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>(`${API_CONFIG.beneficiaries}/user/${userId}`);
  }

  getBeneficiariesByAccount(sourceAccount: string): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>(`${API_CONFIG.beneficiaries}/account/${sourceAccount}`);
  }

  getBeneficiaryById(id: number): Observable<Beneficiary> {
    return this.http.get<Beneficiary>(`${API_CONFIG.beneficiaries}/${id}`);
  }

  addBeneficiary(request: CreateBeneficiaryRequest): Observable<Beneficiary> {
    return this.http.post<Beneficiary>(API_CONFIG.beneficiaries, request);
  }

  deleteBeneficiary(id: number, userId?: number): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    return this.http.delete<any>(`${API_CONFIG.beneficiaries}/${id}`, { params });
  }
}