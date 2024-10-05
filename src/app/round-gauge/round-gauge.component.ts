import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

@Component( {
  selector: 'app-round-gauge',
  standalone: true,
  imports: [
    FormsModule],
  templateUrl: './round-gauge.component.html',
  styleUrl: './round-gauge.component.scss'
} )
export class RoundGaugeComponent implements OnInit
{
  @ViewChild( 'gauge', { static: true } ) gaugeElement!: ElementRef;

  private _gaugeValue = 0;
  private needle! : d3.Selection<SVGLineElement, unknown, null, undefined> ;
  private svg!    : d3.Selection<SVGGElement, unknown, null, undefined> ;

  @Input()
  get gaugeValue(): number {
    return this._gaugeValue;
  }
  set gaugeValue(value: number) {
    this._gaugeValue = value;
    this.updateGauge(this.needle,value) ;
  }

  constructor () { }

  ngOnInit (): void
  {
    this.createGauge();
  }

  createGauge ()
  {
    this.svg = d3.select( this.gaugeElement.nativeElement )
      .append( 'svg' )
      .attr( 'width', 300 )
      .attr( 'height', 160 )
      .append( 'g' )
      .attr( 'transform', 'translate(150, 150)' ); // Center the gauge

    // I had to add "as any" to arc.
    const arc = d3.arc()
      .innerRadius( 80 )
      .outerRadius( 100 )
      .startAngle( -Math.PI / 2 )
      .endAngle( Math.PI / 2 );

    this.svg.append( 'path' )
      .attr( 'd', arc as any )
      .attr( 'fill', '#ddd' );

    this.needle = this.svg.append( 'line' )
      .attr( 'x1', 0 )
      .attr( 'y1', 0 )
      .attr( 'x2', 0 )
      .attr( 'y2', -80 )
      .attr( 'stroke', 'red' )
      .attr( 'stroke-width', 5 )
      .attr( 'transform', 'rotate(0)' );

    this.drawScale() ;

    this.updateGauge( this.needle, this.gaugeValue, 1000 );  // Initialize needle position to 0
  }

  drawScale(): void {
    const scaleValues = [0, 25, 50, 75, 100];  // Define scale values
    const scaleGroup = this.svg.append('g');

    const mainTickInnerRadius = 80 ;
    const mainTickOuterRadius = 100 ;
    const labelRadius = 120 ;

    scaleValues.forEach((value) => {
      const angle = this.scaleToAngle(value) * (Math.PI / 180); // Convert to radians
      const xOuter = Math.sin(angle) * mainTickOuterRadius;
      const yOuter = -Math.cos(angle) * mainTickOuterRadius;
      const xInner = Math.sin(angle) * mainTickInnerRadius;
      const yInner = -Math.cos(angle) * mainTickInnerRadius;
      const xLabel = Math.sin(angle) * labelRadius;
      const yLabel = -Math.cos(angle) * labelRadius;

      // Draw tick marks
      scaleGroup.append('line')
        .attr('x1', xInner)
        .attr('y1', yInner)
        .attr('x2', xOuter)
        .attr('y2', yOuter)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

      // Draw labels
      scaleGroup.append('text')
        .attr('x', xLabel)
        .attr('y', yLabel)
        .attr('dy', '0.35em')  // Center the text vertically
        .attr('text-anchor', 'middle')
        .text(value);
    });
  }

  updateGauge ( needle: d3.Selection<SVGLineElement, unknown, null, undefined>, value: number, duration_ms : number = 0 )
  {
    const angle = this.scaleToAngle(value) ;
    needle.transition()
      .duration( duration_ms )
      .attr( 'transform', `rotate(${ angle })` );
  }

  // Helper function to convert the gauge value (0-100) to an angle
  scaleToAngle(value: number): number
  {
    const scale = d3.scaleLinear()
      .domain([0, 100])
      .range([-90, 90]);  // Needle moves between -90 and 90 degrees (half-circle)
    return scale(value);
  }
}
