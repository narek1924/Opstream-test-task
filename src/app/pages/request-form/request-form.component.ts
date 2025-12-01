import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestSchema, SchemaSection } from '../../models/request-schema';
import { RequestStoreService } from '../../services/request-store.service';
import { InputFieldComponent } from '../../components/input-field/input-field.component';
import { ButtonComponent } from '../../components/button/button.component';
import { TabsComponent } from '../../components/tabs/tabs.component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { SchemaDataService } from '../../services/schema-data.service';
import { MockApiService } from '../../services/mock-api.service';
import { resolveSchemaSection, setupAutosave } from './request-form.helpers';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, ButtonComponent, TabsComponent],
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestFormComponent implements OnDestroy {
  schema?: RequestSchema;
  sectionIndex = 0;
  section!: SchemaSection;
  form: FormGroup = new FormGroup({});
  private readonly destroy$ = new Subject<void>();
  private autosaveSubs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private store: RequestStoreService,
    private schemaData: SchemaDataService,
    private api: MockApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => this.resolveParams(params));
  }

  get isLastStep(): boolean {
    return !!this.schema && this.sectionIndex === this.schema.sections.length - 1;
  }

  get isFirstStep(): boolean {
    return !!this.schema && this.sectionIndex === 0;
  }

  previous(): void {
    if (!this.schema || this.sectionIndex === 0) {
      return;
    }
    this.navigateToSection(this.sectionIndex - 1);
  }

  next(): void {
    if (!this.schema || !this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saveSection();
    this.navigateToSection(this.sectionIndex + 1);
  }

  submit(): void {
    if (!this.schema || !this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saveSection();
    this.store.markSubmitted();
    this.router.navigate(['/request', this.schema.id, 'summary']);
  }

  isActiveChip(index: number): boolean {
    return index === this.sectionIndex;
  }

  private resolveParams(params: ParamMap): void {
    const schemaId = params.get('schemaId');
    const sectionParam = params.get('sectionIndex');

    if (!schemaId || sectionParam === null) {
      this.router.navigate(['/']);
      return;
    }

    const resolvedIndex = Number(sectionParam);
    if (Number.isNaN(resolvedIndex)) {
      this.router.navigate(['/']);
      return;
    }

    resolveSchemaSection(
      this.schemaData,
      this.router,
      schemaId,
      resolvedIndex,
      (schema, section, idx) => {
        this.schema = schema;
        this.sectionIndex = idx;
        this.section = section;
        this.buildForm();
        this.cdr.markForCheck();
      }
    );
  }

  private buildForm(): void {
    this.autosaveSubs.unsubscribe();
    this.autosaveSubs = new Subscription();
    const controls: Record<string, any> = {};
    this.section.fields.forEach((field) => {
      const controlKey = field.id.toString();
      const existingValue =
        this.store.getValue(field.id) ?? field.default ?? (field.type === 'toggle' ? false : '');
      const validators = [];
      if (field.required) {
        validators.push(field.type === 'toggle' ? Validators.requiredTrue : Validators.required);
      }
      controls[controlKey] = [existingValue, validators];
    });
    this.form = this.fb.group(controls);
    this.autosaveSubs.add(
      setupAutosave(this.section, this.form, () => this.schema, this.api, this.store, this.destroy$)
    );
    this.cdr.markForCheck();
  }

  navigateToSection(index: number): void {
    if (!this.schema || (this.sectionIndex === 0 && this.form.invalid)) {
      return;
    }
    this.router.navigate(['/request', this.schema.id, index]);
  }

  private saveSection(): void {
    if (!this.schema) {
      return;
    }
    this.store.saveSection(this.section, this.form.getRawValue());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.autosaveSubs.unsubscribe();
  }
}
