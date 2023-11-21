// tslint:disable
// tslint:disable: component-selector
// tslint:disable: component-class-suffix
import { PortalInjector } from '@angular/cdk/portal';
import {
    AfterViewInit,
    Component,
    ComponentRef,
    EventEmitter,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { Coordinates$v1, Guid, Location$v1 } from '@galileo/web_common-libraries';
import { ColorType$v1 } from '@galileo/web_common-libraries/graphical/color-selector';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { LayoutCompilerAdapterService, ViewEditorSettings } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import * as Common from '@galileo/web_commonmap/_common';
import {
    CommonmapAdapterService$v1,
    Geometry$v1,
    GeometryContextMenuItem$v1,
    GeometryType$v1,
    MapCommunication$v1,
    MapDataRequest$v1,
    MapLayer$v1,
    VectorStyleProperties$v1,
} from '@galileo/web_commonmap/adapter';
import { capabilityId } from '@galileo/web_shapes/adapter';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

let mapIndex = 0;
let contextId = 'commonmap-mapview0';
export class MapController {

    /** map communication. */
    mapComm?: MapCommunication$v1;

    /** Map data request. */
    mapDataRequest?: MapDataRequest$v1;

    /** Reference to observable providing shape ids for channels */
    shapeIds$?: Observable<string[]>;

    /** Subscription reference for the shapeIds$ observable */
    shapeIdsRef$?: Subscription;

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
            shapeIds$ = null,
            shapeIdsRef$ = null,
            missingIds = []
        } = params;

        this.mapComm = mapComm;
        this.mapDataRequest = mapDataRequest;
        this.shapeIds$ = shapeIds$;
        this.shapeIdsRef$ = shapeIdsRef$;
        this.missingIds = missingIds;
        this.mapDestroyed$ = new Subject<void>();
    }
}


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {

    selectedTabIndex = 0;

    showMap = true;

    circleCenter = [-85.444873, 37.97668];

    coords1: any = [[[-87.147973, 38.743373], [-87.142477, 38.17991], [-86.38679, 38.190704], [-86.397782, 38.745515], [-87.147973, 38.743373]]];

    coords2: any = [[[-86.554412, 38.518086], [-86.540681, 37.929034], [-85.444873, 37.97668], [-85.516279, 38.552461], [-86.554412, 38.518086]]];

    testVectStyleProps = new VectorStyleProperties$v1({
        lineColor: '#ad4e1a',
        fillColor: '#753009'
    })

    testGeoms: Geometry$v1[] = [];

    coordIndex = 1;

    /** Array of map controller objects that store the map communication and markers for a given map */
    mapControllers: MapController[] = [];

    graphics = {
        lineType: LineType$v1.solid,
        lineWeight: 2,
        lineColor: '#ad4e1a',
        fillColor: '#753009'
    };

    colorType: typeof ColorType$v1 = ColorType$v1;

    mapViewSettings1 = {
        contextId: 'workspaceId;screenId;tabId;map-a',
        mapSetup: {
            mapPresetId: '1fd20f19-bc5b-4fea-a957-95912c25bcca',
            displayZoomControl: true,
            zoomControlLocation: Common.ZoomControlPositions$v1.BottomRight,
            zoomLevel: -1,
            mapCenter: null
        },
        layerPanel: {
            lockMapAndLayers: false,
            displayLayerPanel: true,
            layerPanelLocation: Common.LayerPanelControlPositions$v1.TopRight,
            allowLayerReorder: true,
        }
    };

    mapViewSettings2 = {
        contextId: 'workspaceId;screenId;tabId;map-b',
        mapSetup: {
            mapPresetId: '1fd20f19-bc5b-4fea-a957-95912c25bcca',
            displayZoomControl: true,
            zoomControlLocation: Common.ZoomControlPositions$v1.BottomRight,
            zoomLevel: -1,
            mapCenter: null
        },
        layerPanel: {
            lockMapAndLayers: false,
            displayLayerPanel: true,
            layerPanelLocation: Common.LayerPanelControlPositions$v1.TopRight,
            allowLayerReorder: true,
        }
    };

    location = new Location$v1({
        formattedAddress: '305 Intergraph Way',
        crossStreet1: 'Cross Street 1',
        crossStreet2: 'Cross Street 2',
        coordinates: new Coordinates$v1({
            latitude: "34.67638",
            longitude: "-86.74194",
            altitude: '0',
        })
    });

    geomsAdded = false;

    dataReady = false;

    constructor(
        private layoutCompilerSrv: LayoutCompilerAdapterService,
        private localizationSvr: CommonlocalizationAdapterService$v1,
        private mapAdapter: CommonmapAdapterService$v1) {
        this.localizationSvr.changeLanguageAsync('en');
    }

    async ngOnInit() {
    }

    async ngAfterViewInit() {
        // load the core module
        await this.layoutCompilerSrv.loadCapabilityCoreAsync(Common.capabilityId);
        // this.initTest();
        // const adminId = `${Common.capabilityId}/admin`;
        // await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
        // this.layoutCompilerSrv.delegateInjectComponentPortalAsync('@hxgn/commonmap/map-configuration/v1', adminId, '#admin-portal', null);
    }

    echo(event) {
        console.log(event);
    }

    settingsUpdated() {
        this.showMap = false;
        setTimeout(() => { this.showMap = true }, 100);
    }

    tabChanged() {
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
    }

    updateLocation(location: Location$v1) {
        this.location = location;
        console.log(this.location);
    }

    setLineType(lineType: LineType$v1) {
        this.graphics.lineType = lineType;
        this.testVectStyleProps.linePattern = (lineType as any);
        this.testGeoms[0].setStyle(this.testVectStyleProps);

        if (this.mapControllers?.length > 0) {
            const mapCont = this.mapControllers[0];
            const mapComm = mapCont.mapComm;

            if (mapComm?.draw?.setStyle) {
                mapComm?.draw?.setStyle(this.testVectStyleProps);
            }
        }
    }

    setLineWeight(weight: number) {
        this.graphics.lineWeight = weight;
        this.testVectStyleProps.lineWidth = weight;
        this.testGeoms[0].setStyle(this.testVectStyleProps);

        if (this.mapControllers?.length > 0) {
            const mapCont = this.mapControllers[0];
            const mapComm = mapCont.mapComm;

            if (mapComm?.draw?.setStyle) {
                mapComm?.draw?.setStyle(this.testVectStyleProps);
            }
        }
    }

    setLineColor(color: string) {
        this.graphics.lineColor = color;
        this.testVectStyleProps.lineColor = color;
        this.testGeoms[0].setStyle(this.testVectStyleProps);
        if (this.mapControllers?.length > 0) {
            const mapCont = this.mapControllers[0];
            const mapComm = mapCont.mapComm;

            if (mapComm?.draw?.setStyle) {
                mapComm?.draw?.setStyle(this.testVectStyleProps);
            }
        }
    }

    setFillColor(color: string) {
        this.graphics.fillColor = color;
        this.testVectStyleProps.fillColor = color;
        this.testGeoms[0].setStyle(this.testVectStyleProps);

        if (this.mapControllers?.length > 0) {
            const mapCont = this.mapControllers[0];
            const mapComm = mapCont.mapComm;

            if (mapComm?.draw?.setStyle) {
                mapComm?.draw?.setStyle(this.testVectStyleProps);
            }
        }
    }

    initTest() {
        this.mapAdapter.mapAdapterEvents.mapViewLoaded$.subscribe((mapComm: MapCommunication$v1) => {
            let layer: MapLayer$v1;
            let shapeGeom: Geometry$v1;

            const mapCont = new MapController({
                mapComm: mapComm
            });

            this.dataReady = true;
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
                    temp.shapeIdsRef$ = null;
                    this.mapControllers.splice(index, 1);
                }
            });


            const maxGeoms = 2;
            let contextMenu: GeometryContextMenuItem$v1[] = [];

            mapComm = mapCont.mapComm;

            let menuItem = new GeometryContextMenuItem$v1({
                id: 'Zoom',
                label: 'Zoom',
                icon: 'assets/shapes/images/create-channel-icon.svg'
            });
            contextMenu.push(menuItem);

            menuItem = new GeometryContextMenuItem$v1({
                id: 'EditShape',
                label: 'Edit Shape',
                icon: 'assets/shapes/images/create-channel-icon.svg'
            });
            contextMenu.push(menuItem);

            const filterMenuItem = new GeometryContextMenuItem$v1({
                id: 'Filter',
                label: 'Set as Filter',
                icon: 'assets/shapes/images/filtering-menu.svg'
            });
            contextMenu.push(filterMenuItem);

            this.testGeoms.push(new Geometry$v1({
                coordinates: this.coords1,
                contextMenu: contextMenu,
                style: this.testVectStyleProps
            }));

            contextMenu = [];
            menuItem = new GeometryContextMenuItem$v1({
                id: 'Zoom',
                label: 'Zoom',
                icon: 'assets/shapes/images/create-channel-icon.svg'
            });
            contextMenu.push(menuItem);

            this.testGeoms.push(new Geometry$v1({
                type: GeometryType$v1.circle,
                coordinates: this.circleCenter,
                radius: 34000,
                contextMenu: contextMenu,
                style: this.testVectStyleProps
            }));

            const clearMenuItem = new GeometryContextMenuItem$v1({
                id: 'ClearFilter',
                label: 'Clear Filter',
                icon: 'assets/shapes/images/filtering-menu.svg'
            });


            this.testGeoms[0].events.contextMenuItemClicked$.pipe(
                filter(data => !!data)
            ).subscribe((menuItem) => {
                switch (menuItem.id) {
                    case 'Filter': {
                        contextMenu.splice(2, 1);
                        contextMenu.push(clearMenuItem);
                        this.testGeoms[0].setContextMenu(contextMenu);
                        break;
                    }
                    case 'ClearFilter': {
                        let geom: Geometry$v1;
                        contextMenu.splice(2, 1);
                        contextMenu.push(filterMenuItem);
                        this.testGeoms[0].setContextMenu(contextMenu);
                        break;
                    }
                    case 'EditShape': {
                        mapComm.mapEvents.mapClicked$.pipe(
                            takeUntil(mapCont.mapDestroyed$)
                        ).subscribe((point) => {
                            mapComm.draw.setStyle(new VectorStyleProperties$v1({
                                lineColor: '#db2ad5',
                                fillColor: '#733c71',
                                lineWidth: 8
                            }));
                        });
                        mapComm.draw.edit(this.testGeoms[0]);
                        break;
                    }
                    case 'Zoom': {
                        this.testGeoms[0].zoomTo();
                        break;
                    }
                }
            });

            this.testGeoms[1].events.contextMenuItemClicked$.pipe(
                filter(data => !!data)
            ).subscribe((menuItem) => {
                switch (menuItem.id) {
                    case 'Filter': {
                        contextMenu.splice(2, 1);
                        contextMenu.push(clearMenuItem);
                        this.testGeoms[1].setContextMenu(contextMenu);
                        break;
                    }
                    case 'ClearFilter': {
                        let geom: Geometry$v1;
                        contextMenu.splice(2, 1);
                        contextMenu.push(filterMenuItem);
                        this.testGeoms[1].setContextMenu(contextMenu);
                        break;
                    }
                    case 'EditShape': {
                        mapComm.mapEvents.mapClicked$.pipe(
                            takeUntil(mapCont.mapDestroyed$)
                        ).subscribe((point) => {
                            mapComm.draw.setStyle(new VectorStyleProperties$v1({
                                lineColor: '#db2ad5',
                                fillColor: '#733c71',
                                lineWidth: 8
                            }));
                        });
                        mapComm.draw.edit(this.testGeoms[1]);
                        break;
                    }
                    case 'Zoom': {
                        this.testGeoms[1].zoomTo();
                        break;
                    }
                }
            });

            mapComm.mapEvents.mapClicked$.pipe(
                takeUntil(mapCont.mapDestroyed$)
            ).subscribe((point) => {

                if (this.geomsAdded) {
                    const geom = this.testGeoms[0];
                    if (this.coordIndex === 1) {
                        geom.coordinates = this.coords2;
                        this.coordIndex = 2;
                    } else {
                        geom.coordinates = this.coords1;
                        this.coordIndex = 1;
                    }

                    if (mapCont.mapDataRequest) {
                        mapCont.mapDataRequest.upsertGeometries([geom]);
                    }
                }

            });

            mapComm.mapEvents.mapDataRequest$.pipe(
                filter((mapDataRequest) => mapDataRequest && mapDataRequest.capabilityId === capabilityId),
                takeUntil(mapCont.mapDestroyed$)
            ).subscribe((mapDataRequest) => {
                mapCont.mapDataRequest = mapDataRequest;

                // Test code
                mapDataRequest.upsertGeometries(this.testGeoms);
                this.geomsAdded = true;
            });

        });
    }

    handleMapDataRequest(mapCont: MapController) {

        // Add shape data to the map
    }

    addGeoms() {
        if (this.mapControllers?.length > 0 && !this.geomsAdded) {
            this.mapControllers[0].mapDataRequest.upsertGeometries(this.testGeoms);
            this.geomsAdded = true;
        }
    }

    removeGeoms() {
        if (this.mapControllers?.length > 0 && this.geomsAdded) {
            this.mapControllers[0].mapDataRequest.clearGeometries();
            this.geomsAdded = false;
        }
    }

    addGeom() {
        if (this.mapControllers?.length > 0 && !this.geomsAdded) {
            this.mapControllers[0].mapDataRequest.upsertGeometries([this.testGeoms[0]]);
            this.geomsAdded = true;
        }
    }

    removeGeom() {
        if (this.mapControllers?.length > 0 && this.geomsAdded) {
            this.mapControllers[0].mapDataRequest.removeGeometries([this.testGeoms[0].id]);
            this.geomsAdded = false;
        }
    }

}

