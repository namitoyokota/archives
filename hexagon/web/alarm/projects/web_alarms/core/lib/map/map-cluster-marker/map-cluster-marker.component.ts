import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import {
    Alarm$v1,
    capabilityId,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
    RestrictIds$v1,
} from '@galileo/web_alarms/_common';
import { Guid, StoreService } from '@galileo/web_common-libraries';
import {
    ClusterMarker$v1,
    ComponentIcon$v1,
    DisplayPriority$v1,
    IconDefinition2d$v1,
    MapCommunication$v1,
    MapType$v1,
    Marker$v1,
    MarkerDescriptor$v1,
    MarkerSettings$v1,
    Point$v1,
    Size$v1,
} from '@galileo/web_commonmap/adapter';
import { Subject, Subscription } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';

import { ClusterMarkerDetailsSettings } from '../map-cluster-details/map-cluster-details.component';
import { MapService } from '../map.service';
import { TranslationTokens } from './map-cluster-marker.translation';

export interface ClusterMarkerSettings {
    id: string;
    showDetails: boolean;
    mapComm: MapCommunication$v1;
}

const maxWidth = 360;

@Component({
    templateUrl: 'map-cluster-marker.component.html',
    styleUrls: ['map-cluster-marker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('fadeout', [
            transition(':enter', [
                style({ opacity: '1' }),
                animate(200)
            ]),
            transition(':leave', [
                animate(200, style({ opacity: '0' }))
            ]),
            state('*', style({ opacity: '1' })),
        ])
    ]
})

export class MapClusterMarkerInjectableComponent implements OnInit, OnDestroy {

    /** The component marker options for the children of this cluster marker  */
    childMarkers: any;

    /** Flag that is set to true will show the title tooltip */
    showToolTip = false;

    /** Count of children inside of the cluster marker */
    childCount = 0;

    /** Highest priority of all child markers */
    highestPriority = null;

    /** Flag to indicate the marker should have focus */
    isFocused = false;

    /** Show Cluster List */
    showDetails = false;

    /** Expose translation tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Communication api to map */
    private mapComm: MapCommunication$v1;

