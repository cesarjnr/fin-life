import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../shared/utils/form';
import { LoginDto } from '../../../core/dtos/auth.dto';

interface LoginForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    LogoComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  public readonly loginForm = this.formBuilder.group<LoginForm>({
    email: this.formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this.formBuilder.control('', Validators.required),
  });
  public getErrorMessage = getErrorMessage;
  public showPassword = false;

  public handleLoginFormSubmit(): void {
    this.loginForm.markAllAsTouched();

    const loginFormValue = this.loginForm.value as LoginDto;

    if (this.loginForm.valid) {
      this.authService.login(loginFormValue).subscribe({
        next: (user) => {
          const portfolio = user.portfolios.find(
            (portfolio) => portfolio.default,
          );

          localStorage.setItem('user', JSON.stringify(user));
          this.router.navigate(['portfolios', portfolio!.id]);
        },
      });
    }
  }

  public togglePasswordInputVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