@Component({
    selector: 'hxgn-commonmap-mapview-wrapper',
    template: `<div style="width: 100%; height: 100%;" id="{{portalHostId}}"></div>`
})

export class MapviewComponentWrapper implements AfterViewInit, OnDestroy {

    @Input() settings;

    public readonly portalHostId = `hxgn-commonmap-mapview-wrapper-${this.newGuid()}`;

    private compRef: ComponentRef<any>;

    constructor(
        private layoutCompilerSvc: LayoutCompilerAdapterService,
        private adapterSvc: CommonmapAdapterService$v1
    ) { }

    async ngAfterViewInit() {
        this.injectMapview();
    }

    ngOnDestroy() {
        if (this.compRef) {
            this.compRef.destroy();
            this.compRef = null;
        }
    }

    async injectMapview() {
        // this.settings.contextId = contextId;
        // mapIndex += 1;
        // contextId = 'commonmap-mapview' + mapIndex.toString();

        await this.adapterSvc.waitOnCore();

        this.compRef = await this.layoutCompilerSvc.delegateInjectComponentPortalAsync(
            Common.InjectableComponentNames.MapviewComponent,
            Common.capabilityId,
            `#${this.portalHostId}`,
            this.settings,
            this.settings.contextId
        );
    }

    settingsUpdated() {
        if (this.compRef) {
            this.compRef.destroy();
            this.compRef = null;
        }

        this.injectMapview();
    }
    private newGuid() {
        return Guid.NewGuid();
    }
}

