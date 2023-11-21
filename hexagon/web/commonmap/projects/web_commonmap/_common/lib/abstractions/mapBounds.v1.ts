import { Point$v1 } from './point.v1';

/** Represents the geographic bounds */

export class MapBounds$v1 {
    /** Bottom-left geographic coordinate */
    bottomLeft: Point$v1;
    /** Bottom-right geographic coordinate */
    bottomRight: Point$v1;
    /** Top-left geographic coordinate */
    topLeft: Point$v1;
    /** Top-right geographic coordinate */
    topRight: Point$v1;
    /** Map center */
    center: Point$v1;

    constructor (topLeft: Point$v1, bottomRight: Point$v1, center?: Point$v1 ) {
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
        this.center = center;

        this.bottomLeft = new Point$v1(this.topLeft.latitude, this.bottomRight.longitude, this.bottomRight.altitude);
        this.topRight = new Point$v1(this.bottomRight.latitude, this.topLeft.longitude, this.topLeft.altitude);
    }
}
