import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { REQUEST_SCHEMAS, RequestSchema } from '../models/request-schema';
import { RequestValue } from './request-store.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class MockApiService {
  // keep failures in the 10–20% range
  private readonly failureRate = 0.15;

  constructor(private notifier: NotificationService) {}

  getSchemas(): Observable<RequestSchema[]> {
    return timer(this.randomDelay()).pipe(map(() => REQUEST_SCHEMAS));
  }

  saveQuestion(_requestId: string, questionId: number, _value: RequestValue): Observable<void> {
    const key = `save-${questionId}`;
    this.notifier.show('Saving…', 'info', 1200, key);

    return timer(this.randomDelay()).pipe(
      mergeMap(() => {
        if (Math.random() < this.failureRate) {
          this.notifier.show('Error while saving', 'error', 1500, key);
          return throwError(() => new Error('Save failed'));
        }
        this.notifier.show('Saved', 'success', 1200, key);
        return of(void 0);
      })
    );
  }

  private randomDelay(): number {
    return 600 + Math.floor(Math.random() * 400);
  }
}