@Component({
    selector: 'hxgn-commonmap-mapview-settings-wrapper',
    template: `<div style="width: 100%; height: 100%;" id="{{portalHostId}}"></div>`
})

export class MapviewSettingsWrapperComponent implements AfterViewInit, OnDestroy {

    @Input() settings;

    @Output() changed: EventEmitter<any> = new EventEmitter<any>();

    public readonly portalHostId = `hxgn-commonmap-mapview-settings-wrapper-${this.newGuid()}`;

    private compRef: ComponentRef<any>;

    constructor(
        private layoutCompilerSvc: LayoutCompilerAdapterService,
        private adapterSvc: CommonmapAdapterService$v1
    ) { }

    async ngAfterViewInit() {
        await this.adapterSvc.waitOnCore();

        const editorSettings = new ViewEditorSettings<any>(this.settings);

        editorSettings.updateMailBox = new Subject<any>();
        editorSettings.updateMailBox.subscribe(() => {

            this.changed.emit(this.settings);
        });
        this.compRef = await this.layoutCompilerSvc.delegateInjectComponentPortalAsync(
            Common.InjectableComponentNames.MapviewSettingsComponent,
            Common.capabilityId,
            `#${this.portalHostId}`,
            editorSettings,
            this.settings.contextId
        );
    }

