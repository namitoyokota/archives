import { Point$v1 } from './point.v1';
import { UpdateMarkerMessage$v1 } from './updateMarkerMessage.v1';
import { MarkerDescriptor$v1 } from './markerDescriptor.v1';
import { MapCommunication$v1 } from './mapCommunication.v1';
import { DisplayPriority$v1 } from './displayPriority.v1';
import { DisplayPriorityMessage$v1 } from './displayPriorityMessage.v1';
import { DraggableOptionMessage$v1 } from './draggableOptionMessage.v1';
import { DisplayPopupMessage$v1 } from './displayPopupMessage.v1';
import { MarkerSettings$v1 } from './markerSettings.v1';
import { ZoomMessage$v1 } from './zoomMessage.v1';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
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
    locationChangedSub = new Subject<UpdateMarkerMessage$v1>();

    /** Bus for marker removed event */
    markerRemovedSub = new Subject<MarkerDescriptor$v1>();

    /** Bus for marker is clicked on the map event */
    markerClickedSub = new Subject<MarkerDescriptor$v1>();
}

/** Information needed to add a marker to the map */
export class Marker$v1 {

    /** Settings used to create the marker */
    markerSettings: MarkerSettings$v1<any>;

    /** Id of the marker assigned by the map when the marker is added  */
    markerId?: string;

    /** Id of the map layer that owns the marker.  If layerId is null, marker will be added to the dynamics layer
    * on the map.
    */
    layerId?: string;

    /** Coordinate where the marker is positioned */
    coordinate: Point$v1;

    /** Display Priority for the marker */
    displayPriority?: DisplayPriority$v1;

    /** Map Communication interface object for the map where the cluster marker resides */
    mapComm: MapCommunication$v1;

    /*
    /** Private interface provided by the map to manipulate and receive events from markers */
    markerSubs: MarkerCommunicationSubs$v1;

    /** Event fired when the marker location is updated by drag  */
    readonly locationChanged$?: Observable<UpdateMarkerMessage$v1>;

    /** Event fired when marker is removed */
    readonly markerRemoved$?: Observable<MarkerDescriptor$v1>;

    /** Event fired when marker is clicked.  This event will not be fired when component icons are being
    *  used on 2d maps.
    */
    readonly markerClicked$?: Observable<MarkerDescriptor$v1>;

    constructor(params: Marker$v1 = {} as Marker$v1) {
        const {
            markerSettings,
            markerSubs,
            markerId,
            layerId,
            coordinate,
            displayPriority,
            mapComm
        } = params;

        this.markerSettings = markerSettings;
        this.markerSubs = markerSubs;
        this.markerId = markerId;
        this.layerId = layerId;
        this.coordinate = coordinate;
        this.displayPriority = displayPriority;
        this.mapComm = mapComm;

        if (this.markerSubs) {
            this.locationChanged$ = this.markerSubs.locationChangedSub.asObservable().pipe(
                filter(item => !!item && item.markerDescriptor.markerId === this.markerId && item.markerDescriptor.layerId === this.layerId)
            );
            this.markerRemoved$ = this.markerSubs.markerRemovedSub.asObservable().pipe(
                filter(item => !!item && item.markerId === this.markerId && item.layerId === this.layerId)
            );
            this.markerClicked$ = this.markerSubs.markerClickedSub.asObservable().pipe(
                filter(item => !!item && item.markerId === this.markerId && item.layerId === this.layerId)
            );
        }
    }

    async update?(latitude: number, longitude: number, altitude?: number) {

        const coord = new Point$v1(latitude, longitude, altitude);
        const updateParams = new UpdateMarkerMessage$v1({
            coordinate: coord,
            markerDescriptor: new MarkerDescriptor$v1(this.markerId, this.layerId)
        } as UpdateMarkerMessage$v1);

        await this.markerSubs.updateSub.next(updateParams);
    }
    /**
    * Delete marker from map
    */
    async delete?() {
        await this.markerSubs.deleteSub.next(new MarkerDescriptor$v1(this.markerId, this.layerId));
    }


    /**
     * Set the display priority of the marker.  When setting the display priority to focused, the marker will be
     * removed from the cluster and displayed individually on the highest display level.  The map will also automatically
     * pan to center the marker in the map window if the marker is close to the edge.
     *
     * @param displayPriority - display priority to set
     * @param disableAutoPanOnFocus - Stop the auto panning of the map when display priority set to focused
     */

    async setDisplayPriority?(displayPriority: DisplayPriority$v1, disableAutoPanOnFocus?: boolean) {
        await this.markerSubs.setDisplayPrioritySub.next(
                new DisplayPriorityMessage$v1({
                    disableAutoPanOnFocus: disableAutoPanOnFocus,
                    displayPriority: displayPriority,
                    markerDescriptor: new MarkerDescriptor$v1(this.markerId, this.layerId)
                } as DisplayPriorityMessage$v1));
    }

    /**
    * Zooms the map to center around the map marker and zoom to the input zoom level
    *
    * @param zoomLevel - Level to zoom the map
    */
   async zoomTo?(zoomLevel: number) {
        await this.markerSubs.zoomToSub.next(new ZoomMessage$v1({
            zoomLevel: zoomLevel,
            markerDescriptor: new MarkerDescriptor$v1(this.markerId, this.layerId)
        } as ZoomMessage$v1));
    }

    /**
     * Pans the map to center around the map marker
     */
    async panTo?() {
        this.markerSubs.panToSub.next(new MarkerDescriptor$v1(this.markerId, this.layerId));
    }

    /**
     * Set draggable flag on the map marker
     */
    async setDraggableOption?(draggable: boolean) {
        this.markerSubs.setDraggableOptionSub.next(new DraggableOptionMessage$v1({
            draggable: draggable,
            markerDescriptor: new MarkerDescriptor$v1(this.markerId, this.layerId)
        } as DraggableOptionMessage$v1));
    }


    /**
     * Method used display a popup window for a marker
     *
     * @param content - the content of the popup window.  This can be a string or an html element.
     * If this content is a string, a div will be created containing the content.
     *
     * @param panTo - optional flag to determine if the map should pan to center the marker.
     */
    async displayPopup(content: string | HTMLElement, panTo = true) {
        this.markerSubs.displayPopupSub.next({
            markerDescriptor: new MarkerDescriptor$v1(this.markerId, this.layerId),
            content: content,
            panTo: panTo
        } as DisplayPopupMessage$v1);
    }

    /**
     * Method used display a popup window for a marker
     *
     * @param content - the content of the popup window.  This can be a string or an html element.
     * If this content is a string, a div will be created containing the content.
     *
     * @param panTo - optional flag to determine if the map should pan to center the marker.
     */
    async hidePopup() {
        this.markerSubs.hidePopupSub.next(new MarkerDescriptor$v1(this.markerId, this.layerId));
    }
}
