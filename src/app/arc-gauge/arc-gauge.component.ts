import { Component, OnInit, ElementRef, ViewChild, input, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

@Component( {
  selector: 'app-arc-gauge',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './arc-gauge.component.html',
  styleUrl: './arc-gauge.component.scss'
} )
export class ArcGaugeComponent implements OnInit
{
  @ViewChild( 'gauge', { static: true } ) gaugeElement!: ElementRef;

  private _gaugeValue = 0;
  private needle! : d3.Selection<SVGPathElement, unknown, null, undefined> ;
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

    // V1
    // I had to add "as any" to arc.
    const arc = d3.arc()
      .innerRadius( 80 )
      .outerRadius( 100 )
      .startAngle( -Math.PI / 2 )
      .endAngle( Math.PI / 2 );

    this.svg.append( 'path' )
      .attr( 'd', arc as any )
      .attr( 'fill', '#ddd' );

    this.needle = this.svg.append('path')
      .attr('fill', 'red') // Color of the current value arc
      .attr('d', this.createArc(0)); // Start with an arc of 0

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

  // Function to create an arc based on the current value
  createArc(value: number): any {
    const angle = this.scaleToAngle(value);
    const arc = d3.arc()
      .innerRadius(80)
      .outerRadius(100)
      .startAngle(-Math.PI / 2)
      .endAngle(angle * (Math.PI / 180)); // Convert to radians

    return arc;
  }

  updateGauge ( needle: d3.Selection<SVGPathElement, unknown, null, undefined>, value: number, duration_ms : number = 0 )
  {
    needle.transition()
      .duration( duration_ms )
      .attr('d', this.createArc(value)); // Start with an arc of 0
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
