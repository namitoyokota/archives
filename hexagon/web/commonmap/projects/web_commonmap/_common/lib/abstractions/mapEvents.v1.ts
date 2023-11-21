import { Subject, ReplaySubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Point$v1 } from './point.v1';
import { Size$v1 } from './size.v1';
import { MapBounds$v1 } from './mapBounds.v1';
import { MapviewState$v1 } from './mapviewState.v1';
import { MapDataRequest$v1 } from './mapDataRequest.v1';
import { DisplayPriorityMessage$v1 } from './displayPriorityMessage.v1';
import { MarkerDescriptor$v1 } from './markerDescriptor.v1';
import { Marker$v1 } from './marker.v1';
import { ClusterMarker$v1 } from './clusterMarker.v1';
import { Geometry$v1 } from './geometry.v1';

/** Private class for firing map events */
export class MapEventsSubs$v1 {
    /** Bus for the mapDataRequest event */
    mapDataRequestSub = new ReplaySubject<MapDataRequest$v1>();

    /** Bus for the mapClicked event */
    mapClickedSub: Subject<Point$v1> = new Subject<Point$v1>();

    /** Bus for the mapResized event */
    mapResizedSub: Subject<Size$v1> = new Subject<Size$v1>();

    /** Bus for the mapBoundsChanged event */
    mapBoundsChangedSub: Subject<MapBounds$v1> = new Subject<MapBounds$v1>();

    /** Bus for the mapZoomChanged event */
    mapZoomChangedSub: Subject<number> = new Subject<number>();

    /** Bus for the mapviewStateChanged event */
    mapviewStateChangedSub: Subject<MapviewState$v1> = new Subject<MapviewState$v1>();

    /** Bus for the markerDisplayPriorityChanged event */
    markerDisplayPriorityChangedSub: Subject<DisplayPriorityMessage$v1> = new Subject<DisplayPriorityMessage$v1>();

    /** Bus for the clusterMarkerExpanding event */
    clusterMarkerExpandingSub: Subject<MarkerDescriptor$v1> = new Subject<MarkerDescriptor$v1>();

    /** Bus for the marker drag start event */
    markerDragStartedSub: Subject<MarkerDescriptor$v1> = new Subject<MarkerDescriptor$v1>();

    /** Bus for the marker drag end event */
    markerDragEndedSub: Subject<MarkerDescriptor$v1> = new Subject<MarkerDescriptor$v1>();

    /** Bus for the marker drag end event */
    markerClickedSub: Subject<Marker$v1> = new Subject<Marker$v1>();

    /** Bus for the popup hidden event */
    markerPopupClosedSub: Subject<MarkerDescriptor$v1> = new Subject<MarkerDescriptor$v1>();

    /** Bus for the marker drag end event */
    clusterMarkerClickedSub: Subject<ClusterMarker$v1> = new Subject<ClusterMarker$v1>();

    /** Bus for the layer panel display state (open/closed) change event */
    layerPanelDisplayStateChangedSub = new Subject<boolean>();

    /** Bus for the mapCommunicationClosed event */
    mapCommunicationClosedSub: Subject<boolean> = new Subject<boolean>();

    /** Bus for the geometry clicked event */
    geometryClickedSub = new Subject<Geometry$v1>();
 }

 /** Class defining the events that are fired from a Map component */
export class MapEvents$v1 {

    /** Private interface for firing map events */
    subs: MapEventsSubs$v1 = new MapEventsSubs$v1();

    /** Event fired by map to initially load data for a map layer  */
    readonly mapDataRequest$?: Observable<MapDataRequest$v1> = this.subs.mapDataRequestSub.asObservable().pipe(
                        filter(item => !!item)
    );

    /** Event fired when user clicks on a map */
    readonly mapClicked$: Observable<Point$v1> = this.subs.mapClickedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when map resizes */
    readonly mapResized$: Observable<Size$v1> = this.subs.mapResizedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when map bounds changes.  The map bounds will be sent as a parameter */
    readonly mapBoundsChanged$: Observable<MapBounds$v1> = this.subs.mapBoundsChangedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when map zoom changes */
    readonly mapZoomChanged$: Observable<number> = this.subs.mapZoomChangedSub.asObservable();

    /** Event fired when map view bounds and or zoom changes */
    readonly mapviewStateChanged$: Observable<MapviewState$v1> = this.subs.mapviewStateChangedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when marker display priority changed */
   readonly markerDisplayPriorityChanged$: Observable<DisplayPriorityMessage$v1> =
            this.subs.markerDisplayPriorityChangedSub.asObservable().pipe(
                filter(item => !!item)
    );

    /** Event fired when a capability notifies the map that it is expanding a cluster marker. */
   readonly clusterMarkerExpanding$: Observable<MarkerDescriptor$v1> = this.subs.clusterMarkerExpandingSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when a marker drag event starts. */
   readonly markerDragStarted$: Observable<MarkerDescriptor$v1> = this.subs.markerDragStartedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when a marker drag event starts. */
    readonly markerDragEnded$: Observable<MarkerDescriptor$v1> = this.subs.markerDragEndedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when a marker drag event starts. */
    readonly markerClicked$: Observable<Marker$v1> = this.subs.markerClickedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when a marker popup is closed */
    readonly markerPopupClosed$: Observable<MarkerDescriptor$v1> = this.subs.markerPopupClosedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when a marker drag event starts. */
    readonly clusterMarkerClicked$: Observable<ClusterMarker$v1> = this.subs.clusterMarkerClickedSub.asObservable().pipe(
        filter(item => !!item)
    );

    /** Event fired when layer panel display state changes */
    readonly layerPanelDisplayStateChanged$: Observable<boolean> = this.subs.layerPanelDisplayStateChangedSub.asObservable();

    /** Event fired when communication is closed to this map */
    readonly mapCommunicationClosed$: Observable<boolean> = this.subs.mapCommunicationClosedSub.asObservable();

    /** Event fired when geometry is clicked on the map */
    readonly geometryClicked$: Observable<Geometry$v1> = this.subs.geometryClickedSub.asObservable().pipe(
        filter(item => !!item)
    );
}
