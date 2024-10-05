import { Component, OnInit, ElementRef, ViewChild, input, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

class blockInfo
{
  startAngle: number = 0;
  endAngle: number = 0;
  color: string = 'red';
}

@Component( {
  selector: 'app-block-gauge',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './block-gauge.component.html',
  styleUrl: './block-gauge.component.scss'
} )
export class BlockGaugeComponent implements OnInit
{
  @ViewChild( 'gauge', { static: true } ) gaugeElement!: ElementRef;

  // Define block size and gap size in degrees
  private readonly blockSize: number = 2.5 * Math.PI / 180;
  private readonly gapSize: number = 1 * Math.PI / 180;

  private readonly startingAngle : number = -120 * Math.PI / 180 ;
  private readonly endingAngle : number = +120 * Math.PI / 180 ;

  private readonly mainTickInnerRadius = 100;
  private readonly mainTickOuterRadius = 110;
  private readonly labelRadius = 125;

  private readonly innerArcRadius = 80;
  private readonly outerArcRadius = 100;

  private readonly innerRingRadius = 80;
  private readonly outerRingRadius = 100;

  blockData: Array<blockInfo> = [];

  private _gaugeValue = 0;
  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private arcGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private textElement!: d3.Selection<SVGTextElement, unknown, null, undefined>;

  @Input()
  get gaugeValue (): number
  {
    return this._gaugeValue;
  }
  set gaugeValue ( value: number )
  {
    this._gaugeValue = value;
    this.updateGauge( value );
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
      .attr( 'height', 300 )
      .append( 'g' )
      .attr( 'transform', 'translate(150, 150)' ); // Center the gauge

    const arc1 = d3.arc()
      .innerRadius( this.innerRingRadius )
      .outerRadius( this.innerRingRadius )
      .startAngle( this.startingAngle )
      .endAngle( this.endingAngle );

    this.svg.append( 'path' )
      .attr( 'd', arc1 as any )
      .attr( 'fill', 'none' ) // No fill, just stroke
      .attr( 'stroke', 'black' ) // Stroke color for each arc
      .attr( 'stroke-width', 2 ); // Line thickness (you can adjust this value)

    const arc2 = d3.arc()
      .innerRadius( this.outerRingRadius )
      .outerRadius( this.outerRingRadius )
      .startAngle( this.startingAngle )
      .endAngle( this.endingAngle );

    this.svg.append( 'path' )
      .attr( 'd', arc2 as any )
      .attr( 'fill', 'none' ) // No fill, just stroke
      .attr( 'stroke', 'black' ) // Stroke color for each arc
      .attr( 'stroke-width', 2 ); // Line thickness (you can adjust this value)

    // Append a new text element
    this.textElement = this.svg.append( 'text' )
      .attr( 'class', 'value' )
      .attr( 'x', 0 )
      .attr( 'y', 0 )
      .attr( 'text-anchor', 'middle' )
      .attr( 'dominant-baseline', 'middle' )
      .attr( 'font-size', '36px' )
      .attr( "font-family", "Verdana" )
      .attr( 'fill', '#000' );

    this.drawScale();

    // Create a group for the arcs
    this.arcGroup = this.svg.append( 'g' )
      .attr( 'transform', 'translate(0, 0)' );

    //this.createBlockData();
    this.createBlocksForValue( 60 );

    // Bind the blockData array to the SVG elements
    this.drawBlocksFromArray();

    this.updateGauge( this.gaugeValue );
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

  // Create an array of objects representing each block
  private createBlocksForValue ( value: number ): void
  {
    const startAngle = this.scaleToAngleRad( 0 );
    const endAngle = this.scaleToAngleRad( value );

    this.blockData.length = 0;

    let currentAngle = startAngle;
    while ( currentAngle <= endAngle )
    {
      const b = new blockInfo;
      b.startAngle = currentAngle;
      currentAngle += this.blockSize;
      //b.endAngle = currentAngle ;
      b.endAngle = ( currentAngle < endAngle ) ? currentAngle : endAngle;
      currentAngle += this.gapSize;
      b.color = '#4CAF50';
      this.blockData.push( b );
    }
  }

  // Method to create an arc based on start and end angles
  private createBlockArc ( b: blockInfo ): any
  {
    const arc = d3.arc()
      .innerRadius( this.innerArcRadius )
      .outerRadius( this.outerArcRadius )
      .startAngle( b.startAngle )
      .endAngle( b.endAngle );

    return arc;
  }

  private drawBlocksFromArray ()
  {
    const arcs = this.arcGroup.selectAll( 'path' )
      .data( this.blockData );

    // Remove old blocks
    arcs.exit()
      .remove();

    // Update the last of the existing blocks, which may be a partial block
    arcs.filter( ( d, i ) => i === arcs.size() - 1 )
      .attr( 'd', d => this.createBlockArc( d )() )
      .attr( 'fill', d => d.color );

    // Add new blocks
    arcs.enter()
      .append( 'path' )
      .attr( 'd', d => this.createBlockArc( d )() ) // Use a fixed radius
      .attr( 'fill', d => d.color );
  }

  // Function to create an arc based on the current value
  createArc ( value: number ): any
  {
    const angle = this.scaleToAngleRad( value );
    const arc = d3.arc()
      .innerRadius( this.innerArcRadius )
      .outerRadius( this.outerArcRadius )
      .startAngle( -Math.PI / 2 )
      .endAngle( angle );

    return arc;
  }

  updateGauge ( value: number )
  {
    this.createBlocksForValue( value );
    this.drawBlocksFromArray();

    this.textElement.text( value.toFixed( 1 ) );
  }

  // Helper function to convert the gauge value (0-100) to an angle
  scaleToAngleRad ( value: number ): number
  {
    const scale = d3.scaleLinear()
      .domain( [ 0, 100 ] )
      .range( [ this.startingAngle, this.endingAngle ] );  // Needle moves between -90 and 90 degrees (half-circle)
    return scale( value );
  }
}
