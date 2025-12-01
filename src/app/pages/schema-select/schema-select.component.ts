import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RequestSchema } from '../../models/request-schema';
import { ButtonComponent } from '../../components/button/button.component';
import { ChipComponent } from '../../components/chip/chip.component';
import { RequestState, RequestStoreService } from '../../services/request-store.service';
import { IconComponent } from '../../components/app-icon/app-icon.component';
import { SchemaDataService } from '../../services/schema-data.service';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';

@Component({
  standalone: true,
  selector: 'app-schema-select',
  imports: [CommonModule, ButtonComponent, ChipComponent, IconComponent, SkeletonComponent],
  templateUrl: './schema-select.component.html',
  styleUrls: ['./schema-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaSelectComponent {
  readonly state$: Observable<RequestState | null>;
  readonly schemas = signal<RequestSchema[]>([]);
  readonly loading = signal(true);
  selectedChip = signal<number>(Infinity);

  activeSchema = computed(() => {
    const list = this.schemas();
    return list[this.selectedChip()];
  });

  constructor(
    private router: Router,
    private requestStore: RequestStoreService,
    private schemaData: SchemaDataService
  ) {
    this.state$ = this.requestStore.state$;
    this.schemaData.loadSchemas().subscribe({
      next: (schemas) => {
        this.schemas.set(schemas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  start(): void {
    const activeSchema = this.activeSchema();
    if (activeSchema) {
      this.requestStore.clear();
      this.requestStore.start(activeSchema);
      this.router.navigate(['/request', activeSchema.id, 0]);
    }
  }

  resume(): void {
    const state = this.requestStore.snapshot;
    if (!state) {
      return;
    }
    this.router.navigate(['/request', state.schemaId, 0]);
  }

  clear(): void {
    this.requestStore.clear();
  }

  isActiveChip(index: number): boolean {
    return index === this.selectedChip();
  }

  setActiveChip(index: number) {
    if (this.selectedChip() !== index) {
      this.selectedChip.set(index);
      return;
    }
    this.selectedChip.set(Infinity);
  }

  hasStateForActive(state: RequestState | null): boolean {
    const active = this.activeSchema();
    if (!state || !active) {
      return false;
    }
    return state.schemaId === active.id && Object.keys(state.values ?? {}).length > 0;
  }
}
