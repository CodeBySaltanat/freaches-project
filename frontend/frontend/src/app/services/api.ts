import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login/`, { username, password });
  }

  register(username: string, password: string, role: string) {
    return this.http.post<any>(`${this.baseUrl}/register/`, { username, password, role });
  }

  getBranches() {
    return this.http.get<any>(`${this.baseUrl}/branches/`);
  }

  getProductsByBranch(branchId: number) {
    return this.http.get<any>(`${this.baseUrl}/products/?branch=${branchId}`);
  }

  createOrder(orderData: any) {
    return this.http.post<any>(`${this.baseUrl}/orders/`, orderData);
  }

  getProfile() {
    return this.http.get<any>(`${this.baseUrl}/profile/`);
  }

  saveSession(authResponse: any) {
    localStorage.setItem('token', authResponse.access);

    if (authResponse.refresh) {
      localStorage.setItem('refresh', authResponse.refresh);
    }

    if (authResponse.user) {
      localStorage.setItem('username', authResponse.user.username);
      localStorage.setItem('role', authResponse.user.role);
      localStorage.setItem('roleLabel', authResponse.user.role_label);
    }
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('roleLabel');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  getRoleLabel() {
    return localStorage.getItem('roleLabel') || 'Пользователь';
  }

  getUsername() {
    return localStorage.getItem('username') || 'Гость';
  }
}
