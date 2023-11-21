import { Injectable } from '@angular/core';
import {
    Alarm$v1,
    AlarmFilter$v1,
    capabilityId,
    InjectableComponentNames,
    RestrictIds$v1,
} from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import {
    ClusterMarker$v1,
    ClusterSettings$v1,
    CommonmapAdapterService$v1,
    ComponentIcon$v1,
    DisplayPriority$v1,
    IconDefinition2d$v1,
    IconDefinition3d$v1,
    MapCommunication$v1,
    MapDataRequest$v1,
    MapType$v1,
    Marker$v1,
    MarkerSettings$v1,
    Point$v1,
    Size$v1,
} from '@galileo/web_commonmap/adapter';
import { ShapeFilter$v1, ShapesAdapterService$v1 } from '@galileo/web_shapes/adapter';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter, first, map, startWith, takeUntil } from 'rxjs/operators';

import { ActionStoreService, FilterActionData$v1 } from '../action-store.service';
import { EventService } from '../event.service';
import { ClusterMarkerDetailsSettings } from './map-cluster-details/map-cluster-details.component';
import { ClusterMarkerSettings } from './map-cluster-marker/map-cluster-marker.component';
import { MarkerSettings } from './map-marker/map-marker.component';

export class MapController {

    /** map communication. */
    mapComm?: MapCommunication$v1;

    /** Map data request. */
    mapDataRequest?: MapDataRequest$v1;

    /** Map markers. */
    markersMap?: Map<string, Marker$v1>;

    /** Focused map markers. */
    focusedMarkersMap?: Map<string, Marker$v1>;

    /** Cluster details marker. */
    clusterDetailsMarker?: Marker$v1;

    /** Reference to observable providing alarm ids for channels */
    alarmIds$?: Observable<string[]>;

    /** Subscription reference for the alarmsIds$ observable */
    alarmIdsRef$?: Subscription;

    /** List of ids for missing alarms in the store.  This happens when channels have tombstoned
     * items that they have not loaded in the store.
     */
     missingIds?: string[];

     /** Subject fired to shut down listener of store events */
    clearStoreEvents$?: Subject<void>;

     /** Subject fired when this map is destroyed */
    mapDestroyed$?: Subject<void>;

    constructor(params: MapController = {} as MapController) {
        const {
            mapComm = null,
            mapDataRequest = null,
            markersMap = new Map<string, Marker$v1>(),
            focusedMarkersMap = new Map<string, Marker$v1>(),
            clusterDetailsMarker = null,
            alarmIds$ = null,
            alarmIdsRef$ = null,
            missingIds = []
        } = params;

        this.mapComm = mapComm;
        this.mapDataRequest = mapDataRequest;
        this.markersMap = markersMap;
        this.focusedMarkersMap = focusedMarkersMap;
        this.clusterDetailsMarker = clusterDetailsMarker;
        this.alarmIds$ = alarmIds$;
        this.alarmIdsRef$ = alarmIdsRef$;
        this.missingIds = missingIds;
        this.mapDestroyed$ = new Subject<void>();
    }
}

@Injectable()
export class MapService {

    /** Flag used to track when the  map service has been initialized. */
    initialized = false;

    /** Array of map controller objects that store the map communication and markers for a given map */
    mapControllers: MapController[] = [];

    constructor(private mapAdapterSvc: CommonmapAdapterService$v1,
                private eventSrv: EventService,
                private actionStore: ActionStoreService,
                private alarmStore: StoreService<Alarm$v1>,
                private ffAdapter: CommonfeatureflagsAdapterService$v1,
                private shapeAdapter: ShapesAdapterService$v1) {

        this.initListeners();
    }

