import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoundGaugeComponent } from './round-gauge/round-gauge.component';
import { ArcGaugeComponent } from './arc-gauge/arc-gauge.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    RoundGaugeComponent,
    ArcGaugeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public  GaugeValue = 0;
}
