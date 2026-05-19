import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.html',
  styleUrl: './about.css',
  host: {
    id: 'about',
    role: 'region',
    'aria-labelledby': 'about-heading'
  }
})
export class AboutComponent {}
