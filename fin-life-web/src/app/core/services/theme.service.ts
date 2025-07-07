import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'dark';

  constructor() {
    this.setInitialTheme();
  }

  public toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  public getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  private setInitialTheme(): void {
    const initialTheme = (localStorage.getItem('selected-theme') ||
      this.currentTheme) as 'light' | 'dark';

    this.setTheme(initialTheme);
  }

  private setTheme(theme: 'light' | 'dark'): void {
    document.documentElement.classList.remove(`${this.currentTheme}-theme`);
    document.documentElement.classList.add(`${theme}-theme`);
    this.currentTheme = theme;
    localStorage.setItem('selected-theme', theme);
  }
}
