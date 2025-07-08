import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginDto } from '../dtos/auth.dto';
import { User } from '../dtos/user.dto';
import { DISPLAY_TOAST_ON_ERROR } from '../interceptors/error-handling.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  public login(loginDto: LoginDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, loginDto, {
      withCredentials: true,
    });
  }

  public refreshToken(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/refresh`, null, {
      withCredentials: true,
      context: new HttpContext().set(DISPLAY_TOAST_ON_ERROR, false),
    });
  }

  public logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, null);
  }

  public getLoggedUser(): User | null {
    const user = localStorage.getItem('user');

    return user ? JSON.parse(user) : null;
  }
}
