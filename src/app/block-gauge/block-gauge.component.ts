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
  private readonly blockSize: number = 3 * Math.PI / 180; // Degrees for each block
  private readonly gapSize: number = 1 * Math.PI / 180; // Degrees for each gap

  private readonly mainTickInnerRadius = 80;
  private readonly mainTickOuterRadius = 100;
  private readonly labelRadius = 120;

  private readonly innerArcRadius = 80 ;
  private readonly outerArcRadius = 100 ;


  blockData: Array<blockInfo> = [];

  private _gaugeValue = 0;
  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private arcGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;

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

    this.drawScale();

    // Create a group for the arcs
    this.arcGroup = this.svg.append( 'g' )
      .attr( 'transform', 'translate(0, 0)' );

    //this.createBlockData();
    this.createBlocksForValue( 60 );

    // Bind the blockData array to the SVG elements
    this.drawBlocksFromArray();

    this.updateGauge( this.gaugeValue ) ;
  }

  drawScale (): void
  {
    const scaleValues = [ 0, 25, 50, 75, 100 ];  // Define scale values
    const scaleGroup = this.svg.append( 'g' );

    scaleValues.forEach( ( value ) =>
    {
      const angle = this.scaleToAngleRad( value );
      const xOuter = Math.sin( angle ) * this.mainTickOuterRadius;
      const yOuter = -Math.cos( angle ) * this.mainTickOuterRadius;
      const xInner = Math.sin( angle ) * this.mainTickInnerRadius;
      const yInner = -Math.cos( angle ) * this.mainTickInnerRadius;
      const xLabel = Math.sin( angle ) * this.labelRadius;
      const yLabel = -Math.cos( angle ) * this.labelRadius;

      // Draw tick marks
      scaleGroup.append( 'line' )
        .attr( 'x1', xInner )
        .attr( 'y1', yInner )
        .attr( 'x2', xOuter )
        .attr( 'y2', yOuter )
        .attr( 'stroke', 'black' )
        .attr( 'stroke-width', 2 );

      // Draw labels
      scaleGroup.append( 'text' )
        .attr( 'x', xLabel )
        .attr( 'y', yLabel )
        .attr( 'dy', '0.35em' )  // Center the text vertically
        .attr( 'text-anchor', 'middle' )
        .text( value );
    } );
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
    arcs.filter((d, i) => i === arcs.size() - 1)
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
  }

  // Helper function to convert the gauge value (0-100) to an angle
  scaleToAngleRad ( value: number ): number
  {
    const scale = d3.scaleLinear()
      .domain( [ 0, 100 ] )
      .range( [ -Math.PI / 2, Math.PI / 2 ] );  // Needle moves between -90 and 90 degrees (half-circle)
    return scale( value );
  }
}