    ngOnDestroy() {
        if (this.compRef) {
            this.compRef.destroy();
            this.compRef = null;
        }
    }

    private newGuid() {
        return Guid.NewGuid();
    }
}

@Component({
    selector: 'hxgn-commonmap-map-configuration-wrapper',
    template: `<div style="width: 100%; height: 100%;" id="{{portalHostId}}"></div>`
})
export class MapConfigurationWrapperComponent implements AfterViewInit, OnDestroy {

    @Input() selectedTabIndex;

    public readonly portalHostId = `app-commonmap-configuration-wrapper-${this.newGuid()}`;

    private initialized = false;

    private compRef: ComponentRef<any>;

    constructor(
        private layoutCompilerSvc: LayoutCompilerAdapterService,
        private adapterSvc: CommonmapAdapterService$v1
    ) { }

    async ngAfterViewInit() {

        if (this.selectedTabIndex === 1) {
            await this.adapterSvc.waitOnCore();
            const adminId = `${Common.capabilityId}/admin`;
            setTimeout(async () => {
                this.compRef = await this.layoutCompilerSvc.delegateInjectComponentPortalAsync(
                    Common.InjectableComponentNames.MapConfigurationComponent,
                    adminId,
                    `#${this.portalHostId}`,
                    {},
                    'commonmap-map-configuration'
                );
            }, 100);

            this.initialized = true;
        }
    }