    /** Map view window size */
    private mapViewSize: Size$v1;
    private childAlarmIds: string[];
    private highestPriorityId: string = null;
    private clusterDetailsMarker: Marker$v1;
    private markerClickedRef$: Subscription;
    private childMarkerUpdatedRef$: Subscription;
    private markerDeletedRef$: Subscription;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private cdr: ChangeDetectorRef,
        private alarmStore: StoreService<Alarm$v1>,
        private mapSvc: MapService,
        private zone: NgZone,
        @Inject(LAYOUT_MANAGER_SETTINGS) private clusterMarker: ClusterMarker$v1) {
    }

    ngOnInit() {

        this.clusterMarker.clusterSettings.properties.id = Guid.NewGuid();
        this.childCount = this.clusterMarker.childMarkers.length;
        this.childMarkers = this.clusterMarker.childMarkers;
        this.childAlarmIds = this.getClusteredAlarms().map((alarm) => {
            return (alarm.id);
        });
        this.mapComm = this.clusterMarker.mapComm;
        this.mapViewSize = this.mapComm.mapViewSize;

        this.setHighestPriority();
        this.getLayerInfo();

        this.listenToUpdateEvent();

        this.childMarkerUpdatedRef$ = this.clusterMarker.childMarkersUpdated$.subscribe(
            (clusterMarker: ClusterMarker$v1) => {
                if (clusterMarker) {
                    this.clusterMarker = clusterMarker;
                    this.childCount = this.clusterMarker.childMarkers.length;
                    this.childMarkers = this.clusterMarker.childMarkers;
                    this.childAlarmIds = this.getClusteredAlarms().map((alarm) => {
                        return (alarm.id);
                    });
                    this.highestPriority = null;
                    this.highestPriorityId = null;
                    this.setHighestPriority();
                }
            });

        this.mapComm.mapEvents.mapResized$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((size: Size$v1) => {
            this.mapViewSize = size;
        });

        // Listen for marker clicks from the 3d map or non component icons
        this.markerClickedRef$ = this.clusterMarker.markerClicked$.subscribe(
            async (markerDesc: MarkerDescriptor$v1) => {
                if (this.mapComm.mapType === MapType$v1.Type2D) {
                    let showClusterDetails = false;

                    if (this.childCount > 49 || this.mapViewSize.width <= maxWidth) {
                        const maxZoom = await this.clusterMarker.zoomToClusterBounds();
                        if (maxZoom) {
                            showClusterDetails = true;
                        }
                    } else {
                        showClusterDetails = true;
                    }

                    if (showClusterDetails) {
                        await this.clusterMarker.notifyClusterMarkerExpanding();

                        this.clusterMarker.setDisplayPriority(DisplayPriority$v1.Normal);
                        this.isFocused = false;
                        this.cdr.detectChanges();

                        const lat: number = this.clusterMarker.coordinate.latitude;
                        const lng: number = this.clusterMarker.coordinate.longitude;
                        const coordinate = new Point$v1(lat, lng);
                        const clusteredAlarms = this.getClusteredAlarms();
                        const clusterDetailsSettings: ClusterMarkerDetailsSettings = {
                            id: null,
                            clusteredAlarms: clusteredAlarms
                        };

                        const iconDef2d = new IconDefinition2d$v1({
                            icon: new ComponentIcon$v1<ClusterMarkerDetailsSettings>({
                                componentName: InjectableComponentNames.mapClusterDetailsComponent,
                                capabilityId: capabilityId,
                            } as ComponentIcon$v1<ClusterMarkerDetailsSettings>),
                            iconSize: new Size$v1(43, 43)
                        } as IconDefinition2d$v1);

                        const markerSettings = new MarkerSettings$v1({
                            coordinate: coordinate,
                            iconDefinition2d: iconDef2d,
                            addToCluster: false,
                            displayPriority: DisplayPriority$v1.Focused,
                            properties: clusterDetailsSettings,
                            layerId: this.clusterMarker.layerId
                        } as MarkerSettings$v1<any>);

                        this.clusterMarker.mapComm.addMarkersAsync(
                            markerSettings, this.clusterMarker.layerId).catch().then((retMarker: Marker$v1) => {
                                this.clusterDetailsMarker = retMarker;
                            });
                    }

                } else {
                    this.showDetails = true;
                    this.cdr.detectChanges();
                    await this.clusterMarker.notifyClusterMarkerExpanding();
                    const markerDeleted$ = this.mapSvc.openClusterDetailsMarker(this.mapComm, this.clusterMarker);
                    if (markerDeleted$) {

                        this.markerDeletedRef$ = markerDeleted$.pipe(
                            first(),
                            takeUntil(this.destroy$)
                        ).subscribe(() => {
                            this.showDetails = false;
                            this.cdr.detectChanges();
                            this.markerDeletedRef$ = null;
                        });
                    } else {
                        this.showDetails = false;
                        this.cdr.detectChanges();
                    }
                }
            });
    }

    ngOnDestroy() {
        if (this.markerClickedRef$) {
            this.markerClickedRef$.unsubscribe();
            this.markerClickedRef$ = null;
        }
        if (this.childMarkerUpdatedRef$) {
            this.childMarkerUpdatedRef$.unsubscribe();
            this.childMarkerUpdatedRef$ = null;
        }

        if (this.markerDeletedRef$) {
            this.markerDeletedRef$.unsubscribe();
            this.markerDeletedRef$ = null;
        }

        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    async getLayerInfo() {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }

    /** Get the child alarms and find the highest priority */
    setHighestPriority() {
        const children = this.childMarkers;

        for (const child of children) {
            const alarmId = child.markerSettings.properties.alarmId;

            // const alarm = this.coreSrv.getAlarmById(alarmId);
            const alarm = this.alarmStore.snapshot(alarmId);
            if (alarm) {
                if (!alarm.isRedacted(RestrictIds$v1.priority) && typeof (alarm.priority) !== 'undefined') {
                    if (this.highestPriority === null || this.highestPriority > alarm.priority) {
                        this.highestPriority = alarm.priority;
                        this.highestPriorityId = alarm.id;
                    }
                }
            }
        }
        this.cdr.detectChanges();
    }

    /**
     * Mouse over of map marker
     */
    mouseEnter() {
        this.clusterMarker.setDisplayPriority(DisplayPriority$v1.Top);
        this.isFocused = true;
        this.showToolTip = true;
    }

    /**
     * Mouse leaves map marker
     */
    mouseLeave() {
        this.clusterMarker.setDisplayPriority(DisplayPriority$v1.Normal);
        this.isFocused = false;
        this.showToolTip = false;
    }

    /**
     * Get the list of alarms in the cluster
     */
    getClusteredAlarms(): Alarm$v1[] {
        const clusteredAlarms = [];
        const children = this.childMarkers;

        for (const child of children) {
            const alarmId = child.markerSettings.properties.alarmId;

            const alarm = this.alarmStore.snapshot(alarmId);
            if (alarm) {
                clusteredAlarms.push(alarm);
            }
        }

        return (clusteredAlarms);

    }

    /**
     * Stop propagation of mouse events
     *
     * @param event mouse event
     */
    stopPropagation(event) {
        event.stopPropagation();
    }

    /**
     * Listen to alarm update events
     */
    private listenToUpdateEvent() {
        this.alarmStore.upserted$.pipe(
            takeUntil(this.destroy$),
            filter(changes => !!changes?.inserts?.length),
            map(changes => changes?.inserts)
        ).subscribe((alarms) => {
            for (const alarm of alarms) {
                const temp = this.childAlarmIds.find(id => id === alarm.id);
                if (temp) {
                    if (alarm.id === this.highestPriorityId) {
                        this.highestPriority = null;
                        this.highestPriorityId = null;
                        this.setHighestPriority();
                    } else {
                        if (!alarm.isRedacted(RestrictIds$v1.priority) && typeof (alarm.priority) !== 'undefined') {
                            if (this.highestPriority === null || this.highestPriority > alarm.priority) {
                                this.highestPriority = alarm.priority;
                                this.highestPriorityId = alarm.id;
                            }
                        }
                    }
                }
            }
            this.cdr.detectChanges();
        });
    }
}
