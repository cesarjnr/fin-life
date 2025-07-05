import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private loadingCount = 0;
  private loadingCountSource = new BehaviorSubject<number>(0);
  public loadingCount$ = this.loadingCountSource.asObservable();

  public setLoading(loading: boolean): void {
    if (loading) {
      this.loadingCount++;
    } else {
      this.loadingCount--;
    }

    this.loadingCountSource.next(this.loadingCount);
  }
}
