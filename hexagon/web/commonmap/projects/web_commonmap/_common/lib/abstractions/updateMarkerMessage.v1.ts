import { Point$v1 } from './point.v1';
import { MarkerDescriptor$v1 } from './markerDescriptor.v1';

/** Parameters that are passed when updating the location of a marker */
export class UpdateMarkerMessage$v1 {
    /** Updated coordinate for the marker */
    coordinate: Point$v1;

    /** Marker descriptor of marker being updated */
    markerDescriptor: MarkerDescriptor$v1;

    constructor(params = {} as UpdateMarkerMessage$v1) {
        const {
            coordinate,
            markerDescriptor
        } = params;

        this.coordinate = coordinate;
        this.markerDescriptor = markerDescriptor;
    }
}