    // async ngOnChanges(changes: SimpleChanges) {
    //     if (changes.selectedTabIndex && changes.selectedTabIndex.currentValue === 1 && !this.initialized) {
    //         const adminId = `${Common.capabilityId}/admin`;
    //         this.layoutCompilerSvc.delegateInjectComponentPortalAsync(
    //             Common.InjectableComponentNames.MapConfigurationComponent,
    //             adminId,
    //             `#${this.portalHostId}`,
    //             {},
    //             'commonmap-map-configuration'
    //         );
    //     }
    // }

    ngOnDestroy() {
        if (this.compRef) {
            this.compRef.destroy();
            this.compRef = null;
        }
    }

    private newGuid() {
        return Guid.NewGuid();
    }

}

@Component({
    selector: 'hxgn-list-wrapper',
    template: `<div style="width: 100%; height: 100%;" id="{{portalHostId}}"></div>`
})

export class ListComponentWrapper implements AfterViewInit, OnDestroy {

    @Input() listType = 'Assets';

    public readonly portalHostId = `hxgn-list-wrapper-${this.newGuid()}`;

    private compRef: ComponentRef<any>;

    constructor(private layoutCompilerSvc: LayoutCompilerAdapterService) { }

    async ngAfterViewInit() {

        switch (this.listType) {
            case 'Assets': {
                this.injectAssetList();
                break;
            }
            case 'Shapes': {
                this.injectShapeList();
                break;
            }

        }

    }

