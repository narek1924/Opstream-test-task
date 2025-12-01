import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { RequestSchema } from '../models/request-schema';
import { MockApiService } from './mock-api.service';

@Injectable({ providedIn: 'root' })
export class SchemaDataService {
  private readonly schemasSignal = signal<RequestSchema[]>([]);
  private loaded$?: Observable<RequestSchema[]>;

  constructor(private api: MockApiService) {}

  loadSchemas(): Observable<RequestSchema[]> {
    if (this.schemasSignal().length) {
      return of(this.schemasSignal());
    }
    if (!this.loaded$) {
      this.loaded$ = this.api
        .getSchemas()
        .pipe(
          tap((schemas) => this.schemasSignal.set(schemas)),
          shareReplay({ bufferSize: 1, refCount: true })
        );
    }
    return this.loaded$;
  }

  schemas = computed(() => this.schemasSignal());

  schemaById(id: string): Observable<RequestSchema | undefined> {
    if (!id) {
      return of(undefined);
    }
    if (this.schemasSignal().length) {
      return of(this.schemasSignal().find((schema) => schema.id === id));
    }
    return this.loadSchemas().pipe(map((schemas) => schemas.find((schema) => schema.id === id)));
  }
}
