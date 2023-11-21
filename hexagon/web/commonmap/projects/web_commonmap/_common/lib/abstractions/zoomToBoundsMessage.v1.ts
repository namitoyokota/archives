import { MapBounds$v1 } from './mapBounds.v1';
import { Point$v1 } from './point.v1';
import { PixelPoint$v1 } from './pixelPoint.v1';
import { matExpansionAnimations } from '@angular/material/expansion';

/**
 * Parameters passed when zooming the map to fit an area.  The area is defined by a
 * bounds (upper left coordinate/ lower right coordinate) or by a series of coordinates.
 * If both bounds and coordinates are specified, the bounds will be used.
 * Optionally, you can ensure the area is a certain distance from the edges of the map by defining a
 * padding value in pixel.  The zoom level can be limited by defining a maximum zoom.
 */
export class ZoomToBoundsMessage$v1 {

    /** Map bounds defining the area */
    bounds?: MapBounds$v1;

    /** Coordinates used to calculate the area */
    coordinates?: Point$v1[];

    /** Minimum space to ensure from edges of map */
    padding?: PixelPoint$v1;

    /** Maximum zoom to allow when fitting bounds */
    maxZoom?: number;

    constructor(params = {} as ZoomToBoundsMessage$v1) {
        const {
            bounds,
            coordinates,
            padding,
            maxZoom
        } = params;

        this.bounds = bounds;
        this.coordinates = coordinates;
        this.padding = padding;
        this.maxZoom = maxZoom;
    }
}
