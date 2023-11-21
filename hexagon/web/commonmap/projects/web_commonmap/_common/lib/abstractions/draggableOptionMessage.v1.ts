import { MarkerDescriptor$v1 } from './markerDescriptor.v1';

/** Parameters that are passed when updating the location of a marker */
export class DraggableOptionMessage$v1 {
    /** Draggable flag for the marker */
    draggable: boolean;

    /** Marker descriptor of marker being updated */
    markerDescriptor: MarkerDescriptor$v1;

    constructor(params = {} as DraggableOptionMessage$v1) {
        const {
            draggable = false,
            markerDescriptor
        } = params;

        this.draggable = draggable;
        this.markerDescriptor = markerDescriptor;
    }
}
