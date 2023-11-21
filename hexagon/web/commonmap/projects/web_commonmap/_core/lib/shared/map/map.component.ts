import {
    Component, OnInit, Input, Inject, OnDestroy,
    ViewChild, ChangeDetectorRef, NgZone, AfterViewInit
} from '@angular/core';
import * as LayoutCompiler from '@galileo/web_commonlayoutmanager/adapter';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import '@galileo/leaflet-contextmenu';
import '@galileo/leaflet-draw';
import * as turf from '@turf/turf';
import { takeUntil, debounceTime, filter, map, first, debounce } from 'rxjs/operators';
import { Subject, BehaviorSubject, fromEvent, Observable, interval, Subscription, timer } from 'rxjs';
import {
    MapviewOverrides,
    MarkerInfo,
    MarkerType,
    LayerPanelNotification,
    LayerGroupInfo,
    LayerCollectionInfo,
    LayerPropsCmdLayerInfo,
    GeometryInfo,
    ContextMenuItem
} from '../../abstractions/core.models';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapCoreService$v1 } from '../../commonmap-core.service';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { LayerPanelComponent } from '../layer-panel/layer-panel.component';
import { Guid } from '@galileo/web_common-libraries';

import { MapTranslationTokens } from './map.translation';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { LeafletDrawService } from './leaflet-draw.service';
import { MapLayerSelectionService$v1 } from './map-layer-selection.service';
import { GeoSpatialService$v1 } from './geospatial.service';
import { GeometryType$v1 } from '@galileo/web_commonmap/_common';

const DYNAMICS_LAYER_ID = 'dynamics';
const DYNAMICS_GEOM_LAYER_ID = 'dynamicsGeom'
const DYNAMICS_MASK_LAYER_ID = 'dynamicsMask';
const DRAW_LAYER_ID = 'draw';
const DRAW_GEOM_LAYER_ID = 'drawGeom';
const DRAW_MARKERS_LAYER_ID = 'drawMarkers';
const DRAW_MASK_LAYER_ID = 'drawMask';
const DRAW_POPUP_LAYER_ID = 'drawPopup';

