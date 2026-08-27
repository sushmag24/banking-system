import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, CreateUserRequest, User, UserUpdateStatus } from '../models/user.model';
import { API_CONFIG } from './api.config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'apex_auth_token';
  private readonly USER_KEY = 'apex_auth_user';

  currentUser = signal<LoginResponse | null>(this.getStoredUser());
  isAuthenticated = signal<boolean>(!!this.getStoredToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(request: CreateUserRequest): Observable<any> {
    return this.http.post<any>(`${API_CONFIG.users}/register`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_CONFIG.users}/login`, request).pipe(
      tap((response) => {
        this.saveAuthData(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  saveAuthData(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this.currentUser.set(response);
    this.isAuthenticated.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): LoginResponse | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(API_CONFIG.users);
  }

  updateUserStatus(userId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Observable<any> {
    const body: UserUpdateStatus = { status };
    return this.http.patch<any>(`${API_CONFIG.users}/${userId}`, body);
  }
}