import { ImageIcon$v1 } from './imageIcon.v1';
import { ComponentIcon$v1 } from './componentIcon.v1';
import { Size$v1 } from './size.v1';
import { PixelPoint$v1 } from './pixelPoint.v1';

export class IconDefinition3d$v1 {

    /** Icon definition for marker when displayed on a 3d map */
    icon: ImageIcon$v1 | ComponentIcon$v1<any>;

    /** Size of the container for the icon in pixels.
     */
    iconSize?: Size$v1;

    /** Anchor point for the icon.  This will be the center of the marker by default if no anchor is defined.
     * If a different anchor point is needed then specify the location in x and y pixels
    */
    iconAnchor?: PixelPoint$v1;

    /** Opacity for the image */
    opacity?: number;

    /** Offset in pixels from the location of the marker to display the icon. */
    markerOffset?: PixelPoint$v1;

    /** Rotation to apply to the icon for the marker.  Specify in degrees. */
    rotation?: number;

    constructor (params = {} as IconDefinition3d$v1) {
        const {
            icon,
            iconSize = new Size$v1(32, 32),
            iconAnchor,
            opacity = 1,
            markerOffset,
            rotation
        } = params;
        this.icon = icon;
        this.iconSize = iconSize;
        if (iconAnchor) {
            this.iconAnchor = iconAnchor;
        } else {
            this.iconAnchor = new PixelPoint$v1(this.iconSize.width / 2, this.iconSize.height / 2);
        }
        this.opacity = opacity;
        this.markerOffset = markerOffset;
        this.rotation = rotation;
    }
}
