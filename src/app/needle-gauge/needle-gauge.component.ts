import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

@Component( {
  selector: 'app-needle-gauge',
  standalone: true,
  imports: [
    FormsModule ],
  templateUrl: './needle-gauge.component.html',
  styleUrl: './needle-gauge.component.scss'
} )
export class NeedleGaugeComponent implements OnInit
{
  @ViewChild( 'gauge', { static: true } ) gaugeElement!: ElementRef;

  private readonly startingAngleDeg: number = -90;
  private readonly endingAngleDeg: number = +90;

  private readonly mainTickInnerRadius = 100;
  private readonly mainTickOuterRadius = 110;
  private readonly labelRadius = 125;

  private readonly innerArcRadius = 80;
  private readonly outerArcRadius = 100;


  private _gaugeValue = 0;
  private needle!: d3.Selection<SVGPathElement, unknown, null, undefined>;
  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;

  @Input()
  get gaugeValue (): number
  {
    return this._gaugeValue;
  }
  set gaugeValue ( value: number )
  {
    this._gaugeValue = value;
    this.updateGauge( this.needle, value );
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
      .attr( 'height', 180 )
      .append( 'g' )
      .attr( 'transform', 'translate(150, 150)' ); // Center the gauge

    // I had to add "as any" to arc.
    const arc = d3.arc()
      .innerRadius( 80 )
      .outerRadius( 100 )
      .startAngle( this.startingAngleDeg * Math.PI / 180 )
      .endAngle( this.endingAngleDeg * Math.PI / 180 );

    this.svg.append( 'path' )
      .attr( 'd', arc as any )
      .attr( 'fill', '#ddd' );

    const needleWidth = 7;  // Width of the needle
    const needleHeight = 90; // Height of the needle

    // Define a triangular needle as an SVG path
    const needlePath = `M ${ -needleWidth } 0 L 0 ${ -needleHeight } L ${ needleWidth / 2 } 0 Z`;

    // Append the needle path
    this.needle = this.svg.append( 'path' )
      .attr( 'd', needlePath )
      .attr( 'fill', 'red' )
      .attr( 'stroke', 'black' )
      .attr( 'stroke-width', 0.25 )
      .attr( 'transform', 'rotate(0)' ); // Initial rotation

    this.drawScale();

    // Append the center circle with a gradient
    this.drawNeedleCenter();

    this.updateGauge( this.needle, this.gaugeValue, 1000 );  // Initialize needle position to 0
  }

  // This is an updated version of the function in round-gauge and arc-gauge
  // which now uses D3's binding capability.
  drawScale (): void
  {
    const scaleValues = [ 0, 25, 50, 75, 100 ];  // Define scale values
    const scaleGroup = this.svg.append( 'g' );

    // Bind scaleValues as data
    const ticks = scaleGroup.selectAll( 'line' )
      .data( scaleValues )
      .enter()
      .append( 'line' )
      .attr( 'x1', d => Math.sin( this.scaleToAngleRad( d ) ) * this.mainTickInnerRadius )
      .attr( 'y1', d => -Math.cos( this.scaleToAngleRad( d ) ) * this.mainTickInnerRadius )
      .attr( 'x2', d => Math.sin( this.scaleToAngleRad( d ) ) * this.mainTickOuterRadius )
      .attr( 'y2', d => -Math.cos( this.scaleToAngleRad( d ) ) * this.mainTickOuterRadius )
      .attr( 'stroke', 'black' )
      .attr( 'stroke-width', 2 );

    // Bind scaleValues to labels
    const labels = scaleGroup.selectAll( 'text' )
      .data( scaleValues )
      .enter()
      .append( 'text' )
      .attr( 'x', d => Math.sin( this.scaleToAngleRad( d ) ) * this.labelRadius )
      .attr( 'y', d => -Math.cos( this.scaleToAngleRad( d ) ) * this.labelRadius )
      .attr( 'dy', '0.35em' )  // Center the text vertically
      .attr( "font-family", "Verdana" )
      .attr( 'font-size', '14px' )
      .attr( 'text-anchor', 'middle' )
      .text( d => d );
  }

  drawNeedleCenter (): void
  {
    // Define the radial gradient for the domed effect
    const gradient = this.svg.append( 'defs' )
      .append( 'radialGradient' )
      .attr( 'id', 'needleCenterGradient' )
      .attr( 'cx', '50%' )
      .attr( 'cy', '50%' )
      .attr( 'r', '50%' );

    // Define gradient colors
    gradient.append( 'stop' )
      .attr( 'offset', '0%' )
      .attr( 'style', 'stop-color:white;stop-opacity:1' );
    gradient.append( 'stop' )
      .attr( 'offset', '100%' )
      .attr( 'style', 'stop-color:#A0A0A0;stop-opacity:1' );

    // Append the circle to the SVG with the gradient fill
    this.svg.append( 'circle' )
      .attr( 'cx', 0 )   // Center x
      .attr( 'cy', 0 )   // Center y
      .attr( 'r', 16 )   // Radius of the circle
      .attr( 'fill', 'url(#needleCenterGradient)' )
      // .attr( 'stroke', 'gainsboro' )
      // .attr( 'stroke-width', 0.5 );
  }

  updateGauge ( needle: d3.Selection<SVGPathElement, unknown, null, undefined>, value: number, duration_ms: number = 0 )
  {
    const angle = this.scaleToAngle( value );
    needle.transition()
      .duration( duration_ms )
      .attr( 'transform', `rotate(${ angle })` );
  }

  // Helper function to convert the gauge value (0-100) to an angle
  scaleToAngle ( value: number ): number
  {
    const scale = d3.scaleLinear()
      .domain( [ 0, 100 ] )
      .range( [ this.startingAngleDeg, this.endingAngleDeg ] );  // Needle moves between -90 and 90 degrees (half-circle)
    return scale( value );
  }

  scaleToAngleRad ( value: number ): number
  {
    return this.scaleToAngle( value ) * Math.PI / 180;
  }
}
