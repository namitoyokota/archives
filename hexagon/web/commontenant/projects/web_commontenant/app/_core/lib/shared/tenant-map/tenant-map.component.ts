import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MapCommunication$v1, MapSettings$v1, MapviewState$v1, Point$v1 } from '@galileo/web_commonmap/adapter';
import { MapData$v1, Tenant$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslationTokens } from './tenant-map.translation';

@Component({
    selector: 'hxgn-commontenant-tenant-map',
    templateUrl: 'tenant-map.component.html',
    styleUrls: ['tenant-map.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class TenantMapComponent implements OnInit, OnDestroy, OnChanges {

    /** The active tenant */
    @Input() tenant: Tenant$v1;

    /** Flag indicating if this is a new tenant situation */
    @Input() isNew = false;

    /** Fired when the zoom level or location the map changes */
    @Output() mapDataChanged: EventEmitter<MapData$v1> = new EventEmitter<MapData$v1>();

    /** Settings to control the display of the map */
    mapSettings: MapSettings$v1;

    /** Class that contains the API to communicate with the map  */
    mapComm: MapCommunication$v1;

    /** Icon url */
    iconUrl: string;

    /** Expose translation tokens to html. */
    tokens: typeof TranslationTokens = TranslationTokens;

    private mapData: MapData$v1;

    private skipMapviewChange = false;

    /** Fired when component destroyed */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor() {}

    /**
     * On init life cycle hook
     */
    async ngOnInit() {
        this.mapSettings = new MapSettings$v1();
        this.mapSettings.mapControls.displayLayerPanel = false;

        if (this.tenant) {
            this.mapData = new MapData$v1(this.tenant.mapData);
            if (this.mapData.centerLatitude && this.mapData.centerLongitude && this.mapData.zoomLevel) {
                const lat = parseFloat(this.mapData.centerLatitude);
                const lng = parseFloat(this.mapData.centerLongitude);
                const alt = 0;
                if (lat && lng) {
                    this.mapSettings.mapCenter = new Point$v1(lat, lng, alt);
                }
                const zoomLevel = parseInt(this.mapData.zoomLevel, 10);
                if (zoomLevel) {
                    this.mapSettings.zoomLevel = zoomLevel;
                }
            }
        }

        if (this.tenant && this.tenant.tenantIconUrl) {
            this.iconUrl = this.tenant.tenantIconUrl;
        } else {
            this.iconUrl = 'assets/commontenant-core/Organization-default-icon.png';
        }
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * On changes lifecycle hook
     */
    ngOnChanges(changes: SimpleChanges) {
        if (!this.mapComm) {
            return;
        }

        // On tenant change
        if (changes.tenant.previousValue.id !== changes.tenant.currentValue.id) {
            if (this.tenant) {
                this.mapSettings = new MapSettings$v1();
                this.mapSettings.mapControls.displayLayerPanel = false;

                this.mapData = new MapData$v1(this.tenant.mapData);
                if (this.mapData.centerLatitude && this.mapData.centerLongitude && this.mapData.zoomLevel) {
                    const lat = parseFloat(this.mapData.centerLatitude);
                    const lng = parseFloat(this.mapData.centerLongitude);
                    const alt = 0;
                    if (lat && lng) {
                        this.mapSettings.mapCenter = new Point$v1(lat, lng, alt);
                    }
                    const zoomLevel = parseInt(this.mapData.zoomLevel, 10);
                    if (zoomLevel) {
                        this.mapSettings.zoomLevel = zoomLevel;
                    }
                }
                this.iconUrl = this.tenant.tenantIconUrl;
                this.setView(this.mapData);
            } else {
                this.iconUrl = 'assets/commontenant-core/Organization-default-icon.png';
            }
        }

    }

    /**
     * Sets the map view to the given map data and does not emit an update
     * @param mapData Map data to use to set the view
     */
    setView(mapData: MapData$v1) {
        let lat = 0.0;
        let lng = 0.0;
        let zoomLevel;
        let centerPt: Point$v1;

        const alt = 0.0;
        this.skipMapviewChange = true;
        this.mapData = new MapData$v1(mapData);

        if (this.mapData.centerLatitude && this.mapData.centerLongitude && this.mapData.zoomLevel) {
            const tempLat = parseFloat(this.mapData.centerLatitude);
            const tempLng = parseFloat(this.mapData.centerLongitude);
            const tempZoomLevel = parseInt(this.mapData.zoomLevel, 10);
            if (tempLat && tempLng && tempZoomLevel) {
                lat = tempLat;
                lng = tempLng;
                zoomLevel = tempZoomLevel;
                centerPt = new Point$v1(lat, lng, alt);
            }

        }
        this.mapComm.setMapView(zoomLevel, centerPt);
    }

    /** Processes map ready messages */
    async mapReady(mapComm: MapCommunication$v1) {
        this.mapComm = mapComm;

        // If there is missing map data, initialize the map data from the default map
        if (!(this.mapData && this.mapData.centerLatitude &&
            this.mapData.centerLongitude)) {
            const mapView = await this.mapComm.getMapView();
            const lat = mapView.mapCenter.latitude.toString();
            const lng = mapView.mapCenter.longitude.toString();
            const alt = '0.0';
            const zoom = mapView.zoomLevel.toString();

            this.mapData = new MapData$v1({
                centerLatitude: lat,
                centerLongitude: lng,
                centerAltitude: alt,
                zoomLevel: zoom
            });

            if (this.isNew) {
                this.mapDataChanged.emit(new MapData$v1(this.mapData));
            }
        }

        this.mapComm.mapEvents.mapviewStateChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((mapviewState: MapviewState$v1) => {
            if (!this.skipMapviewChange) {
                this.mapData.zoomLevel = mapviewState.zoomLevel.toString();
                this.mapData.centerLatitude = mapviewState.bounds.center.latitude.toString();
                this.mapData.centerLongitude = mapviewState.bounds.center.longitude.toString();
                this.mapDataChanged.emit(new MapData$v1(this.mapData));
            } else {
                this.skipMapviewChange = false;
            }
        });
    }
}
