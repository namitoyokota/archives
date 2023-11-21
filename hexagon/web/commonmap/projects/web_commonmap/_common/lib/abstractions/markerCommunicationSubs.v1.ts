import { Subject, Observable, fromEventPattern } from 'rxjs';
import { MarkerDescriptor$v1 } from './markerDescriptor.v1';
import { UpdateMarkerMessage$v1 } from './updateMarkerMessage.v1';
import { ZoomMessage$v1 } from './zoomMessage.v1';
import { DisplayPriorityMessage$v1 } from './displayPriorityMessage.v1';
import { DraggableOptionMessage$v1 } from './draggableOptionMessage.v1';
import { DisplayPopupMessage$v1 } from './displayPopupMessage.v1';
import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';

/** Private interface for communication with map */
export class MarkerCommunicationSubs$v1 {
    /**
     * Subject to fire when the component marker should be updated on the map
     *
     * @param updateParams: Contains the markerInfo and new coordinate information.
     */
    updateSub = new Subject<UpdateMarkerMessage$v1>();
    /**
     * Subject to fire when the component marker should be deleted from the map
     *
     * @param markerInfo: Info that contains the markerId and layerId to identify the marker
     */
    deleteSub = new Subject<MarkerDescriptor$v1>();

    /**
     * Subject to fire to set the display priority of the marker
     *
     * @param displayPriorityInfo: Info that contains the markerId and layerId to identify the marker and the new display priority
     */
    setDisplayPrioritySub = new Subject<DisplayPriorityMessage$v1>();

    /**
     * Subject to fire to zoom to the marker location
     *
     * @param zoomParams: Contains the markerInfo and zoom level
    */
    zoomToSub = new Subject<ZoomMessage$v1>();

    /**
     * Subject to fire to pan the map to the marker location
     *
     * @param markerInfo: Info that contains the markerId and layerId to identify the marker
    */
    panToSub = new Subject<MarkerDescriptor$v1>();

    /**
     * Subject to fire to notify that the cluster marker is being expanded.  This allows other
     * capabilities to close their expanded clusters so that only one is open at a time.
     */
    notifyClusterMarkerExpandingSub = new Subject<MarkerDescriptor$v1>();

    /**
     * Subject to fire to zoom the map to the bounds of the cluster.
     */
    zoomToClusterBoundsSub = new Subject<MailBox<MarkerDescriptor$v1, boolean>>();

    /** Subject to fire to set marker option */
    setDraggableOptionSub = new Subject<DraggableOptionMessage$v1>();

    /** Subject to fire to open the popup window for a marker */
    displayPopupSub = new Subject<DisplayPopupMessage$v1>();

    /** Subject to fire to hide the marker popup if one is displayed. */
    hidePopupSub = new Subject<MarkerDescriptor$v1>();

    // Subjects for marker events

    /** Bus for the location updates event */
    locationChangedSub: Subject<UpdateMarkerMessage$v1> = new Subject<UpdateMarkerMessage$v1>();

    /** Bus for marker removed event */
    markerRemovedSub = new Subject<MarkerDescriptor$v1>();

    /** Bus for marker is clicked on the map event */
    markerClickedSub = new Subject<MarkerDescriptor$v1>();

}

