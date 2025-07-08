import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private loadingCount = 0;
  private isLoadingSource = new BehaviorSubject<number>(0);
  public isLoading$ = this.isLoadingSource
    .asObservable()
    .pipe(map((count: number) => count > 0));

  public setLoading(loading: boolean): void {
    if (loading) {
      this.loadingCount++;
    } else {
      this.loadingCount--;
    }

    this.isLoadingSource.next(this.loadingCount);
  }
}
