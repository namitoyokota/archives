import { MarkerDescriptor$v1 } from './markerDescriptor.v1';

/** Parameters passed when zooming the map to a specific level around a marker */
export class ZoomMessage$v1 {

    /** Zoom level */
    zoomLevel: number;

    /** Marker descriptor of marker to zoom to */
    markerDescriptor: MarkerDescriptor$v1;

    constructor(params = {} as ZoomMessage$v1) {
        const {
            markerDescriptor,
            zoomLevel = 15
        } = params;

        this.markerDescriptor = markerDescriptor;
        this.zoomLevel = zoomLevel;
    }
}
