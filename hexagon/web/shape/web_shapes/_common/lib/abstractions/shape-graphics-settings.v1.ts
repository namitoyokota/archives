import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { ShapeFillPattern$v1 } from './shape-fill-pattern.v1';
import { ShapeFillType$v1 } from './shape-fill-type.v1';

/**
 * How a shape looks
 */
export class ShapeGraphicsSettings$v1 {

  /** The fill color of the shape in hex */
  fillColor?: string;

  /** The fill pattern of the shape */
  fillPattern?: ShapeFillPattern$v1;

  /** The type of fill to be used */
  fillType?: ShapeFillType$v1;

  /** The color of the line color of the shape in hex */
  lineColor?: string;

  /** The type of line the shape has*/
  lineType?: LineType$v1;

  /** The weight of the line of the shape */
  lineWeight?: number;

  constructor(param: ShapeGraphicsSettings$v1 = {} as  ShapeGraphicsSettings$v1) {
    const {
      fillColor = null,
      fillPattern = null,
      fillType = null,
      lineColor = null,
      lineType = null,
      lineWeight = null
    } = param;

    this.fillColor = fillColor;
    this.fillPattern = fillPattern;
    this.fillType = fillType;
    this.lineColor = lineColor;
    this.lineType = lineType;
    this.lineWeight = lineWeight;
  }
}
