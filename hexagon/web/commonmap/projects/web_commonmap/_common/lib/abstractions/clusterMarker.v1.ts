import { Subject, BehaviorSubject } from 'rxjs';
import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { Point$v1 } from './point.v1';
import { ClusterSettings$v1 } from './clusterSettings.v1';
import { Marker$v1 } from './marker.v1';
import { MapCommunication$v1 } from './mapCommunication.v1';
import { DisplayPriority$v1 } from './displayPriority.v1';
import { DisplayPriorityMessage$v1 } from './displayPriorityMessage.v1';
import { MarkerDescriptor$v1 } from './markerDescriptor.v1';
import { ZoomMessage$v1 } from './zoomMessage.v1';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

/** Private interface for communication with map */
export class ClusterMarkerCommunicationSubs$v1 {

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

    /** Bus for marker removed event */
    childMarkersUpdatedSub = new Subject<ClusterMarker$v1>();

    /** Bus for marker removed event */
    markerRemovedSub = new Subject<MarkerDescriptor$v1>();

    /** Bus for marker is clicked on the map event */
    markerClickedSub = new Subject<MarkerDescriptor$v1>();
}

/** Information that is injected into the cluster marker component when a cluster marker is created
 *  on the map.
 */
export class ClusterMarker$v1 {

    /** Id assigned by the map for the cluster marker when marker is added to map.  This will be used to
     *  identify the cluster marker when communicating with the map.
     */
    markerId: string;

    /** Id assigned to the data layer on the map that owns the cluster marker */
    layerId?: string;

    /** Location of cluster marker */
    coordinate: Point$v1;

    /** Map Communication interface object for the map where the cluster marker resides */
    mapComm: MapCommunication$v1;

    /** User defined settings defined for this layer. */
    clusterSettings?: ClusterSettings$v1<any>;

    /**
     * Array of Marker$v1 objects that correspond to the child markers contained in this
     * cluster marker;
     */
    childMarkers?: Marker$v1[];


    /** Private interface for communicating with map */
    markerSubs: ClusterMarkerCommunicationSubs$v1;

    /**
     * Event that is fired when the list of child markers in a cluster is modified.
     */
    readonly childMarkersUpdated$?: Observable<ClusterMarker$v1>;

    /** Event fired when marker is removed */
    readonly markerRemoved$?: Observable<MarkerDescriptor$v1>;

    /** Event fired when marker is clicked.  This event will not be fired when component icons are being
    *  used on 2d maps.
    */
    readonly markerClicked$?: Observable<MarkerDescriptor$v1>;

   constructor(params: ClusterMarker$v1 = {} as ClusterMarker$v1) {
        const {
            markerId,
            layerId,
            coordinate,
            childMarkers = [],
            mapComm,
            markerSubs,
            clusterSettings
        } = params;

        this.markerId = markerId;
        this.layerId = layerId;
        this.coordinate = coordinate;
        this.childMarkers = childMarkers;
        this.clusterSettings = clusterSettings;
        this.mapComm = mapComm;
        this.markerSubs = markerSubs;
        if (this.markerSubs) {
            this.childMarkersUpdated$ = this.markerSubs.childMarkersUpdatedSub.asObservable().pipe(
                filter(item => !!item && item.markerId === this.markerId && item.layerId === this.layerId)
            );
            this.markerRemoved$ = this.markerSubs.markerRemovedSub.asObservable().pipe(
                filter(item => !!item && item.markerId === this.markerId && item.layerId === this.layerId)
            );
            this.markerClicked$ = this.markerSubs.markerClickedSub.asObservable().pipe(
                filter(item => !!item && item.markerId === this.markerId && item.layerId === this.layerId)
            );
        }
    }

    /**
    * Set display priority of the marker
    */

    async setDisplayPriority?(displayPriority: DisplayPriority$v1, disableAutoPanOnFocus?: boolean) {
        await this.markerSubs.setDisplayPrioritySub.next(
            new DisplayPriorityMessage$v1({
                displayPriority: displayPriority,
                markerDescriptor: new MarkerDescriptor$v1(this.markerId, this.layerId),
                disableAutoPanOnFocus: disableAutoPanOnFocus
            } as DisplayPriorityMessage$v1));
    }

    /**
    * Zoom map to the bounds represented by the markers that are part of this cluster.
    */
    async zoomToClusterBounds(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {

            const mailbox = new MailBox<MarkerDescriptor$v1, boolean>(new MarkerDescriptor$v1(this.markerId, this.layerId));

            // Listen for response in the mailbox
            mailbox.response.subscribe((maxZoomReached: boolean) => {
                resolve(maxZoomReached);
                mailbox.close();
            });

            this.markerSubs.zoomToClusterBoundsSub.next(mailbox);
        });
    }
    /**
     * Notify that the cluster marker is being expanded
     *
     * @param clusterMarkerSettings for cluster being expanded
     */

    async notifyClusterMarkerExpanding() {
        await this.markerSubs.notifyClusterMarkerExpandingSub.next(new MarkerDescriptor$v1(this.markerId, this.layerId));
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

}
