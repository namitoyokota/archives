import { Component, Inject, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent, Coordinates$v1, Location$v1 } from '@galileo/web_common-libraries';
import { InjectableComponentNames } from '@galileo/web_commonmap/_common';
import {
    LocationSelectSettings$v1,
    LAYOUT_MANAGER_SETTINGS,
    MapCommunication$v1,
    MapCreateMessage$v1,
    MapSettings$v1,
    Marker$v1,
    Point$v1,
    MarkerSettings$v1,
    IconDefinition2d$v1,
    Size$v1,
    ComponentIcon$v1,
    capabilityId
} from '@galileo/web_commonmap/_common';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { CommonmapDataService$v1 } from '../../commonmap-data.service';
import { TranslationTokens } from './location-select.translation';

export interface MarkerSettings {
    /** Flag to disable events */
    disableEvents?: boolean;

    /** Map comm object */
    mapComm: MapCommunication$v1;
}

@Component({
    templateUrl: 'location-select.component.html',
    styleUrls: ['location-select.component.scss']
})

export class LocationSelectInjectableComponent implements OnInit, OnDestroy {

    /** Current location object */
    @Input() location: Location$v1 = new Location$v1();

    /** Currently displayed marker */
    marker: Marker$v1;

    /** API to communicate with the map  */
    mapComm: MapCommunication$v1;

    /** Configurations sent to the map component */
    mapCreateMessage: MapCreateMessage$v1;

    /** Icon definition for marker on a 2d map */
    readonly pinIcon = new IconDefinition2d$v1({
        iconSize: new Size$v1(46, 46),
        icon: new ComponentIcon$v1<MarkerSettings>({
            componentName: InjectableComponentNames.PinMarkerComponent,
            capabilityId: capabilityId
        })
    });

    /** Indicates that UI is in loading state */
    isLoading = false;

    /** Expose translation tokens to html */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Destroy subscription */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public settings: LocationSelectSettings$v1,
        private dataSrv: CommonmapDataService$v1,
        private dialog: MatDialog
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.updateLoading(true);

        this.settings.location$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(location => {
            if (location) {
                this.updateLocation(location);
            }
        });

        const mapSettings = new MapSettings$v1();
        mapSettings.mapControls.displayLayerPanel = false;

        this.mapCreateMessage = new MapCreateMessage$v1({
            mapSettings: mapSettings
        });

        this.mapCreateMessage.mapReady$.pipe(
            takeUntil(this.destroy$),
            filter(item => !!item)
        ).subscribe((mapComm: MapCommunication$v1) => {
            this.updateLoading(false);
            this.mapReady(mapComm);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Updates location object */
    updateLocation(location: Location$v1): void {
        this.location = location;
        this.updateMarker(this.location.coordinates);
        this.emitUpdate();
    }

    /** Updates and emits loading flag */
    updateLoading(isLoading: boolean): void {
        this.isLoading = isLoading;
        this.settings.loadingChanged(isLoading);
    }

    /** Emits event for changed location */
    emitUpdate(): void {
        this.settings.locationChanged(this.location);
    }

    /** Creates new marker with given coordinates */
    async updateMarker(coordinates: Coordinates$v1): Promise<void> {
        if (coordinates && coordinates.longitude && coordinates.latitude && !this.isLoading) {
            this.location.coordinates = coordinates;

            await this.createMarker(new Point$v1(
                +coordinates.latitude,
                +coordinates.longitude,
                +coordinates.altitude
            ));
        }
    }

    /** Stores API object used to communicate with map */
    mapReady(mapComm: MapCommunication$v1): void {
        this.mapComm = mapComm;
        this.updateMarker(this.location.coordinates);

        // Listen to map click
        this.mapComm.mapEvents.mapClicked$.pipe(
            takeUntil(this.mapComm.mapEvents.mapCommunicationClosed$)
        ).subscribe((point: Point$v1) => {
            this.createMarker(point);

            // Get address from coordinates
            this.updateLoading(true);
            this.dataSrv.geolocation.reverseGeolocation$(
                point.latitude.toString(),
                point.longitude.toString()
            ).toPromise().then(foundAddress => {
                this.updateLocation(foundAddress);
                this.updateLoading(false);
            }).catch(error => {
                this.dialog.open(CommonErrorDialogComponent, {
                    data: {
                        message: error?.errors[0]
                    }
                });

                this.updateLoading(false);
            });
        });
    }

    /** Displays incident on map */
    async createMarker(point: Point$v1): Promise<void> {
        // Remove marker if exists
        if (this.marker) {
            this.marker.delete();
        }

        // Create new marker
        const markerSettings = new MarkerSettings$v1<MarkerSettings>({
            coordinate: point,
            addToCluster: false,
            iconDefinition2d: this.pinIcon,
            properties: {
                disableEvents: true,
                mapComm: this.mapComm
            }
        });

        // Add marker to map
        await this.mapComm.addMarkersAsync(markerSettings).then((marker: Marker$v1) => {
            this.marker = marker;

            // Center map to marker
            if (this.marker) {
                this.marker.panTo();
            }
        });
    }
}
