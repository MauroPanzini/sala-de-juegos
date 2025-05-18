import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-retro-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retro-alert.component.html',
  styleUrl: './retro-alert.component.scss'
})
export class RetroAlertComponent {
  @Input() message: string = '';
  @Input() show: boolean = false;
  @Input() type: 'success' | 'error' | 'info' = 'info';

  close() {
    this.show = false;
  }
}