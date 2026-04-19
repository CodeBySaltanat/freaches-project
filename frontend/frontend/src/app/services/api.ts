import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getProducts() {
    return this.http.get('http://127.0.0.1:8000/api/products/');
  }

  createOrder(orderData: any) {
    return this.http.post('http://127.0.0.1:8000/api/orders/', orderData);
  }

  // 🔥 НАШ НОВЫЙ МЕТОД ДЛЯ УДАЛЕНИЯ
  deleteOrder(id: number) {
    return this.http.delete(`http://127.0.0.1:8000/api/orders/${id}/`);
  }

  login(username: string, password: string) {
    return this.http.post<any>('http://127.0.0.1:8000/api/login/', { username, password });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token); 
  }

  getToken() {
    return localStorage.getItem('token');
  }

  register(username: string, password: string) {
    return this.http.post('http://127.0.0.1:8000/api/register/', { username, password });
  }

  getBranches() {
    return this.http.get('http://127.0.0.1:8000/api/branches/');
  }
  
  getProductsByBranch(branchId: number) {
    return this.http.get(`http://127.0.0.1:8000/api/products/?branch=${branchId}`);
  }
}
