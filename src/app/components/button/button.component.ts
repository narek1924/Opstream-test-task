import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `<button class="app-button" [attr.type]="type()" [disabled]="disabled()">
    <span><ng-content></ng-content></span>
  </button>`,
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  variant = input<'primary' | 'secondary'>('primary');

  @HostBinding('class.block')
  block = true;

  @HostBinding('class.secondary')
  get secondary(): boolean {
    return this.variant() === 'secondary';
  }
}
