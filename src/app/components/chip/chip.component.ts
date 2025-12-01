import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-chip',
  standalone: true,
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ChipComponent {
  @Input() isActive = false;
  @Input() disabled = false;

  @HostBinding('class.chip--active')
  get activeClass(): boolean {
    return this.isActive;
  }

  @HostBinding('class.chip--disabled')
  get disabledClass(): boolean {
    return this.disabled;
  }
}
