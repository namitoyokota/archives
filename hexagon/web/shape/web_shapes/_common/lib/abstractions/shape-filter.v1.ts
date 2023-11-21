import { ActionData$v1 } from '@galileo/web_commonlayoutmanager/adapter';

export interface ShapeFilter$v1 extends ActionData$v1 {
  /** Shape id that the filter came from */
  sourceId?: string;

  /** Radius if circle */
  radius?: number;

  /** Shape type */
  type?: 'Polygon' | 'Rectangle' | 'Circle' | 'Line';

  /** The coordinates of the shape */
  coordinates?: [[number[]]] | number[]; // Array of array of numbers
}
