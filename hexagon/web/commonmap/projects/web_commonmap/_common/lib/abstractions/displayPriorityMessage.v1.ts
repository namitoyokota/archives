import { MarkerDescriptor$v1 } from './markerDescriptor.v1';
import { DisplayPriority$v1 } from './displayPriority.v1';

/** Parameters passed in message when setting the display priority of a marker */
export class DisplayPriorityMessage$v1 {

    /** Display priority */
    displayPriority: DisplayPriority$v1;

    /** Marker descriptor of marker being updated */
    markerDescriptor: MarkerDescriptor$v1;

    /** Flag to indicate whether the auto pan should occur when display priority is set to focused.
     */
    disableAutoPanOnFocus?;

    constructor(params = {} as DisplayPriorityMessage$v1) {

        const {
            markerDescriptor,
            displayPriority = DisplayPriority$v1.Normal,
            disableAutoPanOnFocus = false
        } = params;

        this.markerDescriptor = markerDescriptor;
        this.displayPriority = displayPriority;
        this.disableAutoPanOnFocus = disableAutoPanOnFocus;
    }
}
