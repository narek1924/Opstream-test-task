import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RequestSchema, SchemaSection } from '../models/request-schema';

export type RequestValue = string | number | boolean;

export interface RequestState {
  schemaId: string;
  values: Record<string, RequestValue>;
  submittedAt?: string;
}

const STORAGE_KEY = 'request-state';

@Injectable({ providedIn: 'root' })
export class RequestStoreService {
  private readonly stateSubject = new BehaviorSubject<RequestState | null>(this.readFromStorage());
  readonly state$ = this.stateSubject.asObservable();

  get snapshot(): RequestState | null {
    return this.stateSubject.value;
  }

  start(schema: RequestSchema): void {
    const nextState: RequestState = {
      schemaId: schema.id,
      values: this.snapshot?.schemaId === schema.id ? { ...this.snapshot.values } : {}
    };
    this.persist(nextState);
  }

  saveSection(section: SchemaSection, rawValues: Record<string, RequestValue>): void {
    const current = this.snapshot;
    if (!current) {
      return;
    }

    const updatedValues = { ...current.values };
    section.fields.forEach((field) => {
      const key = field.id.toString();
      const value = rawValues[key];
      updatedValues[key] = this.normalizeValue(field.type, value);
    });

    this.persist({ ...current, values: updatedValues, submittedAt: undefined });
  }

  markSubmitted(): void {
    const current = this.snapshot;
    if (!current) {
      return;
    }
    this.persist({ ...current, submittedAt: new Date().toISOString() });
  }

  getValue(fieldId: number): RequestValue | undefined {
    return this.snapshot?.values[fieldId.toString()];
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.stateSubject.next(null);
  }

  private persist(state: RequestState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.stateSubject.next(state);
  }

  private readFromStorage(): RequestState | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as RequestState;
    } catch {
      return null;
    }
  }

  private normalizeValue(type: string, value: RequestValue): RequestValue {
    if (type === 'number') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : '';
    }
    if (type === 'toggle') {
      return Boolean(value);
    }
    return value;
  }
}