    /** Subscribe to the map adapter events */
    subscribeToEvents() {
        this.mapAdapterSvc.mapAdapterEvents.mapViewLoaded$.subscribe((mapComm: MapCommunication$v1) => {

            const mapCont = new MapController({
                mapComm: mapComm
            });

            this.mapControllers.push(mapCont);

            mapComm.mapEvents.mapDataRequest$.pipe(
                filter((mapDataRequest) => mapDataRequest && mapDataRequest.capabilityId === capabilityId),
                takeUntil(mapCont.mapDestroyed$)
            ).subscribe((mapDataRequest) => {
                mapCont.mapDataRequest = mapDataRequest;
                this.handleMapDataRequest(mapCont);
            });

            mapComm.mapEvents.mapCommunicationClosed$.pipe(
                filter(item => !!item)
            ).subscribe(() => {
                const index = this.mapControllers.findIndex((cont) => {
                    return (cont.mapComm.mapId === mapComm.mapId);
                });

                if (index !== -1) {
                    const temp = this.mapControllers[index];
                    temp.mapDestroyed$.next();
                    temp.mapDestroyed$.complete();
                    temp.alarmIdsRef$ = null;
                    this.mapControllers.splice(index, 1);
                }
            });
        });

        this.initialized = true;
    }


    /** Load the initial data to the map */
    private handleMapDataRequest(mapCont: MapController) {
        // Set up the cluster settings for this layer before any data is added
        const clusterMarkerSize = new Size$v1(43, 43);
        const clusterComponentSettings: ClusterMarkerSettings = {
            mapComm: mapCont.mapComm,
            showDetails: false,
            id: null
        };

        const compClusterIcon = new ComponentIcon$v1<ClusterMarkerSettings>({
            componentName: InjectableComponentNames.mapClusterMarkerComponent,
            capabilityId: capabilityId,
        });

        const iconDef2d = new IconDefinition2d$v1({
            icon: compClusterIcon,
            iconSize: clusterMarkerSize
        } as IconDefinition2d$v1);

        const iconDef3d = new IconDefinition3d$v1({
            icon: compClusterIcon,
            iconSize: clusterMarkerSize,
        } as IconDefinition3d$v1);

        const clusterSettings = new ClusterSettings$v1<ClusterMarkerSettings>({
            iconDefinition2d: iconDef2d,
            iconDefinition3d: iconDef3d,
            properties: clusterComponentSettings
        } as ClusterSettings$v1<ClusterMarkerSettings>);

        mapCont.mapComm.setClusterSettingsForLayer(clusterSettings, mapCont.mapDataRequest.layerId);

        // Used to signal the store listener when to start processing store events
        const dataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
        mapCont.clearStoreEvents$ = new Subject<null>();

        this.listenToStoreEvents(mapCont, dataLoaded$);
        this.addAlarmsToMap(mapCont);
        // Start listening to store events
        dataLoaded$.next(true);
        this.listenToEventsFromMap(mapCont);
        this.listenToSelectionChangeEvent(mapCont);
        this.listenToFilterChangeEvent(mapCont);
    }

    /** Manually add a map to the map service */
    // Add method for channels
    addMapForChannels(mapComm: MapCommunication$v1, alarmIds$: Observable<string[]>) {
        // const temp = alarmIds$ !== null;
        // console.log("AddMapForChannels: " + temp.toString());
        const index = this.mapControllers.findIndex((cont) => {
            return (cont.mapComm.mapId === mapComm.mapId);
        });

        if (index !== -1) {
            this.removeMapForChannels(mapComm);
        }

        const mapCont = new MapController({
            mapComm: mapComm,
            alarmIds$: alarmIds$
        });

        this.mapControllers.push(mapCont);

        mapComm.mapEvents.mapDataRequest$.pipe(
            filter((mapDataRequest) => mapDataRequest && mapDataRequest.capabilityId === capabilityId),
            takeUntil(mapCont.mapDestroyed$)
        ).subscribe((mapDataRequest) => {
            mapCont.mapDataRequest = mapDataRequest;

            // Check to see if displaying list of alarms or all data on the channels map.
            if (alarmIds$) {
                this.setupMapLayerForChannels(mapCont);
                this.listenToAlarmIdChanges(mapCont);

            } else {
                this.handleMapDataRequest(mapCont);
            }
        });

        mapComm.mapEvents.mapCommunicationClosed$.pipe(
            filter(item => !!item)
        ).subscribe(() => {
            const idx = this.mapControllers.findIndex((cont) => {
                return(cont.mapComm.mapId === mapComm.mapId);
            });
            if (idx !== -1) {
                const temp = this.mapControllers[idx];
                temp.mapDestroyed$.next();
                temp.mapDestroyed$.complete();
                temp.alarmIdsRef$ = null;
                this.mapControllers.splice(idx, 1);
            }
        });
    }

