import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoundGaugeComponent } from './round-gauge/round-gauge.component';
import { ArcGaugeComponent } from './arc-gauge/arc-gauge.component';
import { FormsModule } from '@angular/forms';
import { BlockGaugeComponent } from './block-gauge/block-gauge.component';
import { NeedleGaugeComponent } from './needle-gauge/needle-gauge.component';
import { GradientGaugeComponent } from "./gradient-gauge/gradient-gauge.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    RoundGaugeComponent,
    NeedleGaugeComponent,
    ArcGaugeComponent,
    BlockGaugeComponent,
    GradientGaugeComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public  GaugeValue = 0;
}
