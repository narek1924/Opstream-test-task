import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationBarComponent } from './components/notification-bar/notification-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('opstream-fe-test');
}