    /** Manually remove a map to the map service */
    // Added method for channels
    removeMapForChannels(mapComm: MapCommunication$v1) {
        const index = this.mapControllers.findIndex((mapCont) => {
            return (mapCont.mapComm.mapId === mapComm.mapId);
        });

        if (index !== -1) {
            const mapCont = this.mapControllers[index];
            if (mapCont.clearStoreEvents$) {
                mapCont.clearStoreEvents$.next();
                mapCont.clearStoreEvents$.complete();
                mapCont.clearStoreEvents$ = null;
            }

            mapCont.mapComm.deleteAllMarkers(mapCont.mapDataRequest.layerId);
            mapCont.markersMap.clear();
            mapCont.focusedMarkersMap.clear();

            mapCont.mapDestroyed$.next();
            mapCont.mapDestroyed$.complete();
            mapCont.alarmIdsRef$ = null;
            this.mapControllers.splice(index, 1);
        }
    }


    /** Load the initial data to the map */
    setupMapLayerForChannels(mapCont: MapController) {
        // Set up the cluster settings for this layer before any data is added
        const clusterMarkerSize = new Size$v1(43, 43);
        const clusterComponentSettings: ClusterMarkerSettings = {
            mapComm: mapCont.mapComm,
            showDetails: false,
            id: null
        };

        const compClusterIcon = new ComponentIcon$v1<ClusterMarkerSettings>({
            componentName: InjectableComponentNames.mapClusterMarkerComponent,
            capabilityId: capabilityId,
        });

        const iconDef2d = new IconDefinition2d$v1({
            icon: compClusterIcon,
            iconSize: clusterMarkerSize
        } as IconDefinition2d$v1);

        const iconDef3d = new IconDefinition3d$v1({
            icon: compClusterIcon,
            iconSize: clusterMarkerSize,
        } as IconDefinition3d$v1);

        const clusterSettings = new ClusterSettings$v1<ClusterMarkerSettings>({
            iconDefinition2d: iconDef2d,
            iconDefinition3d: iconDef3d,
            properties: clusterComponentSettings
        } as ClusterSettings$v1<ClusterMarkerSettings>);

        mapCont.mapComm.setClusterSettingsForLayer(clusterSettings, mapCont.mapDataRequest.layerId );

        this.listenToEventsFromMap(mapCont);
        this.listenToSelectionChangeEvent(mapCont);
        this.listenToFilterChangeEvent(mapCont);
    }

    private async addAlarmsToMap(mapCont: MapController, alarmFilter: AlarmFilter$v1 = null, shapeFilter: ShapeFilter$v1 = null) {
        const markerSettingsList: MarkerSettings$v1<MarkerSettings>[] = [];

        this.alarmStore.entity$.pipe(
            map(list => {
                let filterList = [];
                if (alarmFilter) {
                    filterList = alarmFilter.apply(list);
                } else {
                    filterList = list;
                }

                // Apply shape filter
                if (shapeFilter?.coordinates) {
                    filterList = filterList.filter((alarm: Alarm$v1) => {
                    if (!alarm?.location?.coordinates?.latitude ||
                        !alarm?.location?.coordinates?.longitude) {
                        return false;
                    }

                    const point = [+alarm.location.coordinates.longitude, +alarm.location.coordinates.latitude];
                    return this.shapeAdapter.isPointInGeometry(shapeFilter, point);
                    });
                }

                return filterList;
            }),
            first()
        ).subscribe(async alarms => {
            for (const alarm of alarms) {
                const markerSettings: MarkerSettings$v1<MarkerSettings> =
                    this.createAlarmMarker(alarm, mapCont);
                if (markerSettings) {
                    markerSettingsList.push(markerSettings);
                }
            }

            await mapCont.mapComm.addMarkersAsync(markerSettingsList, mapCont.mapDataRequest.layerId).catch()
                .then((retMarkers: Marker$v1[]) => {
                    if (retMarkers) {
                        for (const marker of retMarkers) {
                            if (marker) {
                                mapCont.markersMap.set(marker.markerSettings.properties.alarmId, marker);
                                mapCont.markersMap.set(marker.markerId, marker);
                            }
                        }
                    }
                });
        });
    }

