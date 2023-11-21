import { Size$v1 } from './size.v1';
import { Point$v1 } from './point.v1';
import { PixelPoint$v1 } from './pixelPoint.v1';
import { DisplayPriority$v1 } from './displayPriority.v1';
import { IconDefinition2d$v1 } from './iconDefinition2d.v1';
import { IconDefinition3d$v1 } from './iconDefinition3d.v1';

/** Information needed to add a component marker to the map */
export class MarkerSettings$v1<T> {

    /** Coordinate where the marker is positioned */
    coordinate: Point$v1;

    /** The heading of the marker, defined as an azimuth: the clockwise angle from the north direction,
     *  in degrees (range [0, 360]). This is for 3d maps only.
     *
     *  A heading of 0 means the icon will always be pointing towards the
     *  north pole. A value of 90 will make the icon always point towards the east, etc. A heading that
     *  is not a Number or Number.NaN, is ignored.
     *
     *  The heading property can be used together with rotation. The rotation can be used to 'correct'
     *  a left-pointing arrow icon image, to make it point upwards (by setting a rotation of 90). Then,
     *  using a heading of 0 makes the arrow icon always point towards the north pole.
     *
     */

    heading?: number;

    /** (3d maps only) Whether or not this icon should be draped on top of the terrain.
     *  This is for 3d maps only.
     *
     *  By default, an icon is draped if the geometry has undefined or zero Z.
     *  Otherwise it will not be draped.
     *
     *  You can override the default behavior by setting this flag true or false.
     *  If you explicitly drape for a 3D point with height, its height is discarded.
     */
    draped?: boolean;

    /** Flag to indicate if marker should be part of the cluster group for the layer.  If
     *  clustering is disabled for the layer, this parameter will be ignored.
     */
    addToCluster?: boolean;

    /** Draggable flag */
    draggable?: boolean;

    /** Display Priority for the marker */
    displayPriority?: DisplayPriority$v1;

    /** Icon to use for the marker on 2d map */
    iconDefinition2d?: IconDefinition2d$v1;

    /** Icon to use for the marker on 3d map */
    iconDefinition3d?: IconDefinition3d$v1;

    /** Object to store private properties. */
    properties?: T;

    /** Id of the map layer that owns the marker.  If layerId is null, marker will be added to the dynamics layer
     * on the map.
     */
    layerId?: string;

    constructor(params: MarkerSettings$v1<T> = {} as MarkerSettings$v1<T>) {
        const {
            coordinate,
            heading,
            draped,
            displayPriority = DisplayPriority$v1.Normal,
            addToCluster = true,
            draggable = false,
            layerId = 'dynamics',
            iconDefinition2d,
            iconDefinition3d,
            properties
        } = params;

        this.coordinate = coordinate;
        this.heading = heading;
        this.draped = draped;
        this.displayPriority = displayPriority;
        this.addToCluster = addToCluster;
        this.draggable = draggable;
        this.layerId = layerId;
        this.iconDefinition2d = iconDefinition2d;
        this.iconDefinition3d = iconDefinition3d;
        this.properties = properties;
    }
}
