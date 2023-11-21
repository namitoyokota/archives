import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import * as CommonHttp from '@galileo/web_common-http';
import * as Common from '@galileo/web_commonmap/_common';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { Subject, BehaviorSubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import * as L from 'leaflet';

import {
    CommonmapDataService$v1,
    CommonmapEventService$v1,
    CommonmapCoreService$v1,
    HxDRHelperService,
    LayerGroupInfo,
    LayerPropsCmdLayerInfo,
    WMTSInfo,
    ContextMenuItem,
    MapLayerSelectionService$v1,
    GeoSpatialService$v1
} from '@galileo/web_commonmap/_core';
import { AdminServiceTranslationTokens} from './admin.service.translation';

@Injectable()
export class CommonmapAdminService {

    isDirty = false;
    isNew = false;
    isDeleting = false;

    isMapLayerValid = true;
    isMapPresetValid = true;

    map: L.Map = null;
    mapOptions: L.MapOptions;
    mapId = 'preview-map';

    custZoomLayers = {};

    leafletBaseMapLayers: any[] = [];
    leafletOverlays: any[] = [];
    leafletDataLayers: any[] = [];

    baseMapsPane: any = null;
    overlaysPane: any = null;
    dataLayersPane: any = null;

    mapPresets: Common.MapPreset$v1[] = [];
    mapLayers: Common.MapLayer$v1[] = [];

    mapPresetDtos: Common.MapPresetDtoLeaflet$v1[] = [];
    mapLayerDtos: Common.MapLayerDtoLeaflet$v1[] = [];

    layerGroupInfos: any = {};

    savedMapPresets: Common.MapPreset$v1[] = [];
    savedMapLayers: Common.MapLayer$v1[] = [];
    savedDefaultMapPreset: Common.MapPreset$v1 = null;

    mapPresetOverlays: Common.MapLayer$v1[];
    mapPresetDataLayers: Common.MapLayer$v1[];
    mapPresetBaseMaps: Common.MapLayer$v1[];

    wmsModel: any;
    availWMSInfo: any;
    gettingCapabilities = false;

    wmtsModel: any;
    availWMTSInfo: any;

    availHxDRWMSLayerInfo: Common.HxDRLayerInfo;

    wfsCapabilities: any;
    availWFSInfo: any;

    mapLayersDataLayers: Common.MapLayer$v1[];
    mapLayersOverlays: Common.MapLayer$v1[];
    mapLayersBaseMaps: Common.MapLayer$v1[];

    displayedMapPreset: Common.MapPreset$v1 = null;

    selectedMapPreset: Common.MapPreset$v1 = null;
    selectedMapLayer: Common.MapLayer$v1 = null;

    defaultMapPreset: Common.MapPreset$v1 = null;
    defaultBaseMapLayer: Common.MapLayer$v1 = null;

    defaultBaseLeafletLayer: L.Layer = null;

    defaultLayerControl: any;
    defaultZoomControl: any;

    changingTabs = false;

    lastLayerAction: any;

    supportedCRS: any;

    linePatternDashArrays: {};

    contextMenuItems: ContextMenuItem[];

    geospatialSvc: GeoSpatialService$v1;

    adminComps: Common.AdminCompInfo[] = [];
    capabilityMapLayerData: Common.MapLayerComponentData$v1[];

    mapDataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    mapPresetChanged$: Subject<Common.MapPreset$v1> = new Subject();
    mapLayerChanged$: Subject<Common.MapLayer$v1> = new Subject();
    beforeChangesDiscarded$: Subject<void> = new Subject();
    beforeChangesSaved$: Subject<void> = new Subject();
    changesDiscarded$: Subject<any> = new Subject();
    changesSaved$: Subject<any> = new Subject();
    mapLayerCloned$: Subject<any> = new Subject();
    mapLayerDeleted$: Subject<any> = new Subject();
    mapPresetDeleted$: Subject<any> = new Subject();
    mapZoomChanged$: Subject<any> = new Subject();
    mapCenterChanged$: Subject<any> = new Subject();
    refreshPreview$: Subject<any> = new Subject();
    processing$ = new Subject<any>();
    processingComplete$ = new Subject<any>();
    loadingLayerInfo$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    mapUpdating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    mapClicked$ = new Subject<Common.Point$v1>();

    displayLayerPropsCmd$ = new Subject<any>();
    closeLayerPropsCmd$ = new Subject<boolean>();

    selectedLayers: any;
 
    // Used in conjunction with the DirtyComponent$v1 interface
    isDirty$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    disableSave$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    mapAdminComponents$: BehaviorSubject<Common.AdminCompInfo[]> =
        new BehaviorSubject<Common.AdminCompInfo[]>(this.adminComps);

    /**  Expose translation tokens to html template */
    tokens: typeof AdminServiceTranslationTokens = AdminServiceTranslationTokens;
    preFetchTokensList = [
        this.tokens.layerPropsCmdMenuItemLabel,
        this.tokens.copyCoordsMsg,
        this.tokens.copyCoordsTooltip
    ];

    // Supported WFS Output formats 
    supportedOutputFormats;

    transStrings = {};
    translationFinished = false;
    
    languageChanged$: Subject<string>;
    mapDataTranslated$: Subject<void> = new Subject<void>();

    standardMapAdminToken = this.tokens.standardMapComponentName;

    LayerFormat: typeof Common.LayerFormat$v1 = Common.LayerFormat$v1;

    private curAuthToken: string;
    private destroy$ = new Subject

    constructor(private mapDataSvc: CommonmapDataService$v1,
        private tenantAdapterSvc: CommontenantAdapterService$v1,
        private eventSvc: CommonmapEventService$v1,
        private mapCoreSvc: CommonmapCoreService$v1,
        private hxdrSvc: HxDRHelperService,
        public localizationSvc: CommonlocalizationAdapterService$v1,
        public errorNotification: MatSnackBar,
        private mailboxSvc: Common.CommonmapMailboxService,
        public selectionSvc: MapLayerSelectionService$v1,
        public dialog: MatDialog) {


        this.selectionSvc.selectionChanged$.subscribe((selectedLayers) => {
            this.selectedLayers = selectedLayers;
        });    
        this.mapCoreSvc.localizeGroup(['admin', 'core', 'main', 'shared']);
        this.linePatternDashArrays = this.mapCoreSvc.linePatternDashArrays;
        this.supportedOutputFormats = this.mapCoreSvc.supportedOutputFormats;
        this.initContextMenuItems();
        this.languageChanged$ = this.mapCoreSvc.languageChanged$;
        this.initLocalization();

        this.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            await this.initLocalization();
            if ((this.map as any)?.contextMenu) {
                const map = this.map as any;
                (this.mapOptions as any).copyCoordsMsg = map.options.copyCoordsMsg = this.transStrings[this.tokens.copyCoordsMsg];
                (this.mapOptions as any).copyCoordsTooltip = map.options.copyCoordsTooltip = this.transStrings[this.tokens.copyCoordsTooltip];
                map.contextMenu.refresh();
            }

        });
        
        this.mapDataLoaded$.pipe(
            filter(data => !!data)
        ).subscribe(() => {
            /** Listen for other map providers to register a admin component */
            this.mailboxSvc.mailbox$v1.registerMapAdminComponent$.subscribe(async (adminCompData: Common.MapAdminComponentData$v1) => {
                if (!adminCompData.name) {
                    const token = adminCompData.nameToken;
                    if (token) {
                        await this.localizationSvc.localizeStringAsync(token);
                        adminCompData.name = await this.localizationSvc.getTranslationAsync(token);
                    }
                }
                const idx = this.adminComps.findIndex((compInfo) => compInfo.adminCompData.capabilityId === adminCompData.capabilityId);
                if (idx !== -1) {
                    this.adminComps[idx].adminCompData = adminCompData;
                    this.adminComps[idx].registered = true;
                } else {
                    // This is very unlikely to happen. For us to hit this path, this capability would have to register
                    // an admin component before the common map was loaded.
                    const compInfo = new Common.AdminCompInfo({
                        adminCompData: adminCompData,
                        registered: true
                    });
                    this.adminComps.push(compInfo);
                }
                if (this.adminComps.length > 1) {
                    this.adminComps.sort(this.sortAdminCompByName);
                }
                this.mapAdminComponents$.next(this.adminComps);
            });
        });

        this.mapCoreSvc.mapDataReady$.subscribe(async (dataReady) => {

            if (!dataReady) {
                return;
            }
            this.defaultMapPreset = await this.mapCoreSvc.getDefaultMapPreset();
            if (this.defaultMapPreset) {
                for (const layer of this.defaultMapPreset.mapLayers) {
                    if (layer.type === Common.MapLayerType$v1.BaseMap && layer.shownOnStartup) {
                        this.defaultBaseMapLayer = layer;
                        break;
                    }
                }
            }

            this.savedMapPresets = this.mapCoreSvc.mapPresets;
            this.mapPresets = this.cloneMapPresets(this.savedMapPresets);

            this.savedMapLayers = this.mapCoreSvc.mapLayers;
            this.mapLayers = this.cloneMapLayers(this.savedMapLayers);

            this.mapLayerDtos = this.mapCoreSvc.mapLayerDtos;
            this.mapPresetDtos = this.mapCoreSvc.mapPresetDtos;

            this.mapCoreSvc.mapDataTranslated$.subscribe((translated) => {
                this.savedMapPresets = this.mapCoreSvc.mapPresets;
                this.mapPresets = this.cloneMapPresets(this.savedMapPresets);
    
                this.savedMapLayers = this.mapCoreSvc.mapLayers;
                this.mapLayers = this.cloneMapLayers(this.savedMapLayers);
    
                this.mapLayerDtos = this.mapCoreSvc.mapLayerDtos;
                this.mapPresetDtos = this.mapCoreSvc.mapPresetDtos;

                if (this.selectedMapPreset) {
                    this.mapCoreSvc.translateMapPreset(this.selectedMapPreset);
                }
                this.mapDataTranslated$.next();
            });
    
            this.capabilityMapLayerData = this.mapCoreSvc.getCapabilityMapLayerData();
            const myTokens = [];

            const capManifests = await this.tenantAdapterSvc.getCapabilityListAsync(Common.capabilityId);
            if (capManifests != null) {
                for (const capManifest of capManifests) {
                    if (capManifest.compatible) {
                        const result = capManifest.compatible.filter(item => item.capabilityId === Common.capabilityId);
                        if (result.length > 0) {
                            const compOptions: Common.MapCompatibleOptions$v1 = <any>result[0].options;
                            if (compOptions) {
                                if (compOptions.mapLayers) {
                                    for (const mapLayerData of compOptions.mapLayers) {
                                        this.capabilityMapLayerData.push(new Common.MapLayerComponentData$v1({
                                            capabilityId: capManifest.id,
                                            nameToken: mapLayerData.nameToken,
                                            id: mapLayerData.id,
                                            featureFlag: mapLayerData.featureFlag,
                                            licenseFeatureId: mapLayerData.licenseFeatureId
                                        }));
                                        myTokens.push(mapLayerData.nameToken);
                                    }
                                }

                                if (compOptions.mapAdminComponent) {
                                    const adminComp = compOptions.mapAdminComponent as Common.MapAdminComponentData$v1;
                                    let featureFlagEnabled = true;
                                    let licenseValid = true;
                                    if (adminComp.featureFlagId) {
                                        featureFlagEnabled = this.mapCoreSvc.isFeatureFlagEnabled(adminComp.featureFlagId);
                                    }

                                    if (adminComp.licenseFeatureId) {
                                        licenseValid = await this.mapCoreSvc.isLicenseValidAsync(adminComp.licenseFeatureId);
                                    }
                                    if (featureFlagEnabled && licenseValid) {
                                        const compInfo = new Common.AdminCompInfo({
                                            adminCompData: adminComp
                                        });
                                        if (!adminComp.name && adminComp.nameToken) {
                                            await this.localizationSvc.localizeStringAsync(adminComp.nameToken);
                                            adminComp.name = await this.localizationSvc.getTranslationAsync(adminComp.nameToken);
                                        }
                                        this.adminComps.push(compInfo);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            await localizationSvc.localizeStringsAsync(myTokens);

            const name = await localizationSvc.getTranslationAsync(this.tokens.standardMapComponentName);
            const adminCompData = new Common.MapAdminComponentData$v1({
                nameToken: this.tokens.standardMapComponentName,
                name: name,
                icon: 'assets/commonmap-core/images/admin/viewCard.png'
            });

            const adminCompInfo = new Common.AdminCompInfo({
                adminCompData: adminCompData,
                registered: true
            });

            this.adminComps.push(adminCompInfo);
            if (this.adminComps.length > 1) {
                this.adminComps.sort(this.sortAdminCompByName);
            }

            this.mapDataLoaded$.next(true);

        });

        this.mapCoreSvc.authToken$.pipe(
            filter(data => !!data)
        ).subscribe((authToken) => {
            // console.log ('new auth token received')
            this.curAuthToken = authToken;
            let layerGroupInfo: LayerGroupInfo;
            const keys = Object.keys(this.layerGroupInfos);
            for (const key of keys) {
                layerGroupInfo = this.layerGroupInfos[key];
                if (layerGroupInfo.leafletLayer) {
                    if (layerGroupInfo.mapLayer.format === Common.LayerFormat$v1.GeoJSON) {
                        const options = (<any>layerGroupInfo.leafletLayer).options;
                        if (options?.headers) {
                            const headers = options.headers;
                            if (headers['Authorization']) {
                                headers['Authorization'] = 'Bearer ' + this.curAuthToken;
                            }
                        }
                    } else {
                        const layerHeaders: {header: string, value: string}[] = (<any>layerGroupInfo.leafletLayer).headers;
                        if (layerHeaders) {
                            const header = layerHeaders.find(h => h.header === 'Authorization');
                            if (header) {
                                // console.log ('updating auth token in layer header')
                                header.value = 'Bearer ' + this.curAuthToken;
                            }
                        }
                    }
                }
            }
        });

        this.supportedCRS = Object.keys(this.mapCoreSvc.supportedCRS);
    }

    async initialize() {
        this.mapPresetDataLayers = null;
        this.mapPresetBaseMaps = null;
        this.mapPresetOverlays = null;

        this.mapLayersOverlays = null;
        this.mapLayersBaseMaps = null;
        this.mapLayersDataLayers = null;

        this.setIsDirty(false);
        this.selectedMapPreset = null;
        this.selectedMapLayer = null;

        this.wmsModel = null;
        this.availWMSInfo = null;

        this.setMapLayerValid(true);
        this.setMapPresetValid(true);

        this.layerGroupInfos = {};

        if (this.map) {
            this.setMap(null);
        }

        this.displayedMapPreset = null;
    }

    async getDefaultMapPreset() {
        this.defaultMapPreset = await this.mapCoreSvc.getDefaultMapPreset();
        return (this.defaultMapPreset);
    }

    isFeatureFlagEnabled(featureFlag: string) {
        const value = this.mapCoreSvc.isFeatureFlagEnabled(featureFlag);
        return(this.mapCoreSvc.isFeatureFlagEnabled(featureFlag));
    }

    isHxDRLayerType(mapLayer: Common.MapLayer$v1) {
        return (this.mapCoreSvc.isHxDRLayerType(mapLayer));
    }

    isHxCPLayerType(mapLayer: Common.MapLayer$v1) {
        return (this.mapCoreSvc.isHxCPLayerType(mapLayer));
    }

    initContextMenuItems() {
        const menuItem = new ContextMenuItem({
            index: 99,
            context: this,
            alwaysLast: true,
            callback: ((event: any) => {
                this.layerPropsCmd({event: event}); 
            })
        });

        this.contextMenuItems = [menuItem];
    }

    getLeafletMapOptions(mapPreset: Common.MapPreset$v1): L.MapOptions {
        this.mapOptions = {};
        if (mapPreset != null) {
            this.displayedMapPreset = mapPreset;

            this.mapOptions.zoom = mapPreset.zoomLevel;
            const mapCenter: Common.Point$v1 = mapPreset.mapCenter;

            this.mapOptions.center = L.latLng(mapCenter.latitude, mapCenter.longitude);
            this.mapOptions.maxZoom = 24;
            this.mapOptions.worldCopyJump = true;
            this.mapOptions.zoomControl = false;

            let lineColor;
            let fillColor;
            let opt = mapPreset.getOption(Common.MapPresetOptionName.HighlightLineColor);
            if (opt) {
                lineColor = opt.value; 
            }
            opt = mapPreset.getOption(Common.MapPresetOptionName.HighlightFillColor);
            if (opt) {
                fillColor = opt.value; 
            }
            if (lineColor && fillColor) {
                this.selectionSvc.setHighlightColor(lineColor, fillColor);
            }

            opt = mapPreset.getOption(Common.MapPresetOptionName.SelectionLineColor);
            if (opt) {
                lineColor = opt.value; 
            }
            opt = mapPreset.getOption(Common.MapPresetOptionName.SelectionFillColor);
            if (opt) {
                fillColor = opt.value; 
            }
            if (lineColor && fillColor) {
                this.selectionSvc.setSelectionColor(lineColor, fillColor);
            }

            const mapOp = this.mapOptions as any;
            mapOp.contextmenu = true;
            mapOp.contextmenuAnchor = [15,0];
            mapOp.contextmenuItems = [];
            if (this.mapCoreSvc.isFeatureFlagEnabled(Common.FeatureFlags.LayerInfoCmds)) {
                if (this.contextMenuItems) {
                    mapOp.contextmenuItems = this.contextMenuItems;
                }
            } else {
                mapOp.showCurrentLocation = false;
            }
            mapOp.copyCoordsMsg = this.transStrings[this.tokens.copyCoordsMsg];
            mapOp.copyCoordsTooltip = this.transStrings[this.tokens.copyCoordsTooltip];
    }
        return this.mapOptions;
    }

    getLeafletLayers() {
        let layers: any = [];
        layers = this.leafletBaseMapLayers.concat(this.leafletOverlays.concat(this.leafletDataLayers));

        return (layers);

    }

    async leafletMapReady(map: L.Map) {

        this.map = map;

        this.geospatialSvc = new GeoSpatialService$v1(this.map);
        this.leafletBaseMapLayers = [];
        this.leafletOverlays = [];
        this.leafletDataLayers = [];

        this.custZoomLayers = {};

        this.baseMapsPane = this.mapCoreSvc.createMapPane('mapPresetBaseMaps', null, this.map, null);
        this.overlaysPane = this.mapCoreSvc.createMapPane('mapPresetOverlays', null, this.map, null);
        this.dataLayersPane = this.mapCoreSvc.createMapPane('mapPresetDataLayers', null, this.map, null);

        await this.createBaseMapLayersForMap();
        await this.createOverlaysForMap();
        this.createDataLayersForMap();

        this.mapCoreSvc.addAllAutoRefreshTimersForMap(this.mapId, this.layerGroupInfos);

        this.map.on('unload', () => {
            this.mapCoreSvc.removeAllAutoRefreshTimersForMap(this.mapId);
        });
        this.map.on('zoomend', this.processMapZoomEnd, this);
        this.map.on('click', this.fireMapClicked, this);
        this.map.on('contextmenu', this.fireCloseLayerPropsCmd, this);

        this.setMapEvents(true);

        L.DomUtil.addClass((map as any)._container,'pointer-cursor-enabled');
    }

    destroyMap(map) {
        if (map) {
            this.mapCoreSvc.destroyMap(map);
        }
    }

    refreshMap() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }

    localizeGroup(groups: string | string[]) {
        this.mapCoreSvc.localizeGroup(groups);
    }

    getTranslatedStrings(tokens: string[]): Promise<any> {
        return this.mapCoreSvc.getTranslatedStrings(tokens);
    }

    layerPropsCmd(info: any) {
        const layerPropsCmdLayerInfos = [];
        const layerPropsCmdPoint = new Common.PixelPoint$v1(info.event.containerPoint.x, info.event.containerPoint.y);

        // If there is a selected layer, add it first to the list so it will appear at the top of the list of layers on the 
        // layer properties dialog.

        if (this.selectedLayers?.length > 0) {
            for (const selectedLayer of this.selectedLayers) {
                let parentLayer;
                const layerInfo = this.layerGroupInfos[selectedLayer.mapLayer.id]
                if(layerInfo) {
                    parentLayer = layerInfo.leafletLayer;
                }
                layerPropsCmdLayerInfos.push(new LayerPropsCmdLayerInfo({
                    mapLayer: selectedLayer.mapLayer,
                    leafletLayer: selectedLayer.leafletLayer,
                    parentLayer: parentLayer
                }));
            }
        }

        // Traverse the layers on the map in reverse order in the array so that they are presented in the same order 
        // as the layer panel.
        const keys = Object.keys(this.layerGroupInfos); 
        if (keys?.length > 0) {
            for (let ii = keys.length - 1; ii >= 0; ii--) {
                const layerInfo = this.layerGroupInfos[keys[ii]];
                const mapLayer = layerInfo.mapLayer;
                if (mapLayer?.shownOnStartup && this.isMapLayerDisplayedForZoom(mapLayer)) {
                    if (mapLayer?.format === Common.LayerFormat$v1.WMS || 
                        mapLayer?.format === Common.LayerFormat$v1.HxCPWMS ||
                        mapLayer?.format === Common.LayerFormat$v1.HxDRWMS) {
                        const opt = mapLayer.getOption(Common.MapLayerOptionName.EnableFeatInfo);
                    
                        if (opt?.value === 'true') {
                            layerPropsCmdLayerInfos.push(new LayerPropsCmdLayerInfo({
                                mapLayer: mapLayer
                            }));
                        }
                    } else if (this.isFeatureFlagEnabled(Common.FeatureFlags.Selection) && 
                        (mapLayer?.format === Common.LayerFormat$v1.GeoJSON || mapLayer?.format === Common.LayerFormat$v1.WFS)) {
                        const temp = layerPropsCmdLayerInfos.find((info) => info.mapLayer.id === mapLayer.id);
                        if (!temp) {
                            const locatePoly = this.geospatialSvc.createGeoJSONPolygonFeatureFromPt(info.event.latlng, 20);
                            if (locatePoly) {
                                const leafletLayers = (layerInfo.leafletLayer as L.FeatureGroup).getLayers();
                                if (leafletLayers) {
                                    for (const leafletLayer of leafletLayers) {
                                        if (this.geospatialSvc.featuresIntersect(locatePoly, (leafletLayer as any).feature)) {
                                            layerPropsCmdLayerInfos.push(new LayerPropsCmdLayerInfo({
                                                mapLayer: mapLayer,
                                                parentLayer: layerInfo.leafletLayer
                                            }));
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.displayLayerPropsCmd$.next({layerInfos: layerPropsCmdLayerInfos, point: layerPropsCmdPoint})
    }

    setLeafletLayerOpacity(mapLayer: Common.MapLayer$v1, opacityValue: number) {

        switch (mapLayer.type) {
            case Common.MapLayerType$v1.BaseMap: {
                break;
            }
            case Common.MapLayerType$v1.Overlay: {
                const overlayInfo: LayerGroupInfo = this.layerGroupInfos[mapLayer.id];
                if (overlayInfo && overlayInfo.leafletLayer ) {
                    // if (mapLayer.format === Common.LayerFormat$v1.GeoJSON) {
                    //     const opt = mapLayer.getOption('vectorStyleProps');
                    //     if (opt) {
                    //         const vectStyle = JSON.parse(opt.value);
                    //         if (vectStyle) {
                    //             const options: any = {};
                    //             options.pane = this.mapCoreSvc.createPaneNameForLayer(mapLayer);
                    //             const leafletStyle = this.mapCoreSvc.addLayerStyleOptionsToLeafletOptions(vectStyle, options, options.pane, mapLayer);
                    //             (<any>overlayInfo.leafletLayer).setStyle(leafletStyle);
                    //         }
                    //     }
                    //     const layer = overlayInfo.leafletLayer as L.GeoJSON;
                    //     layer.eachLayer((subLayer) => {
                    //         if ((<any>subLayer).setOpacity) {
                    //             (<any>subLayer).setOpacity(opacityValue);
                    //         }
                    //     });
                    // } else {
                        (<any>overlayInfo.leafletLayer).setOpacity(opacityValue);
                    // }
                }
                break;
            }
            case Common.MapLayerType$v1.Capability: {
                break;
            }
        }
    }

    setLayerDisplay(mapLayer: any, display: boolean) {
        switch (mapLayer.type) {
            case Common.MapLayerType$v1.Capability: {
                break;
            }
            case Common.MapLayerType$v1.Overlay: {
                const overlayInfo: LayerGroupInfo = this.layerGroupInfos[mapLayer.id];
                if (overlayInfo) {
                    if (display && this.isMapLayerDisplayedForZoom(overlayInfo.mapLayer)) {
                        overlayInfo.featureGroup.addLayer(overlayInfo.leafletLayer);
                        this.mapCoreSvc.addAutoRefreshTimer(overlayInfo, this.mapId);
                    } else {
                        overlayInfo.featureGroup.clearLayers();
                        this.mapCoreSvc.removeAutoRefreshTimer(mapLayer.id, this.mapId);
                    }
                }
                if (overlayInfo) {
                    if (display) {
                        overlayInfo.featureGroup.addLayer(overlayInfo.leafletLayer);
                        this.mapCoreSvc.addAutoRefreshTimer(overlayInfo, this.mapId);
                    } else {
                        overlayInfo.featureGroup.clearLayers();
                        this.mapCoreSvc.removeAutoRefreshTimer(mapLayer.id, this.mapId);
                    }
                }
                break;
            }
        }
    }

    setHighlightColor(color: string, fillColor: string) {
        if (this.selectionSvc) {
            this.selectionSvc.setHighlightColor(color, fillColor);
        }
    }

    setSelectionColor(color: string, fillColor: string) {
        if (this.selectionSvc) {
            this.selectionSvc.setSelectionColor(color, fillColor);
        }
    }

    isMapLayerDisplayedForZoom(mapLayer: Common.MapLayer$v1): boolean {
        let display = true;
        const curZoom = this.map.getZoom();
        if (mapLayer.defineMinZoom && curZoom < mapLayer.minZoomLevel) {
            display = false;
        }

        if (mapLayer.defineMaxZoom && curZoom > mapLayer.maxZoomLevel) {
            display = false;
        }
    
        return (display);
    }

    isImageFormatSupported(format: string) {
        return (this.mapCoreSvc.isImageFormatSupported(format));
    }

    isOutputFormatSupported(format) {
        return (this.mapCoreSvc.isOutputFormatSupported(format));
    }

    isFeatInfoFormatSupported(format: string) {
        return (this.mapCoreSvc.isFeatInfoFormatSupported(format));
    }

    sortAdminCompByName(a, b) {
        const name1 = a.adminCompData?.name?.toUpperCase();
        const name2 = b.adminCompData?.name?.toUpperCase();
        let compare = 0;
        if (name1 > name2) {
            compare = 1;
        } else if (name1 < name2) {
            compare = -1;
        }
        return (compare);
    }

    sortByName(a, b) {
        const name1 = a.name.toUpperCase();
        const name2 = b.name.toUpperCase();
        let compare = 0;
        if (name1 > name2) {
            compare = 1;
        } else if (name1 < name2) {
            compare = -1;
        }
        return (compare);
    }

    sortCaseInsensitive(a, b) {
        const name1 = a.toUpperCase();
        const name2 = b.toUpperCase();
        let compare = 0;
        if (name1 > name2) {
            compare = 1;
        } else if (name1 < name2) {
            compare = -1;
        }
        return (compare);
    }

    getLayerOptionDefault(optionName) {
        return(this.mapCoreSvc.getLayerOptionDefault(optionName));
    }


    showGrabCursor(event) {
        L.DomUtil.removeClass((this.map as any)._container,'pointer-cursor-enabled');
        L.DomUtil.addClass((this.map as any)._container,'grabbing-cursor-enabled');
    }

    showDefaultCursor(event) {
        L.DomUtil.addClass((this.map as any)._container,'pointer-cursor-enabled');
        L.DomUtil.removeClass((this.map as any)._container,'grabbing-cursor-enabled');
    }

    fireMapClicked(event) {
        this.clearSelectedLayer();
        const pt = new Common.Point$v1(event.latlng.lat, event.latlng.lng);
        this.mapClicked$.next(pt);
    }

    fireCloseLayerPropsCmd() {
        this.closeLayerPropsCmd$.next(false);
    }

    clearSelectedLayer() {
        if (this.selectionSvc) {
            this.selectionSvc.clearSelection();
        }
    }

    processMapZoomEnd(event: any) {
        const custZoomLayers: any = this.custZoomLayers;
        const curZoom = this.map.getZoom();
        if (custZoomLayers) {
            for (const key of Object.keys(custZoomLayers)) {
                const layerGroupInfo = custZoomLayers[key];
                if (layerGroupInfo.mapLayer.shownOnStartup && this.isMapLayerDisplayedForZoom(layerGroupInfo.mapLayer)) {
                    this.handleGeoJSONLayerWithCustZoom(layerGroupInfo, true);
                } else {
                    this.handleGeoJSONLayerWithCustZoom(layerGroupInfo, false);
                }
            }
        }
    }

    handleGeoJSONLayerWithCustZoom(layerGroupInfo: LayerGroupInfo, display: boolean) {
        if (display) {
            layerGroupInfo.featureGroup.addLayer(layerGroupInfo.leafletLayer);
            this.mapCoreSvc.addAutoRefreshTimer(layerGroupInfo, this.mapId);
        } else {
            layerGroupInfo.featureGroup.clearLayers();
            this.mapCoreSvc.removeAutoRefreshTimer(layerGroupInfo.mapLayer.id, this.mapId);
        }
        layerGroupInfo.displayedOnMap = display;
    }

    setMapEvents(on: boolean) {
        if (this.map) {
            if (on) {
                this.map.on('zoomend', this.fireMapZoomChanged, this);
                this.map.on('moveend', this.fireMapCenterChanged, this);
            } else {
                this.map.off('zoomend', this.fireMapZoomChanged, this);
                this.map.off('moveend', this.fireMapCenterChanged, this);
            }
        }
    }

    addMapControls() {
        this.addZoomControl();
    }

    addZoomControl() {
        const position = Common.ZoomControlPositions$v1.BottomRight;

        this.defaultZoomControl = L.control.zoom({ position: <L.ControlPosition>(position.toLowerCase()) });
        this.defaultZoomControl.addTo(this.map);
    }

    removeZoomControl() {
        if (this.defaultZoomControl) {
            this.map.removeControl(this.defaultZoomControl);
        }
    }

    convertOptionStringValueToType(option: Common.MapLayerOption$v1) {
        return (this.mapCoreSvc.convertOptionStringValueToType(option));
    }

    async createBaseMapLayersForMap() {
        // Create layer pane and create layer for that pane.  The pane will maintain proper display order.
        const mapPresetBaseMaps: Common.MapLayer$v1[] =
            this.mapCoreSvc.getMapLayers(this.displayedMapPreset, Common.MapLayerType$v1.BaseMap);
        const isDefault = this.displayedMapPreset.id === this.mapCoreSvc.defaultMapPreset.id;

        for (const baseMap of mapPresetBaseMaps) {
            const baseMapInfo = new LayerGroupInfo();
            const name = this.mapCoreSvc.createPaneNameForLayer(baseMap);
            baseMapInfo.paneName = name;
            baseMapInfo.pane = this.mapCoreSvc.createMapPane(name, this.baseMapsPane, this.map, null);

            if (baseMap.shownOnStartup && this.leafletBaseMapLayers.length === 0) {
                const layer = await this.mapCoreSvc.createLeafletLayer(baseMap, this.selectionSvc);
                baseMapInfo.mapLayer = baseMap;
                if (layer) {
                    baseMapInfo.leafletLayer = layer;
                    // If the map is being recreated because of a refresh and a basemap is already selected, don't add the default
                    if (!this.selectedMapLayer ||
                        (this.selectedMapLayer && this.selectedMapLayer.type !== Common.MapLayerType$v1.BaseMap)) {
                        this.leafletBaseMapLayers.push(layer);
                    }
                    if (isDefault) {
                        this.defaultBaseLeafletLayer = layer;
                    }

                    this.layerGroupInfos[baseMap.id] = baseMapInfo;
                }
            }
        }
    }

    async createOverlaysForMap() {
        // Create layer pane and create layer for that pane.  The pane will maintain proper display order.
        const mapPresetOverlays: Common.MapLayer$v1[] =
            this.mapCoreSvc.getMapLayers(this.displayedMapPreset, Common.MapLayerType$v1.Overlay);
        for (let ii = mapPresetOverlays.length - 1; ii >= 0; ii--) {
            const overlayInfo = new LayerGroupInfo();
            const name = this.mapCoreSvc.createPaneNameForLayer(mapPresetOverlays[ii]);
            overlayInfo.paneName = name;
            overlayInfo.pane = this.mapCoreSvc.createMapPane(name, this.overlaysPane, this.map, null);
            const layer = await this.mapCoreSvc.createLeafletLayer(mapPresetOverlays[ii], this.selectionSvc);
            overlayInfo.mapLayer = mapPresetOverlays[ii];
            if (layer) {
                let custZoomDisplayed = true;
                overlayInfo.featureGroup = new L.FeatureGroup();
                overlayInfo.leafletLayer = layer;
                if (overlayInfo.mapLayer.format === Common.LayerFormat$v1.GeoJSON ||
                    overlayInfo.mapLayer.format === Common.LayerFormat$v1.WFS) {
                    if (overlayInfo.mapLayer.defineMinZoom || overlayInfo.mapLayer.defineMaxZoom) {
                        this.custZoomLayers[overlayInfo.mapLayer.id] = overlayInfo;
                        custZoomDisplayed = overlayInfo.mapLayer.shownOnStartup && this.isMapLayerDisplayedForZoom(overlayInfo.mapLayer);
                    }
                }
                if (mapPresetOverlays[ii].shownOnStartup && custZoomDisplayed) {
                    overlayInfo.featureGroup.addLayer(layer);
                }
                this.leafletOverlays.push(overlayInfo.featureGroup);
                this.layerGroupInfos[mapPresetOverlays[ii].id] = overlayInfo;
            }
        }
    }

    createDataLayersForMap() {
        // Create layer pane and create layer for that pane.  The pane will maintain proper display order.
        const mapPresetDataLayers: Common.MapLayer$v1[] = this.mapCoreSvc.getMapLayers(this.displayedMapPreset,
                                                        Common.MapLayerType$v1.Capability);
    }

    getCurrentZoom(): number {
        let zoom = -1;
        if (this.map) {
            zoom = this.map.getZoom();
        }
        return (zoom);
    }

    getCurrentCenter(): Common.Point$v1 {
        const center = this.map.getCenter();
        const mapCenter: Common.Point$v1 = { latitude: center.lat, longitude: center.lng, altitude: 0 };

        return (mapCenter);
    }

    setMapZoom(zoomLevel: number) {
        if (this.map) {
            this.map.setZoom(zoomLevel);
        }
    }

    setMapZoomCenterByPreset(mapPreset: Common.MapPreset$v1) {
        if (this.map) {
            const center: L.LatLng = L.latLng(mapPreset.mapCenter.latitude, mapPreset.mapCenter.longitude);
            this.map.setView(center, mapPreset.zoomLevel);
        }
    }

    setMapZoomCenter(zoomLevel: number, mapCenter: Common.Point$v1, noEvents: boolean) {
        if (this.map) {
            const center: L.LatLng = L.latLng(mapCenter.latitude, mapCenter.longitude);

            if (noEvents) {
                this.setMapEvents(false);
            }
            this.map.setView(center, zoomLevel);
            window.setTimeout(() => {
                if (noEvents) {
                    this.setMapEvents(true);
                }
            }, 500);
        }
    }

    removeUrlParams(mapLayer: Common.MapLayer$v1) {
        this.mapCoreSvc.removeURLParams(mapLayer);
    }

    createLeafletLayer(mapLayer: Common.MapLayer$v1, selectionSvc) {
        return(this.mapCoreSvc.createLeafletLayer(mapLayer, selectionSvc));
    }

    addDefaultMapLayer() {
        if (this.leafletBaseMapLayers.length === 0 || this.leafletBaseMapLayers[0] !== this.defaultBaseLeafletLayer) {
            this.leafletBaseMapLayers = [];
            this.leafletBaseMapLayers.push(this.defaultBaseLeafletLayer);
        }
    }

    async addLayerToMap(mapLayer: Common.MapLayer$v1) {
        if (this.map) {
            if (mapLayer.id === this.defaultBaseMapLayer.id) {
                this.addDefaultMapLayer()
            } else {
                const paneName = this.mapCoreSvc.createPaneNameForLayer(mapLayer);
                let groupInfo = this.layerGroupInfos[mapLayer.id];
                if (!groupInfo) {
                    groupInfo = new LayerGroupInfo();
                    switch (mapLayer.type) {
                        case Common.MapLayerType$v1.BaseMap: {
                            this.leafletBaseMapLayers = [];
                            if (mapLayer.valid) {
                                groupInfo.mapLayer = mapLayer;
                                groupInfo.paneName = paneName;
                                if (!this.map.getPane(paneName)) {
                                    groupInfo.pane = this.mapCoreSvc.createMapPane(paneName, this.baseMapsPane, this.map, null);
                                }
                                const layer = await this.mapCoreSvc.createLeafletLayer(mapLayer, this.selectionSvc);
                                if (layer) {
                                    groupInfo.leafletLayer = layer;
                                    this.leafletBaseMapLayers.push(layer);
                                    this.layerGroupInfos[mapLayer.id] = groupInfo;
                                    this.mapCoreSvc.addAutoRefreshTimer(groupInfo, this.mapId);
                                }
                            }
                            break;
                        }
                        case Common.MapLayerType$v1.Overlay: {
                            if (this.leafletBaseMapLayers.length === 0) {
                                this.addDefaultMapLayer();
                            }
                            if (mapLayer.valid) {
                                groupInfo.paneName = paneName;
                                if (!this.map.getPane(paneName)) {
                                    groupInfo.pane = this.mapCoreSvc.createMapPane(paneName, this.overlaysPane, this.map, null);
                                }
                                const layer = await this.mapCoreSvc.createLeafletLayer(mapLayer, this.selectionSvc);
                                groupInfo.mapLayer = mapLayer;
                                if (layer) {
                                    groupInfo.featureGroup = new L.FeatureGroup();
                                    groupInfo.leafletLayer = layer;
                                    let custZoomDisplayed = true;
                                    if (groupInfo.mapLayer.format === Common.LayerFormat$v1.GeoJSON ||
                                        groupInfo.mapLayer.format === Common.LayerFormat$v1.WFS) {
                                        if (groupInfo.mapLayer.defineMinZoom || groupInfo.mapLayer.defineMaxZoom) {
                                            this.custZoomLayers[groupInfo.mapLayer.id] = groupInfo;
                                            custZoomDisplayed = groupInfo.mapLayer.shownOnStartup && this.isMapLayerDisplayedForZoom(groupInfo.mapLayer);
                                        }
                                    }

                                    if (mapLayer.shownOnStartup && custZoomDisplayed  ) {
                                        groupInfo.featureGroup.addLayer(layer);
                                    }
                                    this.leafletOverlays.push(groupInfo.featureGroup);
                                    this.layerGroupInfos[mapLayer.id] = groupInfo;
                                    this.mapCoreSvc.addAutoRefreshTimer(groupInfo, this.mapId);
                                }
                            }
                            break;
                        }
                        case Common.MapLayerType$v1.Capability: {
                            groupInfo.mapLayer = mapLayer;
                            groupInfo.paneName = paneName;
                            if (!this.map.getPane(paneName)) {
                                groupInfo.pane = this.mapCoreSvc.createMapPane(paneName, this.dataLayersPane, this.map, null);
                            }
                            this.layerGroupInfos[mapLayer.id] = groupInfo;
                            break;
                        }
                    }
                }
            }
        }
    }

    removeLayerFromMap(mapLayer: Common.MapLayer$v1, removePane = true) {
        if (this.map) {
            let groupInfo: LayerGroupInfo = this.layerGroupInfos[mapLayer.id];
            if (!groupInfo) {
                const opt = mapLayer.getOption(Common.MapLayerOptionName.WorkingLayer);
                if (opt?.value) {
                    groupInfo = this.layerGroupInfos[opt.value];
                }
            }
            switch (mapLayer.type) {
                case Common.MapLayerType$v1.BaseMap: {
                    if (mapLayer.id !== this.defaultBaseMapLayer.id) {
                        if (groupInfo?.leafletLayer) {
                            this.leafletBaseMapLayers = [];
                            if (removePane) {
                                this.mapCoreSvc.deleteMapPaneByLayer(mapLayer, this.map);
                            }
    
                           this.mapCoreSvc.removeAutoRefreshTimer(mapLayer.id, this.mapId);
                            // if (!this.selectedMapLayer) {
                            //    this.leafletBaseMapLayers.push(this.defaultBaseLeafletLayer);
                            // }
                        }
                    }
                    break;
                }
                case Common.MapLayerType$v1.Overlay: {

                    if (groupInfo?.leafletLayer) {
                        groupInfo.featureGroup.clearLayers();
                        const index = this.leafletOverlays.indexOf(groupInfo.featureGroup);
                        if (index !== -1) {
                            this.leafletOverlays.splice(index, 1);
                        }
                        this.mapCoreSvc.deleteMapPane(groupInfo.paneName, this.map);
                       this.mapCoreSvc.removeAutoRefreshTimer(mapLayer.id, this.mapId);
                    }
                    break;
                }
                case Common.MapLayerType$v1.Capability: {
                    if (removePane) {
                        this.mapCoreSvc.deleteMapPaneByLayer(mapLayer, this.map);
                    }
                    break;
                }
            }
            if (groupInfo) {
                if (this.custZoomLayers[mapLayer.id]) {
                    delete this.custZoomLayers[mapLayer.id];
                }

                delete this.layerGroupInfos[mapLayer.id];
            }
        }
    }

    async redrawLayer(mapLayer: Common.MapLayer$v1) {
        let oldPaneName;
        if (this.map) {
            const groupInfo: LayerGroupInfo = this.layerGroupInfos[mapLayer.id];
            if (!groupInfo) {
                this.addLayerToMap(mapLayer);
            } else {
                if (!mapLayer.valid) {
                    this.removeLayerFromMap(mapLayer);
                } else {
                    const paneName = this.mapCoreSvc.createPaneNameForLayer(mapLayer);
                    if (paneName !== groupInfo.paneName) {
                        oldPaneName = groupInfo.paneName;
                    }
                    switch (mapLayer.type) {
                        case Common.MapLayerType$v1.BaseMap: {
                            groupInfo.mapLayer = mapLayer;
                            groupInfo.paneName = paneName;
                            if (!this.map.getPane(paneName)) {
                                groupInfo.pane = this.mapCoreSvc.createMapPane(paneName, this.baseMapsPane, this.map, null);
                            }
                            const layer = await this.mapCoreSvc.createLeafletLayer(mapLayer, this.selectionSvc);
                            if (layer) {
                                groupInfo.leafletLayer = layer;
                                this.leafletBaseMapLayers = [];
                                this.leafletBaseMapLayers.push(layer);
                                this.mapCoreSvc.addAutoRefreshTimer(groupInfo, this.mapId);
                            }
                            if (oldPaneName) {
                                this.mapCoreSvc.deleteMapPane(oldPaneName, this.map);
                            }
                            break;
                        }
                        case Common.MapLayerType$v1.Overlay: {
                            groupInfo.mapLayer = mapLayer;
                            groupInfo.paneName = paneName;
                            if (!this.map.getPane(paneName)) {
                                groupInfo.pane = this.mapCoreSvc.createMapPane(paneName, this.overlaysPane, this.map, null);
                            }
                            const layer = await this.mapCoreSvc.createLeafletLayer(mapLayer, this.selectionSvc);
                            if (layer) {
                                const index = this.leafletOverlays.indexOf(groupInfo.featureGroup);
                                if (index !== -1) {
                                    this.leafletOverlays.splice(index, 1);
                                }
                                groupInfo.featureGroup = new L.FeatureGroup();
                                groupInfo.leafletLayer = layer;
                                if (mapLayer.shownOnStartup) {
                                    groupInfo.featureGroup.addLayer(layer);
                                   this.mapCoreSvc.addAutoRefreshTimer(groupInfo, this.mapId);
                                }
                                this.leafletOverlays.push(groupInfo.featureGroup);

                            }
                            if (oldPaneName) {
                                this.mapCoreSvc.deleteMapPane(oldPaneName, this.map);
                            }
                            break;
                        }
                        case Common.MapLayerType$v1.Capability: {
                            groupInfo.mapLayer = mapLayer;
                            groupInfo.paneName = paneName;
                            if (!this.map.getPane(paneName)) {
                                groupInfo.pane = this.mapCoreSvc.createMapPane(paneName, this.dataLayersPane, this.map, null);
                            }
                            if (oldPaneName) {
                                this.mapCoreSvc.deleteMapPane(oldPaneName, this.map);
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    clearLayers() {
        this.leafletBaseMapLayers = [];
        this.leafletOverlays = [];
        this.leafletDataLayers = [];

        this.mapCoreSvc.removeAllAutoRefreshTimersForMap(this.mapId);
    }

    reorderOverlays() {
        this.mapPresetOverlays = this.getOverlays(this.selectedMapPreset.mapLayers);

        let zIndex = 100;
        for (let ii = this.mapPresetOverlays.length - 1; ii >= 0; ii--) {
            const overlayInfo: LayerGroupInfo = this.layerGroupInfos[this.mapPresetOverlays[ii].id];
            if (overlayInfo) {
                const pane = this.map.getPane(overlayInfo.paneName);
                if (pane) {
                    pane.style.zIndex = zIndex.toString();
                    zIndex += 100;
                }
            }
        }
}

    reorderDataLayers() {
        this.mapPresetDataLayers = this.getDataLayers(this.selectedMapPreset.mapLayers);
        if (this.mapPresetDataLayers != null) {
            this.leafletDataLayers = [];
            this.createDataLayersForMap();
        }
    }

    fireMapZoomChanged(event: any) {
        if (this.map) {
            this.mapZoomChanged$.next({ map: event.target, zoomLevel: this.map.getZoom() });
        }
    }

    fireMapCenterChanged(event: any) {
        if (this.map) {
            const center = this.map.getCenter();

            const mapCenter: Common.Point$v1 = { latitude: center.lat, longitude: center.lng, altitude: 0 };
            this.mapCenterChanged$.next({ map: event.target, mapCenter: mapCenter });
        }
    }

    getDataLayers(mapLayers: Common.MapLayer$v1[]): Common.MapLayer$v1[] {
        let layers = [];
        if (mapLayers) {
            layers = mapLayers.filter((layer) => {
                const opt = layer.getOption('workingLayer');
                return (layer.type === Common.MapLayerType$v1.Capability && !opt);
            });
        }

        return (layers);
    }

    getOverlays(mapLayers: Common.MapLayer$v1[]): Common.MapLayer$v1[] {
        let layers = [];
        if (mapLayers) {
            layers = mapLayers.filter((layer) => {
                const opt = layer.getOption('workingLayer');
                return ((layer.type === Common.MapLayerType$v1.Overlay)
                         && !opt);
            });
        }

        return (layers);
    }

    getBaseMaps(mapLayers: Common.MapLayer$v1[]): Common.MapLayer$v1[] {
        let layers = [];
        if (mapLayers) {
            layers = mapLayers.filter((layer) => {
                const opt = layer.getOption('workingLayer');
                return (layer.type === Common.MapLayerType$v1.BaseMap && !opt);
            });
        }

        return (layers);
    }

    getDataLayersFromMapLayers(searchString): Common.MapLayer$v1[] {
        this.mapLayersDataLayers = [];
        if (this.mapLayers) {
            this.mapLayersDataLayers = this.mapLayers.filter((layer) => {
                const opt = layer.getOption('workingLayer');
                return ( !opt && layer.type === Common.MapLayerType$v1.Capability &&
                         this.compareWithSearchString(layer.name, searchString));
            });
        }
        return (this.mapLayersDataLayers);
    }

    getOverlaysFromMapLayers(searchString: string): Common.MapLayer$v1[] {
        this.mapLayersOverlays = [];
        if (this.mapLayers) {
            this.mapLayersOverlays = this.mapLayers.filter((layer) => {
                let includeLayer = this.mapCoreSvc.isFeatureFlagForLayer(layer);
                const opt = layer.getOption('workingLayer');
                return ( !opt && includeLayer &&
                         (layer.type === Common.MapLayerType$v1.Overlay) &&
                         this.compareWithSearchString(layer.name, searchString));
            });
        }
        return (this.mapLayersOverlays);
    }

    getBaseMapsFromMapLayers(searchString): Common.MapLayer$v1[] {
        this.mapLayersBaseMaps = [];
        if (this.mapLayers) {
            this.mapLayersBaseMaps = this.mapLayers.filter((layer) => {
                let includeLayer = this.mapCoreSvc.isFeatureFlagForLayer(layer);

                const opt = layer.getOption('workingLayer');
                return ( !opt && includeLayer &&
                         layer.type === Common.MapLayerType$v1.BaseMap &&
                         this.compareWithSearchString(layer.name, searchString));
            });
        }
        return (this.mapLayersBaseMaps);
    }

    compareWithSearchString(token: string, searchString: string): boolean {
        let isContained =  true;
        if (searchString) {
            isContained = (token.toLowerCase().search(searchString.toLowerCase()) !== -1);
        }

        return (isContained);
    }

    public getCommaSeparatedWMSLayers(wmsLayers: string[]): string {
        let list: string;
        if (wmsLayers && wmsLayers.length > 0) {
            list = wmsLayers[0];

            for (let ii = 1; ii < wmsLayers.length; ii++) {
                list += ',' + wmsLayers[ii];
            }
        }
        return (list);
    }
    setIsDirty(flag): void {
        this.isDirty = flag;
        if (this.isDirty$.getValue() !== flag) {
            this.isDirty$.next(flag);
        }
    }

    setMapLayerValid(flag): void {
        this.isMapLayerValid = flag;
        // Check is same as last value sent
        if (this.disableSave$.getValue() === flag) {
            this.disableSave$.next(!flag);
        }
    }

    setMapPresetValid(flag): void {
        this.isMapPresetValid = flag;

        // Check is same as last value sent
        if (this.disableSave$.getValue() === flag) {
            this.disableSave$.next(!flag);
        }
    }

    setMap(map: L.Map) {
        this.map = map;
        if (map === null) {
            this.setMapEvents(false);
        }
    }

    cloneMapPresets(mapPresets): Common.MapPreset$v1[] {
        const newMapPresets: Common.MapPreset$v1[] = [];
        for (const mapPreset of mapPresets) {
            newMapPresets.push(mapPreset.clone());
        }
        return (newMapPresets);
    }

    cloneMapLayers(mapLayers): Common.MapLayer$v1[] {
        const newMapLayers: Common.MapLayer$v1[] = [];
        for (const mapLayer of mapLayers) {
            newMapLayers.push(mapLayer.clone());
        }

        return (newMapLayers);
    }

    setSelectedMapPreset(mapPreset: Common.MapPreset$v1): Promise<Common.MapPreset$v1> {
        return (new Promise<Common.MapPreset$v1>(async (resolve) => {
            this.initialize();

            if (mapPreset != null) {
                if (mapPreset.id === this.mapCoreSvc.defaultMapPreset.id) {
                    mapPreset = await this.mapCoreSvc.getDefaultMapPreset();
                }

                this.getLeafletMapOptions(mapPreset);
                this.selectedMapPreset = mapPreset.clone();
                this.mapPresetDataLayers = this.getDataLayers(this.selectedMapPreset.mapLayers);
                this.mapPresetOverlays = this.getOverlays(this.selectedMapPreset.mapLayers);
                this.mapPresetBaseMaps = this.getBaseMaps(this.selectedMapPreset.mapLayers);
            } else {
                this.setMapEvents(false);
                this.setMap(null);
                this.selectedMapPreset = null;
                this.mapPresetDataLayers = null;
                this.mapPresetBaseMaps = null;
                this.mapPresetOverlays = null;
            }

            this.selectedMapLayer = null;
            this.wmsModel = null;
            this.availWMSInfo = null;

            this.mapPresetChanged$.next(mapPreset);

            resolve(this.selectedMapPreset);

        }));
    }

    setSelectedMapLayer(mapLayer: Common.MapLayer$v1): Common.MapLayer$v1 {
        this.selectedMapPreset = null;
        this.setMapPresetValid(true);
        this.setMapLayerValid(true);
        this.wmsModel = null;
        this.availWMSInfo = null;

        if (mapLayer != null) {
            if (!mapLayer.isSystemDefined) {
                this.selectedMapLayer = mapLayer.clone();
                this.selectedMapLayer.upsertOption('workingLayer', null);
            } else {
                this.selectedMapLayer = mapLayer;
            }
        } else {
            this.selectedMapLayer = null;
        }

        this.mapLayerChanged$.next(this.selectedMapLayer);

        return (this.selectedMapLayer);
    }

    async cleanupWorkingLayer(showProcessingWindow = true) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                if (this.selectedMapLayer) {
                    const opt = this.selectedMapLayer.getOption('workingLayer');
                    if (opt) {
                        if (opt.value && this.selectedMapLayer.id !== opt.value) {
                            if (showProcessingWindow) {
                                this.fireShowHideProcessing(true, false, this.tokens.discardingMapLayerLabel);
                            }

                            await this.deleteMapLayer(this.selectedMapLayer);

                            this.selectedMapLayer.id = opt.value;

                            if (showProcessingWindow) {
                                this.fireShowHideProcessing(false);
                            }
                        }
                        this.selectedMapLayer.removeOption('workingLayer');
                    }
                }
                resolve();
            } catch (err) {
                console.log('Error cleaning up working layer: ' + err.toString());
                resolve();
            }
        });
    }

    fireShowHideProcessing(show: boolean, isNew = false, token?: any) {
        if (show) {
            this.processing$.next({
                token: token,
                isNew: isNew
            });
        } else {
            this.processingComplete$.next({
                success: false,
                isNew: isNew
            });
        }
    }

    /**
     * Validate the information in the map preset data object
     *
     * @param mapPreset - Map preset data object to be validated
     */
    validateMapPreset(mapPreset: Common.MapPreset$v1): string {
        let errorToken;
        if (mapPreset) {
            errorToken = this.validateMapPresetName(mapPreset);
            if (!errorToken) {
                errorToken = this.validateMapPresetBaseMap(mapPreset);
            }
        }
        return (errorToken);
    }

    /**
     * Validate the name of the map preset data object
     *
     * @param mapPreset - Map preset data object
     */
    validateMapPresetName(mapPreset: Common.MapPreset$v1): string {
        let errorToken;
        if (mapPreset) {
            if (!mapPreset.name) {
                errorToken = this.tokens.errorInvalidMapPresetName;
            } else if (!this.isMapPresetNameUnique(mapPreset)) {
                errorToken = this.tokens.errorDuplicateMapPresetName;
            }
        }
        return (errorToken);
    }

    validateMapPresetBaseMap(mapPreset: Common.MapPreset$v1): string {
        let errorToken;
        if (mapPreset) {
            if (!this.isBaseMapDefined(mapPreset.mapLayers)) {
                errorToken = this.tokens.errorNoBaseMapDefined;
            }
        }
        return (errorToken);
    }

    isMapPresetNameUnique(mapPreset: Common.MapPreset$v1): boolean {
        let result = [];
        if (mapPreset?.name) {
            result = this.mapPresets.filter(preset =>
                preset.name.toLowerCase() === mapPreset.name.toLowerCase() && preset.id !== mapPreset.id);
        }
        return (result.length === 0);
    }

    isBaseMapDefined(mapLayers: Common.MapLayer$v1[]): boolean {
        if (mapLayers) {
            const result = mapLayers.filter(layer => layer.type === Common.MapLayerType$v1.BaseMap);
            return (result.length > 0);
        } else {
            return (false);
        }
    }

    getMapLayerByName(name: string, workingLayer: boolean): Common.MapLayer$v1 {
        let mapLayer;
        if (workingLayer) {
            mapLayer = this.mapLayers.find((layer) => {
                const opt = layer.getOption('workingLayer');
                return(layer.name === name && opt);
            });
        } else {
            mapLayer = this.mapLayers.find((layer) => layer.name === name);
        }
        if (mapLayer) {
            return (mapLayer);
        } else {
            return(null);
        }
    }

    validateMapLayer(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        if (mapLayer) {
            errorToken = this.validateLayerName(mapLayer);
            if (errorToken) {
                return (errorToken);
            }

            if (mapLayer.type === Common.MapLayerType$v1.BaseMap || mapLayer.type === Common.MapLayerType$v1.Overlay) {
                    errorToken = this.validateLayerUrl(mapLayer.url);
                if (errorToken) {
                    return (errorToken);
                }

                errorToken = this.validateLayerUrlParams(mapLayer.urlParams);
                if (errorToken) {
                    return (errorToken);
                }

                switch (mapLayer.format) {
                    case Common.LayerFormat$v1.Tile: {
                        errorToken = this.validateTile(mapLayer);
                        break;
                    }
                    case Common.LayerFormat$v1.HxCPWMS:
                    case Common.LayerFormat$v1.WMS: {
                        errorToken = this.validateWMS(mapLayer);
                        break;
                    }
                    case Common.LayerFormat$v1.HxCPWMTS:
                    case Common.LayerFormat$v1.WMTS: {
                        errorToken = this.validateWMTS(mapLayer);
                        break;
                    }
                    case Common.LayerFormat$v1.HxDRWMS: {
                        errorToken = this.validateHxDRWMS(mapLayer);
                        break;
                    }
                }
            } else if (mapLayer.type === Common.MapLayerType$v1.Capability) {
                errorToken = this.validateCapabilityModuleRef(mapLayer);
                if (errorToken) {
                    return (errorToken);
                }
            }
        }
        return (errorToken);
    }

    validateLayerName(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        if (!mapLayer.name) {
            errorToken = this.tokens.errorInvalidLayerName;
        } else if (this.isLayerNameUnique(mapLayer) === false) {
            errorToken = this.tokens.errorDuplicateLayerName;
        }

        return (errorToken);
    }

    validateLayerUrl(url: string): string {
        let errorToken;
        if (!url) {
            errorToken = this.tokens.errorInvalidUrlName;
        } else {

            if (url.toLowerCase().indexOf('http://') !== 0 && url.toLowerCase().indexOf('https://') !== 0) {
                errorToken = this.tokens.errorURLInvalid;
            }
        }

        return (errorToken);
    }

    validateLayerUrlParams(urlParams: Common.MapLayerOption$v1[]): string {
        let errorToken;
        for (const param of urlParams) {
            if (!param.name || !param.value) {
                errorToken = this.tokens.errorInvalidUrlParams;
            }
        }
        return(errorToken);
    }

    validateWMS(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        if (mapLayer.format === this.LayerFormat.WMS || 
            mapLayer.format === this.LayerFormat.HxCPWMS || 
            mapLayer.format === this.LayerFormat.HxDRWMS) {
            errorToken = this.validateWMSLayer(mapLayer);
            if (!errorToken) {
                errorToken = this.validateCRS(mapLayer);
                if (!errorToken) {
                    errorToken = this.validateImageFormat(mapLayer);
                    if (!errorToken) {
                        errorToken = this.validateFeatInfoFormat(mapLayer);
                    }
                }
            }
        }

        return (errorToken);
    }

    validateWMSLayer(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        if (mapLayer.wmsLayers?.length === 0) {
            errorToken = this.tokens.errorNoWMSLayersSelected;
        }

        return(errorToken);
    }

    validateWFS(mapLayer: Common.MapLayer$v1): string {
        let errorToken;

        if (mapLayer.format === this.LayerFormat.WFS) {
            errorToken = this.validateWFSFeatureTypes(mapLayer);
            if (!errorToken) {
                const maxFeatsOpt = mapLayer.getOption(Common.MapLayerOptionName.MaxFeatures);
                if (maxFeatsOpt) {
                    errorToken = this.validateWFSMaxFeatures(maxFeatsOpt.value);
                }
            }
        }

        return (errorToken);
    }

    validateWFSFeatureTypes(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        if (mapLayer.wmsLayers?.length === 0) {
            errorToken = this.tokens.errorNoWFSFeatureTypesSelected;
        }

        return (errorToken);
    }

    validateWFSMaxFeatures(maxFeats) {
        let errorToken = '';
        if (!maxFeats)  {
            errorToken = this.tokens.errorInvalidWFSMaxFeatures;
        } else {
            const value = parseInt(maxFeats, 10);
            if (isNaN(value)) {
                errorToken = this.tokens.errorInvalidWFSMaxFeatures;
            } else if (value < 1) {
                errorToken = this.tokens.errorInvalidWFSMaxFeatures;
            }
        }
        return (errorToken);
    }

    validateCRS(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        const option = mapLayer.getOption('crs');
        if (!option) {
            errorToken = this.tokens.errorNoCRSSelected;
        }
        return(errorToken);
    }


    validateImageFormat(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        const option = mapLayer.getOption(Common.MapLayerOptionName.Format);
        if (!option) {
            errorToken = this.tokens.errorNoImageFormatSelected;
        }
        return(errorToken);
    }

    validateFeatInfoFormat(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        const option = mapLayer.getOption(Common.MapLayerOptionName.EnableFeatInfo);
        if (option?.value === 'true') {
            const option = mapLayer.getOption(Common.MapLayerOptionName.FeatInfoFormat);
            if (!option || !option.value) {
                errorToken = this.tokens.errorNoFeatInfoFormatSelected;
            }
        }
        return(errorToken);
    }

    validateWMTS(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        if (mapLayer.format === this.LayerFormat.WMTS || 
            mapLayer.format === this.LayerFormat.HxCPWMTS) {
            errorToken = this.validateSubdomains(mapLayer);
            if (!errorToken) {
                errorToken = this.validateWMTSLayer(mapLayer);
            }
            if (!errorToken) {
                errorToken = this.validateImageFormat(mapLayer);
            }
            if (!errorToken) {
                errorToken = this.validateWMTSTileMatrixSet(mapLayer);
            }
        }

        return (errorToken);
    }

    validateWMTSLayer(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        const opt = mapLayer.getOption('wmtsLayerId');
        if (!opt || !opt.value) {
            errorToken = this.tokens.errorNoWMTSLayersSelected;
        }

        return(errorToken);
    }

    validateWMTSTileMatrixSet(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        const option = mapLayer.getOption('tileMatrixSetId');
        if (!option || !option.value) {
            errorToken = this.tokens.errorNoWMTSTileMatrixSetSelected;
        }
        return(errorToken);
    }

    validateTile(mapLayer: Common.MapLayer$v1): string {
        let errorToken;
        if (mapLayer.format === this.LayerFormat.Tile) {
            errorToken = this.validateSubdomains(mapLayer);
            if (!errorToken) {
                const tileSizeOpt = mapLayer.getOption('tileSize');
                if (tileSizeOpt) {
                    errorToken = this.validateTileSize(tileSizeOpt.value);
                }
            }
        }

        return (errorToken);
    }

    validateHxDRWMS(mapLayer: Common.MapLayer$v1) {
        let errorToken;
        if (mapLayer.format === this.LayerFormat.HxDRWMS) {
            const option = mapLayer.getOption('hxdrLayerId');
            if (!option || !option.value) {
                errorToken = this.tokens.errorNoHxDRLayerSelected;
            }
            if (!errorToken) {
                errorToken = this.validateCRS(mapLayer);
                if (!errorToken) {
                    errorToken = this.validateImageFormat(mapLayer);
                    if (!errorToken) {
                        errorToken = this.validateFeatInfoFormat(mapLayer);
                    }
                }
            }
        }
        return(errorToken);
    }

    isLayerNameUnique(mapLayer: Common.MapLayer$v1): boolean {
        const opt = mapLayer.getOption('workingLayer');
        let origId;
        if (opt) {
            origId = opt.value;
        }
        const result = this.mapLayers.find(layer => layer.name.toLowerCase() === mapLayer.name.toLowerCase() &&
            layer.id !== mapLayer.id && origId !== layer.id);
        return (!result);
    }

    validateCapabilityModuleRef(mapLayer: Common.MapLayer$v1): string {
        if (!mapLayer.capabilityModuleRef) {
            return (this.tokens.errorNoDataLayerSourceSelected);
        }

        return ('');
    }

    validateSubdomainsString(subdomains) {
        let errorToken;
        subdomains = subdomains.trim();
        if (!subdomains) {
            errorToken = this.tokens.errorSubdomains;
        }
        return (errorToken);
    }

    validateSubdomains(mapLayer: Common.MapLayer$v1) {
        let errorToken;
        if (mapLayer?.url?.includes('{s}')) {
            if (!mapLayer.subdomains ||
                mapLayer.subdomains.length === 0 ) {
                    errorToken = this.tokens.errorSubdomains;
            }
        }
        return (errorToken);
    }

    validateTileSize(tileSize) {
        let errorToken = '';
        if (!tileSize)  {
            errorToken = this.tokens.errorTileSize;
        } else {
            const value = parseInt(tileSize, 10);
            if (isNaN(value)) {
                errorToken = this.tokens.errorTileSize;
            }
        }
        return (errorToken);
    }

    async saveChanges(item?: any, showErrors = true, isStillDirty = false): Promise<any> {
        return( new Promise<any>(async (resolve, reject) => {
            let mapPreset: Common.MapPreset$v1;
            let mapLayer: Common.MapLayer$v1;

            if (item) {
                if (item instanceof Common.MapLayer$v1) {
                    mapLayer = item;
                } else if (item instanceof Common.MapPreset$v1) {
                    mapPreset = item;
                }
            } else {
                if (this.selectedMapPreset) {
                    mapPreset = this.selectedMapPreset;
                    mapPreset.mapLayers = [];
                    mapPreset.mapLayers = this.mapPresetBaseMaps.concat(this.mapPresetOverlays.concat(this.mapPresetDataLayers));
                } else {
                    mapLayer = this.selectedMapLayer;
                }
            }
            let status = false;
            if (mapPreset) {
                const errorToken = this.validateMapPreset(mapPreset);
                if (errorToken) {
                    this.localizationSvc.getTranslationAsync(errorToken).then((response: string) => {
                        const error: CommonHttp.BaseErrorResponse = new CommonHttp.BaseErrorResponse();
                        error.errors = [response];
                        if (showErrors) {
                            this.showError(error);
                        }
                        reject(response);
                    });
                    reject(null);
                }

                const presetDto = new Common.MapPresetDtoLeaflet$v1(mapPreset);
                this.encodeMapPreset(presetDto);
                this.mapDataSvc.saveMapPreset(presetDto, this.isNew).toPromise().catch((err) => {
                    if (showErrors) {
                        this.showError(err);
                    }
                    reject(err.errors[0]);
                }).then((savedPresetDto: Common.MapPresetDtoLeaflet$v1) => {
                    if (savedPresetDto != null) {

                        this.decodeMapPreset(savedPresetDto);

                        savedPresetDto = new Common.MapPresetDtoLeaflet$v1(savedPresetDto);

                        if (!isStillDirty) {
                            this.setIsDirty(false);
                        }

                        const savedPreset: Common.MapPreset$v1 = savedPresetDto.createMapPresetFromDto(this.mapLayerDtos);
                        for (const layer of savedPreset.mapLayers) {
                            if (layer.isSystemDefined && this.mapCoreSvc.translatedStrings[layer.name]) {
                                layer.name = this.mapCoreSvc.translatedStrings[layer.name];
                            }
                        }

                        if (this.isNew) {

                            this.mapPresetDtos.push(savedPresetDto);

                            this.mapPresets.push(savedPreset);
                            this.mapPresets = this.mapPresets.sort(this.sortByName);

                            this.savedMapPresets.push(savedPreset.clone());
                            this.savedMapPresets = this.savedMapPresets.sort(this.sortByName);

                            this.mapPresetBaseMaps = null;
                            this.mapPresetOverlays = null;
                            this.mapPresetDataLayers = null;

                            this.changesSaved$.next(savedPreset);
                            this.eventSvc.mapPresetAdded$.next(savedPreset);
                        } else {

                            let index;
                            let temp = this.mapPresetDtos.find((preset, idx) => { index = idx; return(preset.id === savedPresetDto.id); });
                            if (temp) {
                                this.mapPresetDtos[index] = savedPresetDto;
                            }

                            temp = this.mapPresets.find((preset, idx) => { index = idx; return(preset.id === savedPreset.id); });
                            if (temp) {
                                this.mapPresets[index] = savedPreset;
                                this.mapPresets = this.mapPresets.sort(this.sortByName);
                                this.savedMapPresets[index] = savedPreset.clone();
                              //  this.setSelectedMapPreset(savedPreset);
                            }
                            this.mapPresetBaseMaps = null;
                            this.mapPresetOverlays = null;
                            this.mapPresetDataLayers = null;

                            this.changesSaved$.next(savedPreset);
                            this.eventSvc.mapPresetUpdated$.next(savedPreset);
                        }
                        resolve(savedPreset);
                    } else {
                        reject(null);
                    }
                });
            } else if (mapLayer) {
                const opt = mapLayer.getOption('workingLayer');
                let workingLayer = false;
                if (opt) {
                    workingLayer = true;
                }
                const layerDto = new Common.MapLayerDtoLeaflet$v1(mapLayer);
                this.encodeMapLayer(layerDto);
                await this.mapDataSvc.saveLayerPreset(layerDto, this.isNew).toPromise().catch((err) => {
                    if (showErrors) {
                        this.showError(err);
                    }
                    console.log('Error saving map layer: ' + err.errors && err.errors.length > 0 ? err.errors[0] : '');
                    reject(err.errors[0]);
                }).then((savedLayerDto: Common.MapLayerDtoLeaflet$v1) => {

                    if (savedLayerDto != null) {
                        savedLayerDto = new Common.MapLayerDtoLeaflet$v1(savedLayerDto);
                        status = true;
                        this.decodeMapLayer(savedLayerDto);

                        if (!isStillDirty) {
                            this.setIsDirty(false);
                        }

                        const savedLayer = savedLayerDto.createMapLayerFromDto(null);
                        let index;
                        if (!workingLayer) {
                            if (this.isNew) {
                                this.mapLayerDtos.push(savedLayerDto);

                                this.mapLayers.push(savedLayer);
                                this.mapLayers = this.mapLayers.sort(this.sortByName);
                                this.savedMapLayers.push(savedLayer.clone());
                                this.savedMapLayers = this.savedMapLayers.sort(this.sortByName);

                                this.mapLayersBaseMaps = null;
                                this.mapLayersDataLayers = null;
                                this.mapLayersOverlays = null;

                                this.changesSaved$.next(savedLayer);
                                this.eventSvc.mapLayerAdded$.next(savedLayer);
                            } else {
                                let temp = this.mapLayerDtos.find((layer, idx) => {
                                    index = idx;
                                    return(layer.id === savedLayerDto.id);
                                });

                                if (temp) {
                                    this.mapLayerDtos[index] = savedLayerDto;
                                } else {
                                    this.mapLayerDtos.push(savedLayerDto);
                                }

                                temp = this.mapLayers.find((layer, idx) => {
                                    index = idx;
                                    return(layer.id === savedLayer.id);
                                });

                                if (temp) {
                                    this.mapLayers[index] = savedLayer;
                                    this.savedMapLayers[index] = savedLayer.clone();
                                } else {
                                    this.mapLayers.push(savedLayer);
                                    this.savedMapLayers.push(savedLayer.clone());

                                }

                                this.mapLayers = this.mapLayers.sort(this.sortByName);
                                this.savedMapLayers = this.savedMapLayers.sort(this.sortByName);

                                this.mapLayersBaseMaps = null;
                                this.mapLayersDataLayers = null;
                                this.mapLayersOverlays = null;

                                this.changesSaved$.next(savedLayer);
                                this.eventSvc.mapLayerUpdated$.next(savedLayer);

                                // Update any mapPresets that have included this map layer
                                for (const ii of Object.keys(this.mapPresets)) {
                                    const preset = this.mapPresets[ii];
                                    const presetLayer: Common.MapLayer$v1 = preset.mapLayers.find((layer, idx) => {
                                        index = idx;
                                        return(layer.id === savedLayerDto.id);
                                    });

                                    if (presetLayer) {
                                        preset.mapLayers[index] = new Common.MapLayer$v1(savedLayer);
                                        this.savedMapPresets[ii].mapLayers[index] = new Common.MapLayer$v1(savedLayer);
                                        this.eventSvc.mapPresetUpdated$.next(preset);
                                    }
                                }
                            }
                        }
                        resolve(savedLayer);
                    } else {
                        reject(null);
                    }
                });
            }
        }));
    }

    async discardChanges() {
        let returnItem = null;
        let index;

        this.setMapLayerValid(true);
        this.setMapPresetValid(true);

        if (this.selectedMapPreset != null) {
            const mapPreset = this.savedMapPresets.find((preset, idx) => {
                index = idx;
                return(preset.id === this.selectedMapPreset.id);
            });

            if (mapPreset) {
                this.mapPresets[index] = mapPreset.clone();
                this.selectedMapPreset = this.mapPresets[index];
            }

            returnItem = this.selectedMapPreset;

        } else if (this.selectedMapLayer != null) {
            const mapLayer = this.savedMapLayers.find((layer, idx) => {
                index = idx;
                return(layer.id === this.selectedMapLayer.id);
            });

            if (mapLayer) {
                this.mapLayers[index] = mapLayer.clone();
                this.selectedMapLayer = this.mapLayers[index];
            }
            returnItem = this.selectedMapLayer;
        }

        this.changesDiscarded$.next(returnItem);
        this.setIsDirty(false);
    }

    showError(err: CommonHttp.BaseErrorResponse): void {
        const statusCode = (err.statusCode) ? err.statusCode.toString() : null;
        this.errorNotification.open(err.errors[0], statusCode, {
            duration: 8000
        });


    }

    async cloneMapLayer(mapLayer: Common.MapLayer$v1, showErrors = true): Promise<any> {
        return( new Promise<any>(async (resolve, reject) => {
            if (mapLayer) {
                const opt = mapLayer.getOption('workingLayer');
                let workingLayer = false;
                if (opt) {
                    workingLayer = true;
                }
                const layerDto = new Common.MapLayerDtoLeaflet$v1(mapLayer);
                this.encodeMapLayer(layerDto);
                await this.mapDataSvc.cloneLayerPreset(layerDto).toPromise().catch((err) => {
                    if (showErrors) {
                        this.showError(err);
                    }
                    console.log('Error cloning map layer: ' + err.errors && err.errors.length > 0 ? err.errors[0] : '');
                    reject(err.errors[0]);
                }).then((clonedLayerDto: Common.MapLayerDtoLeaflet$v1) => {

                    if (clonedLayerDto != null) {
                        clonedLayerDto = new Common.MapLayerDtoLeaflet$v1(clonedLayerDto);
                        this.decodeMapLayer(clonedLayerDto);

                        const clonedLayer = clonedLayerDto.createMapLayerFromDto(null);
                        if (!workingLayer) {
                            this.mapLayerDtos.push(clonedLayerDto);

                            this.mapLayers.push(clonedLayer);
                            this.mapLayers = this.mapLayers.sort(this.sortByName);
                            this.savedMapLayers.push(clonedLayer.clone());
                            this.savedMapLayers = this.savedMapLayers.sort(this.sortByName);

                            this.mapLayersBaseMaps = null;
                            this.mapLayersDataLayers = null;
                            this.mapLayersOverlays = null;

                            // this.setSelectedMapLayer(clonedLayer);
                            this.mapLayerCloned$.next(clonedLayer);
                            this.eventSvc.mapLayerAdded$.next(clonedLayer);
                        }
                        resolve(clonedLayer);
                    } else {
                        reject(null);
                    }
                });
            }
        }));
    }

    async deleteMapLayer(mapLayer: Common.MapLayer$v1, showErrors = true) {

        let status = false;
        this.isDeleting = true;

        const opt = mapLayer.getOption('workingLayer');
        let workingLayer = false;
        if (opt) {
            workingLayer = true;
        }

        const layerDto = new Common.MapLayerDtoLeaflet$v1(mapLayer);

        await this.mapDataSvc.deleteLayerPreset(layerDto).toPromise().catch((err) => {
            this.isDeleting = false;
            if (showErrors) {
                this.showError(err);
            }
            status = false;
            console.log('Error deleting map layer: ' + err.errors && err.errors.length > 0 ? err.errors[0] : '');
            return;
        }).then(() => {
            if (!workingLayer) {
                if (this.selectedMapLayer?.id === mapLayer.id) {
                    this.setSelectedMapLayer(null);
                }
                let index;
                let temp = this.mapLayerDtos.find((layer, idx) => {
                    index = idx;
                    return(layer.id === mapLayer.id);
                });

                if (temp) {
                    this.mapLayerDtos.splice(index, 1);
                }

                temp = this.mapLayers.find((layer, idx) => {
                    index = idx;
                    return(layer.id === mapLayer.id);
                });

                if (temp) {
                    this.mapLayers.splice(index, 1);
                    this.savedMapLayers.splice(index, 1);
                }
                this.invalidatePresetsWithDeletedLayer(mapLayer.id);

                this.mapLayersBaseMaps = null;
                this.mapLayersDataLayers = null;
                this.mapLayersOverlays = null;

                this.mapLayerDeleted$.next(mapLayer);
            }
            status = true;
            this.isDeleting = false;
        });

        return (status);

    }

    async deleteMapPreset(mapPreset: Common.MapPreset$v1) {

        let status = false;
        this.isDeleting = true;
        await this.mapDataSvc.deleteMapPreset(mapPreset).toPromise().catch((err) => {
            this.isDeleting = false;
            this.showError(err);
            status = false;
            return;
        }).then(() => {
            status = true;
            this.isDeleting = false;
            if (this.selectedMapPreset?.id === mapPreset.id) {
                this.setSelectedMapPreset(null);
            }

            let index;
            let temp = this.mapPresetDtos.find ((preset, idx) => {
                index = idx;
                return(preset.id === mapPreset.id);
            });

            if (temp) {
                this.mapPresetDtos.splice(index, 1);
            }

            temp = this.mapPresets.find ((preset, idx) => {
                index = idx;
                return(preset.id === mapPreset.id);
            });
            this.mapPresets.splice(index, 1);
            this.savedMapPresets.splice(index, 1);

            this.mapPresetBaseMaps = null;
            this.mapPresetOverlays = null;
            this.mapPresetDataLayers = null;

            this.eventSvc.mapPresetDeleted$.next(mapPreset);
        });

        return (status);

    }

    invalidatePresetsWithDeletedLayer(layerId) {
        for (const preset of this.mapPresets) {
            const result = preset.mapLayers.find((presetLayer) => presetLayer.id === layerId);
            if (result) {
                preset.valid = false;
            }
        }
    }

    encodeMapPreset(mapPreset: any) {
        mapPreset.name = encodeURIComponent(mapPreset.name);
    }

    decodeMapPreset(mapPreset: any) {
        mapPreset.name = decodeURIComponent(mapPreset.name);
    }

    encodeMapLayer(mapLayer) {
        mapLayer.url = encodeURIComponent(mapLayer.url);
        mapLayer.name = encodeURIComponent(mapLayer.name);
        if (mapLayer.capabilityModuleRef) {
            mapLayer.capabilityModuleRef = encodeURIComponent(mapLayer.capabilityModuleRef);
        }
        if (mapLayer.imageName) {
            mapLayer.name = encodeURIComponent(mapLayer.name);
        }

        for (let jj = 0; jj < mapLayer.options.length; jj++) {
            if (mapLayer.options[jj].type === 'string') {
                mapLayer.options[jj].value = encodeURIComponent(mapLayer.options[jj].value);
            }
        }

        if (mapLayer.wmsLayers) {
            for (let jj = 0; jj < mapLayer.wmsLayers.length; jj++) {
                mapLayer.wmsLayers[jj] = encodeURIComponent(mapLayer.wmsLayers[jj]);
            }
        }
    }

    decodeMapLayer(mapLayer) {
        mapLayer.url = decodeURIComponent(mapLayer.url);
        mapLayer.name = decodeURIComponent(mapLayer.name);
        if (mapLayer.capabilityModuleRef) {
            mapLayer.capabilityModuleRef = decodeURIComponent(mapLayer.capabilityModuleRef);
        }
        if (mapLayer.imageName) {
            mapLayer.name = decodeURIComponent(mapLayer.name);
        }

        for (let jj = 0; jj < mapLayer.options.length; jj++) {
            if (mapLayer.options[jj].type === 'string') {
                mapLayer.options[jj].value = decodeURIComponent(mapLayer.options[jj].value);
            }
        }

        if (mapLayer.wmsLayers) {
            for (let jj = 0; jj < mapLayer.wmsLayers.length; jj++) {
                mapLayer.wmsLayers[jj] = decodeURIComponent(mapLayer.wmsLayers[jj]);
            }
        }
    }

    async getAvailableWMSInfo(mapLayer: Common.MapLayer$v1, fetchData): Promise<any> {
        return(new Promise<any> (async (resolve, reject) => {
            if (this.availWMSInfo === null || fetchData) {
                this.availWMSInfo = null;
                if (mapLayer.url) {
                    try {
                        const xml = await this.mapDataSvc.getWMSCapabilities(mapLayer).toPromise();
                        if (xml) {
                            let doc;
                            if (typeof xml === 'string') {
                                const parser = new DOMParser();
                                doc = parser.parseFromString(xml, 'application/xml');
                            } else {
                                doc = xml;
                            }
                            const wmsCapabilities = this.xmlToJson(doc);
                            if (wmsCapabilities) {
                                this.wmsModel = this.createWMSCapabilitiesModel_1_3_0(wmsCapabilities);
                                if (this.wmsModel && this.wmsModel.Layers) {
                                    this.availWMSInfo = this.getWMSInfo(this.wmsModel);
                                } else {
                                    this.availWMSInfo = null;
                                    reject(null);
                                }
                            } else {
                                this.availWMSInfo = null;
                                reject(null);
                            }
                        } else {
                            this.availWMSInfo = null;
                        }
                    } catch (err) {
                        if (err.errors && err.errors.length > 0) {
                            reject(err.errors[0]);
                        } else if (typeof err === 'string') {
                            reject(err);
                        } else {
                            reject();
                        }
                    }
                }
            }

            resolve(this.availWMSInfo);
        }));
    }

    async getAvailableWMSInfoForHxDR(mapLayer: Common.MapLayer$v1, version: string): Promise<any> {
        return(new Promise<any> (async (resolve, reject) => {
            let wmsInfo: any = {};
            if (mapLayer.url != null) {
                try {
                    let xml
                    const displayInfo = await this.hxdrSvc.getHxDRWMSDisplayInfoAsync(mapLayer);
                    if (displayInfo) {
                        const url = mapLayer.url + displayInfo.endpoint;
                        xml = await this.mapDataSvc.getWMSCapabilitiesForHxDR(url, version, mapLayer.id).toPromise();
                    }
                    if (xml) {
                        let doc;
                        if (typeof xml === 'string') {
                            const parser = new DOMParser();
                            doc = parser.parseFromString(xml, 'application/xml');
                        } else {
                            doc = xml;
                        }
                        const wmsCapabilities = this.xmlToJson(doc);
                        if (wmsCapabilities !== null) {
                            const wmsModel = this.createWMSCapabilitiesModel_1_3_0(wmsCapabilities);
                            if (wmsModel) {
                                wmsInfo = this.getWMSInfo(wmsModel);
                            } else {
                                reject(null);
                            }
                        } else {
                            reject(null);
                        }
                    } else {
                        reject(null);
                    }
                } catch (err) {
                    if (typeof err === 'string') {
                        reject(err);
                    } else if (err.errors && err.errors.length > 0) {
                        reject(err.errors[0]);
                    }
                }
            }

            resolve(wmsInfo);
        }));
    }

    async getAvailableWFSInfo(mapLayer: Common.MapLayer$v1, fetchData): Promise<any> {
        return(new Promise<any> (async (resolve, reject) => {
            if (this.availWFSInfo === null || fetchData) {
                this.availWFSInfo = null;
                if (mapLayer.url) {
                    try {
                        const xml = await this.mapDataSvc.getWFSCapabilities(mapLayer).toPromise();
                        if (xml) {
                            let doc;
                            if (typeof xml === 'string') {
                                const parser = new DOMParser();
                                doc = parser.parseFromString(xml, 'application/xml');
                            } else {
                                doc = xml;
                            }
                            const wfsCapsDef = this.xmlToJson(doc);
                            if (wfsCapsDef) {
                                this.wfsCapabilities = this.createWFSCapabilitiesModel_2_0_0(wfsCapsDef);
                                if (this.wfsCapabilities && this.wfsCapabilities.featTypes) {
                                    this.availWFSInfo = this.getWFSInfo(this.wfsCapabilities);
                                } else {
                                    this.availWFSInfo = null;
                                    reject(null);
                                }
                            } else {
                                this.availWFSInfo = null;
                                reject(null);
                            }
                        } else {
                            this.availWFSInfo = null;
                        }
                    } catch (err) {
                        if (err.errors && err.errors.length > 0) {
                            reject(err.errors[0]);
                        } else if (typeof err === 'string') {
                            reject(err);
                        } else {
                            reject();
                        }
                    }
                }
            }

            resolve(this.availWFSInfo);
        }));
    }

    getWFSInfo(wfsCaps: Common.WFSCapabilities): Common.WFSInfo {
        const wfsFeatTypes: any = [];
        const crsList: any = {};
        const wfsInfo = new Common.WFSInfo();
        if (wfsCaps.featTypes?.length > 0) {
            for (const featType of wfsCaps.featTypes) {
                const wfsFeatTypeTree = this.getWFSFeatTypesTree(featType, wfsFeatTypes, crsList);
                if (wfsFeatTypeTree) {
                    wfsInfo.featTypesTree.push(wfsFeatTypeTree);
                    wfsInfo.featTypes.push(featType);
                }
            }
            wfsInfo.outputFormats = this.getWFSOutputFormats(wfsCaps);
            wfsInfo.version = '2.0.0';
        }

        return (wfsInfo);
    }

    getWFSFeatTypesTree(featType: Common.WFSFeatureType, wfsFeatTypes: any, crsList: any) {

        const treeNode: Common.TreeNode = new Common.TreeNode({
            item: new Common.TreeNodeItem ({
                id: featType.name,
                label: featType.title && featType.title !== '' ? featType.title : featType.name,
                data: featType
            }),
            selectable: true
        });

        wfsFeatTypes.push({
            label: treeNode.item.label,
            value: featType.name
        });

        if (featType.defaultReference) {
            const crs = this.getCRSFromURN(featType.defaultReference);
            if (this.isValidReferenceId(crs)) {
               crsList[crs] = crs;
            }
        }

        treeNode.leaf = true;

        return(treeNode);
    }

    getWFSOutputFormats(wfsCaps: Common.WFSCapabilities): string[] {
        const wfsOutputFormats: string[] = [];
        if (wfsCaps.operations?.length > 0) {
            const getFeatOp = wfsCaps.operations.find((op) => op.name === 'GetFeature');
            if (getFeatOp) {
                const formats = getFeatOp.supportedFormats;
                for (const format of formats) {
                    if (this.isOutputFormatSupported(format)) {
                        wfsOutputFormats.push(format);
                    }
                }
                wfsOutputFormats.sort(this.sortCaseInsensitive);
    
            }
        }
        return (wfsOutputFormats);
    }

    getWFSVersion(wfsModel): string {
        let wfsVersion = '2.0.0';
        if (wfsModel?.Version) {
            wfsVersion = wfsModel.Version;
        }
        return (wfsVersion);
    }

    async getWFSFeatureProperties(mapLayer: Common.MapLayer$v1, featType): Promise<any> {
        return(new Promise<any> (async (resolve, reject) => {
            if (mapLayer.url) {
                try {
                    let featProps: string[] = [];
                    const xml = await this.mapDataSvc.getWFSDescribeFeatureType(mapLayer, featType).toPromise();
                    if (xml) {
                        let doc;
                        if (typeof xml === 'string') {
                            const parser = new DOMParser();
                            doc = parser.parseFromString(xml, 'application/xml');
                        } else {
                            doc = xml;
                        }
                        const wfsDesFeatTypes = this.xmlToJson(doc);
                        if (wfsDesFeatTypes) {
                            this.wfsCapabilities = this.createWFSCapabilitiesModel_2_0_0(wfsDesFeatTypes);
                            if (this.wfsCapabilities && this.wfsCapabilities.featTypes) {
                                this.availWFSInfo = this.getWFSInfo(this.wfsCapabilities);
                            } else {
                                this.availWFSInfo = null;
                                reject(null);
                            }
                        } else {
                            this.availWFSInfo = null;
                            reject(null);
                        }
                    } else {
                        this.availWFSInfo = null;
                    }
                } catch (err) {
                    if (err.errors && err.errors.length > 0) {
                        reject(err.errors[0]);
                    } else if (typeof err === 'string') {
                        reject(err);
                    } else {
                        reject();
                    }
                }
            }

            resolve(this.availWFSInfo);
        }));
    }

    getCRSFromURN(urnDef) {
        return (this.mapCoreSvc.getCRSFromURN(urnDef));
    }

    // Changes XML to JSON
    xmlToJson(xml) {
        return (this.mapCoreSvc.xmlToJson(xml));
    }

    createWMSCapabilitiesModel_1_3_0(jsonObj: any): any {
        // convert the string into a xml doc object
        const wmsCapabilities: any = {};
        let crsToken: string;
        let layerInfo: any;
        let capObj: any;

        if (typeof jsonObj.WMS_Capabilities !== 'undefined') {
            capObj = jsonObj.WMS_Capabilities;
        } else if (typeof jsonObj.WMT_MS_Capabilities !== 'undefined') {
            capObj = jsonObj.WMT_MS_Capabilities;
        }
        if (capObj) {
            if (typeof capObj['version'] !== 'undefined') {
                wmsCapabilities.Version = capObj['version'];
                if (wmsCapabilities.Version === '1.3.0') {
                    crsToken = 'CRS';
                } else if (wmsCapabilities['Version'] === '1.1.1') {
                    crsToken = 'SRS';
                }
            }

            if (typeof capObj.Capability !== 'undefined') {
                if (capObj.Capability.Request !== 'undefined') {
                    if (capObj.Capability.Request.GetMap !== 'undefined') {
                        if (capObj.Capability.Request.GetMap.Format !== 'undefined') {
                            let formats = capObj.Capability.Request.GetMap.Format;
                            if (!this.isArray(formats)) {
                                const tempDef = formats;
                                formats = [];
                                formats.push(tempDef);
                            }
                            wmsCapabilities.Formats = [];
                            for (const formatDef of formats) {
                                wmsCapabilities.Formats.push(formatDef);
                            }
                        }
                    }
                    if (capObj.Capability.Request.GetFeatureInfo !== 'undefined') {
                        if (capObj.Capability.Request.GetFeatureInfo.Format !== 'undefined') {
                            let infoFormats = capObj.Capability.Request.GetFeatureInfo.Format;
                            if (!this.isArray(infoFormats)) {
                                const tempDef = infoFormats;
                                infoFormats = [];
                                infoFormats.push(tempDef);
                            }
                            wmsCapabilities.InfoFormats = [];
                            for (const infoFormatDef of infoFormats) {
                                wmsCapabilities.InfoFormats.push(infoFormatDef);
                            }
                        }
                    }
                }

                if (typeof capObj.Capability.Layer !== 'undefined') {
                    wmsCapabilities.Layers = [];
                    if (!this.isArray(capObj.Capability.Layer)) {
                        const tempDef = capObj.Capability.Layer;
                        capObj.Capability.Layer = [];
                        capObj.Capability.Layer.push(tempDef);
                    }

                    for (const layerDef of capObj.Capability.Layer) {
                        layerInfo = this.parseCapabilityLayer(layerDef, crsToken);
                        if (layerInfo) {
                            wmsCapabilities.Layers.push(layerInfo);
                        }
                    }
                }
            }
            // Return the corrected json object
        }
        return wmsCapabilities;
    }

    parseCapabilityLayer(capLayerDef, crsToken: string): any {
        let layerInfo: any;
        let capLayerDefs = [];

        if (!this.isArray(capLayerDef)) {
            capLayerDefs.push(capLayerDef);
        } else {
            capLayerDefs = capLayerDef;
        }

        for (const layerDef of capLayerDefs) {
            layerInfo = {};
            if (typeof layerDef.Title !== 'undefined') {
                layerInfo.Title = this.getXMLTextValue(layerDef.Title);
            }

            if (typeof layerDef.Name !== 'undefined') {
                layerInfo.Name = layerDef.Name;
                layerInfo.Displayable = true;
            } else {
                layerInfo.Displayable = false;
            }

            if (typeof layerDef.queryable !== 'undefined' && layerDef.queryable === '1') {
                layerInfo.Queryable = true;
            } else {
                layerInfo.Queryable = false;
            }

            if (typeof layerDef.Abstract !== 'undefined') {
                layerInfo.Abstract = this.getXMLTextValue(layerDef.Abstract);
            }
            if (typeof layerDef.EX_GeographicBoundingBox !== 'undefined') {
                const exBBox: any = {};
                exBBox.WestBoundLongitude = layerDef.EX_GeographicBoundingBox.westBoundLongitude;
                exBBox.EastBoundLongitude = layerDef.EX_GeographicBoundingBox.eastBoundLongitude;
                exBBox.SouthBoundLatitude = layerDef.EX_GeographicBoundingBox.southBoundLatitude;
                exBBox.NorthBoundLatitude = layerDef.EX_GeographicBoundingBox.northBoundLatitude;
                layerInfo.EX_GeographicBoundingBox = exBBox;
            }

            if (typeof layerDef.BoundingBox !== 'undefined') {
                if (!this.isArray(layerDef.BoundingBox)) {
                    const tempDef = layerDef.BoundingBox;
                    layerDef.BoundingBox = [];
                    layerDef.BoundingBox.push(tempDef);
                }
                layerInfo.BoundingBox = [];
                for (const bboxDef of layerDef.BoundingBox) {
                    const bbox: any = {};
                    if (typeof bboxDef[crsToken] !== 'undefined') {
                        bbox[crsToken] = bboxDef[crsToken];
                        bbox.MinX = bboxDef['minx'];
                        bbox.MinY = bboxDef['miny'];
                        bbox.MaxX = bboxDef['maxx'];
                        bbox.MaxY = bboxDef['maxy'];
                    }
                    layerInfo.BoundingBox.push(bbox);

                }
            } else if (typeof layerDef.LatLonBoundingBox !== 'undefined') {
                if (!this.isArray(layerDef.LatLonBoundingBox)) {
                    const tempDef = layerDef.LatLonBoundingBox;
                    layerDef.LatLonBoundingBox = [];
                    layerDef.LatLonBoundingBox.push(tempDef);
                }
                layerInfo.BoundingBox = [];
                for (const bboxDef of layerDef.LatLonBoundingBox) {
                    const bbox: any = {};
                    bbox[crsToken] = 'EPSG:4366';
                    bbox.MinX = bboxDef['minx'];
                    bbox.MinY = bboxDef['miny'];
                    bbox.MaxX = bboxDef['maxx'];
                    bbox.MaxY = bboxDef['maxy'];
                    layerInfo.BoundingBox.push(bbox);

                }
            }

            if (typeof layerDef[crsToken] !== 'undefined') {
                if (!this.isArray(layerDef[crsToken])) {
                    const tempDef = layerDef[crsToken];
                    layerDef[crsToken] = [];
                    layerDef[crsToken].push(tempDef);
                }
                layerInfo.CRS = [];
                for (const crsDef of layerDef[crsToken]) {
                    layerInfo.CRS.push(crsDef);
                }
            }

            if (typeof layerDef.Layer !== 'undefined') {
                if (!this.isArray(layerDef.Layer)) {
                    const tempDef = layerDef.Layer;
                    layerDef.Layer = [];
                    layerDef.Layer.push(tempDef);
                }

                layerInfo.Layers = [];

                for (const subLayerDef of layerDef.Layer) {

                    const subLayerInfo = this.parseCapabilityLayer(subLayerDef, crsToken);
                    if (subLayerInfo) {
                        layerInfo.Layers.push(subLayerInfo);
                    }
                }
            }
        }

        return(layerInfo);
    }

    getXMLTextValue(text: any) {
        return (this.mapCoreSvc.getXMLTextValue(text));
    }

    isArray(obj: any) {
        return (this.mapCoreSvc.isArray(obj));
    }

    createWFSCapabilitiesModel_2_0_0(jsonObj: any): any {
        // convert the string into a xml doc object
        const wfsCapabilities = new Common.WFSCapabilities();
        let crsToken: string;
        let layerInfo: any;
        let capObj: any;
        let outputFormats; 

        if (typeof jsonObj['wfs:WFS_Capabilities'] !== 'undefined') {
            capObj = jsonObj['wfs:WFS_Capabilities'];
        }
        if (capObj) {
            if (typeof capObj['version'] !== 'undefined') {
                wfsCapabilities.version = capObj['version'];
            }
            const opMeta = this.getObjectProperty(capObj, 'ows','OperationsMetadata');
            if (opMeta) {
                const operations = this.getObjectAsArray(opMeta, 'ows', 'Operation');
                if (operations) {
                    wfsCapabilities.operations = [];
                    for (const operation of operations) {
                        if (operation.name === 'GetFeature') {
                            const op = new Common.WFSOperation();
                            op.name = operation.name;
                            wfsCapabilities.operations.push(op);
                            const params = this.getObjectAsArray(operation, 'ows', 'Parameter');
                            if (params) {
                                const ofDef = params.find((param) => param.name === 'outputFormat');
                                if (ofDef) {
                                    const allowedValues = this.getObjectProperty(ofDef, 'ows', 'AllowedValues');
                                    if (allowedValues) {
                                        const values = this.getObjectAsArray(allowedValues, 'ows', 'Value');
                                        if (values) {
                                            op.supportedFormats = values;
                                        }
                                    }
                                }
                            }
                            break;
                        }
                    }
                }

                const featTypeList = this.getObjectProperty(capObj, 'wfs', 'FeatureTypeList');
                if (featTypeList) {
                    wfsCapabilities.featTypes = [];
                    const featTypes = this.getObjectAsArray(featTypeList, 'wfs', 'FeatureType');
                    if (featTypes) {
                        for (const featType of featTypes) {
                            const wfsFeatType = new Common.WFSFeatureType();
                            wfsFeatType.name = this.getObjectProperty(featType, 'wfs', 'Name');
                            wfsFeatType.title = this.getObjectProperty(featType, 'wfs', 'Title');
                            if (!wfsFeatType.title) {
                                wfsFeatType.title = wfsFeatType.name;
                            }
                            wfsFeatType.defaultReference = this.getObjectProperty(featType, 'wfs', 'DefaultCRS');
                            wfsFeatType.outputFormats = wfsCapabilities.operations[0].supportedFormats;
                            wfsCapabilities.featTypes.push(wfsFeatType);
                        }
                    }
                }
            }
            // Return the corrected json object
        }
        return wfsCapabilities;
    }
    getWFSDescribeFeatureProps(jsonObj: any): any {
        // convert the string into a xml doc object
        const props: string[] = [];

        // if (typeof jsonObj['wfs:WFS_Capabilities'] !== 'undefined') {
        //     capObj = jsonObj['wfs:WFS_Capabilities'];
        // }
        // if (capObj) {
        //     if (typeof capObj['version'] !== 'undefined') {
        //         wfsCapabilities.version = capObj['version'];
        //     }
        //     const opMeta = this.getObjectProperty(capObj, 'ows','OperationsMetadata');
        //     if (opMeta) {
        //         const operations = this.getObjectAsArray(opMeta, 'ows', 'Operation');
        //         if (operations) {
        //             wfsCapabilities.operations = [];
        //             for (const operation of operations) {
        //                 if (operation.name === 'GetFeature') {
        //                     const op = new Common.WFSOperation();
        //                     op.name = operation.name;
        //                     wfsCapabilities.operations.push(op);
        //                     const params = this.getObjectAsArray(operation, 'ows', 'Parameter');
        //                     if (params) {
        //                         const ofDef = params.find((param) => param.name === 'outputFormat');
        //                         if (ofDef) {
        //                             const allowedValues = this.getObjectProperty(ofDef, 'ows', 'AllowedValues');
        //                             if (allowedValues) {
        //                                 const values = this.getObjectAsArray(allowedValues, 'ows', 'Value');
        //                                 if (values) {
        //                                     op.supportedFormats = values;
        //                                 }
        //                             }
        //                         }
        //                     }
        //                     break;
        //                 }
        //             }
        //         }

        //         const featTypeList = this.getObjectProperty(capObj, 'wfs', 'FeatureTypeList');
        //         if (featTypeList) {
        //             wfsCapabilities.featTypes = [];
        //             const featTypes = this.getObjectAsArray(featTypeList, 'wfs', 'FeatureType');
        //             if (featTypes) {
        //                 for (const featType of featTypes) {
        //                     const wfsFeatType = new Common.WFSFeatureType();
        //                     wfsFeatType.name = this.getObjectProperty(featType, 'wfs', 'Name');
        //                     wfsFeatType.title = this.getObjectProperty(featType, 'wfs', 'Title');
        //                     if (!wfsFeatType.title) {
        //                         wfsFeatType.title = wfsFeatType.name;
        //                     }
        //                     wfsFeatType.defaultReference = this.getObjectProperty(featType, 'wfs', 'DefaultCRS');
        //                     wfsFeatType.outputFormats = wfsCapabilities.operations[0].supportedFormats;
        //                     wfsCapabilities.featTypes.push(wfsFeatType);
        //                 }
        //             }
        //         }
        //     }
        //     // Return the corrected json object
        // }
        return props;
    }

    getWMSInfo(wmsModel: any): any {
        const wmsLayers: any = [];
        const crsList: any = {};
        const wmsInfo: any = {layers: [], crsList: [], layersTree: [], wmsImageFormats: [], featInfoFormats: [],  version: ''};
        if (wmsModel.Layers) {
            for (const wmsLayer of wmsModel.Layers) {
                const wmsLayersTree = this.getWMSLayerInfo(wmsLayer, wmsLayers, crsList);
                if (wmsLayersTree) {
                    wmsInfo.layersTree.push(wmsLayersTree);
                }
            }
            const crs = Object.keys(crsList);
            wmsInfo.layers = wmsLayers;
            wmsInfo.crsList = crs && crs.length > 0 ? crs : [];
            wmsInfo.crsList.sort(this.sortCaseInsensitive);

            wmsInfo.wmsImageFormats = this.getWMSLayerFormats(wmsModel);
            wmsInfo.featInfoFormats = this.getFeatInfoFormats(wmsModel);
            wmsInfo.version = this.getWMSVersion(wmsModel);
        }

        return (wmsInfo);
    }

    getWMSLayerInfo(wmsLayer: any, wmsLayers: any, crsList: any) {

        const wmsLayerTreeNode: Common.TreeNode = new Common.TreeNode({
            item: new Common.TreeNodeItem ({
                id: wmsLayer.Displayable ? wmsLayer.Name : wmsLayer.Title,
                label: wmsLayer.Title && wmsLayer.Title !== '' ? wmsLayer.Title : wmsLayer.Name,
                data: wmsLayer
            }),
            selectable: wmsLayer.Displayable
        });

        if (wmsLayer.Displayable) {
            wmsLayers.push({ label: wmsLayer.Title && wmsLayer.Title !== '' ? wmsLayer.Title : wmsLayer.Name,
            value: wmsLayer.Name, queryable: wmsLayer.Queryable });
        }
        if (wmsLayer.CRS) {
            for (const temp of wmsLayer.CRS) {
                if (this.isValidReferenceId(temp)) {
                    crsList[temp] = temp;
                }
            }
        }
        if (wmsLayer.Layers) {
            for (const subLayer of wmsLayer.Layers) {
                const childTreeNode = this.getWMSLayerInfo(subLayer, wmsLayers, crsList);
                if (childTreeNode) {
                    wmsLayerTreeNode.children.push(childTreeNode);
                }
            }
        }
        if (wmsLayerTreeNode.children?.length == 0) {
            wmsLayerTreeNode.leaf = true;
        }

        if (wmsLayerTreeNode.children?.length > 0 || wmsLayerTreeNode.selectable) {
            return(wmsLayerTreeNode);
        } else {
            return(null);
        }
    }

    getWMSLayerFormats(wmsModel): string[] {
        const wmsFormats: string[] = [];
        if (wmsModel?.Formats) {
            for (const format of wmsModel.Formats) {
                if (this.isImageFormatSupported(format)) {
                    wmsFormats.push(format);
                }
            }
        }
        wmsFormats.sort(this.sortCaseInsensitive);
        return (wmsFormats);
    }

    getFeatInfoFormats(wmsModel): string[] {
        const infoFormats: string[] = [];
        if (wmsModel?.InfoFormats) {
            for (const infoFormat of wmsModel.InfoFormats) {
                if (this.isFeatInfoFormatSupported(infoFormat)) {
                    infoFormats.push(infoFormat);
                }
            }
        }
        infoFormats.sort(this.sortCaseInsensitive);
        return (infoFormats);
    }

    getWMSVersion(wmsModel): string {
        let wmsVersion = '1.3.0';
        if (wmsModel?.Version) {
            wmsVersion = wmsModel.Version;
        }
        return (wmsVersion);
    }

    async getAvailableWMTSInfo(mapLayer: Common.MapLayer$v1, fetchData): Promise<WMTSInfo> {
        return(this.mapCoreSvc.getAvailableWMTSInfo(mapLayer));
    }

    findLayerInLayerInfo(mapLayer, layerInfo) {
        return(this.hxdrSvc.findLayerFromLayerInfo(mapLayer, layerInfo));
    }

    async getAvailableHxDRWMSLayers(mapLayer, fetchData): Promise<any> {
        return(new Promise<any> (async (resolve, reject) => {
            if (!this.availHxDRWMSLayerInfo || fetchData) {
                this.availHxDRWMSLayerInfo = new Common.HxDRLayerInfo();
                try {
                    await this.hxdrSvc.getAllHxDRWMSLayersAsync(mapLayer, fetchData).catch((reason) => {
                        console.log('Error getting HxDR layer info from HxdrService');
                        reject(reason);
                    }).then((hxdrLayerInfo) => {
                        if (hxdrLayerInfo) {
                            this.availHxDRWMSLayerInfo = hxdrLayerInfo;
                        }
                        resolve(this.availHxDRWMSLayerInfo);
                    });
                } catch (err) {
                    reject(err);
                }
            } else {
                resolve(this.availHxDRWMSLayerInfo);
            }
        }));
    }

    getObjectProperty(obj: any, namespace: string,  property: string) {
        let prop: any;
        if (typeof obj[property] !== 'undefined') {
            prop = obj[property];
        } else if (typeof obj[`${namespace}:${property}`] !== 'undefined') {
            prop = obj[`${namespace}:${property}`];
        }
        return(prop);
    }
    getObjectAsArray(obj: any, namespace: string,  property: string) {
        let props: any;
        if (typeof obj[property] !== 'undefined') {
            props = obj[property];
        } else if (typeof obj[`${namespace}:${property}`] !== 'undefined') {
            props = obj[`${namespace}:${property}`];
        }
        if (props) {
            if (!this.isArray(props)) {
                const tempDef = props;
                props = [];
                props.push(tempDef);
           }
        }
        return(props);
    }
    isValidReferenceId(ref: string) {
        return(this.mapCoreSvc.isValidReferenceId(ref));
    }

    showWMSError(err: CommonHttp.BaseErrorResponse): void {
        const statusCode = (err.statusCode) ? err.statusCode.toString() : null;
        this.errorNotification.open(err.errors[0], statusCode, {
            duration: 8000
        });
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalization(): Promise<void> {
        return new Promise<void> ((resolve) => {
            this.mapCoreSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
                this.transStrings = response;
                if (this.contextMenuItems?.length > 0) {
                    const menuItem = this.contextMenuItems.find((item) => item.index === 99);
                    if (menuItem) {
                        menuItem.text = this.transStrings[this.tokens.layerPropsCmdMenuItemLabel];
                    }
                }
                this.translationFinished = true;
                resolve();
            });
    
        });
    }
}