    /**
     * Sets up the component marker to use to create an alarm marker on the map
     * @param alarm The alarm to add to the map
     */
    private createAlarmMarker(alarm: Alarm$v1, mapCont: MapController): MarkerSettings$v1<MarkerSettings> {
        let markerSettings: MarkerSettings$v1<MarkerSettings>;

        if (!alarm?.isRedacted(RestrictIds$v1.location) && alarm?.location?.coordinates) {
            if (alarm.location.coordinates.latitude && alarm.location.coordinates.longitude) {
                try {
                    const lat: number = this.convertToFloat(alarm.location.coordinates.latitude);
                    const lng: number = this.convertToFloat(alarm.location.coordinates.longitude);
                    const alt: number = this.convertToFloat(alarm.location.coordinates.altitude);
                    const coordinate = new Point$v1(lat, lng, alt);
                    const markerSize = new Size$v1(38, 38);
                    const componentSettings = {
                        alarmId: alarm.id,
                        mapComm: mapCont.mapComm
                    };

                    const compIcon = new ComponentIcon$v1<MarkerSettings>({
                        componentName: InjectableComponentNames.mapMarkerComponent,
                        capabilityId: capabilityId,
                    });

                    const iconDef2d = new IconDefinition2d$v1({
                        icon: compIcon,
                        iconSize: markerSize,
                    });

                    const iconDef3d = new IconDefinition3d$v1({
                        icon: compIcon,
                        iconSize: markerSize,
                    } as IconDefinition3d$v1);

                    markerSettings = new MarkerSettings$v1<MarkerSettings>({
                        coordinate: coordinate,
                        iconDefinition2d: iconDef2d,
                        iconDefinition3d: iconDef3d,
                        addToCluster: true,
                        properties: componentSettings,
                        layerId: mapCont.mapDataRequest.layerId
                    });

                } catch (ex) {
                    console.error('Could not add alarm to map!', alarm, ex);
                }

            } else {
                console.warn('Alarm Map missing coordinates', alarm);
            }
        }

        return (markerSettings);
    }

    /**
     * Updates the map data
     */
    /**
     * Updates the map data
     */
    async updateMapData() {
        for (const mapCont of this.mapControllers) {
            if (!mapCont.alarmIds$) {
                if (mapCont.mapDataRequest) {
                    // Stop listening to store events
                    if (mapCont.clearStoreEvents$) {
                        mapCont.clearStoreEvents$.next();
                        mapCont.clearStoreEvents$.complete();
                        mapCont.clearStoreEvents$ = null;
                    }

                    mapCont.mapComm.deleteAllMarkers(mapCont.mapDataRequest.layerId);
                    mapCont.markersMap.clear();
                    mapCont.focusedMarkersMap.clear();

                    mapCont.clearStoreEvents$ = new Subject<null>();
                    // Used to signal the store listener when to start processing store events
                    const dataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
                    this.listenToStoreEvents(mapCont, dataLoaded$);
                    this.addAlarmsToMap(mapCont);
                    // Start listening to store events
                    dataLoaded$.next(true);
                }
            } else {
                this.listenToAlarmIdChanges(mapCont);
            }
        }
    }

