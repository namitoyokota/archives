import { MarkerDescriptor$v1 } from './markerDescriptor.v1';

/** Parameters passed in message when displaying a popup window for a marker */
export class DisplayPopupMessage$v1 {

    /** Marker descriptor of marker to zoom to */
    markerDescriptor: MarkerDescriptor$v1;

    /** popup content */
    content: string | HTMLElement;

    /** Flag to indicate whether the auto pan should occur when popup is displayed for a marker.
     */
    disableAutoPan?;

    constructor(params = {} as DisplayPopupMessage$v1) {

        const {
            markerDescriptor,
            content,
            disableAutoPan = false
        } = params;

        this.markerDescriptor = markerDescriptor;
        this.content = content;
        this.disableAutoPan = disableAutoPan;
    }
}
