import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  @Input() width: string | number = '100%';
  @Input() height: string | number = '16px';
  @Input() borderRadius: string | number = '4px';

  asCssSize(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }
}