    /**
     * Removes map data before reading incidents
     */
    async removeMapData() {

        for (const mapCont of this.mapControllers) {
            if (mapCont.mapDataRequest) {
                if (mapCont.clearStoreEvents$) {
                    mapCont.clearStoreEvents$.next();
                    mapCont.clearStoreEvents$.complete();
                    mapCont.clearStoreEvents$ = null;
                }

                mapCont.mapComm.deleteAllMarkers(mapCont.mapDataRequest.layerId);
                mapCont.markersMap.clear();
                mapCont.focusedMarkersMap.clear();
            }
        }
    }

    /** Convert text to a float */
    convertToFloat(numStr: string): number {
        let num = 0.0;
        if (numStr) {
            num = parseFloat(numStr);
            if (isNaN(num)) {
                num = 0.0;
            }
        }
        return(num);
    }

    /**
     * Listen for events that the map cares about
     */
    private initListeners() {
        this.eventSrv.dataReady$.pipe(
            filter((data) => !!data)
        ).subscribe((list) => {
            if (!this.initialized) {
                this.subscribeToEvents();
            } else {
                this.updateMapData();
            }
        });

        this.eventSrv.dataInit$.subscribe(() => {
            if (this.initialized) {
                this.removeMapData();
            }
        });

    }

    /** Listen to channel updates */
    private listenToAlarmIdChanges(mapCont: MapController) {
        if (mapCont.alarmIdsRef$) {
            mapCont.alarmIdsRef$.unsubscribe();
            mapCont.alarmIdsRef$ = null;
        }

        mapCont.alarmIdsRef$ = mapCont.alarmIds$.pipe(
            filter(item => !!item),
            takeUntil(mapCont.mapDestroyed$)
        ).subscribe(async (alarmIds: string[]) => {
            // Stop listening to store events
            // console.log("AlarmIds Observable fired: " + alarmIds.length.toString());
            if (mapCont.clearStoreEvents$) {
                mapCont.clearStoreEvents$.next();
                mapCont.clearStoreEvents$.complete();
                mapCont.clearStoreEvents$ = null;
            }

            mapCont.mapComm.deleteAllMarkers(mapCont.mapDataRequest.layerId);
            mapCont.markersMap.clear();
            mapCont.focusedMarkersMap.clear();

            mapCont.clearStoreEvents$ = new Subject<null>();

            // Used to signal the store listener when to start processing store events
            const dataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
            this.listenToStoreEvents(mapCont, dataLoaded$);
            const markerSettingsList = [];
            for (const id of alarmIds) {
                const alarm = this.alarmStore.snapshot(id);
                if (alarm) {
                    const markerSettings: MarkerSettings$v1<MarkerSettings> = this.createAlarmMarker(alarm, mapCont);
                    if (markerSettings) {
                        markerSettingsList.push(markerSettings);
                    }
                } else {
                    mapCont.missingIds.push(id);
                }
            }

            await mapCont.mapComm.addMarkersAsync(markerSettingsList, mapCont.mapDataRequest.layerId).catch()
                .then((retMarkers: Marker$v1[]) => {
                if (retMarkers) {
                    for (const marker of retMarkers) {
                        if (marker) {
                            mapCont.markersMap.set(marker.markerSettings.properties.alarmId, marker);
                            mapCont.markersMap.set(marker.markerId, marker);
                        }
                    }
                }
            });
            // Start listening to store events
            dataLoaded$.next(true);
        });
    }

    /**
     * Listen for events from the map.
     */
    private listenToEventsFromMap(mapCont: MapController) {
        if (mapCont.mapComm.mapContextId) {
            mapCont.mapComm.mapEvents.mapClicked$.pipe(takeUntil(mapCont.mapComm.mapEvents.mapCommunicationClosed$))
                .subscribe((point: Point$v1) => {
                    this.actionStore.multiselect(mapCont.mapComm.mapContextId, null);
                });
        }
    }

