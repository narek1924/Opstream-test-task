import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, filter, EMPTY } from 'rxjs';
import { tap, retry, catchError } from 'rxjs/operators';
import { SchemaSection, RequestSchema } from '../../models/request-schema';
import { SchemaDataService } from '../../services/schema-data.service';
import { MockApiService } from '../../services/mock-api.service';
import { RequestStoreService, RequestValue } from '../../services/request-store.service';

export function resolveSchemaSection(
  schemaData: SchemaDataService,
  router: Router,
  schemaId: string,
  sectionIndex: number,
  onResolved: (schema: RequestSchema, section: SchemaSection, index: number) => void
): Subscription {
  return schemaData.schemaById(schemaId).subscribe((resolvedSchema) => {
    if (!resolvedSchema) {
      router.navigate(['/']);
      return;
    }
    if (sectionIndex < 0 || sectionIndex >= resolvedSchema.sections.length) {
      router.navigate(['/request', resolvedSchema.id, 0]);
      return;
    }
    onResolved(resolvedSchema, resolvedSchema.sections[sectionIndex], sectionIndex);
  });
}

export function setupAutosave(
  section: SchemaSection,
  form: FormGroup,
  schemaAccessor: () => RequestSchema | undefined,
  api: MockApiService,
  store: RequestStoreService,
  destroy$: Subject<void>
): Subscription {
  const subs = new Subscription();

  section.fields.forEach((field) => {
    const control = form.get(field.id.toString());
    if (!control) {
      return;
    }
    const sub = control.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),
        filter(() => !!schemaAccessor() && control.dirty),
        switchMap((value) => saveAnswer(schemaAccessor, api, store, section, form, field.id, value))
      )
      .subscribe();
    subs.add(sub);
  });

  destroy$.subscribe(() => subs.unsubscribe());
  return subs;
}

function saveAnswer(
  schemaAccessor: () => RequestSchema | undefined,
  api: MockApiService,
  store: RequestStoreService,
  section: SchemaSection,
  form: FormGroup,
  questionId: number,
  value: RequestValue
) {
  const schema = schemaAccessor();
  if (!schema) {
    return EMPTY;
  }
  return api
    .saveQuestion(schema.id, questionId, value)
    .pipe(
      retry(1),
      tap(() => {
        store.saveSection(section, form.getRawValue());
        const control = form.get(questionId.toString());
        control?.markAsPristine();
      }),
      catchError(() => EMPTY)
    );
}
