import { Injectable, signal } from '@angular/core';

export type NoticeKind = 'info' | 'success' | 'error';

export interface Notice {
  id: number;
  message: string;
  kind: NoticeKind;
  key?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notices = signal<Notice[]>([]);
  private counter = 0;

  show(message: string, kind: NoticeKind = 'info', duration = 2500, key?: string): void {
    const id = ++this.counter;
    this.notices.update((list) => {
      const filtered = key ? list.filter((n) => n.key !== key) : list;
      return [...filtered, { id, message, kind, key }];
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: number): void {
    this.notices.update((list) => list.filter((n) => n.id !== id));
  }
}