    /**
     * Listen for alarm selection change event
     */
    private listenToSelectionChangeEvent(mapCont) {
        if (mapCont.mapComm.mapContextId) {
            this.actionStore.multiselect$(mapCont.mapComm.mapContextId).subscribe((data) => {
                if (data && data?.items?.length) {
                    if (mapCont.clusterDetailsMarker) {
                        mapCont.clusterDetailsMarker.delete();
                        mapCont.clusterDetailsMarker = null;
                    }

                    // Check to see if we need to remove any of the focused markers
                    mapCont.focusedMarkersMap.forEach((focusedMarker) => {
                        if (!(data.items.find((item) => item.entityId === focusedMarker.markerSettings.properties.alarmId))) {
                            focusedMarker.setDisplayPriority(DisplayPriority$v1.Normal);
                            mapCont.focusedMarkersMap.delete(focusedMarker.markerSettings.properties.alarmId);
                        }
                    });

                    const disablePan = data.items.length > 1;

                    // Now go through and focus any marker that is not already focused
                    data.items.forEach(item => {
                        // Make sure its one of our markers */
                        const marker: Marker$v1 = mapCont.markersMap.get(item.entityId);
                        if (marker) {
                            const temp = mapCont.focusedMarkersMap.get(item.entityId);
                            if (!temp) {
                                marker.setDisplayPriority(DisplayPriority$v1.Focused, disablePan); // disable pan
                                mapCont.focusedMarkersMap.set(item.entityId, marker);
                            }
                        }
                    });
                } else {
                    mapCont.focusedMarkersMap.forEach((focusedMarker) => {
                        focusedMarker.setDisplayPriority(DisplayPriority$v1.Normal);
                    });
                    mapCont.focusedMarkersMap.clear();
                }
            });
        }
    }

    /**
     * Listen for alarm filter change event
     * @param mapCont Map cont object
     */
    private listenToFilterChangeEvent(mapCont) {
        if (mapCont.mapComm.mapContextId) {
            combineLatest([
                this.actionStore.filter$(mapCont.mapComm.mapContextId).pipe(
                    startWith(null as FilterActionData$v1)
                ),
                this.actionStore.shapeFilter$(mapCont.mapComm.mapContextId).pipe(
                    startWith(null as ShapeFilter$v1)
                )
            ]).subscribe(([basicFilter, shapeFilter]) => {

                mapCont.mapComm.deleteAllMarkers(mapCont.mapDataRequest.layerId);
                mapCont.markersMap.clear();
                mapCont.focusedMarkersMap.clear();
                this.addAlarmsToMap(mapCont, basicFilter?.filter, shapeFilter);
            });
        }
    }