    ngOnDestroy() {
        if (this.compRef) {
            this.compRef.destroy();
            this.compRef = null;
        }

    }

    async injectAssetList() {

        this.compRef = await this.layoutCompilerSvc.delegateInjectComponentPortalAsync(
            '@hxgn/assets/list/v1',
            '@hxgn/assets',
            `#${this.portalHostId}`,
            {
                sortBy: 'timeAsc',
                enableCardExpansion: true,
                enableKeywords: true,
                enablePortalFormatting: false,
                headerTitle: 'Asset List',
                contextId: 'workspaceId;screenId;tabId;list-a',
                customHeaderId: 'customHeader_abc-123'
            },
            'workspaceId;screenId;tabId;list-a'
        );

    }
    async injectShapeList() {

        this.compRef = await this.layoutCompilerSvc.delegateInjectComponentPortalAsync(
            '@hxgn/shapes/list/v1',
            '@hxgn/shapes',
            `#${this.portalHostId}`,
            {
                sortBy: 'timeAsc',
                enableCardExpansion: true,
                enableKeywords: true,
                enablePortalFormatting: false,
                headerTitle: 'Shapes List',
                contextId: 'workspaceId;screenId;tabId;list-a',
                customHeaderId: 'customHeader_abc-123'
            },
            'workspaceId;screenId;tabId;list-a'
        );

    }
    private newGuid() {
        return Guid.NewGuid();
    }
}

@Component({
    selector: 'hxgn-common-waze-wrapper',
    template: `<div id="{{portalHostId}}"></div>`
})
export class WazeWrapperComponent implements AfterViewInit {
    public readonly portalHostId = `hxgn-common-wazeview-wrapper-${this.newGuid()}`;
    private readonly componentName: string = Common.InjectableComponentNames.WazeInjectableComponent$v1;


    constructor(private commonmapMailbox: Common.CommonmapMailboxService,
        private layoutCompiler: LayoutCompilerAdapterService,
        private injector: Injector) { }

    async ngAfterViewInit() {
        const injectorTokens = new WeakMap();
        injectorTokens.set(Common.LAYOUT_MANAGER_SETTINGS, {
            wazeUrl: 'https://embed.waze.com/iframe'
        });

        await this.layoutCompiler.loadCapabilityCoreAsync(Common.capabilityId);

        this.commonmapMailbox.injectComponent.next({
            componentName: this.componentName,
            portalHostId: `#${this.portalHostId}`,
            portalInjector: new PortalInjector(this.injector, injectorTokens)
        });
    }

    private newGuid() {
        return Guid.NewGuid();
    }
}

@Component({
    selector: 'hxgn-common-wazesettings-wrapper',
    template: `<div id="{{portalHostId}}"></div>`
})
export class WazeSettingsWrapperComponent implements AfterViewInit {
    public readonly portalHostId = `hxgn-common-wazesettings-wrapper-${this.newGuid()}`;
    private readonly componentName: string = Common.InjectableComponentNames.WazeSettingsInjectableComponent$v1;


    constructor(private commonmapMailbox: Common.CommonmapMailboxService,
        private layoutCompiler: LayoutCompilerAdapterService,
        private injector: Injector) { }

    async ngAfterViewInit() {
        const injectorTokens = new WeakMap();
        injectorTokens.set(Common.LAYOUT_MANAGER_SETTINGS, new ViewEditorSettings<any>({
            iframeUrl: 'https://embed.waze.com/iframe'
        }));

        await this.layoutCompiler.loadCapabilityCoreAsync(Common.capabilityId);

        this.commonmapMailbox.injectComponent.next({
            componentName: this.componentName,
            portalHostId: `#${this.portalHostId}`,
            portalInjector: new PortalInjector(this.injector, injectorTokens)
        });
    }

    private newGuid() {
        return Guid.NewGuid();
    }
}
