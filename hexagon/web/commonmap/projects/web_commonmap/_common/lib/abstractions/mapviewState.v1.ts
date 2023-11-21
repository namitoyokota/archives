import { MapBounds$v1 } from './mapBounds.v1';

/** Represents the current view state of a map */

export class MapviewState$v1 {
    /** Bounds of the map view */
    bounds?: MapBounds$v1;
    /** Zoom level of the map view */
    zoomLevel?: number;

    constructor (params = {} as MapviewState$v1 ) {
        const {
            bounds,
            zoomLevel
        } = params;
        this.bounds = bounds;
        this.zoomLevel = zoomLevel;
    }
}