    private listenToStoreEvents(mapCont: MapController, dataLoaded$: BehaviorSubject<boolean>) {

        if (!mapCont.alarmIds$) {
            // On delete
            this.alarmStore.removed$.pipe(
                takeUntil(mapCont.clearStoreEvents$),
                filter(item => !!item)
            ).subscribe(id => {
                dataLoaded$.pipe(
                    filter(loaded => !!loaded)
                ).subscribe(async () => {
                    if (id) {
                        const marker: Marker$v1 = mapCont.markersMap.get(id);
                        if (marker) {
                            marker.delete();
                            mapCont.markersMap.delete(id);
                            mapCont.markersMap.delete(marker.markerId);
                        }
                        if (mapCont.focusedMarkersMap[id]) {
                            mapCont.focusedMarkersMap.delete(id);
                        }
                    }
                });
            });
        }

        // On create
        this.alarmStore.upserted$.pipe(
            takeUntil(mapCont.clearStoreEvents$),
            filter(changes => !!changes?.inserts?.length),
            map(changes => changes?.inserts)
        ).subscribe(alarms => {
            for (const alarm of alarms) {
                dataLoaded$.pipe(filter(item => !!item), first()).subscribe(async () => {
                    if (alarm) {
                        // If this a channel map, check to see if we have added this alarm to the map.  If not add it.
                        if (mapCont.alarmIds$) {
                            const index = mapCont.missingIds.findIndex((alarmId) => alarmId === alarm.id);
                            if (index !== -1) {
                                const markerSettings: MarkerSettings$v1<MarkerSettings> = this.createAlarmMarker(alarm, mapCont);
                                if (markerSettings) {
                                    mapCont.mapComm.addMarkersAsync(markerSettings, mapCont.mapDataRequest.layerId).catch()
                                    .then((retMarker: Marker$v1) => {
                                        if (retMarker) {
                                            mapCont.markersMap.set(alarm.id, retMarker);
                                            mapCont.markersMap.set(retMarker.markerId, retMarker);
                                            mapCont.missingIds.splice(index, 1);
                                        }
                                    });
                                }
                            }
                        } else if (!alarm.tombstoned) {
                            const passFilters = await this.filterCheckAsync(alarm, mapCont.mapComm.mapContextId);
                            // Get filter for the current context
                            let alarmFilterActionData;
                            if (mapCont.mapComm.mapContextId) {
                                alarmFilterActionData = (await this.actionStore.filter$(mapCont.mapComm.mapContextId).pipe(first())
                                    .toPromise());
                            }
                            // Check if the alarm passes the filter
                            if (passFilters) {
                                if (!mapCont.markersMap.get(alarm.id)) {
                                    const markerSettings: MarkerSettings$v1<MarkerSettings> = this.createAlarmMarker(alarm, mapCont);
                                    if (markerSettings) {
                                        mapCont.mapComm.addMarkersAsync(markerSettings, mapCont.mapDataRequest.layerId).catch()
                                            .then((retMarker: Marker$v1) => {
                                                mapCont.markersMap.set(retMarker.markerSettings.properties.alarmId,
                                                    retMarker);
                                                mapCont.markersMap.set(retMarker.markerId, retMarker);
                                            });
                                    }
                                }
                            }
                        }
                    }
                });
            }
        });

        // On Update
        this.alarmStore.upserted$.pipe(
            takeUntil(mapCont.clearStoreEvents$),
            filter(changes => !!changes.updates?.length),
            map(changes => changes.updates)
        ).subscribe(alarms => {
            for (const alarm of alarms) {
                dataLoaded$.pipe(
                    filter(loaded => !!loaded),
                    first()
                ).subscribe(async () => {
                    if (alarm) {
                        const marker: Marker$v1 = mapCont.markersMap.get(alarm.id);
                        const passFilters = await this.filterCheckAsync(alarm, mapCont.mapComm.mapContextId);
                        if (marker && !alarm.tombstoned && passFilters) {
                            try {
                                const lat: number = this.convertToFloat(alarm.location.coordinates.latitude);
                                const lng: number = this.convertToFloat(alarm.location.coordinates.longitude);
                                const alt: number = this.convertToFloat(alarm.location.coordinates.altitude);
                                marker.update(lat, lng, alt);
                            } catch (ex) {
                                console.error('HxGn Connect:: Alarms: Could not update marker', alarm, ex);
                            }
                        } else if (!alarm.tombstoned && passFilters) {

                            // Need to add the maker
                            const markerSettings: MarkerSettings$v1<MarkerSettings> = this.createAlarmMarker(alarm, mapCont);
                            if (markerSettings) {
                                mapCont.mapComm.addMarkersAsync(markerSettings, mapCont.mapDataRequest.layerId).catch()
                                    .then((retMarker: Marker$v1) => {
                                        if (retMarker) {
                                            mapCont.markersMap.set(alarm.id, retMarker);
                                            mapCont.markersMap.set(retMarker.markerId, retMarker);
                                        }
                                });
                            }
                        } else if (marker && !mapCont.alarmIds$) {
                            marker.delete();
                            mapCont.markersMap.delete(alarm.id);
                            mapCont.markersMap.delete(marker.markerId);
                            if (mapCont.focusedMarkersMap[alarm.id]) {
                                mapCont.focusedMarkersMap.delete(alarm.id);
                            }

                        }
                }
                });
            }
        });

    }