@Component({
    selector: 'hxgn-commonmap-map-v1',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class MapComponent$v1 implements OnInit, OnDestroy, AfterViewInit, Common.MapInterface$v1, Common.DrawInterface$v1 {

    @ViewChild('layerPanel') layerPanel: LayerPanelComponent;
    @ViewChild('mapDiv', { static: true }) mapDiv;

    @Input() mapCreateMessage: Common.MapCreateMessage$v1;

    mapType = 'leaflet';

    /** Expose translation tokens to html. For now all tokens in map.translation.ts are related to shapes. */
    readonly tokens: typeof MapTranslationTokens = MapTranslationTokens;

    preFetchTokensList = [
        this.tokens.setViewToHomeTooltip,
        this.tokens.openDraw,
        this.tokens.baseMapsHeader,
        this.tokens.overlaysHeader,
        this.tokens.dataLayersHeader,
        this.tokens.layerPropsCmdMenuItemLabel,
        this.tokens.layerPropsCmdDisabledTooltip,
        this.tokens.copyCoordsMsg,
        this.tokens.copyCoordsTooltip
    ];

    transStrings = {};

    mapOptions: L.MapOptions;
    mapPreset: Common.MapPreset$v1;
    savedMapPreset: Common.MapPreset$v1;

    settings: Common.MapSettings$v1;

    isPresetOverridden = false;

    mapViewContextId: string;
    personalizationId: string;

    mapviewOverrides: MapviewOverrides;

    map: L.Map;
    mapInfo: any;
    mapId: string;

    mapComm: Common.MapCommunication$v1;
    markerSubs: Common.MarkerCommunicationSubs$v1;
    clusterMarkerSubs: Common.ClusterMarkerCommunicationSubs$v1;
    bringToTopZ: number;
    focusZ: number;

    windowTooSmall = false;

    mapDataLoaded = false;
    translationFinished = false;

    leafletBaseMapLayers: any = [];
    leafletOverlays: any = [];
    leafletDataLayers: any = [];
    leafletDynamicLayers: any = [];

    layerGroupInfos: any = {};

    baseMapsPane: any = null;
    overlaysPane: any = null;
    dataLayersPane: any = null;

    baseMapsCollInfo: LayerCollectionInfo;
    overlaysCollInfo: LayerCollectionInfo;
    dataLayersCollInfo: LayerCollectionInfo;

    dynamicsCollInfo: LayerCollectionInfo;
    dynamicsPane: any = null;
    dynamicsLayerGroup: LayerGroupInfo;
    dynamicsMaskLayerGroup: LayerGroupInfo;
    dynamicsFeatGroup: L.FeatureGroup = new L.FeatureGroup();

    dragging = false;

    omMarker: Common.Marker$v1;

    layers: L.Layer[] = [];

    autoRefreshLayers: Common.MapLayer$v1[] = [];

    layerPanelNotification: LayerPanelNotification;
    LayerPanelControlPositions: typeof Common.LayerPanelControlPositions$v1 = Common.LayerPanelControlPositions$v1;
    ZoomControlPositions: typeof Common.ZoomControlPositions$v1 = Common.ZoomControlPositions$v1;
    DispPriority: typeof Common.DisplayPriority$v1 = Common.DisplayPriority$v1;

    layerCollInfos: LayerCollectionInfo[] = [];
    collTopZValue = 2500;
    collBottomZValue = 2500;

    geoSpatialSvc: GeoSpatialService$v1;

    private layerColls: Common.LayerCollection$v1[] = [];
    private layerCollsSub = new BehaviorSubject<Common.LayerCollection$v1[]>(null);
    layerCollections$: Observable<Common.LayerCollection$v1[]>;

    private curAuthToken: string;

    FeatureFlags: typeof Common.FeatureFlags = Common.FeatureFlags;

    // Map Interface 
    iDraw: Common.DrawInterface$v1;
    iLayers: Common.LayersInterface$v1;

    // BEGIN SHAPES LAYER

    // CapabilityId that activated draw */
    drawCapId: string;

    drawActive = true;

    // Flag to indicate if shape filter toolbar is displayed.  This temporary till we move it out of map
    showFilterToolbar = false;

    // Title of the draw toolbar.  Can be modified through Draw api */
    drawToolbarTitle: string;

    // Draw button tooltip.  Can be modified through Draw api
    drawButtonTooltip: string;

    /** Leaflet shapes layer. */
    private leafletDrawLayers: any = [];

    /** Layer group info for shapes layer. */
    private drawGeomLayerGroup: LayerGroupInfo;

    /** Layer group info for markers that represent coordinates in shapes layer. */
    private drawMarkersLayerGroup: LayerGroupInfo;

    /** Layer group for draw mask */
    private drawMaskLayerGroup: LayerGroupInfo;

    /** Shapes layer feature group. */
    private drawFeatGroup: L.FeatureGroup = new L.FeatureGroup();

    /** Parent pane where all drawing occurs */
    private drawPane: any = null;

    /** Pane where geomerty is drawn */
    private drawGeomPane: any = null;

    /** Pane for mask when draw mask is used */
    private drawMaskPane: any = null;

    /** A flag that is true when the draw toolbar UI should be shown */
    showDrawToolbar = false;

    /** Whether or not to show the filter mask. */
    showFilterMask = false;

    /** Flag that is true if there is geometry */
    hasGeometry$: Observable<boolean>;

    /** Flag that is true if a draw mask is shown */
    maskShown$: Observable<boolean>;

    drawControlShown = false;

    maskLayerId: string;
    maskGeomId: string;

    contextMenuItems: ContextMenuItem[];

    /** Flag that is true if persistent edit is enabled */
    persistentEdit: boolean;

    displayLayerPropsCmd = false;
    layerPropsCmdPoint: L.Point;
    maxLayerPropsHeight: number;
    layerPropCmdMenuItem: ContextMenuItem;

    layerPropsCmdLayerInfos: LayerPropsCmdLayerInfo[] = []

    selectedLayers: any;

    /** Collection of persistent edit subscriptions. Key is capability Id. */
    private persistentEditSubs = new Map<string, Subscription>();

    private digitizer: LeafletDrawService;

    private destroy$ = new Subject<boolean>();

    constructor(
        private mapCoreSvc: CommonmapCoreService$v1,
        private layoutCompiler: LayoutCompilerAdapterService,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private changeRef: ChangeDetectorRef,
        private zone: NgZone,
        private selectionSvc: MapLayerSelectionService$v1,  
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {

        this.selectionSvc.selectionChanged$.subscribe((selectedLayers) => {
            this.selectedLayers = selectedLayers;
        });    

        this.settings = this.mapCreateMessage.mapSettings;
        this.initContextMenuItems();
        this.initLocalization();

        this.mapCoreSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            await this.initLocalization();
            if ((this.map as any)?.contextMenu) {
                const map = this.map as any;
                map.options.copyCoordsMsg = this.transStrings[this.tokens.copyCoordsMsg];
                map.options.copyCoordsTooltip = this.transStrings[this.tokens.copyCoordsTooltip];
                map.contextMenu.refresh();
            }
        });

        this.iDraw = this as Common.DrawInterface$v1;
        this.iLayers = this as Common.LayersInterface$v1;
        this.layerCollections$ = this.layerCollsSub.asObservable();

        this.digitizer = new LeafletDrawService(this.localizationAdapter, this.mapCoreSvc, this as Common.MapInterface$v1, this.cdr);

        if (this.mapCoreSvc.isFeatureFlagEnabled(Common.FeatureFlags.FFDraw)) {
            this.drawControlShown = true;
        }

        this.mapDataLoaded = false;
        this.personalizationId = this.settings.contextId;
        this.mapViewContextId = this.settings.contextId;

        fromEvent(window, 'resize').pipe(
            debounceTime(100),
            takeUntil(this.destroy$),
        ).subscribe(() => {
            this.checkWindowSize();
        });

        this.mapCoreSvc.mapDataReady$.pipe(takeUntil(this.destroy$)).subscribe(async (dataReady) => {
            if (!dataReady) {
                return;
            }

            this.savedMapPreset = this.settings.mapPreset;
            if (this.savedMapPreset === null || this.savedMapPreset.name === this.mapCoreSvc.defaultMapPresetToken) {
                this.savedMapPreset = await this.mapCoreSvc.getDefaultMapPreset();
            }

            if (this.savedMapPreset) {
                this.mapPreset = this.savedMapPreset.clone();
                await this.applyOverridesToMapPreset();
            }
            this.layerColls = this.mapCoreSvc.createLayerCollsFromMapPreset(this.mapPreset);
            this.layerCollsSub.next(this.layerColls);

            this.mapCoreSvc.mapDataTranslated$.pipe(
                takeUntil(this.destroy$)
            ).subscribe(() => {
                for (const layer of this.mapPreset.mapLayers) {
                    const token = this.mapCoreSvc.sysLayerNameTokens[this.mapPreset.id];
                    if (layer.isSystemDefined) {
                        const token = this.mapCoreSvc.sysLayerNameTokens[layer.id];
                        if (token && this.mapCoreSvc.translatedStrings[token]) {
                            layer.name = this.mapCoreSvc.translatedStrings[token];
                        }
                    }
                }

                this.layerColls = this.mapCoreSvc.createLayerCollsFromMapPreset(this.mapPreset);
                this.layerCollsSub.next(this.layerColls);
            });
            this.getMapOptions();
            this.mapDataLoaded = true;
        });

        this.layerPanelNotification = new LayerPanelNotification();

        this.layerPanelNotification.layerPropertyChanged$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
            this.layerPropertyChanged(event);
        });

        this.layerPanelNotification.layersReordered$.pipe(takeUntil(this.destroy$)).subscribe((collId) => {
            this.layersReordered(collId);
        });

        this.layerPanelNotification.baseMapChanged$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
            this.baseMapChanged(event);
        });

        this.layerPanelNotification.resetToDefaultSelected$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.handleResetToDefault();
        });

        this.layerPanelNotification.layerPanelDisplayStateChanged$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
            this.layerPanelDisplayStateChanged(state);
        });

        this.mapCoreSvc.authToken$.pipe(
            filter(data => !!data),
            takeUntil(this.destroy$)
        ).subscribe((authToken) => {
            if (this.curAuthToken !== authToken) {
                this.curAuthToken = authToken;
                let layerGroupInfo: LayerGroupInfo;
                const keys = Object.keys(this.layerGroupInfos);
                for (const key of keys) {
                    layerGroupInfo = this.layerGroupInfos[key];
                    if (layerGroupInfo.leafletLayer) {
                        if (layerGroupInfo.mapLayer.format === Common.LayerFormat$v1.GeoJSON ||
                            layerGroupInfo.mapLayer.format === Common.LayerFormat$v1.WFS) {
                            const options = (<any>layerGroupInfo.leafletLayer).options;
                            if (options?.headers) {
                                const headers = options.headers;
                                if (headers['Authorization']) {
                                    headers['Authorization'] = 'Bearer ' + this.curAuthToken;
                                }
                            }
                        } else {
                            const layerHeaders: { header: string, value: string }[] = (<any>layerGroupInfo.leafletLayer).headers;
                            if (layerHeaders) {
                                const header = layerHeaders.find(h => h.header === 'Authorization');
                                if (header) {
                                    header.value = 'Bearer ' + this.curAuthToken;
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    ngAfterViewInit() {
        this.checkWindowSize();
        this.canDraw();
    }

    ngOnDestroy() {
        this.digitizer.clearListeners();
        this.mapCoreSvc.removeAllAutoRefreshTimersForMap(this.mapId);
        this.destroy$.next(true);
        this.destroy$.complete();

        this.destroyMap();
    }

    destroyMap() {
        if (this.map) {
            for (const key of Object.keys(this.layerGroupInfos)) {
                const layerGroupInfo = this.layerGroupInfos[key];
                for (const markerKey of Object.keys(layerGroupInfo.leafletMarkers)) {
                    const leafletMarker = layerGroupInfo.leafletMarkers[markerKey];
                    if (leafletMarker.markerInfo) {

                        let parent: any;
                        if (leafletMarker.getVisibleParent) {
                            parent = leafletMarker.getVisibleParent();
                        }
                        if (leafletMarker.markerInfo) {
                            const marker: Common.Marker$v1 = leafletMarker.markerInfo.marker;
                            if (marker) {
                                marker.markerSubs.markerRemovedSub.next(
                                    new Common.MarkerDescriptor$v1(marker.markerId, marker.layerId));
                            }

                            const compRef = leafletMarker.markerInfo.componentRef;
                            if (compRef) {
                                compRef.destroy();
                            }
                        } else if (parent && parent.markerInfo) {
                            const clusterMarker: Common.ClusterMarker$v1 = parent.markerInfo.clusterMarker;
                            if (clusterMarker) {
                                clusterMarker.markerSubs.markerRemovedSub.next(
                                    new Common.MarkerDescriptor$v1(clusterMarker.markerId, clusterMarker.layerId));
                            }

                            const compRef = parent.markerInfo.componentRef;
                            if (compRef) {
                                compRef.destroy();
                            }
                        }
                    }
                }

                for (const markerKey of Object.keys(layerGroupInfo.focusedMarkers)) {
                    const focusedMarker = layerGroupInfo.focusedMarkers[markerKey];
                    const compMarker: Common.Marker$v1 =
                        focusedMarker.markerInfo.compMarker;
                    if (compMarker) {
                        compMarker.markerSubs.markerRemovedSub.next(
                            new Common.MarkerDescriptor$v1(compMarker.markerId, compMarker.layerId));
                    }

                    const compRef = focusedMarker.markerInfo.componentRef;
                    if (compRef) {
                        compRef.destroy();
                    }
                }
                if (layerGroupInfo?.mapDataRequest) {
                    layerGroupInfo.mapDataRequest.iMap = null;
                }
            }

            if (this.mapComm) {
                this.mapComm.mapEvents.subs.mapCommunicationClosedSub.next(true);
                this.mapComm.mapEvents.subs.mapCommunicationClosedSub.complete();
            }

            this.layerGroupInfos = {};
            this.layerCollInfos = [];
            this.layerColls = [];

            this.layers = [];
            this.leafletDataLayers = [];
            this.leafletBaseMapLayers = [];
            this.leafletOverlays = [];
            this.leafletDynamicLayers = [];
            this.leafletDrawLayers = [];

            this.mapCoreSvc.destroyMap(this.map);
            this.map = null;
        }
    }

    /**
     * Used to determine whether layer panel should be displayed normal as a slide out or as a dialog
     */
    checkWindowSize() {
        if (this.mapDiv != null) {
            if (this.layerPanel) {
                this.layerPanel.closeLayerPanel();
            }

            this.layerPropsCmdClose(false);

            this.windowTooSmall = false;
            if (this.mapDiv.nativeElement.offsetWidth <= 450 || this.mapDiv.nativeElement.offsetHeight <= 350) {
                this.windowTooSmall = true;
            }

            if (this.mapCoreSvc.isFeatureFlagEnabled(this.FeatureFlags.LayerInfoCmds)) {
                if (this.mapDiv.nativeElement.offsetWidth <= 360 || this.mapDiv.nativeElement.offsetHeight <= 350) {
                    this.disableLayerPropsCmdMenuItem();
                } else {
                    this.enableLayerPropsCmdMenuItem();
                }
            }

            if (this.mapComm) {
                const size = new Common.Size$v1(this.mapDiv.nativeElement.offsetWidth, this.mapDiv.nativeElement.offsetHeight);
                this.mapComm.mapViewSize = size;
                this.mapComm.mapEvents.subs.mapResizedSub.next(size);
            }
        }
    }

    /**
     * Returns true if the map is large enough to draw
     */
    canDraw(): boolean {
        if (this.mapDiv.nativeElement.offsetWidth >= 505) {
            return true;
        } else {
            this.showDrawToolbar = false;
            return false;
        }
    }

    /**
     * Apply all the user personalization to the map preset.   Update the personalizations and save if there
     * have been changes to the map preset and the override no longer applicable.
     */
    private async applyOverridesToMapPreset() {
        let overridesChanged = false;

        this.isPresetOverridden = false;

        if (this.settings.mapCenter) {
            this.mapPreset.mapCenter = this.settings.mapCenter;
        }

        if (this.settings.zoomLevel || this.settings.zoomLevel === 0) {
            this.mapPreset.zoomLevel = this.settings.zoomLevel;
        }

        if (this.personalizationId) {
            this.mapviewOverrides = await this.mapCoreSvc.getPersonalizationInfoAsync(this.personalizationId);
        }
        if (this.mapviewOverrides && this.mapviewOverrides.mapPresetId === this.mapPreset.id) {

            // Check if basemap has been overridden

            if (this.mapviewOverrides.baseMapId) {
                const curBaseMap = this.mapCoreSvc.getSelectedBaseMap(this.mapPreset.mapLayers);
                if (curBaseMap.id !== this.mapviewOverrides.baseMapId) {
                    // See if the basemap override is still in the map preset.
                    const newBaseMap = this.mapPreset.mapLayers.find((layer) => layer.id === this.mapviewOverrides.baseMapId);
                    if (newBaseMap) {
                        newBaseMap.shownOnStartup = true;
                        curBaseMap.shownOnStartup = false;
                        this.isPresetOverridden = true;
                    } else {
                        this.mapviewOverrides.baseMapId = null;
                        overridesChanged = true;
                    }
                } else {
                    this.mapviewOverrides.baseMapId = null;
                    overridesChanged = true;
                }
            }

            // Check if layer properties are overridden.  At the same time, if anything has changed and the
            // overrides do not apply, remove the overrides.
            const layerProperties = this.mapviewOverrides.layerProperties;

            for (const key of Object.keys(layerProperties)) {
                const mapLayer = this.mapPreset.mapLayers.find((layer) => layer.id === key);
                if (mapLayer) {
                    const props = layerProperties[key];
                    for (const propKey of Object.keys(props)) {
                        if (mapLayer[propKey] !== props[propKey]) {
                            mapLayer[propKey] = props[propKey];
                            this.isPresetOverridden = true;
                        } else {
                            delete (props[propKey]);
                            overridesChanged = true;
                        }
                    }

                    if (Object.keys(props).length === 0) {
                        delete layerProperties[key];
                        overridesChanged = true;
                    }
                } else {
                    delete (layerProperties[key]);
                    overridesChanged = true;
                }
            }

            // Check to see if reorder is needed
            for (const typeKey of Object.keys(this.mapviewOverrides.reorderedLayers)) {
                const origLayers = this.mapCoreSvc.getMapLayers(this.mapPreset, <Common.MapLayerType$v1>typeKey);

                // First check to see if the layers have changed (added/deleted).  If the list of layers are not the
                // same as when the override was saved, we will ignore the override.

                const reorderedIds = this.mapviewOverrides.reorderedLayers[typeKey];
                if (reorderedIds.length !== origLayers.length) {
                    delete this.mapviewOverrides.reorderedLayers[typeKey];
                    overridesChanged = true;
                } else {
                    let exists;
                    for (const layer of origLayers) {
                        exists = reorderedIds.find((id: string) => id === layer.id);
                        if (!exists) {
                            delete this.mapviewOverrides.reorderedLayers[typeKey];
                            overridesChanged = true;
                            break;
                        }
                    }

                    if (exists) {
                        let override = false;
                        for (let ii = 0; ii < origLayers.length; ii++) {
                            if (origLayers[ii].id !== reorderedIds[ii]) {
                                override = true;
                                break;
                            }
                        }

                        if (override) {
                            const newPresetLayers: Common.MapLayer$v1[] = [];
                            for (const id of reorderedIds) {
                                const presetLayer = origLayers.find((layer) => layer.id === id);
                                if (presetLayer) {
                                    newPresetLayers.push(presetLayer);
                                }
                            }
                            this.mapPreset.mapLayers = (this.mapPreset.mapLayers.filter((layer) => layer.type !== typeKey))
                                .concat(newPresetLayers);
                            this.isPresetOverridden = true;
                        } else {
                            delete this.mapviewOverrides.reorderedLayers[typeKey];
                            overridesChanged = true;
                        }
                    }
                }
            }

            // If we made modifications to the overrides, need to see if we should save it or delete it

            if (overridesChanged) {
                this.checkOverridesAndDeleteOrSave();
            }
        } else {
            this.mapviewOverrides = new MapviewOverrides(null);
        }
    }

    initContextMenuItems() {
        if (this.mapCoreSvc.isFeatureFlagEnabled(this.FeatureFlags.LayerInfoCmds)) {
            this.layerPropCmdMenuItem = new ContextMenuItem({
                index: 99,
                context: this,
                alwaysLast: true,
                callback: ((event: any) => {
                    this.layerPropsCmd({event: event}); 
                })
            });
            this.contextMenuItems = [];

            if (this.settings?.mapControls?.showLayerProperties === true) {
                if (this.mapDiv?.nativeElement?.offsetWidth > 360 && this.mapDiv?.nativeElement?.offsetHeight > 350) {
                    this.layerPropCmdMenuItem.disabled = true;
                }
                this.contextMenuItems.push(this.layerPropCmdMenuItem);
            }
        }

    }

    enableLayerPropsCmdMenuItem() {
        if (this.settings?.mapControls?.showLayerProperties === true) {
            const map = this.map as any;
            const menuItem = this.contextMenuItems.find((item) => item.index === 99);
            if (!menuItem) {
                this.contextMenuItems.push(this.layerPropCmdMenuItem);
                if (map?.contextmenu) {
                    map.contextmenu.refresh();
                }
            } else {
                menuItem.disabled = false;
                menuItem.tooltip = null;
                if (map?.contextmenu) {
                    map.contextmenu.refresh();
                }
            }
        }
    }

    disableLayerPropsCmdMenuItem() {
        if (this.settings?.mapControls?.showLayerProperties === true) {
            const map = this.map as any;
            const item = this.contextMenuItems.find((item) => item.index === 99);
            if (item) {
                item.disabled = true;
                item.tooltip = this.transStrings[this.tokens.layerPropsCmdDisabledTooltip];
                if (map?.contextmenu) {
                    map.contextmenu.refresh();
                }
            }
        }
    }

    getMapOptions() {
        if (this.mapPreset != null) {

            this.mapOptions = this.mapCoreSvc.getLeafletMapOptions(this.settings, this.mapPreset, this.contextMenuItems);
            (this.mapOptions as any).copyCoordsMsg = this.transStrings[this.tokens.copyCoordsMsg];
            (this.mapOptions as any).copyCoordsTooltip = this.transStrings[this.tokens.copyCoordsTooltip];

            let lineColor;
            let fillColor;
            let opt = this.mapPreset.getOption(Common.MapPresetOptionName.HighlightLineColor);
            if (opt) {
                lineColor = opt.value; 
            }
            opt = this.mapPreset.getOption(Common.MapPresetOptionName.HighlightFillColor);
            if (opt) {
                fillColor = opt.value; 
            }
            if (lineColor && fillColor) {
                this.selectionSvc.setHighlightColor(lineColor, fillColor);
            }

            opt = this.mapPreset.getOption(Common.MapPresetOptionName.SelectionLineColor);
            if (opt) {
                lineColor = opt.value; 
            }
            opt = this.mapPreset.getOption(Common.MapPresetOptionName.SelectionFillColor);
            if (opt) {
                fillColor = opt.value; 
            }
            if (lineColor && fillColor) {
                this.selectionSvc.setSelectionColor(lineColor, fillColor);
            }
       }
       return (this.mapOptions);
    }

    getLeafletLayers() {
        let layers = this.layerCollInfos.map((info) => info.featureGroup);
        // let layers = [];

        // layers = this.leafletBaseMapLayers.concat(this.leafletOverlays.concat(this.leafletDataLayers));
        if (this.dynamicsLayerGroup) {
            layers.push(this.dynamicsLayerGroup.featureGroup);
            layers.push(this.dynamicsLayerGroup.focusedFeatureGroup);
            layers.push(this.dynamicsLayerGroup.clusterGroup);
        }

        if (this.drawFeatGroup) {
            layers.push(this.drawFeatGroup);
        }

        return (layers);
    }

    async leafletMapReady(leafletMap: L.Map) {
        this.map = leafletMap;
        this.geoSpatialSvc = new GeoSpatialService$v1(this.map);

        this.mapInfo = this.mapCoreSvc.registerMap(leafletMap);
        this.mapId = this.mapInfo.mapId;

        this.mapInfo.custZoomLayers = {};

        this.mapInfo.mapPreset = this.mapPreset;

        // this.map.on('layeradd',this.layerAdded,this)

        this.map.on('zoomend', this.processMapZoomEnd, this);
        this.map.on('moveend', this.processMapMoveEnd, this);
        this.map.on('click', this.fireMapClicked, this);
        this.map.on('contextmenu.show', this.handleMapContextMenuShow, this);  // Event fired from the context menu plugin
        this.map.on('layeradd', this.layerAddedToMap, this);
        this.map.on('layerremove', this.layerRemovedFromMap, this);

        this.mapComm = new Common.MapCommunication$v1(this.mapId, (<any>this.settings).contextId, Common.MapType$v1.Type2D, this as Common.MapInterface$v1);
        if (this.mapDiv) {
            this.mapComm.mapViewSize = new Common.Size$v1(
                this.mapDiv.nativeElement.offsetWidth, this.mapDiv.nativeElement.offsetHeight);
        }

        // Listen to draw clear
        this.mapComm.draw.geometry$.subscribe(g => {
            if (!g) {
                this.digitizer.delete();
            }
        });

        // Temp call to showHide the filter toolbar
        (this.mapComm.draw as any).displayFilterToolbar$.subscribe((flag) => {
            this.showFilterToolbar = flag;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });

        this.maskShown$ = this.digitizer.maskShown$;

        this.hasGeometry$ = this.mapComm.draw.geometry$.pipe(
            map(g => !!g)
        );

        this.mapComm.mapEvents = new Common.MapEvents$v1();
        this.subscribeToMapCommEvents(this.mapComm);

        // this.mailboxSvc.mailbox$v1.mapViewLoaded$.next(this.mapComm);

        // this.setupTest();

        this.leafletBaseMapLayers = [];
        this.leafletOverlays = [];
        this.leafletDataLayers = [];
        this.leafletDrawLayers = [];

        // Create the system collections

        this.baseMapsCollInfo = new LayerCollectionInfo();
        let layerColl = this.layerColls.find((coll) => coll.id === Common.DefaultLayerCollectionIds$v1.BaseMaps);
        this.baseMapsPane = this.mapCoreSvc.createMapPane('baseMaps', null, this.map, 1000);
        this.baseMapsCollInfo.collection = layerColl;
        this.baseMapsCollInfo.pane = this.baseMapsPane;
        this.baseMapsCollInfo.paneName = 'baseMaps';
        this.baseMapsCollInfo.zIndexOffset = 1000;
        this.baseMapsCollInfo.featureGroup = new L.FeatureGroup(null, {
            pane: this.baseMapsPane
        });
        this.layerCollInfos.push(this.baseMapsCollInfo);

        this.overlaysCollInfo = new LayerCollectionInfo();
        layerColl = this.layerColls.find((coll) => coll.id === Common.DefaultLayerCollectionIds$v1.Overlays);
        this.overlaysPane = this.mapCoreSvc.createMapPane('overlays', null, this.map, this.collTopZValue);
        this.overlaysCollInfo.collection = layerColl;
        this.overlaysCollInfo.pane = this.overlaysPane;
        this.overlaysCollInfo.paneName = 'overlays';
        this.overlaysCollInfo.zIndexOffset = this.collTopZValue;
        this.collTopZValue += 100;
        this.overlaysCollInfo.featureGroup = new L.FeatureGroup(null, {
            pane: this.overlaysPane
        });
        this.layerCollInfos.push(this.overlaysCollInfo);

        this.dataLayersCollInfo = new LayerCollectionInfo();
        layerColl = this.layerColls.find((coll) => coll.id === Common.DefaultLayerCollectionIds$v1.DataLayers);
        this.dataLayersPane = this.mapCoreSvc.createMapPane('dataLayers', null, this.map, 5000);
        this.dataLayersCollInfo.collection = layerColl;
        this.dataLayersCollInfo.pane = this.dataLayersPane;
        this.dataLayersCollInfo.paneName = 'dataLayers';
        this.dataLayersCollInfo.zIndexOffset = 5000;
        this.dataLayersCollInfo.featureGroup = new L.FeatureGroup(null, {
            pane: this.dataLayersPane
        });
        this.layerCollInfos.push(this.dataLayersCollInfo);

        await this.createBaseMapLayersForMap(this.mapPreset);
        await this.createOverlaysForMap(this.mapPreset);
        this.createDataLayersForMap(this.mapPreset);

        this.createDynamicsLayer();
        this.createDrawLayer();

        this.digitizer.init(this.map, DRAW_GEOM_LAYER_ID, DRAW_MASK_LAYER_ID, this.drawFeatGroup);
        this.digitizer.capabilityId = Common.capabilityId;

        this.bringToTopZ += 10000;
        this.focusZ = this.bringToTopZ + 20000;

        if (this.settings.mapControls && this.settings.mapControls.displayZoomControl) {
            L.control.zoom({ position: <L.ControlPosition>(this.settings.mapControls.zoomControlLocation.toLowerCase()) })
                .addTo(leafletMap);
        }

        if (this.mapCreateMessage) {
            this.mapCreateMessage.mapReady$.next(this.mapComm);
        }

        L.DomUtil.addClass((leafletMap as any)._container,'pointer-cursor-enabled');

        this.requestDataLayerData();

    }

    async createBaseMapLayersForMap(mapPreset: Common.MapPreset$v1) {
        // Create layer pane and create layer for that pane.  The pane will maintain proper display order.
        const baseMaps: Common.MapLayer$v1[] = this.mapCoreSvc.getMapLayers(mapPreset, Common.MapLayerType$v1.BaseMap);
        (this.baseMapsCollInfo.collection as any).layersList = baseMaps;
        for (const baseMap of baseMaps) {
            const basemapInfo = new LayerGroupInfo();
            const name = this.mapCoreSvc.createPaneNameForLayer(baseMap);
            basemapInfo.paneName = name;
            basemapInfo.pane = this.mapCoreSvc.createMapPane(name, this.baseMapsPane, this.map, null);
            basemapInfo.mapLayer = baseMap;
            if (baseMap.shownOnStartup && this.leafletBaseMapLayers.length === 0) {
                const layer = await this.mapCoreSvc.createLeafletLayer(baseMap, this.selectionSvc, this.mapViewContextId);
                if (layer) {
                    basemapInfo.leafletLayer = layer;
                    this.leafletBaseMapLayers.push(layer);
                    this.baseMapsCollInfo.featureGroup.addLayer(layer);
                    this.mapCoreSvc.addAutoRefreshTimer(basemapInfo, this.mapId);
                }
            }
            this.layerGroupInfos[baseMap.id] = basemapInfo;
            this.baseMapsCollInfo.layerGroupInfos[baseMap.id] = basemapInfo;
        }
    }

    async createOverlaysForMap(mapPreset: Common.MapPreset$v1) {
        // Create layer pane and create layer for that pane.  The pane will maintain proper display order.
        const overlays: Common.MapLayer$v1[] = this.mapCoreSvc.getMapLayers(mapPreset, Common.MapLayerType$v1.Overlay);
        (this.overlaysCollInfo.collection as any).layersList = overlays;
        for (let ii = overlays.length - 1; ii >= 0; ii--) {
            const overlayInfo = new LayerGroupInfo();
            const name = this.mapCoreSvc.createPaneNameForLayer(overlays[ii]);
            overlayInfo.paneName = name;
            overlayInfo.pane = this.mapCoreSvc.createMapPane(name, this.overlaysPane, this.map, null);
            const layer = await this.mapCoreSvc.createLeafletLayer(overlays[ii], this.selectionSvc, this.mapViewContextId);
            overlayInfo.mapLayer = overlays[ii];
            let custZoomDisplayed = true;
            if (layer) {
                overlayInfo.featureGroup = new L.FeatureGroup(null, { pane: name });
                overlayInfo.leafletLayer = layer;
                if (overlayInfo.mapLayer.format === Common.LayerFormat$v1.GeoJSON ||
                    overlayInfo.mapLayer.format === Common.LayerFormat$v1.WFS) {
                    if (overlayInfo.mapLayer.defineMinZoom || overlayInfo.mapLayer.defineMaxZoom) {
                        this.mapInfo.custZoomLayers[overlayInfo.mapLayer.id] = overlayInfo;
                        custZoomDisplayed = this.isLayerBeingDisplayed(overlayInfo);
                    }
                }
                if (overlays[ii].shownOnStartup && custZoomDisplayed) {
                    overlayInfo.displayedOnMap = true;
                    overlayInfo.featureGroup.addLayer(layer);
                    this.mapCoreSvc.addAutoRefreshTimer(overlayInfo, this.mapId);
                }
                this.leafletOverlays.push(overlayInfo.featureGroup);
                this.overlaysCollInfo.featureGroup.addLayer(overlayInfo.featureGroup);
            }
            this.layerGroupInfos[overlays[ii].id] = overlayInfo;
            this.overlaysCollInfo.layerGroupInfos[overlays[ii].id] = overlayInfo;


        }
    }

    createDataLayersForMap(mapPreset: Common.MapPreset$v1) {
        // Create layer pane and create layer for that pane.  The pane will maintain proper display order.
        const dataLayers: Common.MapLayer$v1[] = this.mapCoreSvc.getMapLayers(mapPreset, Common.MapLayerType$v1.Capability);
        (this.dataLayersCollInfo.collection as any).layersList = dataLayers;

        this.bringToTopZ = (dataLayers.length + 1) * 10000;
        this.focusZ = this.bringToTopZ + 10000;
        for (let ii = 0; ii < dataLayers.length; ii++) {
            const layerGroupInfo: LayerGroupInfo = new LayerGroupInfo();
            const dataLayer = dataLayers[ii];
            layerGroupInfo.mapLayer = dataLayer;
            layerGroupInfo.paneName = 'dataLayers';
            layerGroupInfo.pane = this.dataLayersPane;
            layerGroupInfo.leafletMarkers = {};
            layerGroupInfo.leafletClusterMarkers = {};
            // Calculate the z-index starting point for data.  This allows for 10000 markers.  
            layerGroupInfo.zIndexOffset = (((dataLayers.length - 1) - ii) * 10000) + 1;
            layerGroupInfo.clusterSettings = new Common.ClusterSettings$v1({
                enableClustering: true,
                clusterRadius: 40
            });

            layerGroupInfo.featureGroup = new L.FeatureGroup();
            let groupInfo: any = {};
            groupInfo.type = 'featureGroup';
            groupInfo.mapLayer = dataLayer;
            (<any>layerGroupInfo.featureGroup).groupInfo = groupInfo;

            const clusterGroup: any = {
                iconCreateFunction: ((cluster) => (this.createClusterIcon(cluster, this))),
                maxClusterRadius: layerGroupInfo.clusterSettings.clusterRadius,
                spiderfyOnMaxZoom: false,
                spiderfyDistanceMultiplier: 1,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                animate: false,
                disableClusteringAtZoom: null,
                clusterPane: layerGroupInfo.paneName,
            };

            layerGroupInfo.clusterGroup = new L.MarkerClusterGroup(clusterGroup);

            groupInfo = {};
            groupInfo.mapLayer = dataLayer;
            groupInfo.maxZIndex = 0;
            groupInfo.type = 'clusterGroup';

            (layerGroupInfo.clusterGroup as any).groupInfo = groupInfo;
            if (dataLayer.defineMinZoom || dataLayer.defineMaxZoom) {
                this.mapInfo.custZoomLayers[dataLayer.id] = layerGroupInfo;
            }

            layerGroupInfo.displayedOnMap = this.isLayerBeingDisplayed(layerGroupInfo);

            // Create a feature group to add focused items for this layer

            layerGroupInfo.focusedFeatureGroup = new L.FeatureGroup(null);
            groupInfo = {};
            groupInfo.type = 'focusedGroup';
            groupInfo.mapLayer = dataLayer;
            (layerGroupInfo.focusedFeatureGroup as any).groupInfo = groupInfo;

            this.leafletDataLayers.push(layerGroupInfo.clusterGroup);
            this.leafletDataLayers.push(layerGroupInfo.featureGroup);
            this.leafletDataLayers.push(layerGroupInfo.focusedFeatureGroup);
            this.dataLayersCollInfo.featureGroup.addLayer(layerGroupInfo.clusterGroup);
            this.dataLayersCollInfo.featureGroup.addLayer(layerGroupInfo.featureGroup);
            this.dataLayersCollInfo.featureGroup.addLayer(layerGroupInfo.focusedFeatureGroup);

            // Setup to create a map pane if geometries are added to this layer. The z index will be the base offset for this layer in the data layers.
            // This allows for reordering to occur. 
            layerGroupInfo.geomPaneName = this.mapCoreSvc.createPaneNameForLayer(dataLayer) + '_Geom';

            this.layerGroupInfos[layerGroupInfo.mapLayer.id] = layerGroupInfo;
            this.dataLayersCollInfo.layerGroupInfos[layerGroupInfo.mapLayer.id] = layerGroupInfo;
        }
    }

    createDynamicsLayer() {
        this.dynamicsPane = this.mapCoreSvc.createMapPane(DYNAMICS_LAYER_ID, null, this.map, 6000);

        this.dynamicsMaskLayerGroup = new LayerGroupInfo();
        this.dynamicsMaskLayerGroup.zIndexOffset = this.bringToTopZ;

        this.dynamicsMaskLayerGroup.featureGroup = this.dynamicsFeatGroup;
        this.dynamicsMaskLayerGroup.paneName = DYNAMICS_MASK_LAYER_ID;
        this.dynamicsMaskLayerGroup.pane = this.mapCoreSvc.createMapPane(DYNAMICS_MASK_LAYER_ID, this.dynamicsPane, this.map, null);
        this.dynamicsMaskLayerGroup.mapLayer = new Common.MapLayer$v1();
        this.dynamicsMaskLayerGroup.mapLayer.id = DYNAMICS_MASK_LAYER_ID;
        this.dynamicsMaskLayerGroup.mapLayer.type = Common.MapLayerType$v1.Dynamics;

        this.layerGroupInfos[DYNAMICS_MASK_LAYER_ID] = this.dynamicsMaskLayerGroup;

        this.dynamicsLayerGroup = new LayerGroupInfo();
        this.dynamicsLayerGroup.zIndexOffset = this.bringToTopZ;

        this.dynamicsLayerGroup.featureGroup = this.dynamicsFeatGroup;
        this.dynamicsLayerGroup.paneName = DYNAMICS_GEOM_LAYER_ID;
        this.dynamicsLayerGroup.pane = this.mapCoreSvc.createMapPane(DYNAMICS_GEOM_LAYER_ID, this.dynamicsPane, this.map, null);
        this.dynamicsLayerGroup.mapLayer = new Common.MapLayer$v1();
        this.dynamicsLayerGroup.mapLayer.id = DYNAMICS_GEOM_LAYER_ID;
        this.dynamicsLayerGroup.mapLayer.type = Common.MapLayerType$v1.Dynamics;

        this.layerGroupInfos[DYNAMICS_LAYER_ID] = this.dynamicsLayerGroup;


        this.dynamicsCollInfo = new LayerCollectionInfo();
        this.dynamicsCollInfo.collection = new Common.LayerCollection$v1();
        (this.dynamicsCollInfo.collection as any).id = DYNAMICS_LAYER_ID;
        this.dynamicsCollInfo.collection.name = DYNAMICS_LAYER_ID;
        this.dynamicsCollInfo.collection.addLayers([this.dynamicsLayerGroup.mapLayer])
        this.dynamicsCollInfo.collection.addLayers([this.dynamicsMaskLayerGroup.mapLayer])

        this.dynamicsCollInfo.pane = this.dynamicsPane;
        this.dynamicsCollInfo.paneName = DYNAMICS_LAYER_ID;
        this.dynamicsCollInfo.zIndexOffset = 6000;
        this.dynamicsCollInfo.layerGroupInfos[DYNAMICS_LAYER_ID] = this.dynamicsLayerGroup;
        this.dynamicsCollInfo.layerGroupInfos[DYNAMICS_MASK_LAYER_ID] = this.dynamicsMaskLayerGroup;

        const clusterGroup: any = {
            iconCreateFunction: ((cluster) => (this.createClusterIcon(cluster, this))),
            maxClusterRadius: 40,
            spiderfyOnMaxZoom: false,
            spiderfyDistanceMultiplier: 1,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false,
            animate: false,
            disableClusteringAtZoom: null,
            clusterPane: this.dynamicsLayerGroup.paneName,
        };

        this.dynamicsLayerGroup.clusterGroup = new L.MarkerClusterGroup(clusterGroup);

        let groupInfo: any = {};
        groupInfo.maxZIndex = 0;
        groupInfo.type = 'clusterGroup';

        (this.dynamicsLayerGroup.clusterGroup as any).groupInfo = groupInfo;

        // Create a feature group to add focused items for this layer

        this.dynamicsLayerGroup.focusedFeatureGroup = new L.FeatureGroup(null);
        groupInfo = {};
        groupInfo.type = 'focusedGroup';
        (this.dynamicsLayerGroup.focusedFeatureGroup as any).groupInfo = groupInfo;
    }

    createDrawLayer() {

        this.drawPane = this.mapCoreSvc.createMapPane(DRAW_LAYER_ID, null, this.map, 7000);

        this.drawMaskLayerGroup = new LayerGroupInfo();
        this.drawMaskLayerGroup.zIndexOffset = 1;
        this.drawMaskLayerGroup.featureGroup = this.drawFeatGroup;
        this.drawMaskLayerGroup.paneName = DRAW_MASK_LAYER_ID;
        this.drawMaskLayerGroup.pane = this.mapCoreSvc.createMapPane(DRAW_MASK_LAYER_ID, this.drawPane, this.map, 1);
        this.drawMaskLayerGroup.mapLayer = new Common.MapLayer$v1();
        this.drawMaskLayerGroup.mapLayer.type = Common.MapLayerType$v1.Shapes;
        this.drawMaskLayerGroup.mapLayer.id = DRAW_MASK_LAYER_ID;
        this.layerGroupInfos[DRAW_MASK_LAYER_ID] = this.drawMaskLayerGroup;

        this.drawGeomLayerGroup = new LayerGroupInfo();
        this.drawGeomLayerGroup.zIndexOffset = 2;
        this.drawGeomLayerGroup.featureGroup = this.drawFeatGroup;
        this.drawGeomLayerGroup.paneName = DRAW_GEOM_LAYER_ID;
        this.drawGeomLayerGroup.pane = this.mapCoreSvc.createMapPane(DRAW_GEOM_LAYER_ID, this.drawPane, this.map, 2);
        this.drawGeomLayerGroup.mapLayer = new Common.MapLayer$v1();
        this.drawGeomLayerGroup.mapLayer.type = Common.MapLayerType$v1.Shapes;
        this.drawGeomLayerGroup.mapLayer.id = DRAW_GEOM_LAYER_ID;
        this.layerGroupInfos[DRAW_GEOM_LAYER_ID] = this.drawGeomLayerGroup;

        this.drawMarkersLayerGroup = new LayerGroupInfo();
        this.drawMarkersLayerGroup.zIndexOffset = 3;
        this.drawMarkersLayerGroup.featureGroup = this.drawFeatGroup;
        this.drawMarkersLayerGroup.paneName = DRAW_MARKERS_LAYER_ID;
        this.drawMarkersLayerGroup.pane = this.mapCoreSvc.createMapPane(DRAW_MARKERS_LAYER_ID, this.drawPane, this.map, 3);
        this.drawMarkersLayerGroup.mapLayer = new Common.MapLayer$v1();
        this.drawMarkersLayerGroup.mapLayer.type = Common.MapLayerType$v1.Shapes;
        this.drawMarkersLayerGroup.mapLayer.id = DRAW_MARKERS_LAYER_ID;
        this.layerGroupInfos[DRAW_MARKERS_LAYER_ID] = this.drawMarkersLayerGroup;

        this.mapCoreSvc.createMapPane(DRAW_POPUP_LAYER_ID, this.drawPane, this.map, 4);
    }

    showGrabCursor(event) {
        L.DomUtil.removeClass((this.map as any)._container,'pointer-cursor-enabled');
        L.DomUtil.addClass((this.map as any)._container,'grabbing-cursor-enabled');
    }

    showDefaultCursor(event) {
        L.DomUtil.addClass((this.map as any)._container,'pointer-cursor-enabled');
        L.DomUtil.removeClass((this.map as any)._container,'grabbing-cursor-enabled');
    }

    clusterGroupClicked(event: any) {
        event.layer.spiderfy();
    }

    requestDataLayerData() {
        const dataLayers: Common.MapLayer$v1[] = this.mapCoreSvc.getMapLayers(this.mapPreset, Common.MapLayerType$v1.Capability);

        for (const dataLayer of dataLayers) {
            const layerGroupInfo: LayerGroupInfo = this.layerGroupInfos[dataLayer.id];

            if (this.settings.requestDataForCapabilityLayers) {
                this.requestMapData(layerGroupInfo);
            }
        }
    }

    // This event is fired from the context menu plugin when it shows the context menu on the map
    handleMapContextMenuShow(event: any) {
        this.closeLayerPanel();
        this.layerPropsCmdClose(false);
    }

    layerAddedToMap(event: any) {
        if (typeof (event.layer._childClusters) !== 'undefined') {
            // console.log('cluster added cluster marker');
            this.compClusterMarkerAdded(event.layer);
        } else if (event.layer.markerInfo) {
            const markerInfo: MarkerInfo = event.layer.markerInfo;
            if (markerInfo.settings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1) {
                this.compMarkerAdded(event.layer);
            }
        }
    }

    layerRemovedFromMap(event: any) {
        if (typeof (event.layer._childClusters) !== 'undefined') {
            this.compClusterMarkerRemoved(event.layer);
        } else if (event.layer.markerInfo) {
            const markerInfo: MarkerInfo = event.layer.markerInfo;
            if (markerInfo.settings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1) {
                this.compMarkerRemoved(event.layer);
            }
        }
    }

    async requestMapData(layerGroupInfo: LayerGroupInfo) {
        if (layerGroupInfo.mapLayer.options) {
            const result = layerGroupInfo.mapLayer.options.find(option => option.name === 'mapLayerDataId');
            if (result) {
                await this.layoutCompiler.loadCapabilityCoreAsync(layerGroupInfo.mapLayer.capabilityModuleRef);
                const mapDataRequest: Common.MapDataRequest$v1 =
                    new Common.MapDataRequest$v1(layerGroupInfo.mapLayer.capabilityModuleRef, this.mapInfo.mapId,
                                layerGroupInfo.mapLayer.id, result.value);

                (mapDataRequest as any).iMap = this as Common.MapInterface$v1;
                layerGroupInfo.mapDataRequest = mapDataRequest;
                this.mapComm.mapEvents.subs.mapDataRequestSub.next(mapDataRequest);
            }
        }
    }

    private subscribeToMapCommEvents(mapComm: Common.MapCommunication$v1) {

        mapComm.mapCommSubs.addMarkersSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (mailbox: LayoutCompiler.MailBox<Common.AddMarkerMessage$v1,
                Common.Marker$v1 | Common.Marker$v1[]>) => {
                const markers = await this.addMarkers(mailbox.payload);
                mailbox.response.next(markers);
            });

        mapComm.mapCommSubs.deleteAllMarkersSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (layerId) => {
                await this.deleteAllMarkers(layerId);
            });


        mapComm.mapCommSubs.setMapViewSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (mapViewParams: Common.MapPanZoomMessage$v1) => {
                await this.setMapView(mapViewParams);
            });

        mapComm.mapCommSubs.getMapViewSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (mailbox: LayoutCompiler.MailBox<void, Common.MapPanZoomMessage$v1>) => {
                const mapViewParams = this.getMapView();
                mailbox.response.next(mapViewParams);
            });

        mapComm.mapCommSubs.setClusterSettingsSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (clusterSettingsMsg: Common.ClusterSettingsMessage$v1) => {
                await this.setClusterSettingsForLayer(clusterSettingsMsg);
            });

        mapComm.mapCommSubs.panMapByPixelPointSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (pixelPoint: Common.PixelPoint$v1) => {
                await this.panMapByPixelPoint(pixelPoint);
            });

        mapComm.mapCommSubs.zoomToBoundsSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (params: Common.ZoomToBoundsMessage$v1) => {
                await this.zoomToBounds(params);
            });

        mapComm.mapCommSubs.convertLatLonToPixelPointSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (mailbox: LayoutCompiler.MailBox<Common.Point$v1, Common.PixelPoint$v1>) => {
                const pixelPoint = this.convertLatLonToPixelPoint(mailbox.payload);
                mailbox.response.next(pixelPoint);
            });

        mapComm.mapCommSubs.convertPixelPointToLatLonSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (mailbox: LayoutCompiler.MailBox<Common.PixelPoint$v1, Common.Point$v1>) => {
                const latLon = this.convertPixelPointToLatLon(mailbox.payload);
                mailbox.response.next(latLon);
            });

        mapComm.mapCommSubs.setScrollWheelZoomSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (flag) => {
                await this.setScrollWheelZoom(flag);
            });

        mapComm.mapCommSubs.getLayerInfoSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (mailbox: LayoutCompiler.MailBox<string, Common.LayerInfo$v1>) => {
                const layerInfo = this.getLayerInfo(mailbox.payload);
                mailbox.response.next(layerInfo);
            });

        this.markerSubs = new Common.MarkerCommunicationSubs$v1();
        this.clusterMarkerSubs = new Common.ClusterMarkerCommunicationSubs$v1();

        this.subscribeToMarkerEvents(this.markerSubs, mapComm);
        this.subscribeToClusterMarkerEvents(this.clusterMarkerSubs, mapComm);
    }

    subscribeToMarkerEvents(markerSubs: Common.MarkerCommunicationSubs$v1, mapComm: Common.MapCommunication$v1) {

        markerSubs.updateSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (updateMarkerInfo: Common.UpdateMarkerMessage$v1) => {
                await this.updateMarker(updateMarkerInfo);
            });

        markerSubs.deleteSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (markerParams: Common.MarkerDescriptor$v1) => {
                await this.deleteMarker(markerParams);
            });

        markerSubs.setDisplayPrioritySub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (displayPriorityParams: Common.DisplayPriorityMessage$v1) => {
                await this.setDisplayPriority(displayPriorityParams);
            });

        markerSubs.zoomToSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (zoomParams: Common.ZoomMessage$v1) => {
                await this.zoomToLocation(zoomParams);
            });

        markerSubs.panToSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (markerParams: Common.MarkerDescriptor$v1) => {
                await this.panToLocation(markerParams);
            });

        markerSubs.zoomToClusterBoundsSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (mailbox: LayoutCompiler.MailBox<Common.MarkerDescriptor$v1, boolean>) => {
                const maxZoomReached = this.zoomToClusterBounds(mailbox.payload);
                mailbox.response.next(maxZoomReached);
            });

        markerSubs.notifyClusterMarkerExpandingSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (markerParams: Common.MarkerDescriptor$v1) => {
                this.fireClusterMarkerExpanding(markerParams);
            });

        markerSubs.setDraggableOptionSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (dragMsg: Common.DraggableOptionMessage$v1) => {
                this.setDraggable(dragMsg);
            });
    }

    subscribeToClusterMarkerEvents(clusterMarkerSubs: Common.ClusterMarkerCommunicationSubs$v1, mapComm: Common.MapCommunication$v1) {

        clusterMarkerSubs.setDisplayPrioritySub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (displayPriorityParams: Common.DisplayPriorityMessage$v1) => {
                await this.setDisplayPriority(displayPriorityParams);
            });

        clusterMarkerSubs.zoomToSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (zoomParams: Common.ZoomMessage$v1) => {
                await this.zoomToLocation(zoomParams);
            });

        clusterMarkerSubs.panToSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (markerParams: Common.MarkerDescriptor$v1) => {
                await this.panToLocation(markerParams);
            });

        clusterMarkerSubs.zoomToClusterBoundsSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (mailbox: LayoutCompiler.MailBox<Common.MarkerDescriptor$v1, boolean>) => {
                const maxZoomReached = this.zoomToClusterBounds(mailbox.payload);
                mailbox.response.next(maxZoomReached);
            });

        clusterMarkerSubs.notifyClusterMarkerExpandingSub.pipe(takeUntil(mapComm.mapEvents.mapCommunicationClosed$))
            .subscribe(async (markerParams: Common.MarkerDescriptor$v1) => {
                this.fireClusterMarkerExpanding(markerParams);
            });

    }

    setClusterSettingsForLayer(clusterSettingsMsg: Common.ClusterSettingsMessage$v1) {
        const layerId = this.getLayerId(clusterSettingsMsg.layerId);
        let layerGroupInfo = this.dynamicsLayerGroup;
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        }
        if (layerGroupInfo) {
            layerGroupInfo.clusterSettings = clusterSettingsMsg.clusterSettings;
            if (!clusterSettingsMsg.clusterSettings.enableClustering) {
                if (layerGroupInfo.clusterGroup) {
                    layerGroupInfo.clusterGroup.clearLayers();
                }
                layerGroupInfo.clusterGroup = null;
            } else if (clusterSettingsMsg.clusterSettings.clusterRadius) {
                const clusterGroup: any = {
                    iconCreateFunction: ((cluster) => (this.createClusterIcon(cluster, this))),
                    maxClusterRadius: clusterSettingsMsg.clusterSettings.clusterRadius,
                    spiderfyOnMaxZoom: false,
                    spiderfyDistanceMultiplier: 1,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: false,
                    animate: false,
                    disableClusteringAtZoom: null,
                    clusterPane: layerGroupInfo.paneName,
                };
                layerGroupInfo.clusterGroup = new L.MarkerClusterGroup(clusterGroup);
            }
        }
    }

    getLayerId(layerId: string): string {
        return (layerId ? layerId : DYNAMICS_LAYER_ID);
    }

    // This method is called when
    compMarkerAdded(leafletMarker: any) {
        if (leafletMarker && leafletMarker.markerInfo) {
            const markerInfo: MarkerInfo = leafletMarker.markerInfo;
            const marker = markerInfo.marker;
            const portalId = markerInfo.portalId;
            const compIcon = markerInfo.settings.iconDefinition2d.icon as Common.ComponentIcon$v1<any>;

            this.zone.run(() => {
                // console.log('Marker injected: ' + portalId);
                this.layoutCompiler.delegateInjectComponentPortalAsync(compIcon.componentName,
                    compIcon.capabilityId, portalId, marker,
                    this.mapViewContextId).catch().then((componentRef) => {
                        if (markerInfo.compRef) {
                            markerInfo.compRef.destroy();
                            markerInfo.compRef = null;
                        }
                        markerInfo.compRef = componentRef;
                    });
            });
        }

    }

    compMarkerRemoved(leafletMarker: any) {
        if (leafletMarker && leafletMarker.markerInfo &&
            leafletMarker.markerInfo.compRef) {
            // console.log('Marker component destroyed: ' + leafletMarker.markerInfo.markerId);
            leafletMarker.markerInfo.compRef.destroy();
            leafletMarker.markerInfo.compRef = null;
        }
    }

    createComponentMarkerForMap(coordinate: Common.Point$v1, size: Common.Size$v1, anchor: Common.PixelPoint$v1,
        paneName: string, zIndexOffset: number, id: string, draggable = false): any {
        const options: any = {};

        let leafletMarker;
        if (this.validateCoordinate(coordinate)) {
            const iconAnchor = anchor ? anchor : new Common.PixelPoint$v1(size.width / 2, size.height / 2);
            const mapMarkerIcon = new L.DivIcon({
                iconSize: [size.width, size.height],
                iconAnchor: [iconAnchor.x, iconAnchor.y],
                html: `<div id="${id}"></div>`,
                className: 'component-marker'
            });

            options.icon = mapMarkerIcon;
            options.pane = paneName;
            options.zIndexOffset = zIndexOffset;
            options.draggable = draggable;

            let markerId: string;
            leafletMarker = new L.Marker([coordinate.latitude, coordinate.longitude], options);

            if (leafletMarker) {
                markerId = 'leafletMarker-' + Guid.NewGuid();
                (<any>leafletMarker).id = markerId;
                leafletMarker.on('dblclick', (event) => { });
                leafletMarker.on('click', (event) => { (<any>event).originalEvent.preventDefault(); });
            }
        }
        return (leafletMarker);
    }

    createClusterIcon(leafletClusterMarker: L.MarkerCluster, mapRef: any) {
        let icon: any;
        let width = 32;
        let height = 32;
        let clusterMarkerId: string;
        let clusterPortalId: string;
        let mapLayer: Common.MapLayer$v1;
        let layerId: string;
        let divHtml: string;
        const leafletChildMarkers = leafletClusterMarker.getAllChildMarkers();

        // First get information off of the first child marker in the cluster.

        if ((<any>leafletChildMarkers[0]).markerInfo) {
            let markerInfo: MarkerInfo = (<any>leafletClusterMarker).markerInfo;
            const childMarkerInfo: MarkerInfo = (<any>leafletChildMarkers[0]).markerInfo;
            mapLayer = childMarkerInfo.mapLayer;
            layerId = childMarkerInfo.layerId;
            const layerGroupInfo = mapRef.layerGroupInfos[childMarkerInfo.layerId];
            if (layerGroupInfo) {
                mapLayer = layerGroupInfo.mapLayer;
                if (layerGroupInfo.clusterSettings.iconDefinition2d.iconSize) {
                    width = layerGroupInfo.clusterSettings.iconDefinition2d.iconSize.width;
                    height = layerGroupInfo.clusterSettings.iconDefinition2d.iconSize.height;
                }

                if (markerInfo) {
                    clusterMarkerId = markerInfo.markerId;
                    const childMarkers: Common.Marker$v1[] = [];

                    for (const leafletChildMarker of leafletChildMarkers) {
                        const info = (<any>leafletChildMarker).markerInfo;
                        if (info && info.marker) {
                            childMarkers.push(info.marker);
                        }
                    }

                    markerInfo.clusterMarker.childMarkers = childMarkers;
                    markerInfo.clusterMarker.markerSubs.childMarkersUpdatedSub.next(markerInfo.clusterMarker);
                } else {
                    // console.log('createClusterIcon: marker is new');
                    markerInfo = new MarkerInfo();
                    clusterMarkerId = 'clusterMarker-' + Guid.NewGuid();
                    clusterPortalId = '#' + clusterMarkerId;

                    markerInfo.markerId = clusterMarkerId;
                    markerInfo.portalId = clusterPortalId;
                    markerInfo.mapLayer = mapLayer;
                    markerInfo.layerId = layerId;
                    markerInfo.clusterSettings = layerGroupInfo.clusterSettings;

                    (<any>leafletClusterMarker).markerInfo = markerInfo;
                }

                const icon2d = childMarkerInfo.settings.iconDefinition2d.icon;
                if (icon2d && icon2d instanceof Common.ComponentIcon$v1) {
                    // Create the portal div for the component
                    if (childMarkerInfo.marker && icon2d.componentName) {
                        divHtml = `<div id="${clusterMarkerId}"></div>`;
                    }

                    icon = L.divIcon({
                        html: divHtml,
                        className: 'component-marker',
                        iconSize: new L.Point(width, height),
                        iconAnchor: new L.Point(width / 2, height / 2)
                    });

                } else if (icon2d && icon2d instanceof Common.ImageIcon$v1) {
                    icon = L.icon({
                        iconUrl: icon2d.url,
                        iconSize: new L.Point(width, height),
                        iconAnchor: new L.Point(width / 2, height / 2)
                    });
                } else if (icon2d && icon2d instanceof Common.HtmlIcon$v1) {
                    icon = L.divIcon({
                        html: icon2d.html,
                        iconSize: new L.Point(width, height),
                        iconAnchor: new L.Point(width / 2, height / 2)
                    });
                }
            }
            if (!icon) {
                divHtml = `<div id="${clusterMarkerId}" class="cluster-icon-default">${leafletClusterMarker.getChildCount()}</div>`;
                icon = L.divIcon({
                    html: divHtml,
                    iconSize: new L.Point(width, height),
                    iconAnchor: new L.Point(width / 2, height / 2)
                });

            }
            return (icon);
        }

        return (icon);
    }

    validateCoordinate(coord: Common.Point$v1): boolean {
        return !(Number.isNaN(coord.latitude) || Number.isNaN(coord.longitude) || Number.isNaN(coord.altitude));
    }

    compClusterMarkerAdded(leafletClusterMarker: any): Promise<void> {
        return new Promise<void>((resolve) => {
            if (leafletClusterMarker && leafletClusterMarker.markerInfo) {

                leafletClusterMarker.on('click', this.clusterMarkerClicked, this);
                leafletClusterMarker.on('dblclick', this.clusterMarkerDblClicked, this);

                const markerInfo: MarkerInfo = leafletClusterMarker.markerInfo;
                markerInfo.clustered = true;
                const childLeafletMarkers = leafletClusterMarker.getAllChildMarkers();
                let childMarkerInfo: MarkerInfo = childLeafletMarkers[0].markerInfo;
                const layerGroupInfo: LayerGroupInfo = this.layerGroupInfos[markerInfo.layerId];
                const portalId = markerInfo.portalId;
                const markerId = markerInfo.markerId;
                const icon2d = layerGroupInfo.clusterSettings.iconDefinition2d.icon as Common.ComponentIcon$v1<any>;
                // console.log(`clusterComponentLayerAdd: ${portalId}`);

                const zIndexOffset = (<any>childLeafletMarkers[0]).options.zIndexOffset;

                // Set the z index of the cluster marker to be same as the child markers
                leafletClusterMarker.setZIndexOffset(zIndexOffset);

                const childMarkers: Common.Marker$v1[] = [];

                for (const childLeafletMarker of childLeafletMarkers) {
                    childMarkerInfo = childLeafletMarker.markerInfo;
                    if (childMarkerInfo && childMarkerInfo.marker) {
                        childMarkers.push(childMarkerInfo.marker);
                    }
                }

                const latLng = leafletClusterMarker.getLatLng();
                const clusterMarker: Common.ClusterMarker$v1 = new Common.ClusterMarker$v1({
                    childMarkers: childMarkers,
                    clusterSettings: layerGroupInfo.clusterSettings,
                    markerId: markerId,
                    layerId: markerInfo.layerId,
                    markerSubs: this.clusterMarkerSubs,
                    mapComm: this.mapComm,
                    coordinate: new Common.Point$v1(latLng.lat, latLng.lng)
                } as Common.ClusterMarker$v1);

                layerGroupInfo.leafletMarkers[markerId] = leafletClusterMarker;
                layerGroupInfo.leafletClusterMarkers[markerId] = leafletClusterMarker;

                markerInfo.clusterMarker = clusterMarker;
                // console.log('Cluster comp added: ' + markerInfo.markerId);
                this.zone.run(() => {
                    // console.log('Cluster marker injected:' + portalId);
                    this.layoutCompiler.delegateInjectComponentPortalAsync(icon2d.componentName,
                        icon2d.capabilityId, portalId,
                        clusterMarker, this.mapViewContextId).catch().then((componentRef) => {
                            if (markerInfo.compRef) {
                                markerInfo.compRef.destroy();
                                markerInfo.compRef = null;
                            }
                            markerInfo.compRef = componentRef;
                            resolve();
                        });
                });
            }
        });
    }

    compClusterMarkerRemoved(leafletClusterMarker: any) {
        if (leafletClusterMarker && leafletClusterMarker.markerInfo) {
            leafletClusterMarker.off('click', this.clusterMarkerClicked, this);
            leafletClusterMarker.off('dblclick', this.clusterMarkerDblClicked, this);
            this.notifyClusterMarkerRemoved(leafletClusterMarker);
            const layerGroupInfo = this.layerGroupInfos[leafletClusterMarker.markerInfo.layerId];

            if (layerGroupInfo) {
                delete layerGroupInfo.leafletMarkers[leafletClusterMarker.markerInfo.markerId];
                delete layerGroupInfo.leafletClusterMarkers[leafletClusterMarker.markerInfo.markerId];
            }

            if (leafletClusterMarker.markerInfo.compRef) {
                // console.log('Cluster comp removed: ' + clusterMarker.markerInfo.markerId);
                // console.log('Cluster marker component destroyed:' + leafletClusterMarker.markerInfo.markerId);
                leafletClusterMarker.markerInfo.compRef.destroy();
                leafletClusterMarker.markerInfo.compRef = null;
            }
            this.changeRef.detectChanges();
        }
    }

    clusterMarkerClicked(event: any) {
        (<any>event).originalEvent.stopPropagation();
        this.deleteOverlappingMarkersListMarker();
        const markerInfo: MarkerInfo = event.target.markerInfo;
        if (markerInfo && markerInfo.clusterMarker && markerInfo.clusterMarker.markerSubs) {

            const retMarkers = this.findOverlappingMarkers(event.target);
            if (retMarkers.length > 1) {
                this.fireMapClicked(event);
                const baseMarker = retMarkers[0];
                let markerSettings: Common.MarkerSettings$v1<any>;

                const markerClicked$ = new Subject<any>();
                markerClicked$.subscribe((marker) => {
                    this.deleteOverlappingMarkersListMarker();
                    if (marker instanceof Common.Marker$v1) {
                        this.mapComm.mapEvents.subs.markerClickedSub.next(marker);
                        this.markerSubs.markerClickedSub.next(new Common.MarkerDescriptor$v1(marker.markerId, marker.layerId));
                    } else {
                        this.mapComm.mapEvents.subs.clusterMarkerClickedSub.next(marker);
                        this.clusterMarkerSubs.markerClickedSub.next(new Common.MarkerDescriptor$v1(marker.markerId, marker.layerId));
                    }
                });

                const props: any = {
                    overlappingMarkers: retMarkers,
                    mapComm: this.mapComm,
                    markerClicked$: markerClicked$
                };

                const compIcon = new Common.ComponentIcon$v1<any>({
                    componentName: Common.InjectableComponentNames.OverlappingMarkersListComponent,
                    capabilityId: Common.capabilityId

                });

                const iconDef2d = new Common.IconDefinition2d$v1({
                    icon: compIcon,
                    iconSize: baseMarker.clusterSettings.iconDefinition2d.iconSize,
                    iconAnchor: baseMarker.clusterSettings.iconDefinition2d.iconAnchor
                });
                markerSettings = new Common.MarkerSettings$v1<any>({
                    coordinate: baseMarker.coordinate,
                    iconDefinition2d: iconDef2d
                } as Common.MarkerSettings$v1<any>);

                markerSettings.properties = props;

                this.omMarker = this.addOverlappingMarkersListMarker(markerSettings);

            } else {
                this.mapComm.mapEvents.subs.clusterMarkerClickedSub.next(markerInfo.clusterMarker);
                markerInfo.clusterMarker.markerSubs.markerClickedSub.next(
                    new Common.MarkerDescriptor$v1(markerInfo.markerId, markerInfo.layerId));
            }
        }
    }

    clusterMarkerDblClicked(event: any) {
        (<any>event).originalEvent.stopPropagation();
    }

    listenForClusterEvents(markerId: string, layerId: string,
        clusterMarker: Common.ClusterMarker$v1) {

    }

    notifyClusterMarkerRemoved(clusterMarker: any) {
        if (clusterMarker.markerInfo && clusterMarker.markerInfo.marker) {
            const marker: Common.ClusterMarker$v1 = clusterMarker.markerInfo.marker;

            marker.markerSubs.markerRemovedSub.next(
                new Common.MarkerDescriptor$v1(clusterMarker.markerInfo.markerId, clusterMarker.markerInfo.layerId));
        }
    }

    bringClusterMarkerToTop(markerId, layerId) {
        let clusterMarker: L.Marker;
        if (layerId) {
            const layerGroupInfo: LayerGroupInfo = this.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                clusterMarker = layerGroupInfo.leafletClusterMarkers[markerId];
                if (clusterMarker) {
                    clusterMarker.setZIndexOffset(this.bringToTopZ);
                    this.changeRef.detectChanges();
                }
            }
        }
    }

    sendClusterMarkerBackToOriginal(markerId, layerId) {
        if (layerId) {
            const layerGroupInfo: LayerGroupInfo = this.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                const clusterMarker: L.Marker = layerGroupInfo.leafletClusterMarkers[markerId];
                if (clusterMarker) {
                    clusterMarker.setZIndexOffset(layerGroupInfo.zIndexOffset);
                    this.changeRef.detectChanges();
                }
            }
        }
    }

    zoomToClusterBounds(markerParams: Common.MarkerDescriptor$v1): boolean {
        let maxZoomReached = false;
        const curZoom = this.map.getZoom();
        const markerId = markerParams.markerId;
        const layerId = this.getLayerId(markerParams.layerId);
        if (layerId) {
            const layerGroupInfo: LayerGroupInfo = this.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                const clusterMarker: any = layerGroupInfo.leafletClusterMarkers[markerId];
                if (clusterMarker) {
                    const bnds = clusterMarker.getBounds();
                    const bndsZoom = this.map.getBoundsZoom(bnds);
                    if (bndsZoom <= curZoom) {
                        maxZoomReached = true;
                    } else {
                        clusterMarker.zoomToBounds();
                        const newZoom = this.map.getZoom();
                    }
                }
            }
        }

        return (maxZoomReached);
    }


    addMarkers(addParams: Common.AddMarkerMessage$v1): Promise<Common.Marker$v1 | Common.Marker$v1[]> {
        return new Promise<Common.Marker$v1 | Common.Marker$v1[]>((resolve) => {
            if (Object.prototype.toString.call(addParams.markerSettings) === '[object Array]') {

                // console.log('Add markers');
                const markerSettingsList: Common.MarkerSettings$v1<any>[] =
                    <Common.MarkerSettings$v1<any>[]>addParams.markerSettings;

                // console.log(`addComponentMarkers - Marker count: ${compMarkerSettingsList.length}`);

                const layerId = this.getLayerId(addParams.layerId);
                let layerGroupInfo = this.dynamicsLayerGroup;
                if (layerId) {
                    layerGroupInfo = this.layerGroupInfos[layerId];
                }

                const retMarkers: Common.Marker$v1[] = [];
                let retMarker: Common.Marker$v1;

                if (layerGroupInfo) {
                    const leafletMarkers: any = [];
                    for (const markerSettings of markerSettingsList) {
                        const markerId = 'marker-' + this.mapCoreSvc.newGuid();
                        let leafletMarker: any;
                        let markerType: MarkerType;
                        if (markerSettings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1) {
                            leafletMarker = this.createComponentMarkerForMap(markerSettings.coordinate,
                                markerSettings.iconDefinition2d.iconSize, markerSettings.iconDefinition2d.iconAnchor,
                                layerGroupInfo.paneName, layerGroupInfo.zIndexOffset, markerId,
                                markerSettings.draggable);
                            markerType = MarkerType.Component;
                        }

                        if (leafletMarker) {
                            const portalId = '#' + markerId;
                            leafletMarker.on('click', this.compMarkerClicked, this);
                            leafletMarker.on('dblclick', this.compMarkerDblClicked, this);
                            leafletMarker.on('dragstart', this.markerDragStarted, this);
                            leafletMarker.on('dragend', this.markerDragEnded, this);

                            retMarker = new Common.Marker$v1({
                                markerSettings: markerSettings,
                                markerSubs: this.markerSubs,
                                coordinate: markerSettings.coordinate,
                                markerId: markerId,
                                layerId: layerId,
                                mapComm: this.mapComm,
                                displayPriority: markerSettings.displayPriority,
                            } as Common.Marker$v1);

                            retMarkers.push(retMarker);

                            const markerInfo = new MarkerInfo({
                                settings: markerSettings,
                                markerId: markerId,
                                layerId: layerId,
                                mapLayer: layerGroupInfo.mapLayer,
                                portalId: portalId,
                                marker: retMarker,
                                displayPriority: markerSettings.displayPriority,
                                type: markerType
                            } as MarkerInfo);

                            leafletMarker.markerInfo = markerInfo;

                            layerGroupInfo.leafletMarkers[markerId] = leafletMarker;
                            if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                                layerGroupInfo.displayedOnMap = true;
                                if (markerSettings.addToCluster && layerGroupInfo.clusterSettings.enableClustering) {
                                    leafletMarkers.push(leafletMarker);
                                } else {
                                    layerGroupInfo.featureGroup.addLayer(leafletMarker);
                                }
                            }
                        }
                    }

                    if (leafletMarkers.length > 0) {
                        layerGroupInfo.clusterGroup.addLayers(leafletMarkers);
                    }
                    this.changeRef.detectChanges();
                    resolve(retMarkers);
                }
            } else {
                resolve(this.addMarker(<Common.MarkerSettings$v1<any>>addParams.markerSettings,
                    addParams.layerId));
            }

        });
    }

    addMarker(markerSettings: Common.MarkerSettings$v1<any>, layerId: string): Promise<Common.Marker$v1> {
        return new Promise<Common.Marker$v1>(async (resolve) => {
            // console.log('add component marker');
            let layerGroupInfo = this.dynamicsLayerGroup;
            if (layerId) {
                layerGroupInfo = this.layerGroupInfos[layerId];
            }

            let retMarker: Common.Marker$v1;
            let markerId;

            if (layerGroupInfo) {

                markerId = 'marker-' + this.mapCoreSvc.newGuid();
                let leafletMarker: any;
                let markerType: MarkerType;
                if (markerSettings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1) {
                    leafletMarker = this.createComponentMarkerForMap(markerSettings.coordinate, markerSettings.iconDefinition2d.iconSize,
                        markerSettings.iconDefinition2d.iconAnchor, layerGroupInfo.paneName, layerGroupInfo.zIndexOffset, markerId,
                        markerSettings.draggable);
                    markerType = MarkerType.Component;
                }
                if (leafletMarker) {
                    const portalId = '#' + markerId;
                    leafletMarker.on('click', this.compMarkerClicked, this);
                    leafletMarker.on('dblclick', this.compMarkerDblClicked, this);
                    leafletMarker.on('dragstart', this.markerDragStarted, this);
                    leafletMarker.on('dragend', this.markerDragEnded, this);

                    retMarker = new Common.Marker$v1({
                        markerSettings: markerSettings,
                        markerSubs: this.markerSubs,
                        coordinate: markerSettings.coordinate,
                        markerId: markerId,
                        layerId: layerId,
                        displayPriority: markerSettings.displayPriority,
                        mapComm: this.mapComm
                    } as Common.Marker$v1);

                    const markerInfo = new MarkerInfo({
                        settings: markerSettings,
                        markerId: markerId,
                        layerId: layerId,
                        mapLayer: layerGroupInfo.mapLayer,
                        portalId: portalId,
                        marker: retMarker,
                        displayPriority: markerSettings.displayPriority,
                        type: markerType
                    } as MarkerInfo);

                    leafletMarker.markerInfo = markerInfo;

                    layerGroupInfo.leafletMarkers[markerId] = leafletMarker;

                    if (markerSettings.displayPriority === this.DispPriority.Top) {
                        leafletMarker.setZIndexOffset(this.bringToTopZ);
                    }

                    if (markerSettings.displayPriority === this.DispPriority.Focused) {
                        const offset = this.focusZ + Object.keys(layerGroupInfo.focusedMarkers).length;
                        leafletMarker.markerInfo.focusedZIndexOffset = offset;
                        leafletMarker.setZIndexOffset(offset);
                        layerGroupInfo.focusedMarkers[markerId] = leafletMarker;
                        if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                            layerGroupInfo.focusedFeatureGroup.addLayer(leafletMarker);
                        }
                    } else if (markerSettings.addToCluster && this.isLayerBeingDisplayed(layerGroupInfo)) {
                        layerGroupInfo.clusterGroup.addLayer(leafletMarker);
                        // The parent will either be the marker itself or a cluster marker.  If a cluster marker, it will
                        // need to be updated to have the cluster icon injected if the number of child markers in the group is
                        // greater than 2.
                        const parent: any = layerGroupInfo.clusterGroup.getVisibleParent(leafletMarker);
                        if (parent && parent.markerInfo && parent.markerInfo.clustered) {
                            const childMarkers = parent.getAllChildMarkers();
                            if (childMarkers.length > 2) {
                                // if (parent.markerInfo.compRef) {
                                //     parent.markerInfo.compRef.destroy();
                                //     parent.markerInfo.compRef = null;
                                // }
                                await this.compClusterMarkerAdded(parent);
                            }
                        }
                    } else if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                        layerGroupInfo.featureGroup.addLayer(leafletMarker);
                        layerGroupInfo.displayedOnMap = true;
                    }

                    this.changeRef.detectChanges();
                }
            }
            // console.log('Add marker resolve - ' + markerId);
            resolve(retMarker);
        });
    }


    updateMarker(updateInfo: Common.UpdateMarkerMessage$v1): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const layerId = this.getLayerId(updateInfo.markerDescriptor.layerId);
            const markerId = updateInfo.markerDescriptor.markerId;

            // console.log('update marker - ' + markerId);

            let layerGroupInfo: LayerGroupInfo = this.dynamicsLayerGroup;
            if (layerId) {
                layerGroupInfo = this.layerGroupInfos[layerId];
            }

            if (layerGroupInfo) {
                const leafletMarker = layerGroupInfo.leafletMarkers[markerId];
                if (leafletMarker && leafletMarker.markerInfo && this.validateCoordinate(updateInfo.coordinate)) {
                    const markerInfo: MarkerInfo = leafletMarker.markerInfo;
                    const marker = leafletMarker.markerInfo.marker;
                    marker.coordinate = updateInfo.coordinate;
                    // console.log('update marker incident id - ' + markerInfo.settings.properties.incidentId);
                    const newLatLng = new L.LatLng(updateInfo.coordinate.latitude, updateInfo.coordinate.longitude,
                        updateInfo.coordinate.altitude);
                    const curLatLng = leafletMarker.getLatLng();

                    let parentBefore: any;
                    let parentAfter: any;
                    let childMarkersBefore = [];
                    if (newLatLng.lat !== curLatLng.lat || newLatLng.lng !== curLatLng.lng) {
                        if (markerInfo.settings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1 &&
                            layerGroupInfo.clusterSettings.enableClustering && markerInfo.settings.addToCluster) {
                            if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                                parentBefore = layerGroupInfo.clusterGroup.getVisibleParent(leafletMarker);
                                if (parentBefore && parentBefore.markerInfo && parentBefore.markerInfo.clustered) {
                                    childMarkersBefore = parentBefore.getAllChildMarkers();
                                }
                            }

                            leafletMarker.setLatLng(newLatLng);

                            if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                                parentAfter = layerGroupInfo.clusterGroup.getVisibleParent(leafletMarker);

                                if (parentBefore !== parentAfter) {
                                    if (parentBefore && parentBefore.markerInfo && childMarkersBefore.length > 2 &&
                                        parentBefore.markerInfo.compRef) {
                                        // parentBefore.markerInfo.compRef.destroy();
                                        // parentBefore.markerInfo.compRef = null;
                                        await this.compClusterMarkerAdded(parentBefore);
                                    }

                                    if (parentAfter && parentAfter.markerInfo
                                        && parentAfter.markerInfo.clustered) {
                                        const childMarkers = parentAfter.getAllChildMarkers();
                                        if (childMarkers.length > 2 && parentAfter.markerInfo.compRef) {
                                            // parentAfter.markerInfo.compRef.destroy();
                                            // parentAfter.markerInfo.compRef = null;
                                            await this.compClusterMarkerAdded(parentAfter);
                                        }
                                    }
                                } else if (parentBefore && parentBefore.markerInfo &&
                                    parentBefore.markerInfo.clustered &&
                                    parentBefore.markerInfo.compRef) {
                                    // parentBefore.markerInfo.compRef.destroy();
                                    // parentBefore.markerInfo.compRef = null;
                                    await this.compClusterMarkerAdded(parentBefore);
                                }
                            }
                        } else {
                            leafletMarker.setLatLng(newLatLng);
                        }
                        marker.coordinate = updateInfo.coordinate;

                    }

                    const focusedLeafletMarker = layerGroupInfo.focusedMarkers[markerId];
                    if (focusedLeafletMarker) {
                        const latLng = new L.LatLng(updateInfo.coordinate.latitude, updateInfo.coordinate.longitude,
                            updateInfo.coordinate.altitude);
                        focusedLeafletMarker.setLatLng(latLng);
                        focusedLeafletMarker.markerInfo.marker.coordinate = updateInfo.coordinate;
                    }
                }
            }
            // console.log('update marker resolve - ' + markerId);
            resolve();
        });
    }

    deleteMarker(markerParams: Common.MarkerDescriptor$v1): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const markerId = markerParams.markerId;
            const layerId = this.getLayerId(markerParams.layerId);
            // console.log('delete marker - ' + markerId);
            let layerGroupInfo = this.dynamicsLayerGroup;
            if (layerId) {
                layerGroupInfo = this.layerGroupInfos[layerId];
            }
            if (layerGroupInfo) {
                const leafletMarker = layerGroupInfo.leafletMarkers[markerId];
                if (leafletMarker && leafletMarker.markerInfo) {
                    // if (leafletMarker.markerInfo.settings.properties.incidentId) {
                    //     console.log('delete marker - ' + markerId + ' incident id - ' +
                    //          leafletMarker.markerInfo.settings.properties.incidentId);
                    // } else {
                    //     console.log('delete marker - ' + markerId + ' No incident id ');
                    // }
                    // console.log('Map-Delete marker: ' + leafletMarker.markerInfo.markerId);
                    leafletMarker.off('click', this.compMarkerClicked, this);
                    leafletMarker.off('dblclick', this.compMarkerDblClicked, this);
                    leafletMarker.off('dragstart', this.markerDragStarted, this);
                    leafletMarker.off('dragend', this.markerDragEnded, this);
                    const markerInfo: MarkerInfo = leafletMarker.markerInfo;
                    if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                        if (markerInfo.settings.addToCluster && layerGroupInfo.clusterSettings.enableClustering) {
                            if (markerInfo.settings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1) {
                                const parent: any = layerGroupInfo.clusterGroup.getVisibleParent(leafletMarker);
                                let childMarkers = [];
                                if (parent && parent.markerInfo && parent.markerInfo.clustered) {
                                    childMarkers = parent.getAllChildMarkers();
                                }

                                layerGroupInfo.clusterGroup.removeLayer(leafletMarker);
                                this.shutdownComponentEvents(leafletMarker);

                                if (parent && parent.markerInfo) {
                                    if (childMarkers.length > 2 && parent.markerInfo.compRef) {
                                        // parent.markerInfo.compRef.destroy();
                                        // parent.markerInfo.compRef = null;
                                        await this.compClusterMarkerAdded(parent);
                                    }
                                }
                            } else {
                                layerGroupInfo.clusterGroup.removeLayer(leafletMarker);
                                this.shutdownComponentEvents(leafletMarker);
                            }

                        } else {
                            layerGroupInfo.featureGroup.removeLayer(leafletMarker);
                            this.shutdownComponentEvents(leafletMarker);
                        }
                    }

                    delete layerGroupInfo.leafletMarkers[markerId];

                    const focusedMarker = layerGroupInfo.focusedMarkers[markerId];
                    if (focusedMarker) {
                        if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                            layerGroupInfo.focusedFeatureGroup.removeLayer(focusedMarker);
                        }
                        delete layerGroupInfo.focusedMarkers[markerId];
                    }
                    this.changeRef.detectChanges();
                }
            }

            // console.log('delete marker resolve - ' + markerId);
            resolve();

        });
    }

    async deleteAllMarkers(layerId: string) {
        // console.log('Delete all markers');
        this.deleteOverlappingMarkersListMarker();
        const mapLayers = this.mapPreset.mapLayers;
        const mapLayer = mapLayers.find(layer => layer.id === layerId);
        if (mapLayer) {
            const layerGroupInfo: LayerGroupInfo = this.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                layerGroupInfo.focusedFeatureGroup.clearLayers();
                layerGroupInfo.clusterGroup.clearLayers();

                // Remove the layer from the leaflet layers array.
                if (layerGroupInfo.loaded) {
                    let index;
                    const clusterGroup = this.leafletDataLayers.find((layer, idx) => {
                        index = idx;
                        return (layer.groupInfo && layer.groupInfo.mapLayer && layer.groupInfo.type === 'clusterGroup' &&
                            layer.groupInfo.mapLayer.id === layerId);
                    });
                    if (clusterGroup) {
                        this.leafletDataLayers.splice(index, 1);
                        layerGroupInfo.loaded = false;
                    }
                }

                layerGroupInfo.leafletMarkers = {};
                layerGroupInfo.focusedMarkers = {};
                this.changeRef.detectChanges();
            }
        }
    }

    addOverlappingMarkersListMarker(markerSettings: Common.MarkerSettings$v1<any>): Common.Marker$v1 {
        // console.log('add component marker');
        const layerGroupInfo = this.dynamicsLayerGroup;

        let retMarker: Common.Marker$v1;

        if (layerGroupInfo) {
            const markerId = 'omlist-' + this.mapCoreSvc.newGuid();
            let leafletMarker: any;
            let markerType: MarkerType;
            if (markerSettings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1) {
                leafletMarker = this.createComponentMarkerForMap(markerSettings.coordinate, markerSettings.iconDefinition2d.iconSize,
                    markerSettings.iconDefinition2d.iconAnchor, layerGroupInfo.paneName, layerGroupInfo.zIndexOffset, markerId,
                    markerSettings.draggable);
                markerType = MarkerType.Component;
            }
            if (leafletMarker) {
                const portalId = '#' + markerId;
                leafletMarker.on('click', this.omListMarkerClicked, this);

                retMarker = new Common.Marker$v1({
                    markerSettings: markerSettings,
                    markerSubs: this.markerSubs,
                    coordinate: markerSettings.coordinate,
                    markerId: markerId,
                    layerId: DYNAMICS_LAYER_ID,
                    displayPriority: Common.DisplayPriority$v1.Normal,
                    mapComm: this.mapComm
                } as Common.Marker$v1);

                const markerInfo = new MarkerInfo({
                    settings: markerSettings,
                    markerId: markerId,
                    layerId: DYNAMICS_LAYER_ID,
                    mapLayer: layerGroupInfo.mapLayer,
                    portalId: portalId,
                    marker: retMarker,
                    displayPriority: Common.DisplayPriority$v1.Normal,
                    type: markerType
                } as MarkerInfo);

                leafletMarker.markerInfo = markerInfo;

                layerGroupInfo.leafletMarkers[markerId] = leafletMarker;
                layerGroupInfo.featureGroup.addLayer(leafletMarker);
                layerGroupInfo.displayedOnMap = true;

                this.changeRef.detectChanges();
            }
        }

        return (retMarker);
    }

    deleteOverlappingMarkersListMarker() {
        if (this.omMarker) {
            this.omMarker.markerSettings.properties.markerClicked$.complete();

            const leafletMarker = this.dynamicsLayerGroup.leafletMarkers[this.omMarker.markerId];
            if (leafletMarker) {
                this.dynamicsLayerGroup.featureGroup.removeLayer(leafletMarker);
                delete this.dynamicsLayerGroup.leafletMarkers[this.omMarker.markerId];
            }
            this.omMarker = null;
        }
    }
    isLayerBeingDisplayed(layerGroupInfo: LayerGroupInfo) {
        if (layerGroupInfo.layerId === DYNAMICS_LAYER_ID) {
            return (true);
        } else {
            return (layerGroupInfo.mapLayer.shownOnStartup && this.isMapLayerDisplayedForZoom(layerGroupInfo.mapLayer));
        }
    }

    omListMarkerClicked(event: any) {
        // console.log ('OMListMarkerClicked');
        this.deleteOverlappingMarkersListMarker();
    }

    compMarkerClicked(event: any) {
        event.originalEvent.stopPropagation();
        this.deleteOverlappingMarkersListMarker();
        const markerInfo: MarkerInfo = event.target.markerInfo;
        if (markerInfo && markerInfo.marker && markerInfo.marker.markerSubs) {
            const layerInfo: LayerGroupInfo = this.layerGroupInfos[markerInfo.layerId];
            if (layerInfo && layerInfo.focusedFeatureGroup) {
                if (layerInfo.focusedFeatureGroup.hasLayer(event.target)) {
                    this.mapComm.mapEvents.subs.markerClickedSub.next(markerInfo.marker);
                    markerInfo.marker.markerSubs.markerClickedSub.next(
                        new Common.MarkerDescriptor$v1(markerInfo.markerId, markerInfo.layerId));
                } else {
                    const retMarkers = this.findOverlappingMarkers(event.target);
                    if (retMarkers.length > 1) {
                        this.fireMapClicked(event);
                        const baseMarker = retMarkers[0];
                        let markerSettings: Common.MarkerSettings$v1<any>;

                        const markerClicked$ = new Subject<any>();
                        markerClicked$.subscribe((marker) => {
                            this.deleteOverlappingMarkersListMarker();
                            const markerDesc = new Common.MarkerDescriptor$v1(marker.markerId, marker.layerId);
                            if (marker instanceof Common.Marker$v1) {
                                this.mapComm.mapEvents.subs.markerClickedSub.next(marker);
                                this.markerSubs.markerClickedSub.next(markerDesc);
                            } else {
                                this.mapComm.mapEvents.subs.clusterMarkerClickedSub.next(marker);
                                this.clusterMarkerSubs.markerClickedSub.next(markerDesc);
                            }
                        });

                        const props: any = {
                            overlappingMarkers: retMarkers,
                            mapComm: this.mapComm,
                            markerClicked$: markerClicked$
                        };

                        const compIcon = new Common.ComponentIcon$v1<any>({
                            componentName: Common.InjectableComponentNames.OverlappingMarkersListComponent,
                            capabilityId: Common.capabilityId
                        });

                        const iconDef2d = new Common.IconDefinition2d$v1({
                            icon: compIcon,
                            iconSize: baseMarker.markerSettings.iconDefinition2d.iconSize,
                            iconAnchor: baseMarker.markerSettings.iconDefinition2d.iconAnchor
                        });
                        markerSettings = new Common.MarkerSettings$v1<any>({
                            coordinate: baseMarker.coordinate,
                            iconDefinition2d: iconDef2d
                        } as Common.MarkerSettings$v1<any>);

                        markerSettings.properties = props;

                        this.omMarker = this.addOverlappingMarkersListMarker(markerSettings);
                    } else {
                        this.mapComm.mapEvents.subs.markerClickedSub.next(markerInfo.marker);
                        markerInfo.marker.markerSubs.markerClickedSub.next(
                            new Common.MarkerDescriptor$v1(markerInfo.markerId, markerInfo.layerId));
                    }
                }
            }
        }
    }

    compMarkerDblClicked(event: any) {
        event.originalEvent.stopPropagation();
    }

    markerClicked(event: any) {
        event.originalEvent.stopPropagation();
    }

    markerDblClicked(event: any) {
        event.originalEvent.stopPropagation();
    }

    markerDragStarted(event: any) {
        this.dragging = true;
        const markerInfo: MarkerInfo = event.target.markerInfo;
        if (markerInfo && markerInfo.marker && markerInfo.marker.markerSubs) {
            const markerDescriptor = new Common.MarkerDescriptor$v1(markerInfo.markerId, markerInfo.layerId);
            this.mapComm.mapEvents.subs.markerDragStartedSub.next(markerDescriptor);
        }
    }

    markerDragEnded(event: any) {
        this.dragging = false;
        const marker = event.target;
        const markerInfo: MarkerInfo = marker.markerInfo;

        const layerId = this.getLayerId(markerInfo.layerId);
        let layerGroupInfo = this.dynamicsLayerGroup;
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        }

        setTimeout(async () => {
            let parent: any;
            if (layerGroupInfo) {
                if (markerInfo && markerInfo.marker && markerInfo.marker.markerSubs) {
                    parent = layerGroupInfo.clusterGroup.getVisibleParent(marker);
                    if (parent && parent.markerInfo
                        && parent.markerInfo.clustered) {
                        const childMarkers = parent.getAllChildMarkers();
                        if (childMarkers.length > 2 && parent.markerInfo.compRef) {
                            // parent.markerInfo.compRef.destroy();
                            // parent.markerInfo.compRef = null;
                            await this.compClusterMarkerAdded(parent);
                        }
                    }
                    const updateMsg = new Common.UpdateMarkerMessage$v1();
                    const latLng = event.target.getLatLng();
                    updateMsg.markerDescriptor = new Common.MarkerDescriptor$v1(markerInfo.markerId, markerInfo.layerId);
                    const pt = new Common.Point$v1(latLng.lat, latLng.lng, 0.0);
                    updateMsg.coordinate = pt;
                    this.mapComm.mapEvents.subs.markerDragEndedSub.next(updateMsg.markerDescriptor);
                    markerInfo.marker.markerSubs.locationChangedSub.next(updateMsg);
                }
            }
        }, 100);
    }

    setScrollWheelZoom(flag: boolean) {
        return (new Promise<void>((resolve) => {
            if (flag) {
                this.map.scrollWheelZoom.enable();
            } else {
                this.map.scrollWheelZoom.disable();
            }

            resolve();
        }));
    }

    shutdownComponentEvents(leafletMarker: any) {
        if (leafletMarker.markerInfo && leafletMarker.markerInfo.marker) {
            const marker: Common.Marker$v1 = leafletMarker.markerInfo.marker;

            marker.markerSubs.markerRemovedSub.next(new Common.MarkerDescriptor$v1(marker.markerId, marker.layerId));
        }
    }

    setDisplayPriority(params: Common.DisplayPriorityMessage$v1) {
        if (this.dragging) {
            return;
        }

        switch (params.displayPriority) {
            case Common.DisplayPriority$v1.Normal: {
                this.sendBackToOriginal(params.markerDescriptor.markerId, params.markerDescriptor.layerId);
                break;
            }
            case Common.DisplayPriority$v1.Top: {
                this.bringToTop(params.markerDescriptor.markerId, params.markerDescriptor.layerId);
                break;
            }
            case Common.DisplayPriority$v1.Focused: {
                this.addMarkerToFocusLayer(params.markerDescriptor.markerId, params.markerDescriptor.layerId, params.disableAutoPanOnFocus);
                break;
            }
        }
    }

    bringToTop(markerId: string, layerId: string) {
        let leafletMarker: any;
        let layerGroupInfo: LayerGroupInfo;
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        } else {
            layerGroupInfo = this.dynamicsLayerGroup;
        }
        if (layerGroupInfo) {
            leafletMarker = layerGroupInfo.leafletMarkers[markerId];
            if (leafletMarker && leafletMarker.markerInfo) {
                const markerInfo: MarkerInfo = leafletMarker.markerInfo;
                markerInfo.displayPriority = this.DispPriority.Top;
                if (markerInfo.marker) {
                    markerInfo.marker.displayPriority = this.DispPriority.Top;
                }
                if (layerGroupInfo.focusedMarkers[markerId]) {
                    leafletMarker.setZIndexOffset(this.focusZ + Object.keys(layerGroupInfo.focusedMarkers).length);
                    this.changeRef.detectChanges();
                } else {
                    leafletMarker.setZIndexOffset(this.bringToTopZ);
                    this.changeRef.detectChanges();
                }

                const dispPriorityMsg = new Common.DisplayPriorityMessage$v1({
                    markerDescriptor: new Common.MarkerDescriptor$v1(markerId, layerId),
                    displayPriority: Common.DisplayPriority$v1.Top
                } as Common.DisplayPriorityMessage$v1);

                this.fireMarkerDisplayPriorityChanged(dispPriorityMsg);
            }
        }
    }

    sendBackToOriginal(markerId: string, layerId: string) {
        let layerGroupInfo: LayerGroupInfo;
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        } else {
            layerGroupInfo = this.dynamicsLayerGroup;
        }

        if (layerGroupInfo) {
            const leafletMarker: any = layerGroupInfo.leafletMarkers[markerId];
            if (leafletMarker && leafletMarker.markerInfo) {
                const markerInfo: MarkerInfo = leafletMarker.markerInfo;
                if (markerInfo.displayPriority === Common.DisplayPriority$v1.Focused) {
                    this.removeMarkerFromFocusLayer(markerId, layerId);
                } else {
                    leafletMarker.setZIndexOffset(layerGroupInfo.zIndexOffset);
                    if (markerInfo.marker) {
                        markerInfo.displayPriority = this.DispPriority.Normal;

                        const dispPriorityMsg = new Common.DisplayPriorityMessage$v1({
                            markerDescriptor: new Common.MarkerDescriptor$v1(markerId, layerId),
                            displayPriority: Common.DisplayPriority$v1.Normal
                        } as Common.DisplayPriorityMessage$v1);
                        this.fireMarkerDisplayPriorityChanged(dispPriorityMsg);
                    }
                    this.changeRef.detectChanges();
                }
            }
        }
    }

    addMarkerToFocusLayer(markerId, layerId, disableAutoPan: boolean) {
        let leafletMarker: any;
        let layerGroupInfo = this.layerGroupInfos[layerId];
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        }

        this.deleteOverlappingMarkersListMarker();

        if (layerGroupInfo) {
            if (!layerGroupInfo.focusedMarkers[markerId]) {
                leafletMarker = layerGroupInfo.leafletMarkers[markerId];
                if (leafletMarker && leafletMarker.markerInfo) {
                    const markerInfo: MarkerInfo = leafletMarker.markerInfo;
                    markerInfo.displayPriority = this.DispPriority.Focused;
                    if (markerInfo.marker) {
                        markerInfo.marker.displayPriority = this.DispPriority.Focused;
                    }

                    if (markerInfo.settings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1 &&
                        markerInfo.settings.addToCluster &&
                        layerGroupInfo.clusterSettings.enableClustering &&
                        this.isLayerBeingDisplayed(layerGroupInfo)) {

                        const clusterGroup = layerGroupInfo.clusterGroup;
                        const parent: any = layerGroupInfo.clusterGroup.getVisibleParent(leafletMarker);
                        let childMarkers;
                        if (parent && parent.markerInfo && parent.markerInfo.clustered) {
                            childMarkers = parent.getAllChildMarkers();
                            clusterGroup.removeLayer(leafletMarker);
                            if (childMarkers.length > 2 && parent.markerInfo.compRef) {
                                // parent.markerInfo.compRef.destroy();
                                // parent.markerInfo.compRef = null;
                                this.compClusterMarkerAdded(parent);
                            }
                        } else {
                            clusterGroup.removeLayer(leafletMarker);
                        }
                    }

                    const offset = this.focusZ + Object.keys(layerGroupInfo.focusedMarkers).length;
                    markerInfo.focusedZIndexOffset = offset;
                    leafletMarker.setZIndexOffset(offset);
                    layerGroupInfo.focusedMarkers[markerId] = leafletMarker;

                    if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                        layerGroupInfo.focusedFeatureGroup.addLayer(leafletMarker);
                    }

                    const dispPriorityMsg = new Common.DisplayPriorityMessage$v1({
                        markerDescriptor: new Common.MarkerDescriptor$v1(markerId, layerId),
                        displayPriority: Common.DisplayPriority$v1.Focused
                    } as Common.DisplayPriorityMessage$v1);
                    this.fireMarkerDisplayPriorityChanged(dispPriorityMsg);

                    if (!disableAutoPan && this.isLayerBeingDisplayed(layerGroupInfo)) {
                        const bnds = this.map.getBounds().pad(-.15);
                        if (!bnds.contains(leafletMarker.getLatLng())) {
                            this.map.panTo(leafletMarker.getLatLng());
                        }
                    }
                }
            }
        }
    }

    removeMarkerFromFocusLayer(markerId: string, layerId: string) {
        let layerGroupInfo = this.dynamicsLayerGroup;
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        }
        if (layerGroupInfo) {
            const leafletMarker: any = layerGroupInfo.leafletMarkers[markerId];
            if (leafletMarker && leafletMarker.markerInfo) {
                const markerInfo: MarkerInfo = leafletMarker.markerInfo;
                markerInfo.displayPriority = this.DispPriority.Normal;
                if (markerInfo.marker) {
                    markerInfo.marker.displayPriority = this.DispPriority.Normal;
                }
                if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                    layerGroupInfo.focusedFeatureGroup.removeLayer(leafletMarker);
                }
                delete layerGroupInfo.focusedMarkers[markerId];
                leafletMarker.setZIndexOffset(layerGroupInfo.zIndexOffset);

                if (markerInfo.settings.iconDefinition2d.icon instanceof Common.ComponentIcon$v1 &&
                    leafletMarker.markerInfo.settings.addToCluster &&
                    layerGroupInfo.clusterSettings.enableClustering &&
                    this.isLayerBeingDisplayed(layerGroupInfo)) {

                    const clusterGroup = layerGroupInfo.clusterGroup;
                    clusterGroup.addLayer(leafletMarker);
                    // The parent will either be the marker itself or a cluster marker.  If a cluster marker, it will
                    // need to be updated to have the cluster icon injected if the number of child markers in the group is
                    // greater than 2.
                    const parent: any = layerGroupInfo.clusterGroup.getVisibleParent(leafletMarker);
                    if (parent && parent.markerInfo && parent.markerInfo.clustered) {
                        const childMarkers = parent.getAllChildMarkers();
                        if (childMarkers.length > 2 && parent.markerInfo.compRef) {
                            // parent.markerInfo.compRef.destroy();
                            // parent.markerInfo.compRef = null;
                            this.compClusterMarkerAdded(parent);
                        }
                    }
                }

                const dispPriorityMsg = new Common.DisplayPriorityMessage$v1({
                    markerDescriptor: new Common.MarkerDescriptor$v1(markerId, layerId),
                    displayPriority: Common.DisplayPriority$v1.Normal
                } as Common.DisplayPriorityMessage$v1);

                this.fireMarkerDisplayPriorityChanged(dispPriorityMsg);
            }
        }
    }

    zoomToLocation(zoomParams: Common.ZoomMessage$v1) {
        const markerId = zoomParams.markerDescriptor.markerId;
        const layerId = this.getLayerId(zoomParams.markerDescriptor.layerId);
        let layerGroupInfo = this.dynamicsLayerGroup;
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        }
        if (layerGroupInfo) {
            const leafletMarker: L.Marker = layerGroupInfo.leafletMarkers[markerId];
            if (leafletMarker) {
                const latLng = leafletMarker.getLatLng();
                if (latLng) {
                    this.map.setView(latLng, zoomParams.zoomLevel);
                    this.changeRef.detectChanges();
                }
            }
        }
    }

    panToLocation(markerParams: Common.MarkerDescriptor$v1) {
        const markerId = markerParams.markerId;
        const layerId = this.getLayerId(markerParams.layerId);
        let layerGroupInfo = this.dynamicsLayerGroup;
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        }
        if (layerGroupInfo) {
            const leafletMarker: L.Marker = layerGroupInfo.leafletMarkers[markerParams.markerId];
            if (leafletMarker) {
                const latLng = leafletMarker.getLatLng();
                if (latLng) {
                    this.map.panTo(latLng);
                }
            }
        }
    }

    setDraggable(draggableParams: Common.DraggableOptionMessage$v1) {
        const markerId = draggableParams.markerDescriptor.markerId;
        const layerId = this.getLayerId(draggableParams.markerDescriptor.layerId);
        let layerGroupInfo = this.dynamicsLayerGroup;
        if (layerId) {
            layerGroupInfo = this.layerGroupInfos[layerId];
        }
        if (layerGroupInfo) {
            const leafletMarker: L.Marker = layerGroupInfo.leafletMarkers[markerId];
            if (leafletMarker) {
                leafletMarker.options.draggable = draggableParams.draggable;

                if (!draggableParams.draggable && leafletMarker.dragging) {
                    leafletMarker.dragging.disable();
                } else if (draggableParams.draggable && leafletMarker.dragging) {
                    leafletMarker.dragging.enable();
                }
            }
        }
    }

    fireMapClicked(event) {

        this.selectionSvc.clearSelection();
        this.deleteOverlappingMarkersListMarker();
        this.layerPropsCmdClose(true);
        const pt = new Common.Point$v1(event.latlng.lat, event.latlng.lng);
        this.mapComm.mapEvents.subs.mapClickedSub.next(pt);
        this.closeLayerPanel();
    }

    fireClusterMarkerExpanding(markerParams: Common.MarkerDescriptor$v1) {
        this.deleteOverlappingMarkersListMarker();
        this.mapComm.mapEvents.subs.clusterMarkerExpandingSub.next(markerParams);
    }

    fireMarkerDisplayPriorityChanged(dispPriorityMsg: Common.DisplayPriorityMessage$v1) {
        this.mapComm.mapEvents.subs.markerDisplayPriorityChangedSub.next(dispPriorityMsg);
    }

    closeLayerPanel() {
        if (this.layerPanel) {
            this.layerPanel.closeLayerPanel();
            this.changeRef.detectChanges();
        }
    }

    addDataLayerItemsToMap(layerGroupInfo: LayerGroupInfo) {
        if (layerGroupInfo.leafletMarkers) {
            const leafletMarkers = [];
            for (const key of Object.keys(layerGroupInfo.leafletMarkers)) {
                const leafletMarker = layerGroupInfo.leafletMarkers[key];
                if (!layerGroupInfo.focusedMarkers[key]) {
                    if (leafletMarker && leafletMarker.markerInfo) {
                        const marker: Common.Marker$v1 = leafletMarker.markerInfo.marker;
                        if (marker) {
                            if (layerGroupInfo.clusterSettings && layerGroupInfo.clusterSettings.enableClustering &&
                                marker.markerSettings.addToCluster) {
                                leafletMarkers.push(leafletMarker);
                            } else {
                                layerGroupInfo.featureGroup.addLayer(leafletMarker);
                            }
                        }
                    }
                }
            }
            if (leafletMarkers.length > 0) {
                layerGroupInfo.clusterGroup.addLayers(leafletMarkers);
            }

            for (const key of Object.keys(layerGroupInfo.focusedMarkers)) {
                const leafletMarker = layerGroupInfo.focusedMarkers[key];
                layerGroupInfo.focusedFeatureGroup.addLayer(leafletMarker);
            }
        }

        if (layerGroupInfo.leafletGeoms) {

            for (const key of Object.keys(layerGroupInfo.leafletGeoms)) {
                const leafletGeom = layerGroupInfo.leafletGeoms[key];
                if (leafletGeom.bufferLayer) {
                    layerGroupInfo.featureGroup.addLayer(leafletGeom.bufferLayer);
                } else {
                    layerGroupInfo.featureGroup.addLayer(leafletGeom);
                }
            }
        }

        layerGroupInfo.displayedOnMap = true;
    }

    removeDataLayerItemsFromMap(layerGroupInfo: LayerGroupInfo) {
        layerGroupInfo.clusterGroup.clearLayers();
        layerGroupInfo.featureGroup.clearLayers();
        layerGroupInfo.focusedFeatureGroup.clearLayers();
        layerGroupInfo.leafletClusterMarkers = {};
        layerGroupInfo.displayedOnMap = false;
    }

    handleGeoJSONLayerWithCustZoom(layerGroupInfo: LayerGroupInfo, display: boolean) {
        if (display) {
            if (layerGroupInfo?.leafletLayer) {
                layerGroupInfo.featureGroup.addLayer(layerGroupInfo.leafletLayer);
                this.mapCoreSvc.addAutoRefreshTimer(layerGroupInfo, this.mapId);
            }
        } else {
            if (layerGroupInfo?.leafletLayer) {
                layerGroupInfo.featureGroup.clearLayers();
                this.mapCoreSvc.removeAutoRefreshTimer(layerGroupInfo.mapLayer.id, this.mapId);
            }
        }
        layerGroupInfo.displayedOnMap = display;
    }

    getLayerInfo(layerId: string): Common.LayerInfo$v1 {
        const layerGroupInfo: LayerGroupInfo = this.layerGroupInfos[layerId];
        let layerInfo;
        if (layerGroupInfo) {
            layerInfo = new Common.LayerInfo$v1({
                id: layerId,
                name: layerGroupInfo.mapLayer.name
            });
        }
        return (layerInfo);
    }

    getMapView(): Common.MapPanZoomMessage$v1 {
        const mvParams = new Common.MapPanZoomMessage$v1();

        mvParams.zoomLevel = this.map.getZoom();
        const latLng = this.map.getCenter();
        mvParams.mapCenter = new Common.Point$v1(latLng.lat, latLng.lng);
        return (mvParams);
    }

    setMapView(mvParams: Common.MapPanZoomMessage$v1) {
        if (mvParams) {
            if ((mvParams.zoomLevel || mvParams.zoomLevel === 0) && mvParams.mapCenter) {
                this.map.setView(new L.LatLng(mvParams.mapCenter.latitude, mvParams.mapCenter.longitude), mvParams.zoomLevel);
            } else if (mvParams.zoomLevel || mvParams.zoomLevel === 0) {
                this.map.setZoom(mvParams.zoomLevel);
            } else if (mvParams.mapCenter) {
                this.map.panTo(new L.LatLng(mvParams.mapCenter.latitude, mvParams.mapCenter.longitude));
            }
        } else {
            this.map.setView(new L.LatLng(this.mapPreset.mapCenter.latitude, this.mapPreset.mapCenter.longitude), this.mapPreset.zoomLevel);
        }
    }

    panMapByPixelPoint(pixelPoint: Common.PixelPoint$v1) {
        const point = new L.Point(pixelPoint.x, pixelPoint.y);
        this.map.panBy(point);
    }

    zoomToBounds(params: Common.ZoomToBoundsMessage$v1) {
        let bnds: L.LatLngBounds;
        const options: any = {};

        if (params.bounds) {
            const corner1 = new L.LatLng(params.bounds.topLeft.latitude, params.bounds.topLeft.longitude);
            const corner2 = new L.LatLng(params.bounds.bottomRight.latitude, params.bounds.bottomRight.longitude);
            bnds = new L.LatLngBounds(corner1, corner2);
        } else if (params.coordinates && params.coordinates.length > 1) {
            const pts = [];

            for (const coord of params.coordinates) {
                const latLng = new L.LatLng(coord.latitude, coord.longitude);
                pts.push(latLng);
            }
            const poly = new L.Polyline(pts);
            bnds = poly.getBounds();
        }

        if (params.padding) {
            options.padding = [params.padding.x, params.padding.y];
        }

        if (params.maxZoom) {
            options.maxZoom = params.maxZoom;
        }

        this.map.fitBounds(bnds, options);
    }

    // Zoom the map to fit geometry in view
    zoomToGeometry(geom: Common.Geometry$v1, padding?:Common.PixelPoint$v1, onlyWhenDisplayed = true) {

        let bnds: L.LatLngBounds;
        const options: any = {
            padding: [20,20]
        };

        let layerColl;
        if (!geom.collectionId) {
            layerColl = this.dynamicsCollInfo;
        } else {
            layerColl = this.layerCollInfos.find((info) => info.collection.id === geom.collectionId);
        }

        if (layerColl) {
            let layerId = geom.layerId; 
            if (!geom.layerId) {
                layerId = DYNAMICS_LAYER_ID;
            }
            const layerGroupInfo: LayerGroupInfo = layerColl.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                if (!onlyWhenDisplayed || (onlyWhenDisplayed && layerGroupInfo.displayedOnMap)) {
                    const leafletGeom = layerGroupInfo.leafletGeoms[geom.id];
                    if (leafletGeom) {
                        bnds = leafletGeom.getBounds();
        
                        if (padding) {
                            options.padding = [padding.x, padding.y];
                        }
        
                        if (bnds) {
                            this.map.fitBounds(bnds, options);
                        }
                    } 
                }
            }
        }
    }

    convertLatLonToPixelPoint(latLon: Common.Point$v1): Common.PixelPoint$v1 {
        const temp = new L.LatLng(latLon.latitude, latLon.longitude);
        const point = this.map.latLngToContainerPoint(temp);
        const pixelPoint = new Common.PixelPoint$v1(point.x, point.y);
        return (pixelPoint);
    }

    convertPixelPointToLatLon(pixelPoint: Common.PixelPoint$v1): Common.Point$v1 {
        const temp = new L.Point(pixelPoint.x, pixelPoint.y);
        const latLng = this.map.containerPointToLatLng(temp);
        const point = new Common.Point$v1(latLng.lat, latLng.lng);
        return (point);
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

    processMapZoomEnd(event: any) {

        this.deleteOverlappingMarkersListMarker();

        const custZoomLayers: any = this.mapInfo.custZoomLayers;
        const curZoom = this.map.getZoom();
        if (custZoomLayers) {
            for (const key of Object.keys(custZoomLayers)) {
                const layerGroupInfo = custZoomLayers[key];
                if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                    if (layerGroupInfo.mapLayer.type === Common.MapLayerType$v1.Capability) {
                        this.addDataLayerItemsToMap(layerGroupInfo);
                    } else {
                        this.handleGeoJSONLayerWithCustZoom(layerGroupInfo, true);
                    }
                } else {
                    if (layerGroupInfo.mapLayer.type === Common.MapLayerType$v1.Capability) {
                        this.removeDataLayerItemsFromMap(layerGroupInfo);
                    } else {
                        this.handleGeoJSONLayerWithCustZoom(layerGroupInfo, false);
                    }
                }
            }
        }
        this.mapComm.mapEvents.subs.mapZoomChangedSub.next(curZoom);
    }

    processMapMoveEnd(event: any) {
        const bnds = this.map.getBounds();
        let corner = bnds.getNorthWest();
        const topLeft = new Common.Point$v1(corner.lat, corner.lng);
        corner = bnds.getSouthEast();
        const bottomRight = new Common.Point$v1(corner.lat, corner.lng);
        const center = this.map.getCenter();
        const mapCenter = new Common.Point$v1(center.lat, center.lng, center.alt);

        const mapBounds = new Common.MapBounds$v1(topLeft, bottomRight, mapCenter);
        this.mapComm.mapEvents.subs.mapBoundsChangedSub.next(mapBounds);

        const curZoom = this.map.getZoom();

        const mapviewState = new Common.MapviewState$v1({
            bounds: mapBounds,
            zoomLevel: curZoom
        } as Common.MapviewState$v1);

        this.mapComm.mapEvents.subs.mapviewStateChangedSub.next(mapviewState);
    }

    /**
     * Drawing on the map is done
     */
    drawDone(g: Common.Geometry$v1) {
        this.showDrawToolbar = false;

        // Clear the digitizing layer
        this.digitizer.cancel();

        // Use any so the behavior subject does not have to be exposed in the api
        setTimeout(() => {
            (this.mapComm.draw as any).geometry.next(g as Common.Geometry$v1);
        }, 100);
    }

    /**
     * Clear the draw mask
     */
    clearMask(): void {
        this.digitizer.clearMask();
    }

    /**
     * Show the filter mask for the currently drawn shape
     */
    showMask(): void {
        this.digitizer.showDrawMask();
    }

    layerPropertyChanged(event: any) {
        switch (event.name) {
            case 'opacity': {
                this.setLeafletLayerOpacity(event.mapLayer, event.value);
                break;
            }
            case 'shownOnStartup': {

                // Send mapClick to force closure of markers.
                this.deleteOverlappingMarkersListMarker();
                const latlng: L.LatLng = this.map.getCenter();
                const pt = new Common.Point$v1(latlng.lat, latlng.lng);
                this.mapComm.mapEvents.subs.mapClickedSub.next(pt);

                this.setLayerDisplay(event.mapLayer, event.value);
                break;
            }
        }
        this.handleLayerPropertyOverride(event.mapLayer, event.name, event.value);
    }

    /**
     * Called when user changes basemap on layer panel
     *
     * @param event - object contains new base map layer
     */
    async baseMapChanged(event: any) {

        this.mapCoreSvc.removeAutoRefreshTimer(event.prevBaseMapLayer.id, this.mapId);
        let layerInfo = this.layerGroupInfos[event.prevBaseMapLayer.id];
        if (layerInfo) {
            layerInfo.leafletLayer = null;
        }
        this.leafletBaseMapLayers.splice(0, 1);
        this.baseMapsCollInfo.featureGroup.clearLayers();
        this.changeRef.detectChanges();

        layerInfo = this.layerGroupInfos[event.baseMapLayer.id];
        const layer = await this.mapCoreSvc.createLeafletLayer(event.baseMapLayer, this.selectionSvc, this.mapViewContextId);
        if (layer) {
            this.leafletBaseMapLayers.push(layer);
            this.baseMapsCollInfo.featureGroup.addLayer(layer);
            if (layerInfo) {
                layerInfo.leafletLayer = layer;
                this.mapCoreSvc.addAutoRefreshTimer(layerInfo, this.mapId);
            }
        }

        this.changeRef.detectChanges();

        this.handleBaseMapOverride(event.baseMapLayer.id);
    }

    findLeafletLayers(mapLayer: any): any {
        let result;
        switch (mapLayer.type) {
            case Common.MapLayerType$v1.Capability: {
                result = this.leafletDataLayers.filter(dataLayer => dataLayer.groupInfo.mapLayer.id === mapLayer.id);
                break;
            }
            case Common.MapLayerType$v1.Overlay: {
                result = this.leafletOverlays.filter(leafletLayer => leafletLayer.layerInfo.mapLayer.id === mapLayer.id);
                break;
            }
            case Common.MapLayerType$v1.BaseMap: {
                result = this.leafletBaseMapLayers.find(leafletLayer => leafletLayer.layerInfo.mapLayer.id === mapLayer.id);
                break;
            }
            case Common.MapLayerType$v1.Shapes: {
                result = this.leafletDrawLayers.find(leafletLayer => leafletLayer.layerInfo.mapLayer.id === mapLayer.id);
                break;
            }
        }

        return (result);
    }

    calcDistBetweenPtSqrd(pt1, pt2) {
        let r: number;
        let i: number;
        const distSqrd = (r = pt1.x - pt2.x) * r + (i = pt1.y - pt2.y) * i;
        return (distSqrd);
    }

    findOverlappingMarkers(clickedMarker: any): any {
        const retMarkers = [];
        let nearbyDistSqr: number;
        let dist: number;
        if (clickedMarker.markerInfo.clusterMarker) {
            retMarkers.push(clickedMarker.markerInfo.clusterMarker);
            dist = Math.floor(clickedMarker.markerInfo.clusterSettings.iconDefinition2d.iconSize.width / 2);
        } else {
            retMarkers.push(clickedMarker.markerInfo.marker);
            dist = Math.floor(clickedMarker.markerInfo.settings.iconDefinition2d.iconSize.width / 2);
        }
        nearbyDistSqr = dist * dist;
        const clickedPixelPt = this.map.latLngToLayerPoint(clickedMarker.getLatLng());
        const keys = Object.keys(this.layerGroupInfos);
        for (const key of keys) {
            const layerInfo: LayerGroupInfo = this.layerGroupInfos[key];
            if (layerInfo.mapLayer.type === Common.MapLayerType$v1.Capability) {
                const markerKeys = Object.keys(layerInfo.leafletMarkers);
                for (const markerKey of markerKeys) {
                    const leafletMarker = layerInfo.leafletMarkers[markerKey];
                    if (this.map.hasLayer(leafletMarker) && leafletMarker !== clickedMarker &&
                        !layerInfo.focusedFeatureGroup.hasLayer(leafletMarker)) {
                        const pixelPt = this.map.latLngToLayerPoint(leafletMarker.getLatLng());
                        const distBtwnPts = this.calcDistBetweenPtSqrd(clickedPixelPt, pixelPt);
                        if (distBtwnPts < nearbyDistSqr) {
                            if (leafletMarker.markerInfo.clusterMarker) {
                                retMarkers.push(leafletMarker.markerInfo.clusterMarker);
                            } else {
                                retMarkers.push(leafletMarker.markerInfo.marker);
                            }
                        }
                    }
                }
            }
        }

        return (retMarkers);
    }

    setLeafletLayerOpacity(mapLayer: any, opacityValue: any) {
        switch (mapLayer.type) {
            case Common.MapLayerType$v1.Capability: {
                const layerGroupInfo = this.layerGroupInfos[mapLayer.id];
                const clusterGroup = layerGroupInfo.clusterGroup;
                for (const key of Object.keys(layerGroupInfo.leafletMarkers)) {
                    const marker = layerGroupInfo.leafletMarkers[key];
                    marker.setOpacity(opacityValue);
                    const parent = clusterGroup.getVisibleParent(marker);
                    if (parent) {
                        parent.setOpacity(opacityValue);
                    }
                }
                break;
            }
            case Common.MapLayerType$v1.Overlay: {
                const overlayInfo: LayerGroupInfo = this.layerGroupInfos[mapLayer.id];
                if (overlayInfo && overlayInfo.leafletLayer) {
                    // if (mapLayer.format === Common.LayerFormat$v1.GeoJSON) {
                    //     const opt = mapLayer.getOption('vectorStyleProps');
                    //     if (opt) {
                    //         const options: any = {};
                    //         options.pane = this.mapCoreSvc.createPaneNameForLayer(mapLayer);
                    //         const leafletStyle = this.mapCoreSvc.addLayerStyleOptionsToLeafletOptions(opt.value, options, options.pane, mapLayer);
                    //         (<any>overlayInfo.leafletLayer).setStyle(leafletStyle);
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
            case Common.MapLayerType$v1.BaseMap: {
                const result = this.findLeafletLayers(mapLayer);
                if (result) {
                    result.setOpacity(opacityValue);
                }
                break;
            }
        }
    }

    /** Clears any drawn geometry */
    clearGeometry(): void {
        this.showFilterToolbar = false;
        this.digitizer.cancel();
        this.mapComm.draw.clear();
    }

    setLayerDisplay(mapLayer: any, display: boolean) {
        switch (mapLayer.type) {
            case Common.MapLayerType$v1.Capability: {
                const layerGroupInfo: LayerGroupInfo = this.layerGroupInfos[mapLayer.id];
                if (layerGroupInfo) {
                    if (display && this.isMapLayerDisplayedForZoom(layerGroupInfo.mapLayer)) {
                        this.addDataLayerItemsToMap(layerGroupInfo);
                    } else {
                        this.removeDataLayerItemsFromMap(layerGroupInfo);
                    }
                    this.changeRef.detectChanges();
                }

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
                    this.changeRef.detectChanges();
                }
                break;
            }
        }
    }

    layersReordered(collId: string) {
        //   const mapLayers: Common.MapLayer$v1[] =
        //       this.mapCoreSvc.getMapLayers(this.mapPreset, <Common.MapLayerType$v1>event.layerType);
        const collInfo = this.layerCollInfos.find((info) => info.collection.id === collId);
        if (collInfo) {
            const mapLayers: Common.MapLayer$v1[] = (collInfo.collection as any).layersList;

            switch (collId) {
                case Common.DefaultLayerCollectionIds$v1.DataLayers: {
                    for (let ii = 0; ii < mapLayers.length; ii++) {
                        const mapLayer = mapLayers[ii];
                        const newZOffset = (((mapLayers.length- 1) - ii) * 10000) + 1;

                        const layerGroupInfo = this.layerGroupInfos[mapLayer.id];
                        if (layerGroupInfo.zIndexOffset !== newZOffset) {
                            if (layerGroupInfo.leafletMarkers) {
                                const clusterGroup = layerGroupInfo.clusterGroup;
                                for (const key of Object.keys(layerGroupInfo.leafletMarkers)) {
                                    const marker = layerGroupInfo.leafletMarkers[key];
                                    marker.setZIndexOffset(newZOffset);
                                    const parent = clusterGroup.getVisibleParent(marker);
                                    if (parent) {
                                        parent.setZIndexOffset(newZOffset);
                                    }
                                }
                            }
                            if (layerGroupInfo.geomPane) {
                                (layerGroupInfo.geomPane as any).style.zIndex = newZOffset;
                            }
                            layerGroupInfo.zIndexOffset = newZOffset;
                        }
                    }

                    break;
                }
                case Common.DefaultLayerCollectionIds$v1.Overlays: {
                    let zIndex = 100;
                    for (let ii = mapLayers.length - 1; ii >= 0; ii--) {
                        const dataLayerInfo: LayerGroupInfo = this.layerGroupInfos[mapLayers[ii].id];
                        if (dataLayerInfo) {
                            const pane = this.map.getPane(dataLayerInfo.paneName);
                            if (pane) {
                                pane.style.zIndex = zIndex.toString();
                                zIndex += 100;
                            }
                        }
                    }
                    break;
                }
            }
            this.handleLayersReordered(mapLayers);

        }
    }

    layerPanelDisplayStateChanged(state: boolean) {
        this.mapComm.mapEvents.subs.layerPanelDisplayStateChangedSub.next(state);
    }

    startDraw() {
        this.showFilterToolbar = false;
        this.showDrawToolbar = true;
        (this.mapComm.draw as any).start.next(this.digitizer.capabilityId);
    }

    // Draw interface methods */
    activateDraw(capabilityId: string, mapDrawSetup?: Common.MapDrawSetup$v1) {
        this.digitizer.capabilityId = capabilityId;

        if (mapDrawSetup) {
            if (mapDrawSetup.drawButtonTooltip) {
                this.drawButtonTooltip = mapDrawSetup.drawButtonTooltip;
            } else {
                this.drawButtonTooltip = this.transStrings[this.tokens.openDraw];
            }

            if (mapDrawSetup.drawToolbarTitle) {
                this.drawToolbarTitle = mapDrawSetup.drawToolbarTitle;
            } else {
                this.drawToolbarTitle = null;
            }

            this.persistentEdit = mapDrawSetup.persistentEdit;

            if (this.persistentEditSubs.has(capabilityId)) {
                this.persistentEditSubs.get(capabilityId).unsubscribe();
                this.persistentEditSubs.delete(capabilityId);
            }

            if (this.persistentEdit) {
                this.persistentEditSubs.set(capabilityId, 
                    this.digitizer.geometry$.pipe(
                        filter(g => g?.capabilityId === capabilityId),
                        debounceTime(50),
                    ).subscribe(g => {
                        if (!g?.coordinates) {
                            g = null;
                        }
                        (this.mapComm.draw as any).geometry.next(g);
                    })
                );
            }

            this.digitizer.autoEdit = mapDrawSetup.autoEdit;
        }

        this.drawActive = true;
        (this.mapComm.draw as any).activated.next(capabilityId);
    }

    deactivateDraw() {
        this.drawActive = false;
        this.digitizer.cancel();
    }

    edit(geometry: Common.Geometry$v1, centerGeometry?: boolean, padding?: Common.PixelPoint$v1) {
        this.drawActive = true;
        this.showDrawToolbar = true;
        this.changeRef.detectChanges();
        this.digitizer.drawEditGeometry(geometry, centerGeometry, padding);
    }

    clear() {
        if (this.drawActive && this.digitizer) {
            this.digitizer.cancel();
        }
    }

    setStyle(style: Common.VectorStyleProperties$v1) {
        this.digitizer.setStyle(style);
    }

    centerGeometry(padding?: Common.PixelPoint$v1) {
        this.digitizer.centerGeometry(padding);
    }


    // Layers interface methods

    addLayerCollection?(collection: Common.LayerCollection$v1, position?: Common.LayerPosition$v1, posRefCollId?: string): Common.LayerCollection$v1 {
        let layerCollInfo: LayerCollectionInfo;
        const pos = position ? position : Common.LayerPosition$v1.Top;
        switch (pos) {
            case Common.LayerPosition$v1.Top: {
                layerCollInfo = new LayerCollectionInfo();
                layerCollInfo.paneName = collection.name;
                this.collTopZValue += 100;
                layerCollInfo.zIndexOffset = this.collTopZValue;
                layerCollInfo.pane = this.mapCoreSvc.createMapPane(collection.name, null, this.map, this.collTopZValue);
                layerCollInfo.featureGroup = new L.FeatureGroup(null, {
                    pane: layerCollInfo.pane
                });
                layerCollInfo.collection = collection;
                this.layerCollInfos.push(layerCollInfo);
                (collection as any).iMap = this as Common.MapInterface$v1;
                this.layerColls.splice(this.layerColls.length-1, 0, collection);
                this.layerCollsSub.next(this.layerColls);
                break;
            }
            case Common.LayerPosition$v1.Bottom: {
                layerCollInfo = new LayerCollectionInfo();
                layerCollInfo.paneName = collection.name;
                layerCollInfo.zIndexOffset = this.collBottomZValue;
                layerCollInfo.pane = this.mapCoreSvc.createMapPane(collection.name, null, this.map, this.collBottomZValue);
                layerCollInfo.collection = collection;
                this.collBottomZValue -= 50;
                this.layerCollInfos = [layerCollInfo].concat(this.layerCollInfos);
                (collection as any).iMap = this as Common.MapInterface$v1;
                break;
            }
            case Common.LayerPosition$v1.Above: {
                if (posRefCollId) {
                    let collIdx;
                    const refCollInfo = this.layerCollInfos.find((info, index) => {
                        collIdx = index;
                        return (info.collection.id === posRefCollId);
                    });
                    if (refCollInfo) {
                        const zIndex = refCollInfo.zIndexOffset;
                        layerCollInfo = new LayerCollectionInfo();
                        layerCollInfo.paneName = collection.name;
                        layerCollInfo.zIndexOffset = zIndex + 10;
                        layerCollInfo.pane = this.mapCoreSvc.createMapPane(collection.name, null, this.map, layerCollInfo.zIndexOffset);
                        layerCollInfo.collection = collection;
                        if (collIdx === this.layerCollInfos.length - 1) {
                            this.layerCollInfos.push(layerCollInfo);
                        } else {
                            this.layerCollInfos = this.layerCollInfos.splice(0, collIdx + 1).concat([layerCollInfo], this.layerCollInfos.splice(collIdx + 1));
                        }
                        (collection as any).iMap = this as Common.MapInterface$v1;
                    }
                }
                break;
            }
            case Common.LayerPosition$v1.Below: {
                if (posRefCollId) {
                    let collIdx;
                    const refCollInfo = this.layerCollInfos.find((info, index) => {
                        collIdx = index;
                        return (info.collection.id === posRefCollId);
                    });
                    if (refCollInfo) {
                        const zIndex = refCollInfo.zIndexOffset;
                        layerCollInfo = new LayerCollectionInfo();
                        layerCollInfo.paneName = collection.name;
                        layerCollInfo.zIndexOffset = zIndex - 10;
                        layerCollInfo.pane = this.mapCoreSvc.createMapPane(collection.name, null, this.map, layerCollInfo.zIndexOffset);
                        layerCollInfo.collection = collection;
                        if (collIdx === 0) {
                            this.layerCollInfos = [layerCollInfo].concat(this.layerCollInfos);
                        } else {
                            this.layerCollInfos = this.layerCollInfos.splice(0, collIdx).concat([layerCollInfo], this.layerCollInfos.splice(collIdx));
                        }
                        (collection as any).iMap = this as Common.MapInterface$v1;
                    }
                }
                break;
            }
        }
        if (layerCollInfo) {
            const layers = (layerCollInfo.collection as any)?.layersList; 
            if (layers?.length > 0) {
                this.addLayersToCollection(collection.id, layers);
            }
        }

        return (collection);
    }

    removeLayerCollection?(collectionId: string) {

    };

    updateLayerCollection?(collection: Common.LayerCollection$v1) {

    }

    addLayersToCollection?(collectionId: string, layers: Common.MapLayer$v1[], position?: Common.LayerPosition$v1, positionRefLayerId?: string): Common.MapLayer$v1[] {
        const collInfo = this.layerCollInfos.find((info) => info.collection.id === collectionId );
        if (collInfo) {
            const pos = position ? position : Common.LayerPosition$v1.Top;
            const top = (collInfo.collection as any).layersList?.length + 1;
            switch (pos) {
                case Common.LayerPosition$v1.Top: {
                    for (const layer of layers) {
                        layer.setValid();
                        if (layer.valid) {
                            const layerGroupInfo = new LayerGroupInfo();
                            layerGroupInfo.mapLayer = layer;
                            layerGroupInfo.paneName = this.mapCoreSvc.createPaneNameForLayer(layer);
                            layerGroupInfo.pane = this.mapCoreSvc.createMapPane(layerGroupInfo.paneName, collInfo.pane, this.map, top);
                            layerGroupInfo.zIndexOffset = top;
                            layerGroupInfo.layerId = layer.id;
                            layerGroupInfo.geomPaneName = layerGroupInfo.paneName + '_Geom';
                            layerGroupInfo.displayedOnMap = this.isLayerBeingDisplayed(layerGroupInfo);
                            (layer as any).iMap = this as Common.LayersInterface$v1;
                            switch (layer.format) {
                                case Common.LayerFormat$v1.Geometry: {
                                    layerGroupInfo.featureGroup = new L.FeatureGroup(null, {
                                        pane: layerGroupInfo.paneName
                                    });
                                    if (layer.geometries) {
                                        this.upsertGeometries(layer.geometries, collectionId, layer.id);
                                    }

                                    collInfo.featureGroup.addLayer(layerGroupInfo.featureGroup);
                                    this.layerGroupInfos[layer.id] = layerGroupInfo;
                                    collInfo.layerGroupInfos[layer.id] = layerGroupInfo;

                                    break;
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
        return(layers);
    }

    removeLayersFromCollection?(collectionId: string, layerIds: string[]) {
    }

    updateLayersInCollection?(collectionId: string, layers: Common.MapLayer$v1[]) {
    }

    upsertGeometries(geometries: Common.Geometry$v1[], collectionId?: string, layerId?: string) {
        // console.log('upsert');
        let layerColl;
        if (!collectionId) {
            layerColl = this.dynamicsCollInfo;
        } else {
            layerColl = this.layerCollInfos.find((info) => info.collection.id === collectionId);
        }
        if (layerColl) {
            if (!layerId) {
                layerId = DYNAMICS_LAYER_ID;
            }
            const layerGroupInfo: LayerGroupInfo = layerColl.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                // const leafletLayers = [];
                if (!layerGroupInfo.geomPane) {
                    // Setup to create a map pane if geometries are added to this layer. The z index will be the base offset for this layer in the data layers.
                    // This allows for reordering to occur. 
                    layerGroupInfo.geomPane = this.mapCoreSvc.createMapPane(layerGroupInfo.geomPaneName, layerGroupInfo.pane, this.map, layerGroupInfo.zIndexOffset);
                }

                for (const geom of geometries) {
                    let existingGeom = layerGroupInfo.geoms[geom.id];
                    let leafletGeom;
                    if (existingGeom) {
                        layerGroupInfo.geoms[geom.id] = geom;
                        leafletGeom = layerGroupInfo.leafletGeoms[geom.id];
                        if (leafletGeom) {
                            if (geom.style) {
                                const leafletStyle = this.mapCoreSvc.convertVectorStylePropsToLeafletOptions(geom.style, layerGroupInfo.geomPaneName);
                                leafletGeom.setStyle(leafletStyle);
                            }

                            switch (geom.type) {
                                case Common.GeometryType$v1.polygon: {
                                    const poly: L.Polygon = leafletGeom;
                                    const latLngs: L.LatLng[] = [];
                                    for (const boundary of geom.coordinates) {
                                        const coords = boundary as [number[]];
                                        for (const coord of coords) {
                                            const latLng = new L.LatLng(coord[1], coord[0]);
                                            latLngs.push(latLng);
                                        }
                                    }
                                    if (latLngs.length > 0) {
                                        poly.setLatLngs([latLngs]);
                                    }
                                    break;
                                }
                                case Common.GeometryType$v1.circle: {
                                    const circle: L.Circle = leafletGeom;
                                    const coord = geom.coordinates as number[];
                                    const latLng = new L.LatLng(coord[1], coord[0]);
                                    circle.setLatLng(latLng);
                                    break;
                                }
                                case Common.GeometryType$v1.line: {
                                    geom.bufferLayer = this.digitizer.drawBuffer(geom, {
                                        pane: layerGroupInfo.geomPaneName
                                    });
                                    break;
                                }
                            }
                        }
                        if (geom.useAsMask) {
                            this.maskLayerId = layerId;
                        }
                        // Need to add code to update geometry
                    } else {
                        layerGroupInfo.geoms[geom.id] = geom;

                        // Check to see if layer is actual being displayed.  If so, add geometry to feature group, otherwise
                        // just hold onto geometry to add to layer when layer is turned on.

                        let featureGroup;
                        if (this.isLayerBeingDisplayed(layerGroupInfo)) {
                            featureGroup = layerGroupInfo.featureGroup;
                        }

                        leafletGeom = this.digitizer.displayGeometry(geom, {
                            pane: layerGroupInfo.geomPaneName,
                            featureGroup: featureGroup,
                            context: this,
                            menuItemCallback: this.geometryContextMenu
                        });

                        geom.layerId = layerId;
                        geom.collectionId = collectionId;
                        (geom as any).iMap = this as Common.MapInterface$v1;

                        if (leafletGeom) {
                            leafletGeom.on('click', this.geometryClicked, this);

                            const geomInfo = new GeometryInfo({
                                geom: geom,
                                mapLayer: layerGroupInfo.mapLayer,
                                layerId: layerId,
                                collectionId: collectionId,
                            });

                            leafletGeom.geomInfo = geomInfo;
                            if (geom.bufferLayer) {
                                (geom.bufferLayer as any).geomInfo = geomInfo;
                            }

                            layerGroupInfo.leafletGeoms[geom.id] = leafletGeom;
                            if (geom.useAsMask) {
                                this.maskLayerId = layerId;
                                this.maskGeomId = geom.id;
                            }
                        }
                    }
                }
            }
        }
    }

    removeGeometries(geometryIds: string[], collectionId?: string, layerId?: string) {
        let layerColl;
        if (!collectionId) {
            layerColl = this.dynamicsCollInfo;
        } else {
            layerColl = this.layerCollInfos.find((info) => info.collection.id === collectionId);
        }
        if (layerColl) {
            if (!layerId) {
                layerId = DYNAMICS_LAYER_ID;
            }
            const layerGroupInfo: LayerGroupInfo = layerColl.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                for (const geomId of geometryIds) {
                    const leafletGeom = layerGroupInfo.leafletGeoms[geomId];
                    if (leafletGeom) {
                        layerGroupInfo.featureGroup.removeLayer(leafletGeom);
                        delete layerGroupInfo.leafletGeoms[geomId];
                    }
                    let geom = layerGroupInfo.geoms[geomId];
                    if (geom) {
                        // console.log('Remove');
                        if (geom.bufferLayer) {
                            layerGroupInfo.featureGroup.removeLayer(geom.bufferLayer);                            
                        }
                        delete layerGroupInfo.geoms[geomId];
                        if (geom.useAsMask && this.maskGeomId === geom.id) {
                            this.digitizer.clearMask();
                        }
                        // Need to add code to update geometry
                    }
                }
            }
        }
    }

    clearGeometries?(collectionId: string, layerId: string,) {
        let layerColl;
        if (!collectionId) {
            layerColl = this.dynamicsCollInfo;
        } else {
            layerColl = this.layerCollInfos.find((info) => info.collection.id === collectionId);
        }
        if (layerColl) {

            if (!layerId) {
                layerId = DYNAMICS_LAYER_ID;
            }
            const layerGroupInfo: LayerGroupInfo = layerColl.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                layerGroupInfo.featureGroup.clearLayers();
                layerGroupInfo.geoms = [];
                layerGroupInfo.leafletGeoms = [];

                if (this.maskLayerId === layerId) {
                    this.digitizer.clearMask();
                }
            }
        }
    }

    setGeometryStyle?(style: Common.VectorStyleProperties$v1, geometryId: string, collectionId?: string, layerId?: string) {
        let layerColl;
        if (!collectionId) {
            layerColl = this.dynamicsCollInfo;
        } else {
            layerColl = this.layerCollInfos.find((info) => info.collection.id === collectionId);
        }
        if (layerColl && style) {
            if (!layerId) {
                layerId = DYNAMICS_LAYER_ID;
            }
            const layerGroupInfo: LayerGroupInfo = layerColl.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                const leafletGeom = layerGroupInfo.leafletGeoms[geometryId];
                if (leafletGeom) {
                    const leafletStyle = this.mapCoreSvc.convertVectorStylePropsToLeafletOptions(style);
                    leafletGeom.setStyle(leafletStyle);
                }
            }
        }
    }

    setGeometryContextMenu?(contextMenuItems: Common.GeometryContextMenuItem$v1[], geometryId: string, collectionId?: string, layerId?: string) {
        let layerColl;
        if (!collectionId) {
            layerColl = this.dynamicsCollInfo;
        } else {
            layerColl = this.layerCollInfos.find((info) => info.collection.id === collectionId);
        }
        if (layerColl) {
            if (!layerId) {
                layerId = DYNAMICS_LAYER_ID;
            }
            const layerGroupInfo: LayerGroupInfo = layerColl.layerGroupInfos[layerId];
            if (layerGroupInfo) {
                const leafletGeom = layerGroupInfo.leafletGeoms[geometryId];
                if (leafletGeom) {
                    if (contextMenuItems?.length > 0) {
                        const newItems = [];
                        let index = 0;
                        for (const item of contextMenuItems) {
                            const menuItem: any = {
                                text: item.label,
                                icon: item.icon,
                                disabled: item.disabled,
                                index: index,
                                submenuItems: null
                            }
                
                            if (item.submenuItems?.length > 0) {
                                menuItem.submenuItems = [];
                                for (const subItem of item.submenuItems) {
                                    const submenuItem = {
                                        text: subItem.label,
                                        icon: subItem.icon,
                                        disabled: subItem.disabled,
                                        index: index,
                                        context: this,
                                        callback: ((event: any) => {
                                            this.geometryContextMenu({menuItem: subItem, geom: layerGroupInfo.geoms[geometryId], event: event, context: this}) 
                                        })
                                    }
                                    menuItem.submenuItems.push(submenuItem);
                                }
                            } else {
                                menuItem.context = this;
                                callback: ((event: any) => {
                                    this.geometryContextMenu({menuItem: item, geom: layerGroupInfo.geoms[geometryId], event: event, context: this}) 
                                })
                            }
                            newItems.push(menuItem);
                            index++;
                        }
                        leafletGeom.options.contextmenuItems = newItems;
                    } else {
                        leafletGeom.options.contextmenuItems = [];
                    }
                }
            }
        }
    }

    geometryClicked(event: any) {
        L.DomEvent.stopPropagation(event.originalEvent);
        this.deleteOverlappingMarkersListMarker();
        const geomInfo: GeometryInfo = event.target.geomInfo;
        if (geomInfo && geomInfo.geom) {
            this.mapComm.mapEvents.subs.geometryClickedSub.next(geomInfo.geom);
            (geomInfo.geom as any).events.clicked.next(geomInfo.geom);;
        }
    }

    geometryContextMenu(event: any) {
        if (event.context?.closeLayerPanel) {
            event.context.closeLayerPanel();
        }

        if (event.context?.deleteOverlappingMarkersListMarker) {
            event.context.deleteOverlappingMarkersListMarker();
        }
        (event.geom as any).events.contextMenuItemClicked.next(event.menuItem);
    }

    /**
     * Handles saving the overrides when a map layer property is modified on the layer panel
     *
     * @param layer - Map layer that was modified
     * @param property - Property that was modified
     * @param value - New value for the property
     */
    private handleLayerPropertyOverride(layer: Common.MapLayer$v1, property: string, value: any) {
        let override: any;
        const savedLayer = this.savedMapPreset.mapLayers.find((presetLayer) => presetLayer.id === layer.id);
        if (savedLayer[property] !== value) {
            override = this.mapviewOverrides.layerProperties[layer.id];
            if (!override) {
                override = {};
                this.mapviewOverrides.layerProperties[layer.id] = override;
            }
            override[property] = value;
            this.saveMapOverrides();
        } else {
            if (this.mapviewOverrides.layerProperties[layer.id] &&
                typeof (this.mapviewOverrides.layerProperties[layer.id][property]) !== 'undefined') {

                delete (this.mapviewOverrides.layerProperties[layer.id][property]);
                if (Object.keys(this.mapviewOverrides.layerProperties[layer.id]).length === 0) {
                    delete (this.mapviewOverrides.layerProperties[layer.id]);
                }
                this.checkOverridesAndDeleteOrSave();
            }
        }
    }

    private handleBaseMapOverride(baseMapId: string) {
        if (baseMapId === this.mapCoreSvc.getSelectedBaseMap(this.savedMapPreset.mapLayers).id) {
            this.mapviewOverrides.baseMapId = null;
            this.checkOverridesAndDeleteOrSave();
        } else {
            this.mapviewOverrides.baseMapId = baseMapId;
            this.saveMapOverrides();
        }
    }

    private handleResetToDefault() {
        this.mapPreset = null;
        this.changeRef.detectChanges();
        this.destroyMap();
        this.mapPreset = this.savedMapPreset.clone();

        // Replace the collections with the originals from the preset for basemaps, overlays, and dataLayers.
        this.layerColls = this.mapCoreSvc.createLayerCollsFromMapPreset(this.mapPreset);
        this.changeRef.detectChanges();

        this.isPresetOverridden = false;
        this.mapviewOverrides = new MapviewOverrides(null);
        if (this.personalizationId) {
            this.mapCoreSvc.deletePersonalizationInfoAsync(this.personalizationId);
        }
    }

    private handleLayersReordered(layers: Common.MapLayer$v1[]) {
        const type = layers[0].type;
        const reorderedLayers = this.mapviewOverrides.reorderedLayers;
        let override = false;
        if (reorderedLayers[type]) {
            // Check to see if the order is the same as the original preset.
            const savedLayers = this.mapCoreSvc.getMapLayers(this.savedMapPreset, type);
            for (let ii = 0; ii < savedLayers.length; ii++) {
                if (savedLayers[ii].id !== layers[ii].id) {
                    override = true;
                }
            }

            if (!override) {
                delete (reorderedLayers[type]);
                this.checkOverridesAndDeleteOrSave();
                return;
            }
        }

        if (!reorderedLayers[type] || override) {
            reorderedLayers[type] = [];
            for (const layer of layers) {
                reorderedLayers[type].push(layer.id);
            }

            this.saveMapOverrides();
        }
    }

    private saveMapOverrides() {
        if (this.personalizationId) {
            if (!this.mapviewOverrides.mapPresetId) {
                this.mapviewOverrides.mapPresetId = this.mapPreset.id;
            }

            this.mapCoreSvc.savePersonalizationInfoAsync(this.personalizationId, this.mapviewOverrides);
            this.isPresetOverridden = true;
        }
    }

    /**
     * Check overrides and see if there are any defined.  If not and the overrides are stored, delete
     * them from storage.  The mapPresetId will be set if overrides are stored.
     */
    private checkOverridesAndDeleteOrSave() {
        if (this.mapviewOverrides.mapPresetId && this.personalizationId) {
            const deleteOverride = this.mapviewOverrides.baseMapId === null &&
                Object.keys(this.mapviewOverrides.layerProperties).length === 0 &&
                Object.keys(this.mapviewOverrides.reorderedLayers).length === 0;

            if (deleteOverride) {
                this.mapCoreSvc.deletePersonalizationInfoAsync(this.personalizationId);
                this.isPresetOverridden = false;
                // for now just save until I get delete ready.
                // this.mapviewOverrides.mapPresetId = null;
                // this.mapCoreSvc.savePersonalizationInfoAsync(this.personalizationId, this.mapviewOverrides);
            } else {
                this.saveMapOverrides();
                this.isPresetOverridden = true;
            }
        }
    }

    async layerPropsCmd(info: any) {
        this.layerPropsCmdLayerInfos = [];
        this.layerPropsCmdPoint = info.event.containerPoint;

        // If there is a selected layer, add it first to the list so it will appear at the top of the list of layers on the 
        // layer properties dialog.
        if (this.selectedLayers?.length > 0) {
            for (const selectedLayer of this.selectedLayers) {
                let parentLayer;
                const layerInfo = this.layerGroupInfos[selectedLayer.mapLayer.id]
                if(layerInfo) {
                    parentLayer = layerInfo.leafletLayer;
                }
                this.layerPropsCmdLayerInfos.push(new LayerPropsCmdLayerInfo({
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
                            this.layerPropsCmdLayerInfos.push(new LayerPropsCmdLayerInfo({
                                mapLayer: mapLayer
                            }));
                        }
                    } else if (this.mapCoreSvc.isFeatureFlagEnabled(Common.FeatureFlags.Selection) &&
                        (mapLayer?.format === Common.LayerFormat$v1.GeoJSON || mapLayer?.format === Common.LayerFormat$v1.WFS)) {
                        const temp = this.layerPropsCmdLayerInfos.find((info) => info.mapLayer.id === mapLayer.id);
                        if (!temp) {
                            const locatePoly = this.geoSpatialSvc.createGeoJSONPolygonFeatureFromPt(info.event.latlng, 20);
                            if (locatePoly) {
                                const leafletLayers = (layerInfo.leafletLayer as L.FeatureGroup).getLayers();
                                if (leafletLayers) {
                                    for (const leafletLayer of leafletLayers) {
                                        if (this.geoSpatialSvc.featuresIntersect(locatePoly, (leafletLayer as any).feature)) {
                                            this.layerPropsCmdLayerInfos.push(new LayerPropsCmdLayerInfo({
                                                mapLayer: mapLayer,
                                                leafletLayer: leafletLayer,
                                                parentLayer: layerInfo.leafletLayer
                                            }));
                                        }
                                    }
                                }
                            }
                        } 
                    }
                }
            }
        }

        if (this.mapDiv) {
            this.maxLayerPropsHeight = this.mapDiv.nativeElement.offsetHeight - 75;
        } else {
            this.maxLayerPropsHeight = null;
        }

        if (!this.displayLayerPropsCmd) {
            this.displayLayerPropsCmd = true;
            this.cdr.detectChanges();
        }

    }

    layerPropsCmdClose(clearSelection: boolean) {
        if (this.displayLayerPropsCmd) {
            if (clearSelection) {
                this.selectionSvc.clearSelection();
            }
            this.displayLayerPropsCmd = false;
            this.changeRef.markForCheck();
            this.changeRef.detectChanges();
        }
    }
    /**
     * Set up routine for localization.
     */
    private async initLocalization(): Promise<void> {
        this.mapCoreSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
            this.drawButtonTooltip = this.transStrings[this.tokens.openDraw];
            this.drawToolbarTitle = null;
            if (this.layerPropCmdMenuItem) {
                this.layerPropCmdMenuItem.text = this.transStrings[this.tokens.layerPropsCmdMenuItemLabel];
                if (this.layerPropCmdMenuItem.disabled) {
                    this.layerPropCmdMenuItem.tooltip = this.transStrings[this.tokens.layerPropsCmdDisabledTooltip];
                }
            }

            if (this.contextMenuItems?.length > 0) {
                const menuItem = this.contextMenuItems.find((item) => item.index === 99);
                if (menuItem) {
                    menuItem.text = this.transStrings[this.tokens.layerPropsCmdMenuItemLabel];
                    if (menuItem.disabled) {
                        menuItem.tooltip = this.transStrings[this.tokens.layerPropsCmdDisabledTooltip];
                    }
                }
            }
            this.translationFinished = true;
        });
    }
}

@Component({
    selector: 'hxgn-commonmap-map-injectable-v1',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class MapComponentInjectable$v1 extends MapComponent$v1 {

    constructor(
        private _mapCoreSvc: CommonmapCoreService$v1,
        private _layoutCompiler: LayoutCompilerAdapterService,
        private _localizationSrv: CommonlocalizationAdapterService$v1,
        private _changeRef: ChangeDetectorRef,
        private _zone: NgZone,
        private _selectionSvc: MapLayerSelectionService$v1,
        cdr: ChangeDetectorRef,
        @Inject(Common.LAYOUT_MANAGER_SETTINGS) public mapCreateMessage: Common.MapCreateMessage$v1
    ) {

        super(_mapCoreSvc, _layoutCompiler, _localizationSrv, _changeRef, _zone, _selectionSvc, cdr);
        this.mapCreateMessage = mapCreateMessage;
        // eslint-disable-next-line no-console
        console.info(mapCreateMessage.mapSettings);
    }
}
