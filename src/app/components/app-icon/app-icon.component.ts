import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      class="app-icon"
      role="img"
      focusable="false"
      aria-hidden="true"
      [attr.width]="sizeValue"
      [attr.height]="sizeValue"
      [style.width]="sizeValue"
      [style.height]="sizeValue"
      [style.color]="colorValue"
    >
      <use [attr.href]="href"></use>
    </svg>
  `,
  styleUrls: ['./app-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() size: number | string = 20;

  @Input() color = 'currentColor';

  @Input() spritePath = '/sprites.svg';

  // The icon id defined inside the SVG sprite file.
  @Input({ required: true }) name!: string;

  get sizeValue(): string {
    return typeof this.size === 'number' ? `${this.size}px` : this.size;
  }

  get colorValue(): string {
    const raw = this.color?.trim();
    if (!raw) {
      return 'currentColor';
    }

    if (raw.startsWith('$')) {
      const token = raw.slice(1);
      const tokenColors: Record<string, string> = {
        'brand-main': '#1db496',
        'brand-light': '#f2fdfb',
        'brand-green-37': '#1aa287',
        black: '#000000',
        white: '#ffffff',
        'state-bg': '#f6f6f7',
        'mono-gray-3': '#e5e5e5',
      };

      return tokenColors[token] ?? 'currentColor';
    }

    return raw;
  }

  get href(): string {
    const safeName = this.name?.trim();
    return safeName ? `${this.spritePath}#${safeName}` : '';
  }
}