    /**
     * Return true if all filters pass
     * @param alarm Alarm to check
     */
    private async filterCheckAsync(alarm: Alarm$v1, contextId: string): Promise<boolean> {
        // Check if passes basic filter
        let passBasicFilter = true;
        const basicFilter = (await this.actionStore.filter$(contextId).pipe(first()).toPromise());

        if (basicFilter?.filter) {
          passBasicFilter = !!basicFilter.filter.apply([alarm]).length;
        }

        // Check if it passes the shape filter
        let passShapeFilter = true;
        if (passBasicFilter) {
          const g = await this.actionStore.shapeFilter$(contextId).pipe(
            first()
          ).toPromise();
          if (g?.coordinates && alarm?.location?.coordinates?.latitude &&
            alarm?.location?.coordinates?.longitude) {

              const point = [+alarm.location.coordinates.longitude, +alarm.location.coordinates.latitude];
              passShapeFilter = this.shapeAdapter.isPointInGeometry(g, point);
          }
        }

        return passBasicFilter && passShapeFilter;
    }

    /** For a 3d map, need to open and close the details marker from the map service */
    openClusterDetailsMarker(mapComm: MapCommunication$v1, clusterMarker: ClusterMarker$v1): Subject<null> {
        let markerDeleted$: Subject<null>;
        if (mapComm.mapType === MapType$v1.Type3D) {
            const mapCont = this.mapControllers.find((mc) => mc.mapComm.mapContextId === mapComm.mapContextId);
            if (mapCont) {
                markerDeleted$ = new Subject<null>();

                if (mapCont.clusterDetailsMarker) {
                    mapCont.clusterDetailsMarker.delete();
                    mapCont.clusterDetailsMarker = null;
                }

                const lat: number = clusterMarker.coordinate.latitude;
                const lng: number = clusterMarker.coordinate.longitude;
                const alt: number = clusterMarker.coordinate.altitude;
                const coordinate = new Point$v1(lat, lng, alt);

                const clusteredAlarms = this.getClusteredAlarms(clusterMarker);
                const clusterDetailsSettings: ClusterMarkerDetailsSettings = {
                    id: null,
                    clusteredAlarms: clusteredAlarms
                };
                const iconDef3d = new IconDefinition3d$v1({
                    icon: new ComponentIcon$v1<ClusterMarkerDetailsSettings>({
                        componentName: InjectableComponentNames.mapClusterDetailsComponent,
                        capabilityId: capabilityId,
                    } as ComponentIcon$v1<ClusterMarkerDetailsSettings>),
                    iconSize: new Size$v1(43, 43)
                } as IconDefinition3d$v1);

                const markerSettings = new MarkerSettings$v1({
                    coordinate: coordinate,
                    iconDefinition3d: iconDef3d,
                    properties: clusterDetailsSettings,
                } as MarkerSettings$v1<any>);

                mapComm.addMarkersAsync(markerSettings).catch()
                    .then((retMarker: Marker$v1) => {
                        mapCont.clusterDetailsMarker = retMarker;
                        retMarker.markerRemoved$.pipe(
                            first()
                        ).subscribe(() => {
                            mapCont.clusterDetailsMarker = null;
                            markerDeleted$.next();
                            markerDeleted$.complete();
                        });
                    });
                }
        }
        return (markerDeleted$);
    }

    private getClusteredAlarms(clusterMarker: ClusterMarker$v1): Alarm$v1[] {
        const clusteredAlarms = [];
        const children = clusterMarker.childMarkers;

        for (const child of children) {
            const alarmId = child.markerSettings.properties.alarmId;

            const alarm = this.alarmStore.snapshot(alarmId);
            if (alarm) {
                clusteredAlarms.push(alarm);
            }
        }

        return (clusteredAlarms);
    }
}
