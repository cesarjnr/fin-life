import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { LoginDto } from '../dtos/auth.dto';
import { Observable } from 'rxjs';
import { User } from '../dtos/user.dto';

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
}
