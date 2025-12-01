import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestStoreService, RequestValue } from '../../services/request-store.service';
import { RequestSchema } from '../../models/request-schema';
import { ButtonComponent } from '../../components/button/button.component';
import { SchemaDataService } from '../../services/schema-data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-request-summary',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './request-summary.component.html',
  styleUrls: ['./request-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestSummaryComponent {
  readonly schema = signal<RequestSchema | null>(null);
  readonly rows = computed(() => {
    const schema = this.schema();
    const state = this.store.snapshot;
    if (!schema || !state) {
      return [];
    }

    return schema.sections.flatMap((section) =>
      section.fields.map((field) => ({
        label: field.label,
        value: state.values[field.id.toString()],
      }))
    );
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    readonly store: RequestStoreService,
    private schemaData: SchemaDataService
  ) {
    const schemaId = this.route.snapshot.paramMap.get('schemaId') ?? '';
    this.schemaData
      .schemaById(schemaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resolved) => {
        if (!resolved) {
          this.router.navigate(['/']);
          return;
        }
        this.schema.set(resolved);
      });
  }

  displayValue(value: RequestValue | undefined): string {
    if (value === undefined || value === '' || value === null) {
      return 'Not answered';
    }
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }
    return String(value);
  }

  trackByLabel = (_: number, row: { label: string }) => row.label;

  complete(): void {
    this.store.clear();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
