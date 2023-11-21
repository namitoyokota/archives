import { Point$v1 } from './point.v1';
/** Parameters that describe the map zoom level and center point */
export class MapPanZoomMessage$v1 {

    /** Zoom level */
    zoomLevel?: number;

    /** Map Center */
    mapCenter?: Point$v1;

    constructor(params = {} as MapPanZoomMessage$v1) {
        const {
            zoomLevel = 15,
            mapCenter
        } = params;

        this.zoomLevel = zoomLevel;
        this.mapCenter = mapCenter;
    }
}
