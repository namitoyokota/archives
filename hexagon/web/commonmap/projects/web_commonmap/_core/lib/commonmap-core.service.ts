import '@galileo/leaflet-ajax';
import '@galileo/leaflet-wfst';
import '@galileo/leaflet-with-header';
import 'leaflet.markercluster';
import * as turf from '@turf/turf';

import { Injectable } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { ColorHelper } from '@galileo/web_common-libraries/graphical/color-selector';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1, UserInfo$v1, UserPersonalization$v1 } from '@galileo/web_commonidentity/adapter';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlicensingAdapterService$v1 } from '@galileo/web_commonlicensing/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import * as Common from '@galileo/web_commonmap/_common';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { MapLayerSelectionService$v1 } from './shared/map/map-layer-selection.service';
import * as L from 'leaflet';
import { BehaviorSubject, interval, Subject, zip } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ShapesAdapterService$v1 } from '@galileo/web_shapes/adapter';
import {
    AutoRefreshLayerInfo,
    ContextMenuItem,
    CommandIds,
    GetFeatInfoFormats,
    LayerInfoData,
    LayerInfoLayerProp,
    MapviewOverrides,
    WMTSInfo,
    WMTSLayerInfo,
    WMTSLayerStyle,
    WMTSTileMatrix,
    WMTSTileMatrixSet,
} from './abstractions/core.models';
import { CoreTranslationTokens } from './commonmap-core.translations';
import { CommonmapDataService$v1 } from './commonmap-data.service';
import { HxDRHelperService } from './HxDRHelper.service';
import { Feature, Geometry } from '@turf/turf';

const SCALE_DENOMINATOR_TOLERANCE = 1e-8;

@Injectable({ providedIn: 'root' })
export class CommonmapCoreService$v1 {

    mapPresets: Common.MapPreset$v1[] = [];
    mapLayers: Common.MapLayer$v1[] = [];

    mapPresetDtos: Common.MapPresetDtoLeaflet$v1[] = [];
    mapLayerDtos: Common.MapLayerDtoLeaflet$v1[] = [];

    maps: any = {};
    currentMapPreset: string;
    mapPresetsLoading = false;
    visibleMarkers = true;
    centerOffsetX: number;
    centerOffsetY: number;

    userInfo: UserInfo$v1;

    defaultMapPreset: Common.MapPreset$v1 = null;
    defaultMapPresetToken = 'commonmap-core.data.defaultMapPresetName';

    dynamicsPaneName = 'dynamics';
    focusPaneName = 'focus';

    layerOptionDefaults: Common.MapLayerOption$v1[];

    translatedStrings: any;

    // eslint-disable-next-line max-len
    defaultAzureSatelliteUrl = 'https://atlas.microsoft.com/map/imagery/png?api-version=1&style=satellite&tileSize=512&zoom={z}&x={x}&y={y}&subscription-key={subscription-key}';
    // eslint-disable-next-line max-len
    defaultAzureRoadsUrl = 'https://atlas.microsoft.com/map/tile/png?api-version=1&layer=basic&style=main&TileFormat=pbf&tileSize=512&zoom={z}&x={x}&y={y}&subscription-key={subscription-key}';

    mapPresetsLoaded: BehaviorSubject<void> = new BehaviorSubject(null);
    mapLayerPresetsLoaded: BehaviorSubject<void> = new BehaviorSubject(null);

    mapDataReady$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    authToken$: BehaviorSubject<string>;

    mapDataTranslated$: Subject<void> = new Subject<void>();

    autoRefreshLayers: AutoRefreshLayerInfo[] = [];

    capabilityMapLayerData: Common.MapLayerComponentData$v1[] = [];
    
    private curAuthToken: string;

    /**  Expose translation tokens to html template */
    tokens: typeof CoreTranslationTokens = CoreTranslationTokens;

    preFetchTokensList = [
        this.tokens.baseMapsHeader,
        this.tokens.dataLayersHeader,
        this.tokens.overlaysHeader,
        this.tokens.erdasBandLabel,
        this.tokens.createSmartShapeMenuLabel,
        this.tokens.useAsFilterMenuLabel,
        this.tokens.cannotCreateShapesTooltip,
        this.tokens.cannotUseAsFilterTooltip
    ];

    capLayerNameTokens = {};
    sysLayerNameTokens = {};

    transStrings = {};

    supportedImageFormats = [
        'image/png',
        'image/jpeg',
        'image/jpgpng',
        'image/jpg',
        'image/gif'
    ];

    supportedOutputFormats = [
        'application/json',
        'json',
        'application/gml+xml; version=3.2'
    ];

    supportedFeatInfoFormats = {
        [GetFeatInfoFormats.Text]: 'text/plain',
        [GetFeatInfoFormats.XML]: 'text/xml',
        [GetFeatInfoFormats.HTML]: 'text/html',
        [GetFeatInfoFormats.JSON]: 'application/json',
        [GetFeatInfoFormats.ESRI_RAW_XML]: 'application/vnd.esri.wms_raw_xml',
        [GetFeatInfoFormats.ESRI_FEATURE_INFO]: 'application/vnd.esri.wms_featureinfo_xml',
        [GetFeatInfoFormats.OGC_XML]: 'application/vnd.ogc.wms_xml',
        [GetFeatInfoFormats.GEOJSON]: 'application/geojson'
    }

    supportedCRS = {
        'EPSG:3857': L.CRS.EPSG3857,
        'EPSG:4326': L.CRS.EPSG4326,
        'EPSG:3395': L.CRS.EPSG3395,
        'EPSG:900913': L.CRS.EPSG900913,
        'CRS84': L.CRS.EPSG4326,
        'CRS:84': L.CRS.EPSG4326
    };

    linePatternDashArrays = {
        [LineType$v1.solid]: [],
        [LineType$v1.dashed]: [5, 5],
        [LineType$v1.dots]: [2, 5],
        [LineType$v1.dashDot]: [5, 5, 2, 5],
        [LineType$v1.dashDotDot]: [5, 5, 2, 5, 2, 5],
        [LineType$v1.longDashShortDash]: [10, 5, 5, 5]
    };

    languageChanged$: Subject<string>;
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private commonmapDataSvc: CommonmapDataService$v1,
        private mailboxSvc: Common.CommonmapMailboxService,
        private commonIdentAdapterSvc: CommonidentityAdapterService$v1,
        private tenantSvc: CommontenantAdapterService$v1,
        private localizationSvc: CommonlocalizationAdapterService$v1,
        private ffAdapterSvc: CommonfeatureflagsAdapterService$v1,
        private licAdapterSvc: CommonlicensingAdapterService$v1,
        private layoutAdapter: LayoutCompilerAdapterService,
        private shapesAdapterSvc: ShapesAdapterService$v1,
        private hxdrSvc: HxDRHelperService
    ) {
        this.initListeners();
        this.initializeLayerOptionDefaults();
        this.initLocalization();

        const head: HTMLElement = document.getElementsByTagName('head')[0];
        let style = document.createElement('link');
        style.href = 'assets/commonmap-core/styles/leaflet.contextmenu.css';
        style.media = 'all';
        style.rel = 'stylesheet';
        style.type = 'text/css';
        head.append(style);

        style = document.createElement('link');
        style.href = 'assets/commonmap-core/styles/leaflet.overrides.css';
        style.media = 'all';
        style.rel = 'stylesheet';
        style.type = 'text/css';
        head.append(style);

        this.languageChanged$ = this.localizationSvc.adapterEvents.languageChanged$;
        this.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
            this.translateAndUpdateSystemMapDataTokens();
        });
        this.mailboxSvc.mailbox$v1.coreIsLoaded$.next(true);
        this.layoutAdapter.coreIsLoadedAsync(Common.capabilityId);
        this.getMapData();

        this.authToken$ = commonmapDataSvc.authToken$;
        this.authToken$.pipe(
            filter(item => !!item)
        ).subscribe((authToken) => {
            this.curAuthToken = authToken;
        });
    }

    async getMapData() {

        const capManifests = await this.tenantSvc.getCapabilityListAsync(Common.capabilityId);
        if (capManifests != null) {
            const tokens = [];
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
                                    tokens.push(mapLayerData.nameToken);
                                }
                            }
                        }
                    }
                }
            }
            await this.localizationSvc.localizeStringsAsync(tokens);
        }


        // Replace default map presets and default map layers name tokens with
        // localized strings;

        const dataReady = zip(
            this.commonmapDataSvc.getMapLayers(),
            this.commonmapDataSvc.getSystemDefinedMapLayers(),
            this.commonmapDataSvc.getMapPresets(),
            this.commonmapDataSvc.getSystemDefinedMapPresets(),
            this.commonIdentAdapterSvc.getUserInfoAsync());

        dataReady.subscribe(async (val) => {

            const tokens = [];
            this.mapLayerDtos = [];
            this.mapPresetDtos = [];
            this.mapLayers = [];
            this.mapPresets = [];

            if (val[1]) {
                for (const layerDto of val[1]) {
                    this.decodeMapLayer(layerDto);
                    let addLayer = true;
                    if (layerDto.capabilityModuleRef) {
                        const result = this.capabilityMapLayerData.find(data => data.capabilityId === layerDto.capabilityModuleRef);

                        if (result?.featureFlag) {
                            if (!this.isFeatureFlagEnabled(result.featureFlag)) {
                                addLayer = false;
                            }
                        }
                    }
                    if (addLayer) {
                        tokens.push(layerDto.name);
                        this.sysLayerNameTokens[layerDto.id] = layerDto.name;
                        const temp = new Common.MapLayerDtoLeaflet$v1(layerDto);
                        this.mapLayerDtos.push(temp);
                        this.mapLayers.push(temp.createMapLayerFromDto());
                    }
                }
            }

            if (val[0]) {
                for (const layerDto of val[0]) {
                    const option = layerDto.options.find((opt) => opt.name === Common.MapLayerOptionName.WorkingLayer);
                    if (!option) {
                        this.decodeMapLayer(layerDto);
                        let addLayer = true;
                        if (layerDto.capabilityModuleRef) {
                            const result = this.capabilityMapLayerData.find(data => data.capabilityId === layerDto.capabilityModuleRef);

                            if (result?.featureFlag) {
                                if (!this.isFeatureFlagEnabled(result.featureFlag)) {
                                    addLayer = false;
                                }
                            }
                        }
                        if (addLayer) {
                            layerDto.isSystemDefined = false;
                            const temp = new Common.MapLayerDtoLeaflet$v1(layerDto);
                            this.mapLayerDtos.push(temp);
                            this.mapLayers.push(temp.createMapLayerFromDto());
                        }
                    }
                }
            }

            this.mapLayers = this.mapLayers.filter((layer) => {
                const opt = layer.getOption(Common.MapLayerOptionName.WorkingLayer);
                return (!opt);
            });
            this.mapLayers = this.mapLayers.sort(this.sortByName);

            for (const mapLayer of this.mapLayers) {
                this.removeURLParams(mapLayer);
            }

            if (val[3]) {
                for (const presetDto of val[3]) {
                    this.decodeMapPreset(presetDto);
                    tokens.push(presetDto.name);
                    this.sysLayerNameTokens[presetDto.id] = presetDto.name
                    const temp = new Common.MapPresetDtoLeaflet$v1(presetDto);
                    this.mapPresetDtos.push(temp);
                    this.mapPresets.push(temp.createMapPresetFromDto(this.mapLayerDtos));
                    if (this.mapPresets[this.mapPresets.length - 1].name.toLowerCase() === this.defaultMapPresetToken.toLowerCase()) {
                        this.defaultMapPreset = this.mapPresets[this.mapPresets.length - 1];
                        const userInfo = await this.commonIdentAdapterSvc.getUserInfoAsync();
                        const tenant = await this.tenantSvc.getTenantAsync(userInfo.activeTenant);
                        if (tenant && tenant.mapData) {
                            if (tenant.mapData.centerLatitude && tenant.mapData.centerLongitude && tenant.mapData.zoomLevel) {
                                const lat = parseFloat(tenant.mapData.centerLatitude);
                                const lng = parseFloat(tenant.mapData.centerLongitude);
                                const alt = 0;
                                if (lat && lng) {
                                    this.defaultMapPreset.mapCenter = new Common.Point$v1(lat, lng, alt);
                                }
                                const zoomLevel = parseInt(tenant.mapData.zoomLevel, 10);
                                if (zoomLevel) {
                                    this.defaultMapPreset.zoomLevel = zoomLevel;
                                }
                            }
                        }
                    }
                }
            }

            if (val[2]) {
                for (const presetDto of val[2]) {
                    this.decodeMapPreset(presetDto);
                    presetDto.isSystemDefined = false;

                    const temp = new Common.MapPresetDtoLeaflet$v1(presetDto);
                    this.mapPresetDtos.push(temp);
                    this.mapPresets.push(temp.createMapPresetFromDto(this.mapLayerDtos));
                }
            }

            this.userInfo = val[4];

            this.mapPresets = this.mapPresets.sort(this.sortByName);

            if (tokens && tokens.length > 0) {
                this.translateAndUpdateSystemMapDataTokens();
                this.mapDataReady$.next(true);
            } else {
                this.mapDataReady$.next(true);
            }

        });
    }

    translateAndUpdateSystemMapDataTokens(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const tokens = Object.values(this.sysLayerNameTokens) as string[];

            if (tokens?.length > 0) {
                await this.localizationSvc.localizeStringsAsync(tokens);
                this.getTranslatedStrings(tokens).then((transStrings) => {
                    this.translatedStrings = transStrings;
                    for (const layer of this.mapLayers) {
                        if (layer.isSystemDefined) {
                            const token = this.sysLayerNameTokens[layer.id];
                            if (token && this.translatedStrings[token]) {
                                layer.name = this.translatedStrings[token];
                            }
                        }
                    }

                    for (const preset of this.mapPresets) {
                        this.translateMapPreset(preset);
                    }

                    this.mapLayers = this.mapLayers.sort(this.sortByName);
                    this.mapPresets = this.mapPresets.sort(this.sortByName);
                    this.mapDataTranslated$.next();
                    resolve();
                });
            }
        });
    }

    translateMapPreset(preset: Common.MapPreset$v1) {
        if (preset.isSystemDefined) {
            const token = this.sysLayerNameTokens[preset.id];
            if (token && this.translatedStrings[token]) {
                preset.name = this.translatedStrings[token];
            }
        }

        for (const layer of preset.mapLayers) {
            const token = this.sysLayerNameTokens[preset.id];
            if (layer.isSystemDefined) {
                const token = this.sysLayerNameTokens[layer.id];
                if (token && this.translatedStrings[token]) {
                    layer.name = this.translatedStrings[token];
                }
            }
        }
    }

    initListeners() {
        /** Listen for other map providers to request mapview loaded event */
        this.mailboxSvc.mailbox$v1.notifyMapViewLoaded$.subscribe((mapComm: Common.MapCommunication$v1) => {
            this.mailboxSvc.mailbox$v1.mapViewLoaded$.next(mapComm);
        });
    }

    public newGuid() {
        return Guid.NewGuid();
    }

    localizeGroup(groups: string | string[]) {
        return (this.localizationSvc.localizeGroup(groups));
    }

    getTranslatedStrings(tokens: string[]): Promise<any> {
        return new Promise<any>((resolve) => {
            this.localizationSvc.getTranslationAsync(tokens).catch((reason) => {
                console.log('Error translating strings: ' + reason);
                resolve({});
            }).then((response) => {
                resolve(response);
            });
        });
    }

    initializeLayerOptionDefaults() {
        this.layerOptionDefaults = [];
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.Attribution, value: '', type: 'string' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.ZoomOffset, value: '0', type: 'number' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.TMS, value: 'false', type: 'boolean' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.TileSize, value: '256', type: 'number' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.TileLevels, value: '19', type: 'number' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.Format, value: 'image/png', type: 'string' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.Transparent, value: 'true', type: 'boolean' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.CRS, value: 'EPSG:3857', type: 'string' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.Version, value: '1.3.0', type: 'string' }));
        this.layerOptionDefaults.push(new Common.MapLayerOption$v1({ name: Common.MapLayerOptionName.LocalAccessOnly, value: 'false', type: 'boolean' }));
    }

    getLayerOptionDefault(optionName) {
        const result = this.layerOptionDefaults.filter(layerOption => layerOption.name === optionName);
        if (result.length > 0) {
            return (result[0]);
        } else {
            return (null);
        }
    }

    registerMap(map: any): string {
        if (!map.mapInfo) {
            const mapInfo: any = {};
            mapInfo.mapId = this.newGuid();
            map.mapInfo = mapInfo;
            this.maps[mapInfo.mapId] = map;
        }
        return (map.mapInfo);
    }

    isImageFormatSupported(format: string) {
        const temp = this.supportedImageFormats.find((fmt) => fmt.toLowerCase() === format.toLowerCase());
        return (!!temp);
    }

    isOutputFormatSupported(format: string) {
        const temp = this.supportedOutputFormats.find((fmt) => fmt.toLowerCase() === format.toLowerCase());
        return (!!temp);
    }

    isFeatInfoFormatSupported(format: string) {
        const temp = this.supportedFeatInfoFormats[format];
        return (!!temp);
    }

    isFeatureFlagEnabled(featureFlag: string) {
        const value = this.ffAdapterSvc.isActive(featureFlag);
        return (this.ffAdapterSvc.isActive(featureFlag));
    }

    async isLicenseValidAsync(licenseFeatureId) {
        return (new Promise<boolean>(async (resolve) => {
            resolve(await this.licAdapterSvc.isFeatureLicensedAsync(licenseFeatureId));
        }));
    }

    getMapPreset(mapPresetId: string): Common.MapPreset$v1 {
        let mapPreset: Common.MapPreset$v1;

        mapPreset = this.mapPresets.find((preset) => preset.id === mapPresetId);

        return mapPreset;
    }

    getDefaultMapPreset(): Promise<Common.MapPreset$v1> {
        return new Promise<Common.MapPreset$v1>(async (resolve) => {
            const userInfo = await this.commonIdentAdapterSvc.getUserInfoAsync();
            const tenant = await this.tenantSvc.getTenantAsync(userInfo.activeTenant);
            if (tenant && tenant.mapData) {
                if (tenant.mapData.centerLatitude && tenant.mapData.centerLongitude && tenant.mapData.zoomLevel) {
                    const lat = parseFloat(tenant.mapData.centerLatitude);
                    const lng = parseFloat(tenant.mapData.centerLongitude);
                    const alt = 0;
                    if (lat && lng) {
                        this.defaultMapPreset.mapCenter = new Common.Point$v1(lat, lng, alt);
                    }
                    const zoomLevel = parseInt(tenant.mapData.zoomLevel, 10);
                    if (zoomLevel) {
                        this.defaultMapPreset.zoomLevel = zoomLevel;
                    }
                }
            }

            resolve(this.defaultMapPreset);
        });
    }

    async getPersonalizationInfoAsync(personalizationId: string) {
        let mapOverrides: MapviewOverrides;
        try {
            const info: UserPersonalization$v1 = <UserPersonalization$v1>await this.commonIdentAdapterSvc.getUserPersonalizationAsync(
                this.userInfo.id, personalizationId);

            if (info && info.personalizationSettings) {
                mapOverrides = JSON.parse(decodeURIComponent(info.personalizationSettings));
            }

        } catch {
            console.log('Commonmap: Error occurred trying to get the overrides');
        }
        return (mapOverrides);
    }

    async savePersonalizationInfoAsync(personalizationId: string, mapviewOverrides: MapviewOverrides) {
        const info = encodeURIComponent(JSON.stringify(mapviewOverrides));
        try {
            await this.commonIdentAdapterSvc.saveUserPersonalizationAsync(this.userInfo.id,
                personalizationId, info);
        } catch {
            console.log('Commonmap: Error occurred trying to save the overrides');
        }
    }

    async deletePersonalizationInfoAsync(personalizationId: string) {
        try {
            await this.commonIdentAdapterSvc.deleteUserPersonalizationAsync(this.userInfo.id,
                personalizationId);
        } catch {
            console.log('Commonmap: Error occurred trying to delete the overrides');
        }
    }

    removeURLParams(mapLayer: Common.MapLayer$v1) {
        const regex = /[?&]([^=#]+)=([^&#]*)/g;
        let match;
        let params: any;

        params = {};
        const idx = mapLayer.url.indexOf('?');
        if (idx !== -1) {
            while (match = regex.exec(mapLayer.url)) {
                params[match[1]] = match[2];
            }

            let option;
            for (const paramName of Object.keys(params)) {
                if (paramName === 'userid' && params[paramName] === '{username}') {
                    option = mapLayer.options.find((opt) => opt.name === 'username');
                    if (option) {
                        option.name = 'userid';
                        option.type = 'urlParam';
                    }
                } else if (paramName === 'passwd' && params[paramName] === '{password}') {
                    option = mapLayer.options.find((opt) => opt.name === 'password');
                    if (option) {
                        option.name = 'passwd';
                        option.type = 'urlParam';
                    }
                } else if (paramName === 'subscription-key' && params[paramName] === '{subscription-key}') {
                    option = mapLayer.options.find((opt) => opt.name === 'subscription-key');
                    if (option) {
                        option.type = 'urlParam';
                    }
                } else {
                    option = mapLayer.options.find((opt) => opt.name === paramName && opt.type === 'urlParam');
                    if (option) {
                        option.value = params[paramName];
                    } else {
                        const mapOption = new Common.MapLayerOption$v1({ name: paramName, value: params[paramName], type: 'urlParam' });
                        mapLayer.options.push(mapOption);
                    }
                }
            }
            mapLayer.url = mapLayer.url.substr(0, idx);
        }
    }

    createPaneNameForLayer(layer: Common.MapLayer$v1): string {
        const validName: string = layer.name.replace(/ /g, '_') + '-' + layer.id;
        return (validName);
    }

    getSelectedBaseMap(mapLayers: Common.MapLayer$v1[]): Common.MapLayer$v1 {
        return (mapLayers.find((layer: Common.MapLayer$v1) =>
            layer.type === Common.MapLayerType$v1.BaseMap && layer.shownOnStartup));
    }

    createMapPane(mapPaneName: string, containerPane: any, map: L.Map, zIndex: number) {
        let newPane;

        const paneName = mapPaneName.replace(/ /g, '_');
        if (containerPane === null) {
            newPane = map.createPane(paneName);
        } else {
            newPane = map.createPane(paneName, containerPane);
        }

        if (newPane && newPane.style && zIndex) {
            newPane.style.zIndex = zIndex;
        }

        return (newPane);
    }

    deleteMapPaneByLayer(mapLayer: Common.MapLayer$v1, map: L.Map) {
        const paneName = this.createPaneNameForLayer(mapLayer);
        this.deleteMapPane(paneName, map);
    }

    deleteMapPane(mapPaneName: string, map: L.Map) {
        const pane = map.getPane(mapPaneName);

        if (pane != null) {
            L.DomUtil.remove(pane);
            delete (<any>map)._panes[mapPaneName];
            delete (<any>map)._paneRenderers[mapPaneName];
        }
    }

    getLeafletMapOptions(settings: Common.MapSettings$v1, mapPreset: Common.MapPreset$v1, contextMenuItems?: ContextMenuItem[]): L.MapOptions {
        const mapOptions: L.MapOptions = {};
        if (mapPreset != null) {

            mapOptions.zoom = settings.zoomLevel ? settings.zoomLevel : mapPreset.zoomLevel;
            const mapCenter: Common.Point$v1 = settings.mapCenter ? settings.mapCenter : mapPreset.mapCenter;



            mapOptions.center = L.latLng(mapCenter.latitude, mapCenter.longitude);
            mapOptions.zoomControl = false;
            mapOptions.maxZoom = 24;
            mapOptions.worldCopyJump = true;


            if (!this.isFeatureFlagEnabled(Common.FeatureFlags.LayerInfoCmds)) {
                (mapOptions as any).showCurrentLocation = false;
            }
            (mapOptions as any).contextmenu = true;
            (mapOptions as any).contextmenuAnchor = [15, 0];
            if (contextMenuItems) {
                (mapOptions as any).contextmenuItems = contextMenuItems;
            }

            if (settings && settings.readOnly) {
                mapOptions.doubleClickZoom = false;
                mapOptions.scrollWheelZoom = false;
                mapOptions.dragging = false;
            }
        }

        return mapOptions;
    }

    contextMenuCallback(data: any) {

        console.log(`Context menu index: ${data.index}`);
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

    getMapLayers(mapPreset: Common.MapPreset$v1,
        type: Common.MapLayerType$v1,
        searchString?: string): Common.MapLayer$v1[] {
        const mapLayers: Common.MapLayer$v1[] = [];
        if (mapPreset) {
            for (const mapPresetLayer of mapPreset.mapLayers) {
                let addLayer = this.isFeatureFlagForLayer(mapPresetLayer);

                if (addLayer) {
                    if (mapPresetLayer.type === type) {
                        if (this.compareWithSearchString(mapPresetLayer.name, searchString)) {
                            mapLayers.push(mapPresetLayer);
                        }
                    }
                }
            }
        }
        return (mapLayers);
    }

    isFeatureFlagForLayer(layer) {
        if (!this.isFeatureFlagEnabled(Common.FeatureFlags.EnableHxDR)) {
            if (this.isHxDRLayerType(layer)) {
                return(false);
            }
        }

        if (!this.isFeatureFlagEnabled(Common.FeatureFlags.EnableHxCP)) {
            if (this.isHxCPLayerType(layer)) {
                return(false);
            }
        }

        if (!this.isFeatureFlagEnabled(Common.FeatureFlags.WFS)) {
            if (layer.format === Common.LayerFormat$v1.WFS) {
                return(false);
            }
        }

        return(true);
    }


    filterMapLayers(mapLayers: Common.MapLayer$v1[], searchString?: string): Common.MapLayer$v1[] {
        const filteredLayers = [];
        for (const layer of mapLayers) {
            let addLayer = true;
            if (!this.isFeatureFlagEnabled(Common.FeatureFlags.EnableHxDR)) {
                if (this.isHxDRLayerType(layer)) {
                    addLayer = false;
                }
            }

            if (!this.isFeatureFlagEnabled(Common.FeatureFlags.EnableHxCP)) {
                if (this.isHxCPLayerType(layer)) {
                    addLayer = false;
                }
            }
            if (addLayer) {
                if (this.compareWithSearchString(layer.name, searchString)) {
                    filteredLayers.push(layer);
                }
            }
        }
        return (filteredLayers);
    }

    getLayerOptionValue(mapLayer: Common.MapLayer$v1, optionName: string) {
        const opt = mapLayer.getOption(optionName);
        if (opt) {
            return (opt.value);
        } else {
            return null;
        }
    }

    getLayerCRS(mapLayer: Common.MapLayer$v1) {
        const opt = mapLayer.getOption(Common.MapLayerOptionName.CRS);
        let crsName;
        if (opt) {
            crsName = opt.value;
        } else {
            crsName = 'EPSG:3857'
        }
        return (this.getCRSByName(crsName));

    }

    getWMSVersion(mapLayer: Common.MapLayer$v1) {
        const opt = mapLayer.getOption('version');
        let version;
        if (opt) {
            version = opt.value;
        } else {
            version = '1.3.0'
        }
        return (version);

    }

    // Check if HxDR type layer
    isHxDRLayerType(mapLayer: Common.MapLayer$v1) {
        return (mapLayer.format === Common.LayerFormat$v1.HxDRWMS);
    }

    // Check if HxDR type layer
    isHxCPLayerType(mapLayer: Common.MapLayer$v1) {
        return (mapLayer.format === Common.LayerFormat$v1.HxCPWMS ||
            mapLayer.format === Common.LayerFormat$v1.HxCPWMTS);
    }

    compareWithSearchString(token: any, searchString: string): boolean {
        if (!token) {
            return (false) 
        } else {
            let tokenStr;
            try {
                let isContained = true;
                if (token.toString) {
                    tokenStr = token.toString();
                    if (tokenStr?.toLowerCase && searchString?.toLowerCase) {
                        isContained = (tokenStr.toLowerCase().search(searchString.toLowerCase()) !== -1);
                    }
                }
                return (isContained);
    
            } catch (ex) {
                return (true);
            }
        }
    }

    encodeMapPreset(mapPreset: Common.MapPresetDtoLeaflet$v1) {
        mapPreset.name = encodeURIComponent(mapPreset.name);
    }

    encodeMapLayer(mapLayer: Common.MapLayerDtoLeaflet$v1) {
        mapLayer.url = encodeURIComponent(mapLayer.url);
        mapLayer.name = encodeURIComponent(mapLayer.name);
        if (mapLayer.capabilityModuleRef) {
            mapLayer.capabilityModuleRef = encodeURIComponent(mapLayer.capabilityModuleRef);
        }
        if (mapLayer.imageName) {
            mapLayer.name = encodeURIComponent(mapLayer.name);
        }

        for (let jj = 0; jj < mapLayer.options.length; jj++) {
            if (mapLayer.options[jj].type === 'string' || mapLayer.options[jj].type === 'urlParam') {
                mapLayer.options[jj].value = encodeURIComponent(mapLayer.options[jj].value);
            }
        }

        if (mapLayer.wmsLayers) {
            for (let jj = 0; jj < mapLayer.wmsLayers.length; jj++) {
                mapLayer.wmsLayers[jj] = encodeURIComponent(mapLayer.wmsLayers[jj]);
            }
        }
    }

    decodeMapPreset(mapPreset: Common.MapPresetDtoLeaflet$v1) {
        mapPreset.name = decodeURIComponent(mapPreset.name);
    }

    decodeMapLayer(mapLayer: Common.MapLayerDtoLeaflet$v1) {
        mapLayer.url = decodeURIComponent(mapLayer.url);
        mapLayer.name = decodeURIComponent(mapLayer.name);
        if (mapLayer.capabilityModuleRef) {
            mapLayer.capabilityModuleRef = decodeURIComponent(mapLayer.capabilityModuleRef);
        }
        if (mapLayer.imageName) {
            mapLayer.name = decodeURIComponent(mapLayer.name);
        }

        for (let jj = 0; jj < mapLayer.options.length; jj++) {
            if (mapLayer.options[jj].type === 'string' || mapLayer.options[jj].type === 'urlParam') {
                mapLayer.options[jj].value = decodeURIComponent(mapLayer.options[jj].value);
            }
        }

        if (mapLayer.wmsLayers) {
            for (let jj = 0; jj < mapLayer.wmsLayers.length; jj++) {
                mapLayer.wmsLayers[jj] = decodeURIComponent(mapLayer.wmsLayers[jj]);
            }
        }
    }

    getDisplayOpacity(mapLayer: Common.MapLayer$v1) {
        let opacity: number = mapLayer.opacity;
        if (mapLayer.type === Common.MapLayerType$v1.BaseMap) {
            opacity = 1;
        }

        return (opacity);
    }

    zoomTo(marker: L.Marker, zoomLevel = 19, map: L.Map): void {
        if (marker) {
            let pos = marker.getLatLng();

            const targetPoint = map.project(pos, zoomLevel).subtract([this.centerOffsetX, this.centerOffsetY]);
            pos = map.unproject(targetPoint, zoomLevel);

            map.setView(pos, zoomLevel);
        }
    }

    getMapZoom(map: L.Map): number {
        return map.getZoom();
    }

    zoomToMapLocation(position: Common.Point$v1, zoomLevel: number, map: L.Map): void {
        if (position) {
            const pos = this.convertPositionToLatLng(position);
            map.setView(pos, zoomLevel);
        }

    }

    convertPositionToLatLng(position: Common.Point$v1): L.LatLng {
        const latLng: L.LatLng = new L.LatLng(position.latitude, position.longitude);
        return (latLng);
    }

    panTo(marker: L.Marker, map: L.Map): void {
        if (map) {
            if (marker) {

                let pos = marker.getLatLng();

                const targetPoint = map.project(pos, map.getZoom()).subtract([this.centerOffsetX, this.centerOffsetY]);
                pos = map.unproject(targetPoint, map.getZoom());

                map.panTo(pos);
            }
        }
    }

    panToCenter(map: L.Map): void {
        let pos = map.getCenter();
        const targetPoint = map.project(pos, map.getZoom()).subtract([this.centerOffsetX, this.centerOffsetY]);
        pos = map.unproject(targetPoint, map.getZoom());

        map.panTo(pos);
    }


    destroyMap(map): void {
        if (map) {
            try {
                map.remove();
                map = null;
            } catch (e) {
                // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
                map = null;
            }
        }
    }

    refreshMap(map: L.Map): void {
        if (map) {
            map.invalidateSize({ animate: true });
        }
    }

    // Creates a leaflet geometry that can be added to the map
    createLeafletGeometry(geom: Common.Geometry$v1, paneName: string) {
        let leafletGeom;
        switch (geom.type) {
            case Common.GeometryType$v1.polygon: {
                const polygon = geom.coordinates as [[number[]]]
                let pts = [];
                for (const poly of polygon) {
                    for (const coords of poly) {
                        pts.push(new L.LatLng(coords[1], coords[0]));
                    }
                }
                leafletGeom = new L.Polygon(pts, {
                    pane: paneName
                } as L.PolylineOptions);
                break;
            }
        }

        return (leafletGeom);
    }

    async createLeafletLayer(mapLayer: Common.MapLayer$v1, selectionSvc?: MapLayerSelectionService$v1, mapviewContextId?: string): Promise<L.Layer> {
        return new Promise<L.Layer>(async (resolve) => {
            try {
                let layer: any;
                let options: any = {};
                const layerInfo: any = {};
                let localAccessOnly: boolean;
                layerInfo.mapLayer = mapLayer;

                options.pane = this.createPaneNameForLayer(mapLayer);

                const localAccessOption = mapLayer.getOption(Common.MapLayerOptionName.LocalAccessOnly);
                localAccessOnly = !!localAccessOption && localAccessOption.value === 'true';

                switch (mapLayer.format) {
                    // case layerFormat.Image: {

                    // 	options.opacity = mapLayer.opacity;
                    // 	for (let option of mapLayer.options) {
                    // 		options[option.name] = option.value;
                    // 	}

                    // 	if (mapLayer.Anchors.length === 4) {
                    // 		let anchorsLL: LatLng[] = this.convertAnchorsPositionToLatLng(mapLayer.Anchors);
                    // 		if (anchorsLL) {
                    // 			let time = new Date().getTime().toString();
                    // 			let url = mapLayer.URL + '?' + time;
                    // 			layer = imageTransform(url, anchorsLL, options);
                    // 			if (mapLayer.IsMinMaxZoomDefined) {
                    // 				secInfo.CustMinZoom = mapLayer.minZoomLevel;
                    // 				secInfo.CustMaxZoom = mapLayer.maxZoomLevel;
                    // 			}
                    // 		}
                    // 	}
                    // 	break;
                    // }

                    case Common.LayerFormat$v1.Tile: {
                        const url = this.getUrlWithParamsForLeaflet(mapLayer, localAccessOnly);

                        if (mapLayer.defineMinZoom) {
                            options.minZoom = mapLayer.minZoomLevel;
                        }
                        if (mapLayer.defineMaxZoom) {
                            options.maxZoom = mapLayer.maxZoomLevel;
                        } else {
                            options.maxZoom = 24;
                        }

                        options.opacity = this.getDisplayOpacity(mapLayer);
                        const defTileLevels = parseInt(this.getLayerOptionDefault(Common.MapLayerOptionName.TileLevels).value, 10);
                        options.maxNativeZoom = defTileLevels - 1;

                        const tileLevelsOpt = mapLayer.getOption(Common.MapLayerOptionName.TileLevels);
                        if (tileLevelsOpt) {
                            const temp = parseInt(tileLevelsOpt.value, 10);
                            if (!isNaN(temp)) {
                                options.maxNativeZoom = temp - 1;
                            }
                        }
                        for (const option of mapLayer.options) {
                            if (option.name === Common.MapLayerOptionName.CRS) {
                                if (option.value === 'EPSG3857') {
                                    option.value = 'EPSG:3857';
                                }

                                let crs;
                                crs = this.getCRSByName(option.value);

                                if (crs !== null) {
                                    options[option.name] = crs;
                                }

                            } else if (option.name !== Common.MapLayerOptionName.WorkingLayer && option.name !== Common.MapLayerOptionName.LocalAccessOnly &&
                                option.name !== Common.MapLayerOptionName.AutoRefresh && option.name !== Common.MapLayerOptionName.AutoRefreshInterval) {
                                if (option.value !== '{x}' && option.value !== '{y}' && option.value !== '{z}') {
                                    options[option.name] = this.convertOptionStringValueToType(option);
                                }
                            }
                        }

                        if (localAccessOnly) {
                            layer = new L.TileLayer(url, options);
                        } else {

                            // Create the header information for the bearer token that used in the proxy api calls;
                            const headers: { header: string, value: string }[] = [];
                            headers.push({
                                header: 'Authorization',
                                value: 'Bearer ' + this.curAuthToken
                            });

                            layer = new L.TileLayer.TileLayerWithHeaders(url, options, headers, null);
                        }
                        break;
                    }

                    case Common.LayerFormat$v1.HxCPWMS:
                    case Common.LayerFormat$v1.WMS: {
                        const url = this.getUrlWithParamsForLeaflet(mapLayer, localAccessOnly);
                        options.layers = this.getCommaSeparatedWMSLayers(mapLayer.wmsLayers);
                        if (!options.layers || options.layers.length === 0) {
                            return (null);
                        }

                        if (mapLayer.defineMinZoom) {
                            options.minZoom = mapLayer.minZoomLevel;
                        }
                        if (mapLayer.defineMaxZoom) {
                            options.maxZoom = mapLayer.maxZoomLevel;
                        } else {
                            options.maxZoom = 24;
                        }

                        options.opacity = this.getDisplayOpacity(mapLayer);

                        for (const option of mapLayer.options) {
                            if (option.name === Common.MapLayerOptionName.CRS) {
                                let crs;
                                crs = this.getCRSByName(option.value);

                                if (crs !== null) {
                                    options[option.name] = crs;
                                }
                            } else if (this.isLeafletOption(option)) {
                                options[option.name] = this.convertOptionStringValueToType(option);
                            }
                        }
                        if (!options.version) {
                            options.version = '1.3.0';
                        }
                        if (!options.transparent) {
                            options.transparent = true;
                        }

                        if (!options.format) {
                            options.format = 'image/png';
                        }

                        if (localAccessOnly) {
                            layer = new L.TileLayer.WMS(url, options);
                        } else {

                            // Create the header information for the bearer token that used in the proxy api calls;
                            const headers: { header: string, value: string }[] = [];
                            headers.push({
                                header: 'Authorization',
                                value: 'Bearer ' + this.curAuthToken
                            });

                            layer = new L.TileLayer.WMSHeader(url, options, headers, null);
                        }

                        break;
                    }
                    case Common.LayerFormat$v1.HxCPWMTS:
                    case Common.LayerFormat$v1.WMTS: {
                        let url;
                        if (!localAccessOnly) {
                            const result = this.swapMapUrlWithProxy(mapLayer.url);
                            url = result.newURL;
                        } else {
                            url = mapLayer.url;
                        }
                        const requestParams = this.getRequestParams(mapLayer, localAccessOnly);

                        options.requestParams = requestParams;

                        let opt = mapLayer.getOption(Common.MapLayerOptionName.WMTSLayerId);
                        if (opt) {
                            options.layer = opt.value;
                        }

                        opt = mapLayer.getOption(Common.MapLayerOptionName.TileMatrixSetId);
                        if (opt) {
                            options.tilematrixSet = opt.value;
                        }

                        if (mapLayer.defineMinZoom) {
                            options.minZoom = mapLayer.minZoomLevel;
                        }
                        if (mapLayer.defineMaxZoom) {
                            options.maxZoom = mapLayer.maxZoomLevel;
                        } else {
                            options.maxZoom = 24;
                        }

                        options.opacity = this.getDisplayOpacity(mapLayer);

                        for (const option of mapLayer.options) {
                            if (option.name === Common.MapLayerOptionName.CRS) {
                                let crs;
                                crs = this.getCRSByName(option.value);

                                if (crs !== null) {
                                    options[option.name] = crs;
                                }
                            } else if (this.isLeafletOption(option)) {
                                options[option.name] = this.convertOptionStringValueToType(option);
                            }
                        }

                        if (!options.format) {
                            options.format = 'image/png';
                        }


                        const success = await this.getWMTSOptionsFromCapabilities(mapLayer, options);
                        if (success) {
                            if (localAccessOnly) {
                                layer = new L.TileLayer.WMTSWithHeaders(url, options, null);
                            } else {

                                // Create the header information for the bearer token that used in the proxy api calls;
                                const headers: { header: string, value: string }[] = [];
                                headers.push({
                                    header: 'Authorization',
                                    value: 'Bearer ' + this.curAuthToken
                                });

                                layer = new L.TileLayer.WMTSWithHeaders(url, options, headers);
                            }
                        }

                        break;
                    }
                    case Common.LayerFormat$v1.GeoJSON: {
                        const url = this.getUrlWithParamsForLeaflet(mapLayer, localAccessOnly);

                        if (mapLayer.defineMinZoom) {
                            options.minZoom = mapLayer.minZoomLevel;
                        }
                        if (mapLayer.defineMaxZoom) {
                            options.maxZoom = mapLayer.maxZoomLevel;
                        } else {
                            options.maxZoom = 24;
                        }
                        options.opacity = this.getDisplayOpacity(mapLayer);
                        options.markersInheritOptions = true;
                        options.bubblingMouseEvents = true;

                        if (this.isFeatureFlagEnabled(Common.FeatureFlags.Selection)) {
                            options.interactive = true;
                        } else {
                            options.interactive = false;
                        }
                        
                        this.addContextMenu(mapLayer, options, mapviewContextId, selectionSvc);

                        for (const option of mapLayer.options) {
                            if (option.name === Common.MapLayerOptionName.CRS) {

                                let crs;
                                crs = this.getCRSByName(option.value);

                                if (crs !== null) {
                                    options[option.name] = crs;
                                }

                            } else if (option.name === Common.MapLayerOptionName.VectorStyleProps) {
                                const vectStyle = JSON.parse(option.value);
                                if (vectStyle) {
                                    options = this.addLayerStyleOptionsToLeafletOptions(vectStyle, options, options.pane, mapLayer,
                                         selectionSvc, mapviewContextId);
                                }
                            } else if (this.isLeafletOption(option)) {
                                options[option.name] = this.convertOptionStringValueToType(option);
                            }
                        }

                        if (localAccessOnly) {
                            layer = new L.GeoJSON.AJAX(url, options);
                        } else {

                            // Create the header information for the bearer token that used in the proxy api calls;
                            const headers = {
                                'Authorization': 'Bearer ' + this.curAuthToken
                            };
                            options.headers = headers;

                            layer = new L.GeoJSON.AJAX(url, options);
                        }

                        break;
                    }
                    case Common.LayerFormat$v1.WFS: {
                        options.url = this.getUrlWithParamsForLeaflet(mapLayer, localAccessOnly);

                        if (mapLayer.defineMinZoom) {
                            options.minZoom = mapLayer.minZoomLevel;
                        }
                        if (mapLayer.defineMaxZoom) {
                            options.maxZoom = mapLayer.maxZoomLevel;
                        } else {
                            options.maxZoom = 24;
                        }

                        options.opacity = this.getDisplayOpacity(mapLayer);
                        options.markersInheritOptions = true;
                        // options.bubblingMouseEvents = true;

                        if (this.isFeatureFlagEnabled(Common.FeatureFlags.Selection)) {
                            options.interactive = true;
                        } else {
                            options.interactive = false;
                        }

                        options.maxFeatures = 1000;
                        let temp = mapLayer.getOption(Common.MapLayerOptionName.MaxFeatures);
                        if (temp) {
                            options.maxFeatures = temp.value;
                        }

                        this.setWFSTypeName(mapLayer.wmsLayers[0], options);
                        options.outputFormat = 'json';
                        temp = mapLayer.getOption(Common.MapLayerOptionName.WFSOutputFormat);
                        if (temp) {
                            options.outputFormat = temp.value;
                        }

                        this.addContextMenu(mapLayer, options, mapviewContextId, selectionSvc);

                        for (const option of mapLayer.options) {
                            if (option.name === Common.MapLayerOptionName.CRS) {
                                if (option.value === 'EPSG3857') {
                                    option.value = 'EPSG:3857';
                                }

                                let crs;
                                crs = this.getCRSByName(option.value);

                                if (crs) {
                                    options[option.name] = crs;
                                    options.coordsToLatLng = ((coords: any) => {
                                        const pt = L.GeoJSON.coordsToLatLng(coords);
                                        const latLng = crs.projection.unproject(pt);
                                        return(latLng);
                                    });
                                }

                            } else if (option.name === Common.MapLayerOptionName.VectorStyleProps) {
                                const vectStyle = JSON.parse(option.value);
                                if (vectStyle) {
                                    options = this.addLayerStyleOptionsToLeafletOptions(vectStyle, options, options.pane, mapLayer,
                                        selectionSvc, mapviewContextId);
                                }
                            } else if (this.isLeafletOption(option)) {
                                options[option.name] = this.convertOptionStringValueToType(option);
                            }
                        }

        
                        if (localAccessOnly) {
                            layer = new L.WFS(options);
                        } else {

                            // // Create the header information for the bearer token that used in the proxy api calls;
                            const headers = {
                                'Authorization': 'Bearer ' + this.curAuthToken
                            };
                            // Create the header information for the bearer token that used in the proxy api calls;
                            // const headers: { header: string, value: string }[] = [];
                            // headers.push({
                            //     header: 'Authorization',
                            //     value: 'Bearer ' + this.curAuthToken
                            // });
                            options.headers = headers;
                    
                            layer = new L.WFS(options);
                        }

                        break;
                    }
                    case Common.LayerFormat$v1.HxDRWMS: {
                        const displayInfo = await this.hxdrSvc.getHxDRWMSDisplayInfoAsync(mapLayer);
                        if (displayInfo) {
                            const url = this.getUrlWithParamsForLeaflet(mapLayer, localAccessOnly, displayInfo);
                            options.layers = this.getCommaSeparatedWMSLayers(mapLayer.wmsLayers);
                            if (!options.layers || options.layers.length === 0) {
                                return (null);
                            }

                            if (mapLayer.defineMinZoom) {
                                options.minZoom = mapLayer.minZoomLevel;
                            }
                            if (mapLayer.defineMaxZoom) {
                                options.maxZoom = mapLayer.maxZoomLevel;
                            } else {
                                options.maxZoom = 24;
                            }

                            options.opacity = this.getDisplayOpacity(mapLayer);

                            for (const option of mapLayer.options) {
                                if (option.name === Common.MapLayerOptionName.CRS) {
                                    let crs;
                                    crs = this.getCRSByName(option.value);

                                    if (crs !== null) {
                                        options[option.name] = crs;
                                    }
                                } else if (this.isLeafletOption(option)) {
                                    options[option.name] = this.convertOptionStringValueToType(option);
                                }
                            }
                            if (!options.version) {
                                options.version = '1.3.0';
                            }
                            if (!options.transparent) {
                                options.transparent = true;
                            }

                            if (!options.format) {
                                options.format = 'image/png';
                            }

                            if (localAccessOnly) {
                                layer = new L.TileLayer.WMS(url, options);
                            } else {

                                // Create the header information for the bearer token that used in the proxy api calls;
                                const headers: { header: string, value: string }[] = [];
                                headers.push({
                                    header: 'Authorization',
                                    value: 'Bearer ' + this.curAuthToken
                                });

                                layer = new L.TileLayer.WMSHeader(url, options, headers, null);
                            }
                        }

                        break;
                    }
                }

                if (layer) {
                    layer.layerInfo = layerInfo;
                }

                resolve(layer);
            } catch (err) {
                console.log('Exception thrown creating leaflet layer');
            }
        });
    }

    isLeafletOption(opt) {
        let valid = false;
        if (opt.name !== Common.MapLayerOptionName.WorkingLayer && opt.name !== Common.MapLayerOptionName.LocalAccessOnly && 
            opt.name !== Common.MapLayerOptionName.AutoRefresh &&  opt.name !== Common.MapLayerOptionName.AutoRefreshInterval &&
            opt.name !== Common.MapLayerOptionName.WMTSLayerId && opt.name !== Common.MapLayerOptionName.TileMatrixSetId &&
            opt.name !== Common.MapLayerOptionName.HXDRLayerId && opt.name !== Common.MapLayerOptionName.VectorStyleProps &&
            opt.name !== Common.MapLayerOptionName.EnableFeatInfo && opt.name !== Common.MapLayerOptionName.FeatInfoFormat && 
            opt.name !== Common.MapLayerOptionName.WFSOutputFormat && opt.name !== Common.MapLayerOptionName.MaxFeatures &&
            opt.value !== '{x}' && opt.value !== '{y}' && opt.value !== '{z}') {
            valid = true;
        }

        return (valid);
    }

    addLayerStyleOptionsToLeafletOptions(vectorStyleProps: Common.VectorStyleProperties$v1, options: any, pane: string, mapLayer: Common.MapLayer$v1,
             selectionSvc?: MapLayerSelectionService$v1, mapviewContextId?: string) {
        let newOpts = options;
        let leafletOptions: any;
        if (vectorStyleProps) {
            vectorStyleProps.lineOpacity = mapLayer.opacity;
            vectorStyleProps.fillOpacity = mapLayer.opacity;
            vectorStyleProps.pointSymbolOpacity = mapLayer.opacity;
            leafletOptions = this.convertVectorStylePropsToLeafletOptions(vectorStyleProps, pane);
            if (mapLayer.format === Common.LayerFormat$v1.GeoJSON || mapLayer.format === Common.LayerFormat$v1.WFS) {

                leafletOptions.pointToLayer = ((geoJsonPt, latLng: L.LatLng) => {
                    const layer = this.convertGeoJSONPointFeatureToLayer(latLng, vectorStyleProps, pane, geoJsonPt, mapLayer); 
                    return (layer);
                });

                leafletOptions.style = ((feature) => {
                    const style = {
                        ...leafletOptions
                    };
                    if (feature?.geometry?.type?.toLowerCase() === 'multilinestring' ||
                        feature?.geometry?.type?.toLowerCase() === 'linestring') {
                        style.fill = false;
                    }
                    return (style);
                })

                if (this.isFeatureFlagEnabled(Common.FeatureFlags.Selection)) {
                    leafletOptions.onEachFeature = ((feature, layer) => {
                        if (feature?.geometry?.type?.toLowerCase() === 'multilinestring' ||
                            feature?.geometry?.type?.toLowerCase() === 'linestring' || 
                            feature?.geometry?.type?.toLowerCase() === 'polygon' ||
                            feature?.geometry?.type?.toLowerCase() === 'multipolygon') {
                            this.addGeoJsonAreaLineMouseHandlers(layer, mapLayer, selectionSvc);
                            this.addContextMenuItemsForFeature(feature, layer, selectionSvc, mapviewContextId);
                        } else if(feature?.geometry?.type?.toLowerCase() === 'point' ||
                            feature?.geometry?.type?.toLowerCase() === 'multipoint' ) {
                            this.addGeoJSONPointMouseHandlers(layer, mapLayer, selectionSvc);
                        }
    
                    });
                }

            }
            newOpts = {
                ...options,
                ...leafletOptions
            };
        }

        return (newOpts);
    }

    /** Uses the style properties defined in the VectorStyleProperties class and create an leaflet layer options object */
    convertVectorStylePropsToLeafletOptions(vectorStyleProps: Common.VectorStyleProperties$v1, pane?: string): any {
        let newOpts;
        if (vectorStyleProps) {
            const pathOpts: L.PathOptions = {};
            let lineOpacity = vectorStyleProps.lineOpacity;
            let fillOpacity = vectorStyleProps.fillOpacity;
            let lineColor = vectorStyleProps.lineColor;
            let fillColor = vectorStyleProps.fillColor;

            if (vectorStyleProps?.lineColor?.length > 7) {
                lineColor = vectorStyleProps.lineColor.slice(0, 7);
                lineOpacity = ColorHelper.getOpacity(vectorStyleProps.lineColor);
            }

            if (vectorStyleProps?.fillColor?.length > 7) {
                fillColor = vectorStyleProps.fillColor.slice(0, 7);
                fillOpacity = ColorHelper.getOpacity(vectorStyleProps.fillColor);
            }

            pathOpts.color = lineColor;
            pathOpts.weight = vectorStyleProps.lineWidth > 5 ? 5 : vectorStyleProps.lineWidth;
            pathOpts.dashArray = this.calcDashArrayByWidth(vectorStyleProps.lineWidth, vectorStyleProps.linePattern);
            pathOpts.fill = fillOpacity > 0 ? true : false;
            pathOpts.fillColor = fillColor;

            pathOpts.opacity = lineOpacity;
            pathOpts.fillOpacity = fillOpacity;
            if (pane) {
                pathOpts.pane = pane;
            }
            newOpts = pathOpts;
        } else {
            console.log('Error converting vector style properties to object');
        }
        return (newOpts);
    }

    /** Method called on every GeoJSON point feature to convert to a marker to display on the leaflet map */
    convertGeoJSONPointFeatureToLayer(latLng: L.LatLng, vectorStyleProps: Common.VectorStyleProperties$v1, pane: string, geoJSONPt: any, mapLayer: Common.MapLayer$v1) {
        let marker;
        const options: any = {};

        if (this.validateGeoJSONCoordinate(latLng)) {

            const size = vectorStyleProps.pointSymbolSize;
            const iconAnchor = new Common.PixelPoint$v1(size / 2, size / 2);
            const fontSize = `${vectorStyleProps.pointSymbolSize}px`;
            const font = `${vectorStyleProps.pointSymbolFont}`;
            const symColor = vectorStyleProps.pointSymbolColor;
            const charCode = vectorStyleProps.pointSymbolCharCode;
            const mapMarkerIcon = new L.DivIcon({
                iconSize: [size, size],
                iconAnchor: [iconAnchor.x, iconAnchor.y],
                html: `<div style="display:flex;justify-content:center;align-items:center;height:${fontSize};width:${fontSize};font-size:${fontSize};font-family:${font};color:${symColor}">
                <div>${charCode}</div></div>`,
                className: 'geojson-marker'
            });

            options.icon = mapMarkerIcon;
            options.pane = pane;
            options.opacity = vectorStyleProps.pointSymbolOpacity;
            options.bubblingMouseEvents = true;

            if (this.isFeatureFlagEnabled(Common.FeatureFlags.Selection)) {
                options.interactive = true;
            } else {
                options.interactive = false;
            }

            let markerId: string;
            marker = new L.Marker([latLng.lat, latLng.lng], options);

            if (marker) {
                markerId = 'geoJSONMarker-' + Guid.NewGuid();
                (<any>marker).id = markerId;
                marker.on('dblclick', (event) => { });
            }
        }
        return (marker);
    }

    addContextMenuItemsForFeature(feature: Feature, layer: any, selectionSvc: MapLayerSelectionService$v1, mapviewContextId) {
        const geomType = feature.geometry.type.toLowerCase();
        let addUseAsFilter = true;
        let disableCreateSmartShape = false;
        let disableUseAsFilter = false;
        let createTooltip;
        let useTooltip;
        if (geomType === 'multilinestring' || geomType === 'linestring') {
            addUseAsFilter = false;
        }

        if (geomType === 'multilinestring' || geomType === 'multipolygon') {
            const geom = feature.geometry as Geometry;
            if (geom.coordinates.length > 1) {
                disableCreateSmartShape = true;
                createTooltip = this.transStrings[this.tokens.cannotCreateShapesTooltip];
                disableUseAsFilter = true;
                useTooltip = this.transStrings[this.tokens.cannotUseAsFilterTooltip];
            }
        }
        
        layer.options.contextmenuItems = [];
        let menuItem: any = {
            text: this.transStrings[this.tokens.createSmartShapeMenuLabel],
            index: 1,
            submenuItems: null, 
            tooltip: createTooltip,
            disabled: disableCreateSmartShape,
            menuId: CommandIds.CreateSmartShape
        }

        menuItem.context = this;
        menuItem.callback = ((event: any) => {
            this.createSmartShape({ event: event, selectionSvc: selectionSvc, context: this })
        });
        layer.options.contextmenuItems.push(menuItem);
        
        if (addUseAsFilter && mapviewContextId) {
            menuItem = {
                text: this.transStrings[this.tokens.useAsFilterMenuLabel],
                index: 2,
                submenuItems: null, 
                tooltip: useTooltip,
                disabled: disableUseAsFilter,
                menuId: CommandIds.UseAsFilter
            }
    
            menuItem.context = this;
            menuItem.callback = ((event: any) => {
                this.useAsFilter({ event: event, selectionSvc: selectionSvc, mapviewContextId: mapviewContextId, context: this })
            });
            layer.options.contextmenuItems.push(menuItem);
        }
    }
    /** Validate lat/Lng coordinate */
    validateGeoJSONCoordinate(latLng: L.LatLng): boolean {
        return !(Number.isNaN(latLng.lat) || Number.isNaN(latLng.lng));
    }

    /** Context menu command call back to initiate smart shape editor.  The command is available for vector area and linear data.
     * 
     * @param event Object containing various parameters coming from leaflet in response to right click
     */
    private createSmartShape(event: any) {
        const leafletLayer: any = event.event.relatedTarget;
        if (event.selectionSvc) {
            event.selectionSvc.clearSelection();
        }

        if (leafletLayer?.feature) {
            const layerLatLngs = (leafletLayer as any).getLatLngs();
            const geoJSONGeom:Geometry = turf.getGeom(leafletLayer.feature);
            const geom = new Common.Geometry$v1();
            geom.radius = 2000;
            let latLngs: L.LatLng[];
            let boundary;
            let coords;
            switch(geoJSONGeom.type.toLowerCase()) {
                case 'linestring': {
                    geom.type = Common.GeometryType$v1.line;
                    latLngs = layerLatLngs;
                    coords = [];
                    boundary = coords;
                    break;
                }
                case 'polygon': {
                    geom.type = Common.GeometryType$v1.polygon;
                    latLngs = layerLatLngs[0];
                    coords = [];
                    boundary = [];
                    coords.push(boundary); 
                    break;
                }
                case 'multilinestring': {
                    geom.type = Common.GeometryType$v1.line;
                    if (layerLatLngs.length === 1) {
                        latLngs = layerLatLngs[0];
                        coords = [];
                        boundary = coords;
                    }
                    break;
                }
                case 'multipolygon': {
                    geom.type = Common.GeometryType$v1.polygon;
                    if (layerLatLngs.length === 1) {
                        latLngs = layerLatLngs[0];
                        coords = [];
                        boundary = [];
                        coords.push(boundary); 
                    }
                    break;
                }
            }
            if (latLngs?.length > 1) {
                for (const latLng of latLngs) {
                    boundary.push([latLng.lng, latLng.lat]);
                }
                geom.coordinates = coords;
                this.shapesAdapterSvc.startCreateShapeAsync(geom);
    
            }
        }
    }

    /** Context menu command call back to initiate smart shape editor.  The command is available for vector area and linear data.
     * 
     * @param event Object containing various parameters coming from leaflet in response to right click
     */
     private useAsFilter(event: any) {
        const leafletLayer: any = event.event.relatedTarget;
        if (event.selectionSvc) {
            event.selectionSvc.clearSelection();
        }
        if (leafletLayer?.feature) {
            const layerLatLngs = (leafletLayer as any).getLatLngs();
            const geoJSONGeom:Geometry = turf.getGeom(leafletLayer.feature);
            const geom = new Common.Geometry$v1();
            geom.radius = 2;
            let latLngs: L.LatLng[];
            let boundary;
            let coords;
            switch(geoJSONGeom.type.toLowerCase()) {
                case 'linestring': {
                    geom.type = Common.GeometryType$v1.line;
                    latLngs = layerLatLngs;
                    coords = [];
                    boundary = coords;
                    break;
                }
                case 'polygon': {
                    geom.type = Common.GeometryType$v1.polygon;
                    latLngs = layerLatLngs[0];
                    coords = [];
                    boundary = [];
                    coords.push(boundary); 
                    break;
                }
                case 'multilinestring': {
                    geom.type = Common.GeometryType$v1.line;
                    if (layerLatLngs.length === 1) {
                        latLngs = layerLatLngs[0];
                        coords = [];
                        boundary = coords;
                        }
                    break;
                }
                case 'multipolygon': {
                    geom.type = Common.GeometryType$v1.polygon;
                    if (layerLatLngs.length === 1) {
                        latLngs = layerLatLngs[0];
                        coords = [];
                        boundary = [];
                        coords.push(boundary); 
                        }
                    break;
                }
            }
            if (latLngs?.length > 1) {
                for (const latLng of latLngs) {
                    boundary.push([latLng.lng, latLng.lat]);
                }
                geom.coordinates = coords;
                this.shapesAdapterSvc.useAsShapeFilterAsync(geom, event.mapviewContextId);
    
            }
        }
    }

    calcDashArrayByWidth(lineWidth: number, lineType: LineType$v1) {
        const dash = 8 + (lineWidth - 2);
        const longDash = 18 + (lineWidth - 2);
        const space = 8 + (lineWidth - 2);
        const dot = 2;

        let dashArray;
        switch (lineType) {
            case LineType$v1.dashed: {
                dashArray = [dash, space];
                break;
            }
            case LineType$v1.dots: {
                dashArray = [dot, space];
                break;
            }
            case LineType$v1.dashDot: {
                dashArray = [dash, space, dot, space];
                break;
            }
            case LineType$v1.dashDotDot: {
                dashArray = [dash, space, dot, space, dot, space];
                break;
            }
            case LineType$v1.longDashShortDash: {
                dashArray = [longDash, space, dash, space];
                break;
            }
        }

        return (dashArray);

    }

    addGeoJsonAreaLineMouseHandlers(leafletLayer: any, mapLayer?: Common.MapLayer$v1, selectionSvc?: MapLayerSelectionService$v1) {
        // leafletLayer.on('click', (event) => {
        //     L.DomEvent.stopPropagation(event);
        //     if (selectionSvc) {
        //         selectionSvc.select(event.target, mapLayer, false);
        //     }
        // }, this);

        leafletLayer.on('contextmenu', (event) => {
            if (selectionSvc) {
                selectionSvc.select(event.target, mapLayer, false);
            }
        }, this);

        leafletLayer.on('mouseover', (event) => {
            if (selectionSvc) {
                selectionSvc.highlight(event.target);
            }
        }, this);

        leafletLayer.on('mouseout', (event) => {
            if (selectionSvc) {
                selectionSvc.clearHighlight(event.target);
            }
        }, this);
    }

    addGeoJSONPointMouseHandlers(leafletLayer: any, mapLayer?: Common.MapLayer$v1, selectionSvc?: MapLayerSelectionService$v1) {
        // leafletLayer.on('click', (event) => {
        //     L.DomEvent.stopPropagation(event);
        //     if (selectionSvc) {
        //         selectionSvc.select(event.target, mapLayer, false);
        //     }
        // }, this);

        leafletLayer.on('contextmenu', (event) => {
            if (selectionSvc) {
                selectionSvc.select(event.target, mapLayer, false);
            }
        }, this);

        leafletLayer.on('mouseover', (event) => {
            if (selectionSvc) {
                selectionSvc.highlight(event.target);
            }
        }, this);

        leafletLayer.on('mouseout', (event) => {
            if (selectionSvc) {
                selectionSvc.clearHighlight(event.target);
            }
        }, this);
    }

    addContextMenu(mapLayer: Common.MapLayer$v1, options, mapviewContextId?: string, selectionSvc?: MapLayerSelectionService$v1) {
        options.contextmenu = true;
        options.contextmenuItems = [];

        let menuItem: any = {
            text: this.transStrings[this.tokens.createSmartShapeMenuLabel],
            index: 1,
            submenuItems: null, 
            tooltip: null,
            disabled: false,
            menuId: 'createSmartShape'
        }

        menuItem.context = this;
        menuItem.callback = ((event: any) => {
            this.createSmartShape({ event: event, selectionSvc: selectionSvc, context: this })
        });
        options.contextmenuItems.push(menuItem);

        if (mapviewContextId) {
            menuItem = {
                text: this.transStrings[this.tokens.useAsFilterMenuLabel],
                index: 2,
                submenuItems: null, 
                tooltip: null,
                disabled: false,
                menuId: 'useAsFilter'
            }
    
            menuItem.context = this;
            menuItem.callback = ((event: any) => {
                this.useAsFilter({ event: event, selectionSvc: selectionSvc, mapviewContextId: mapviewContextId, context: this })
            });
            options.contextmenuItems.push(menuItem);
    
        }
    }

    setWFSTypeName(name: string, options: any) {
        if (name) {
            const nsName = name.split(':');
            if (nsName?.length ===2) {
                options.typeNS = nsName[0];
                options.typeName = nsName[1];
            } else {
                options.typeName = name;
            }
        }
    }

    getWFSReaderFormat(mapLayer) {
        let readerFormat;
        const temp = mapLayer.getOption(Common.MapLayerOptionName.WFSOutputFormat);
        if (temp) {
            const format = temp.value;
            switch (format) {
                case 'application/json':
                case 'json': {
                    readerFormat = new L.Format.GeoJSON({}); 
                    break;
                }
                case 'application/gml+xml; version=3.2': {
                    readerFormat = new L.Format.GML({});
                    break;
                }
            }
        }

        return(readerFormat);
    }

    getWMTSOptionsFromCapabilities(mapLayer: Common.MapLayer$v1, options: any): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            try {
                let opt;
                let wmtsLayerId;
                let tileMatrixSetId;
                let tileMatrixSet: WMTSTileMatrixSet;
                let levelOffset;
                let tileMatrices: WMTSTileMatrix[];
                let tileMatrixIds: any;
                opt = mapLayer.getOption(Common.MapLayerOptionName.WMTSLayerId);
                if (opt) {
                    wmtsLayerId = opt.value;
                }
                const wmtsInfo = await this.getAvailableWMTSInfo(mapLayer);
                if (wmtsInfo && wmtsLayerId) {
                    const wmtsLayerInfo: WMTSLayerInfo = wmtsInfo.layers.find(layer => layer.id === wmtsLayerId);
                    if (!this.isDefined(wmtsLayerInfo)) {
                        resolve(false);
                    } else {
                        opt = mapLayer.getOption('tileMatrixSetId');
                        if (opt) {
                            tileMatrixSetId = opt.value;
                        }

                        if (tileMatrixSetId) {
                            tileMatrixSet = wmtsInfo.tileMatrixSets[tileMatrixSetId];
                            if (tileMatrixSet) {
                                levelOffset = this.getQuadTreeCompatibleLevelOffset(tileMatrixSet);
                                tileMatrices = tileMatrixSet.tileMatrices;
                                tileMatrixIds = tileMatrices.map((matrix) => {
                                    const topLeftCorner = matrix.topLeftCorner.split(/\s+/).map((num) => {
                                        return parseFloat(num);
                                    });

                                    const retMatrix = {
                                        identifier: matrix.id,
                                        topLeftCorner: topLeftCorner
                                    };
                                    return (retMatrix);
                                });
                                const tileMatrix = tileMatrices[levelOffset];
                                let style = wmtsLayerInfo.styles.find((styleInfo) => styleInfo.isDefault);
                                if (!style && wmtsLayerInfo.styles?.length > 0) {
                                    style = wmtsLayerInfo.styles[0];
                                }

                                options.layer = wmtsLayerId;
                                options.tileMatrixSetId = tileMatrixSetId;
                                options.style = style.id;
                                options.tileMatrices = tileMatrixIds;
                                if (tileMatrixSet.crs === 'EPSG:4326') {
                                    options.tms = true;
                                }

                                resolve(true);

                            } else {
                                console.log('Unable to find tile matrix that supports the layer tile maxtrix set id');
                                resolve(false);
                            }
                        }
                    }
                } else {
                    resolve(false);
                }
            } catch (err) {
                console.log('Error getting WMTS options from capabilities');
                resolve(false);
            }

        });

    }
    getCRSByName(crsName: string) {
        let crs;
        if (crsName) {
            const upperName = crsName.toUpperCase();
            crs = this.supportedCRS[upperName];
        }
        return (crs);
    }

    // Copied from Luciad
    getQuadTreeCompatibleLevelOffset(t) {
        let levelOffset = 0;
        const e = t.tileMatrices;
        const r = e[e.length - 1];
        for (let i = e.length - 2; i >= 0; i--) {
            const a = e[i];
            // eslint-disable-next-line no-bitwise
            const n = 1 << e.length - i - 1;
            const l = a.scaleDenominator * SCALE_DENOMINATOR_TOLERANCE;
            if (Math.abs(a.scaleDenominator - r.scaleDenominator * n) > l) {
                levelOffset = i + 1;
            } else if (a.topLeftCorner !== r.topLeftCorner) {
                levelOffset = i + 1;
            } else if (a.tileWidth !== r.tileWidth || a.tileHeight !== r.tileHeight) {
                levelOffset = i + 1;
            } else if (a.matrixWidth !== r.matrixWidth / n || a.matrixHeight !== r.matrixHeight / n) {
                levelOffset = i + 1;
            }
        }
        return 0;
    }

    convertOptionStringValueToType(option: Common.MapLayerOption$v1) {
        let value;

        switch (option.type) {
            case 'number':
                value = Number(option.value);
                break;
            case 'boolean':
                value = option.value === 'true';
                break;
            default:
                value = option.value;
        }
        return (value);
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

    public getUrlWithParamsForLeaflet(mapLayer: Common.MapLayer$v1, localAccessOnly: boolean, displayInfo?: any) {
        let url;

        if (!localAccessOnly) {
            const result = this.swapMapUrlWithProxy(mapLayer.url);

            if (displayInfo) {
                url = result.newURL + displayInfo.endpoint;
                url += '&mapLayerPresetId=' + mapLayer.id;

            } else {
                url = result.newURL;
                url += '?mapLayerPresetId=' + mapLayer.id;
            }
            if (result.isSubdomain) {
                url += '&s={s}';
            }
            if (mapLayer.urlParams) {
                for (const param of mapLayer.urlParams) {
                    url += '&';
                    url += param.name + '=' + param.value;
                }
            }
        } else {
            url = mapLayer.url;
            if (mapLayer.urlParams) {
                for (let ii = 0; ii < mapLayer.urlParams.length; ii++) {
                    const param = mapLayer.urlParams[ii];
                    if (ii === 0) {
                        url += '?';
                    } else {
                        url += '&';
                    }
                    url += param.name + '=' + param.value;
                }
            }
        }

        return (url);
    }

    public getRequestParams(mapLayer: Common.MapLayer$v1, localAccessOnly: boolean) {
        const requestParams: any = {};


        if (!localAccessOnly) {
            requestParams.mapLayerPresetId = mapLayer.id;
            if (this.isSubdomain(mapLayer.url)) {
                requestParams.s = '{s}';
            }
        }

        if (mapLayer.urlParams) {
            for (const param of mapLayer.urlParams) {
                requestParams[param.name] = param.value;
            }
        }


        return (requestParams);
    }

    isSubdomain(url: string) {
        const tempURL = new URL(url);
        const origin = decodeURIComponent(tempURL.origin);
        return (origin.toLowerCase().indexOf('{s}') !== -1);
    }

    swapMapUrlWithProxy(url: string) {
        const result: any = {};
        let urlOrigin;

        if (!window.location.port) {
            urlOrigin = window.location.origin;
        } else {
            urlOrigin = 'https://localhost.hxgnconnect.com';
        }

        const proxyHRef = urlOrigin + '/api/commonMap/leaflet/v1/proxyTile';
        const tempURL = new URL(url);
        const origin = decodeURIComponent(tempURL.origin);

        result.isSubdomain = origin.toLowerCase().indexOf('{s}') !== -1;
        const pathname = decodeURIComponent(tempURL.pathname);
        result.newURL = proxyHRef;
        if (pathname.length > 1) {
            result.newURL += pathname;
        }

        return result;
    }
    async getWMSFeatureInfo(mapLayer: Common.MapLayer$v1, bbox: string, point: Common.PixelPoint$v1, size: Common.PixelPoint$v1): Promise<any> {
        return (new Promise<any>(async (resolve, reject) => {
            let wmsFeatureInfo: any;

            if (mapLayer.url) {
                try {
                    let featInfo;
                    if (mapLayer.format === Common.LayerFormat$v1.HxDRWMS) {
                        const displayInfo = await this.hxdrSvc.getHxDRWMSDisplayInfoAsync(mapLayer);
                        if (displayInfo) {
                            const url = mapLayer.url + displayInfo.endpoint;
                            featInfo = await this.commonmapDataSvc.getWMSGetFeatureInfoForHxDR(url, mapLayer, bbox, size, point).toPromise();
                        }
                    } else {
                        featInfo = await this.commonmapDataSvc.getWMSGetFeatureInfo(mapLayer, bbox, size, point).toPromise();
                    }

                    if (featInfo) {
                        wmsFeatureInfo = featInfo;
                    } else {
                        wmsFeatureInfo = null;
                        reject(null);
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

            resolve(wmsFeatureInfo);
        }));
    }

    async getWMSFeatureInfoForHxDR(mapLayer: Common.MapLayer$v1, bbox: string, point: Common.PixelPoint$v1, size: Common.PixelPoint$v1): Promise<any> {
        return (new Promise<any>(async (resolve, reject) => {
            let wmsFeatureInfo: any;

            if (mapLayer.url) {
                try {
                    const featInfo = await this.commonmapDataSvc.getWMSGetFeatureInfo(mapLayer, bbox, size, point).toPromise();
                    if (featInfo) {
                        wmsFeatureInfo = featInfo;
                    } else {
                        wmsFeatureInfo = null;
                        reject(null);
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

            resolve(wmsFeatureInfo);
        }));
    }

    async getAvailableWMTSInfo(mapLayer: Common.MapLayer$v1): Promise<WMTSInfo> {
        return (new Promise<WMTSInfo>(async (resolve, reject) => {
            let availWMTSInfo: WMTSInfo;

            if (mapLayer.url) {
                try {
                    const xmlStr = await this.commonmapDataSvc.getWMTSCapabilities(mapLayer).toPromise();
                    if (xmlStr) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(xmlStr, 'application/xml');
                        const wmtsCapabilities = this.xmlToJson(doc);
                        if (wmtsCapabilities) {
                            const wmtsModel = this.createWMTSCapabilitiesModel(wmtsCapabilities);
                            if (wmtsModel && wmtsModel.layers?.length > 0 && wmtsModel.tileMatrixSets?.length > 0) {
                                availWMTSInfo = this.getWMTSInfo(wmtsModel);
                            } else {
                                availWMTSInfo = null;
                                reject(null);
                            }
                        } else {
                            availWMTSInfo = null;
                            reject(null);
                        }
                    } else {
                        availWMTSInfo = null;
                        reject(null);
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

            resolve(availWMTSInfo);
        }));
    }
    createWMTSCapabilitiesModel(jsonObj: any): any {
        // convert the string into a xml doc object
        const wmtsModel: any = {};
        let layerInfo: any;
        let contents: any;

        try {
            if (this.isDefined(jsonObj.Capabilities) && this.isDefined(jsonObj.Capabilities.Contents)) {
                contents = jsonObj.Capabilities.Contents;
            }
            if (this.isDefined(contents.Layer)) {
                wmtsModel.layers = [];
                if (!this.isArray(contents.Layer)) {
                    const tempDef = contents.Layer;
                    contents.Layer = [];
                    contents.Layer.push(tempDef);
                }

                for (const layerDef of contents.Layer) {
                    if (this.isDefined(layerDef.TileMatrixSetLink)) {
                        layerInfo = {};

                        let tileMatrixSetLinkDef = layerDef.TileMatrixSetLink;
                        if (!this.isArray(tileMatrixSetLinkDef)) {
                            const tempDef = tileMatrixSetLinkDef;
                            tileMatrixSetLinkDef = [];
                            tileMatrixSetLinkDef.push(tempDef);
                        }
                        layerInfo.tileMatrixSetLinks = [];
                        for (const linkDef of tileMatrixSetLinkDef) {
                            const linkInfo: any = {};
                            if (this.isDefined(linkDef.TileMatrixSet)) {
                                linkInfo.tileMatrixSet = linkDef.TileMatrixSet;
                                layerInfo.tileMatrixSetLinks.push(linkInfo);
                            }
                        }
                        layerInfo.identifier = layerDef['ows:Identifier'];
                        layerInfo.title = this.isDefined(layerDef['ows:Title']) ? layerDef['ows:Title'] : layerInfo.identifier;
                        layerInfo.abstract = this.isDefined(layerDef['ows:Abstract']) ? layerDef['ows:Abstract'] : layerInfo.title;

                        if (this.isDefined(layerDef['ows:WGS84BoundingBox'])) {
                            layerInfo.wgs84BoundingBox = {};
                            layerInfo.wgs84BoundingBox.lowerCorner = layerDef['ows:WGS84BoundingBox']['ows:LowerCorner'];
                            layerInfo.wgs84BoundingBox.upperCorner = layerDef['ows:WGS84BoundingBox']['ows:UpperCorner'];
                        }

                        if (this.isDefined(layerDef.Format)) {
                            let formatDefs = layerDef.Format;
                            if (!this.isArray(formatDefs)) {
                                const tempDefs = formatDefs;
                                formatDefs = [];
                                formatDefs.push(tempDefs);
                            }
                            layerInfo.formats = [];
                            for (const format of formatDefs) {
                                if (this.isImageFormatSupported(format)) {
                                    layerInfo.formats.push(format);
                                }
                            }
                        }

                        if (this.isDefined(layerDef.Style)) {
                            let styleDefs = layerDef.Style;
                            if (!this.isArray(styleDefs)) {
                                const tempDefs = styleDefs;
                                styleDefs = [];
                                styleDefs.push(tempDefs);
                            }
                            layerInfo.styles = [];
                            for (const styleDef of styleDefs) {
                                const styleInfo: any = {};
                                styleInfo.identifier = styleDef['ows:Identifier'];
                                styleInfo.title = this.isDefined(styleDef['ows:Title']) ? styleDef['ows:Title'] : styleInfo.identifier;
                                styleInfo.abstract = this.isDefined(styleDef['ows:Abstract']) ? styleDef['ows:Abstract'] : styleInfo.title;
                                if (this.isDefined(styleDef.isDefault)) {
                                    styleInfo.isDefault = styleDef.isDefault === 'true' ? true : false;
                                }
                                layerInfo.styles.push(styleInfo);
                            }
                        }

                        wmtsModel.layers.push(layerInfo);
                    }
                }
            }

            if (this.isDefined(contents.TileMatrixSet)) {
                wmtsModel.tileMatrixSets = [];
                if (!this.isArray(contents.TileMatrixSet)) {
                    const tempDef = contents.TileMatrixSet;
                    contents.TileMatrixSet = [];
                    contents.TileMatrixSet.push(tempDef);
                }

                for (const setDef of contents.TileMatrixSet) {
                    const tileMatrixSetInfo: any = {};
                    tileMatrixSetInfo.identifier = setDef['ows:Identifier'];
                    tileMatrixSetInfo.crs = setDef['ows:SupportedCRS'];
                    tileMatrixSetInfo.title = this.isDefined(setDef['ows:Title']) ? setDef['ows:Title'] : tileMatrixSetInfo.identifier;
                    tileMatrixSetInfo.abstract = this.isDefined(setDef['ows:Abstract']) ? setDef['ows:Abstract'] : tileMatrixSetInfo.title;

                    if (this.isDefined(setDef.TileMatrix)) {
                        tileMatrixSetInfo.tileMatrices = [];
                        if (!this.isArray(setDef.TileMatrix)) {
                            const tempDef = setDef.TileMatrix;
                            setDef.TileMatrix = [];
                            setDef.TileMatrix.push(tempDef);
                        }
                        for (const tileMatrixDef of setDef.TileMatrix) {
                            const tileMatrixInfo: any = {};
                            tileMatrixInfo.identifier = tileMatrixDef['ows:Identifier'];
                            tileMatrixInfo.scaleDenominator = tileMatrixDef['ScaleDenominator'];
                            tileMatrixInfo.topLeftCorner = tileMatrixDef['TopLeftCorner'];
                            tileMatrixInfo.tileWidth = tileMatrixDef['TileWidth'];
                            tileMatrixInfo.tileHeight = tileMatrixDef['TileHeight'];
                            tileMatrixInfo.matrixWidth = tileMatrixDef['MatrixWidth'];
                            tileMatrixInfo.matrixHeight = tileMatrixDef['MatrixHeight'];

                            tileMatrixSetInfo.tileMatrices.push(tileMatrixInfo);
                        }
                    }
                    wmtsModel.tileMatrixSets.push(tileMatrixSetInfo);
                }
            }

        } catch (err) {
            const myErr = err;
            console.log('Error creating WMTS Capabilities Model');
        }

        // Return the corrected json object
        return wmtsModel;
    }
    getWMTSInfo(wmtsModel: any): WMTSInfo {
        const wmtsInfo = new WMTSInfo();
        if (wmtsModel.layers) {
            for (const wmtsLayer of wmtsModel.layers) {
                try {

                    if (wmtsLayer.formats?.length > 0) {
                        const layerInfo = new WMTSLayerInfo({
                            id: wmtsLayer.identifier,
                            title: wmtsLayer.title,
                            abstract: wmtsLayer.abstract,
                            formats: wmtsLayer.formats,
                            tooltip: this.getLayerTooltip(wmtsLayer)
                        });
                        for (const style of wmtsLayer.styles) {
                            const styleInfo = new WMTSLayerStyle({
                                id: style.identifier,
                                title: style.title,
                                abstract: style.abstract,
                                isDefault: style.isDefault
                            });
                            layerInfo.styles.push(styleInfo);
                        }
                        for (const tileMatrixSetLink of wmtsLayer.tileMatrixSetLinks) {
                            const setId = tileMatrixSetLink.tileMatrixSet;
                            const tileMatrixSet = wmtsModel.tileMatrixSets.find((set) => set.identifier === setId);
                            if (tileMatrixSet) {
                                const matrixSetCRS = this.getCRSFromURN(tileMatrixSet.crs);
                                if (this.isValidReferenceId(matrixSetCRS)) {
                                    if (!wmtsInfo.tileMatrixSets[setId]) {
                                        const matrixSetInfo = new WMTSTileMatrixSet({
                                            id: tileMatrixSet.identifier,
                                            title: tileMatrixSet.title,
                                            abstract: tileMatrixSet.abstract,
                                            tooltip: this.getTileMatrixSetTooltip(tileMatrixSet),
                                            crs: matrixSetCRS
                                        });
                                        if (tileMatrixSet.tileMatrices?.length > 0) {
                                            for (const tileMatrixInfo of tileMatrixSet.tileMatrices) {
                                                const tileMatrix = new WMTSTileMatrix({
                                                    id: tileMatrixInfo.identifier,
                                                    scale: tileMatrixInfo.scaleDenominator,
                                                    topLeftCorner: tileMatrixInfo.topLeftCorner,
                                                    tileWidth: tileMatrixInfo.tileWidth,
                                                    tileHeight: tileMatrixInfo.tileHeight,
                                                    matrixWidth: tileMatrixInfo.matrixWidth,
                                                    matrixHeight: tileMatrixInfo.matrixHeight
                                                });
    
                                                matrixSetInfo.tileMatrices.push(tileMatrix);
                                            }
                                        }
                                        wmtsInfo.tileMatrixSets[setId] = matrixSetInfo;
                                    }
    
                                    layerInfo.tileMatrixSetIds.push(setId);
                                }
                            }
                        }
                        if (layerInfo.tileMatrixSetIds.length > 0) {
                            wmtsInfo.layers.push(layerInfo);
                        }
                    }
                } catch (err) {
                    console.log("Error getting WMTS info for layer: " + err);
                }
            }
        }

        wmtsInfo.layers.sort(this.sortByLayer);

        return (wmtsInfo);
    }

    getCRSFromURN(urnDef: string) {
        let crs: string;
        if (urnDef) {
            const parts = urnDef.split(':');
            if (parts?.length === 7) {
                const auth = parts[4].toUpperCase();
                if (auth === 'EPSG') {
                    crs = 'EPSG:' + parts[6];
                } else if (auth === 'OGC') {
                    crs = parts[6];
                }
            } else if (parts?.length === 6) {
                const auth = parts[4].toUpperCase();
                if (auth === 'EPSG') {
                    crs = 'EPSG:' + parts[5];
                } else if (auth === 'OGC') {
                    crs = parts[5];
                }
            }
        }
        return (crs);
    }

    getLayerTooltip(wmtsLayer) {
        let tooltip = wmtsLayer.title;

        if (wmtsLayer.abstract) {
            tooltip = `${tooltip}\n\n${wmtsLayer.abstract}`;
        }
        return (tooltip);
    }

    getTileMatrixSetTooltip(tileMatrixSet: WMTSTileMatrixSet) {
        let tooltip = tileMatrixSet.title;

        if (tileMatrixSet.crs) {
            tooltip = `${tooltip}\nCRS: ${this.getCRSFromURN(tileMatrixSet.crs)}`;
        }
        if (tileMatrixSet.abstract) {
            tooltip = `${tooltip}\n\n${tileMatrixSet.abstract}`;
        }
        return (tooltip);
    }

    createLayerInfoDataFromESRIFeatureCollection(jsonObj: any): LayerInfoData[] {
        // convert the string into a xml doc object
        const layerInfos: LayerInfoData[] = [];
        let featResp: any;

        if (typeof jsonObj.FeatureInfoResponse !== 'undefined') {
            featResp = jsonObj.FeatureInfoResponse;
            if (typeof featResp.FeatureInfoCollection !== 'undefined') {
                let featCollDefs = featResp.FeatureInfoCollection;
                if (!this.isArray(featCollDefs)) {
                    const tempDef = featCollDefs;
                    featCollDefs = [];
                    featCollDefs.push(tempDef);
                }
                for (const featCollDef of featCollDefs) {
                    let layerName;
                    if (typeof featCollDef.layername !== 'undefined') {
                        layerName = featCollDef.layername;
                    }

                    if (typeof featCollDef.FeatureInfo !== 'undefined') {
                        let featInfoDefs = featCollDef.FeatureInfo;
                        if (!this.isArray(featInfoDefs)) {
                            const tempDef = featInfoDefs;
                            featInfoDefs = [];
                            featInfoDefs.push(tempDef);
                        }
                        for (const featInfoDef of featInfoDefs) {
                            let layerInfo: LayerInfoData = new LayerInfoData();
                            if (layerName) {
                                layerInfo.layerName = layerName;
                            }
                            if (typeof featInfoDef.Field !== 'undefined') {
                                let fieldDefs = featInfoDef.Field;
                                if (!this.isArray(fieldDefs)) {
                                    const tempDef = fieldDefs;
                                    fieldDefs = [];
                                    fieldDefs.push(tempDef);
                                }
    
                                for (const fieldDef of fieldDefs) {
                                    if (typeof fieldDef.FieldName !== 'undefined' && typeof fieldDef.FieldValue !== 'undefined') {
                                        const layerProp = new LayerInfoLayerProp({
                                            name: fieldDef.FieldName,
                                            value: fieldDef.FieldValue
                                        });
                                        layerInfo.layerProps.push(layerProp);
                                    }
                                }
                            }
                            if (layerInfo.layerName || layerInfo.layerProps.length > 0) {
                                layerInfos.push(layerInfo);
                            }
                        }
                    }
                }
            }
        }
        return layerInfos;
    }


    createLayerInfoDataFromESRIXml(jsonObj: any): LayerInfoData[] {
        // convert the string into a xml doc object
        const layerInfos: LayerInfoData[] = [];
        let featResp: any;

        if (typeof jsonObj['esri_wms:FeatureInfoResponse'] !== 'undefined') {
            featResp = jsonObj['esri_wms:FeatureInfoResponse'];
            if (typeof featResp['esri_wms:FeatureInfoCollection'] !== 'undefined') {
                let featCollDefs = featResp['esri_wms:FeatureInfoCollection'];
                if (!this.isArray(featCollDefs)) {
                    const tempDef = featCollDefs;
                    featCollDefs = [];
                    featCollDefs.push(tempDef);
                }
                for (const featCollDef of featCollDefs) {
                    let layerName;
                    if (typeof featCollDef.layername !== 'undefined') {
                        layerName = featCollDef.layername;
                    }

                    if (typeof featCollDef['esri_wms:FeatureInfo'] !== 'undefined') {
                        let featInfoDefs = featCollDef['esri_wms:FeatureInfo'];
                        if (!this.isArray(featInfoDefs)) {
                            const tempDef = featInfoDefs;
                            featInfoDefs = [];
                            featInfoDefs.push(tempDef);
                        }
                        for (const featInfoDef of featInfoDefs) {
                            let layerInfo: LayerInfoData = new LayerInfoData();
                            if (layerName) {
                                layerInfo.layerName = layerName;
                            }
                            if (typeof featInfoDef['esri_wms:Field'] !== 'undefined') {
                                let fieldDefs = featInfoDef['esri_wms:Field'];
                                if (!this.isArray(fieldDefs)) {
                                    const tempDef = fieldDefs;
                                    fieldDefs = [];
                                    fieldDefs.push(tempDef);
                                }
    
                                for (const fieldDef of fieldDefs) {
                                    if (typeof fieldDef['esri_wms:FieldName'] !== 'undefined' && typeof fieldDef['esri_wms:FieldValue'] !== 'undefined') {
                                        const fieldName = fieldDef['esri_wms:FieldName']['cdata-section'];
                                        let fieldValue = fieldDef['esri_wms:FieldValue']['cdata-section'];
                                        if (typeof fieldValue === 'string') {
                                            const layerProp = new LayerInfoLayerProp({
                                                name: fieldName,
                                                value: fieldValue
                                            });
                                            layerInfo.layerProps.push(layerProp);
                                        }
                                    }
                                }
                            }
                            if (layerInfo.layerName || layerInfo.layerProps.length > 0) {
                                layerInfos.push(layerInfo);
                            }
                        }
                    }
                }
            }
        }
        return layerInfos;
    }

    createLayerInfoDataFromXml(jsonObj: any): LayerInfoData[] {
        // convert the string into a xml doc object
        let layerInfos: LayerInfoData[] = [];

        if (typeof jsonObj['FeatureInfoResponse'] !== 'undefined') {
            layerInfos = this.createLayerInfoDataFromEsriTypeXml(jsonObj);
        } else if (typeof jsonObj['wfs:FeatureCollection'] !== 'undefined') {
            layerInfos = this.createLayerInfoDataFromGeoServerTypeXml(jsonObj);
        } else if (typeof jsonObj['RasterLayerInfoResponse'] !== 'undefined') { 
            layerInfos = this.createLayerInfoDataFromErdasServerTypeXml(jsonObj);
        }
        return layerInfos;
    }
    createLayerInfoDataFromEsriTypeXml(jsonObj: any): LayerInfoData[] {
        // convert the string into a xml doc object
        const layerInfos: LayerInfoData[] = [];
        let featResp: any;

        if (typeof jsonObj.FeatureInfoResponse !== 'undefined') {
            featResp = jsonObj.FeatureInfoResponse;
            if (typeof featResp.FIELDS !== 'undefined') {
                let fields = featResp.FIELDS;
                if (!this.isArray(fields)) {
                    const tempDef = fields;
                    fields = [];
                    fields.push(tempDef);
                }
                for (const field of fields) {
                    let layerInfo: LayerInfoData = new LayerInfoData();
                    if (typeof field.layername !== 'undefined') {
                        layerInfo.layerName = field.layername;
                    }

                    const keys = Object.keys(field);
                    if (keys.length > 0) {
                        for (const key of keys) {
                            const name = key;
                            let value = field[key];
                            if (typeof value === 'string') {
                                const layerProp = new LayerInfoLayerProp({
                                    name: name,
                                    value: value
                                });
                                layerInfo.layerProps.push(layerProp);
                            }
                        }
                    }

                    if (layerInfo.layerName || layerInfo.layerProps.length > 0) {
                        layerInfos.push(layerInfo);
                    }
                }
            }
        }
        return layerInfos;
    }

    createLayerInfoDataFromGeoServerTypeXml(jsonObj: any): LayerInfoData[] {
        // convert the string into a xml doc object
        const layerInfos: LayerInfoData[] = [];
        let featColl: any;

        if (typeof jsonObj['wfs:FeatureCollection'] !== 'undefined') {
            featColl = jsonObj['wfs:FeatureCollection'];
            if (typeof featColl['gml:featureMember'] !== 'undefined') {
                let featMembs = featColl['gml:featureMember'];
                if (!this.isArray(featMembs)) {
                    const tempDef = featMembs;
                    featMembs = [];
                    featMembs.push(tempDef);
                }
                for (const featMemb of featMembs) {
                    let layerInfo: LayerInfoData = new LayerInfoData();

                    const featMembKeys = Object.keys(featMemb);
                    let layerNameStr;
                    if (featMembKeys?.length > 0) {
                        const layerNameStr = featMembKeys[0] as string;
                        const layerName = layerNameStr.split(':');
                        if (layerName.length > 1) {
                            layerInfo.layerName = layerName[1];
                        } else if (layerName.length === 1) {
                            layerInfo.layerName = layerName[0];
                        }
                        const layerDef = featMemb[layerNameStr];
                        const layerPropNames = Object.keys(layerDef);
                        if (layerPropNames?.length > 0) {
                            if (layerPropNames.length > 0) {
                                for (let name of layerPropNames) {
                                    let propName = name;
                                    const pos = propName.indexOf(':');
                                    if (pos !== -1) {
                                        propName = propName.substring(pos + 1);
                                    }
                                    let value = layerDef[name];
                                    if (typeof value === 'string') {
                                        const layerProp = new LayerInfoLayerProp({
                                            name: propName,
                                            value: value
                                        });
                                        layerInfo.layerProps.push(layerProp);
                                    }
                                }
                            }

                        }
                    }
                    if (layerInfo.layerName || layerInfo.layerProps.length > 0) {
                        layerInfos.push(layerInfo);
                    }
                }
            }
        }
        return layerInfos;
    }

    createLayerInfoDataFromErdasServerTypeXml(jsonObj: any): LayerInfoData[] {
        // convert the string into a xml doc object
        const layerInfos: LayerInfoData[] = [];

        if (typeof jsonObj['RasterLayerInfoResponse'] !== 'undefined') {
            const rasterLayerInfo = jsonObj['RasterLayerInfoResponse'];
            if (typeof rasterLayerInfo['Raster'] !== 'undefined') {
                let rasterInfos = rasterLayerInfo['Raster'];
                if (!this.isArray(rasterInfos)) {
                    const tempDef = rasterInfos;
                    rasterInfos = [];
                    rasterInfos.push(tempDef);
                }
                for (const rasterInfo of rasterInfos) {
                    let layerInfo: LayerInfoData = new LayerInfoData();


                    if (typeof rasterInfo.layer !== 'undefined') {
                        layerInfo.layerName = rasterInfo.layer;
                    }

                    if (typeof rasterInfo.Info !== 'undefined') {
                        const info = rasterInfo.Info;
                        const keys = Object.keys(info);
                        if (keys?.length > 0) {
                            for (const key of keys) {
                                layerInfo.layerProps.push(new LayerInfoLayerProp({
                                    name: key,
                                    value: info[key]
                                }));
                            }
                        }
                    }
                    if (typeof rasterInfo.RGB !== 'undefined') {
                        const rgb = rasterInfo.RGB;
                        const keys = Object.keys(rgb);
                        if (keys?.length > 0) {
                            for (const key of keys) {
                                layerInfo.layerProps.push(new LayerInfoLayerProp({
                                    name: key,
                                    value: rgb[key]
                                }));
                            }
                        }
                    }

                    if (typeof rasterInfo.Raw !== 'undefined') {
                        if (typeof rasterInfo.Raw.Band !== 'undefined') {
                            let bands = rasterInfo.Raw.Band;
                            if (!this.isArray(bands)) {
                                const tempDef = bands;
                                bands = [];
                                bands.push(tempDef);
                            }
                            bands.sort(this.sortByIndex);
                            for (const band of bands) {
                                layerInfo.layerProps.push(new LayerInfoLayerProp({
                                    name: `${this.transStrings[this.tokens.erdasBandLabel]} ${band.index}`,
                                    value: band.value
                                }));
                            }
                        }
                    }

                    if (layerInfo.layerName || layerInfo.layerProps.length > 0) {
                        layerInfos.push(layerInfo);
                    }
                }
            }
        }
        return layerInfos;
    }

    createLayerInfoDataFromJSON(jsonStr: string): LayerInfoData[] {
        let layerInfos: LayerInfoData[] = [];
        try {
            const jsonObj = JSON.parse(jsonStr);
            if (jsonObj?.type) {
                switch (jsonObj.type) {
                    case 'FeatureCollection': {
                        if (typeof jsonObj.features !== 'undefined') {
                            const features = jsonObj.features;

                            for (const feat of features) {
                                const layerInfo = this.createLayerInfoDataFromGeoJSONFeature(feat);
                                if (layerInfo.layerProps.length > 0) {
                                    layerInfos.push(layerInfo);
                                }
                            }
                        }
                        break;
                    }

                    case 'Feature': {
                        const feat = jsonObj.feature;
                        const layerInfo = this.createLayerInfoDataFromGeoJSONFeature(feat);
                        if (layerInfo.layerProps.length > 0) {
                            layerInfos.push(layerInfo);
                        }

                    }
                }
            } else if (jsonObj?.layers) {
                const layers = jsonObj.layers;
                if (layers && this.isArray(layers)) {
                    for (const layer of layers) {
                        const layerInfo = new LayerInfoData();
                        if (layer.name) {
                            layerInfo.layerName = layer.name;
                        }

                        if (typeof layer.info !== 'undefined') {
                            const info = layer.info;
                            const keys = Object.keys(info);
                            if (keys?.length > 0) {
                                for (const key of keys) {
                                    layerInfo.layerProps.push(new LayerInfoLayerProp({
                                        name: key,
                                        value: info[key]
                                    }));
                                }
                            }
                        }
                        if (typeof layer.rgb !== 'undefined') {
                            const rgb = layer.rgb;
                            const keys = Object.keys(rgb);
                            if (keys?.length > 0) {
                                for (const key of keys) {
                                    layerInfo.layerProps.push(new LayerInfoLayerProp({
                                        name: key,
                                        value: rgb[key]
                                    }));
                                }
                            }
                        }
                        if (typeof layer.raw !== 'undefined') {
                            if (typeof layer.raw?.bands !== 'undefined') {
                                const bands = layer.raw.bands;
                                bands.sort(this.sortByIndex);
                                for (const band of bands) {
                                    layerInfo.layerProps.push(new LayerInfoLayerProp({
                                        name: `${this.transStrings[this.tokens.erdasBandLabel]} ${band.index}`,
                                        value: band.value
                                    }));
                                }
                            }
                        }

                        if (layerInfo.layerProps.length > 0) {
                            layerInfos.push(layerInfo);
                        }
                    }                    
                }
            }
        } catch (err) {
            console.log('Error parsing JSON response from GetFeatureInfo');
            layerInfos = [];
        }
        return layerInfos;
    }

    createLayerInfoDataFromGeoJSONFeature(feat: any): LayerInfoData {
        const layerInfo = new LayerInfoData();
        try {
            if (feat.layerName) {
                layerInfo.layerName = feat.layerName;
            }
            if (typeof feat.id !== 'undefined') {
                layerInfo.layerProps.push(new LayerInfoLayerProp({
                    name: 'id',
                    value: feat.id
                }));
            }
            if (typeof feat.properties !== 'undefined') {
                const props = feat.properties;
                const keys = Object.keys(props);
                if (keys?.length > 0) {
                    for (const key of keys) {
                        layerInfo.layerProps.push(new LayerInfoLayerProp({
                            name: key,
                            value: props[key]
                        }));
                    }
                }
            }
        } catch (err) {
            console.log('Error parsing GeoJson feature');
        }
        return layerInfo;
    }


    sortByIndex(a: any, b: any) {
        const index1 = a.index;
        const index2 = b.index;
        let compare = 0;
        if (index1 && index2) {
            if (index1 > index2) {
                compare = 1;
            } else if (index1 < index2) {
                compare = -1;
            }
        }
        return (compare);
    }

    sortByLayer(a: WMTSLayerInfo, b: WMTSLayerInfo) {
        const name1 = a.title ? a.title.toUpperCase() : a.id.toUpperCase();
        const name2 = b.title ? b.title.toUpperCase() : b.id.toUpperCase();
        let compare = 0;
        if (name1 > name2) {
            compare = 1;
        } else if (name1 < name2) {
            compare = -1;
        }
        return (compare);
    }

    isValidReferenceId(ref: string) {
        const temp = this.getCRSByName(ref);
        return (!!temp);
    }

    xmlToJson(xml) {

        // Create the return object
        let obj;
        if (xml.nodeType === 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj = {};
                for (let j = 0; j < xml.attributes.length; j++) {
                    const attribute = xml.attributes.item(j);
                    obj[attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) { // text
            obj = xml.nodeValue;
        } else if (xml.nodeType === 4) { // cdata-section
            obj = xml.nodeValue;
        } else if (xml.nodeType === 8) { // comment
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            if (xml.childNodes.length === 1 && xml.childNodes[0].nodeName === '#text') {
                obj = xml.childNodes[0].nodeValue;
            } else {
                for (let i = 0; i < xml.childNodes.length; i++) {
                    const item = xml.childNodes.item(i);
                    let nodeName = item.nodeName as string;
                    if (nodeName[0] === '#') {
                        nodeName = nodeName.substr(1);
                    }
                    const objValue = this.xmlToJson(item);
                    if (objValue) {
                        if (!obj) {
                            obj = {};
                            obj[nodeName] = objValue;
                        } else if (typeof (obj[nodeName]) === 'undefined') {
                            obj[nodeName] = objValue;
                        } else {
                            if (typeof (obj[nodeName].push) === 'undefined') {
                                const old = obj[nodeName];
                                obj[nodeName] = [];
                                obj[nodeName].push(old);
                            }
                            obj[nodeName].push(objValue);
                        }
                    }
                }
            }
        }
        return obj;
    }

    getXMLTextValue(text: any) {
        if (text) {
            if (typeof (text) === 'string') {
                return (text);
            } else if (text['cdata-section']) {
                return (text['cdata-section']);
            }
        } else {
            return (null);
        }
    }

    isArray(obj: any) {
        let result = true;
        if (!obj || typeof (obj.push) === 'undefined') {
            result = false;
        }
        return (result);
    }

    isUndefined(obj) {
        return ('undefined' === typeof (obj));
    }

    isDefined(obj, t = false) {
        return !this.isUndefined(obj) && (t || null !== obj);
    }

    isAutoRefresh(mapLayer: Common.MapLayer$v1) {
        let autoRefresh = false;
        let opt = mapLayer.getOption('autoRefresh');
        if (opt?.value && opt.value === 'true') {
            opt = mapLayer.getOption('autoRefreshInterval');
            if (opt?.value) {
                autoRefresh = true;
            }
        }
        return (autoRefresh);
    }
    /**
     * Creates a refresh timer for a auto refreshed layer
     * @param layerInfo Information about the map layer
     * @param mapId Id of map where layer resides
     */
    //  addAutoRefreshLayer(layerInfo: LayerGroupInfo, mapId: string) {
    addAutoRefreshTimer(layerInfo: any, mapId: string) {
        const mapLayer: Common.MapLayer$v1 = layerInfo.mapLayer;
        if (mapLayer) {
            if (this.isAutoRefresh(mapLayer)) {
                // Remove an existing timer if present
                this.removeAutoRefreshTimer(mapLayer.id, mapId);

                const opt = mapLayer.getOption('autoRefreshInterval');
                if (opt?.value) {
                    const refInt = parseInt(opt.value, 10) * 60000;
                    // const refInt = 15000; // used for testing
                    const shutdownTrigger$ = new Subject<boolean>();

                    interval(refInt).pipe(takeUntil(shutdownTrigger$)).subscribe(() => {
                        switch (mapLayer.format) {
                            case Common.LayerFormat$v1.HxCPWMS:
                            case Common.LayerFormat$v1.HxCPWMTS:
                            case Common.LayerFormat$v1.HxDRWMS:
                            case Common.LayerFormat$v1.WMS:
                            case Common.LayerFormat$v1.Tile:
                            case Common.LayerFormat$v1.WMTS: {
                                const leafletLayer: L.GridLayer = layerInfo.leafletLayer as L.GridLayer;
                                if (leafletLayer) {
                                    // console.log('Redrawing wms layer for auto refresh: ' + mapLayer.name);
                                    if (leafletLayer.redraw) {
                                        leafletLayer.redraw();
                                    }
                                }
                                break;
                            }
                            case Common.LayerFormat$v1.GeoJSON: {
                                const leafletLayer: L.GeoJSON.AJAX = layerInfo.leafletLayer as L.GeoJSON.AJAX;
                                if (leafletLayer) {
                                    // console.log('Redrawing geojson layer for auto refresh: ' + mapLayer.name);
                                    if (leafletLayer.refresh) {
                                        leafletLayer.refresh((leafletLayer as any)._url);
                                    }
                                }
                                break;
                            }
                            case Common.LayerFormat$v1.WFS: {
                                const leafletLayer: L.WFS = layerInfo.leafletLayer as L.WFS;
                                if (leafletLayer) {
                                    // console.log('Redrawing WFS layer for auto refresh: ' + mapLayer.name);
                                    if (leafletLayer.refresh) {
                                        leafletLayer.refresh();
                                    }
                                }
                                break;
                            }
                        }
                    });

                    const autoRefInfo = new AutoRefreshLayerInfo({
                        mapId: mapId,
                        layerId: mapLayer.id,
                        shutdownTrigger$: shutdownTrigger$
                    });

                    this.autoRefreshLayers.push(autoRefInfo);
                }
            }
        }
    }
    /**
     * Shuts down the refresh time for the layer and removes it from the list
     * @param layerId Id for the mapLayer
     * @param mapId Id of map where layer resides
     */
    removeAutoRefreshTimer(layerId: string, mapId: string) {

        const index = this.autoRefreshLayers.findIndex((arLayers) => arLayers.mapId === mapId && arLayers.layerId === layerId);
        if (index !== -1) {
            const autoRefInfo = this.autoRefreshLayers[index];
            autoRefInfo.shutdownTrigger$.next(true);
            autoRefInfo.shutdownTrigger$.complete();

            this.autoRefreshLayers.splice(index, 1);
        }
    }

    /**
     * Creates all the auto refresh timers for auto refresh layers on a map
     * @param mapId Id of map where layer resides
     */
    addAllAutoRefreshTimersForMap(mapId: string, layerInfos: any) {
        const keys = Object.keys(layerInfos);
        for (const key of keys) {
            const layerInfo = layerInfos[key];
            this.addAutoRefreshTimer(layerInfo, mapId);
        }
    }

    /**
     * Shuts down all auto refresh timers for auto refresh layers on a map
     * @param mapId Id of map where layer resides
     */
    removeAllAutoRefreshTimersForMap(mapId: string) {

        const refLayerInfos = this.autoRefreshLayers.filter((arLayers) => arLayers.mapId === mapId);
        if (refLayerInfos?.length > 0) {
            for (const refLayerInfo of refLayerInfos) {
                this.removeAutoRefreshTimer(refLayerInfo.layerId, mapId);
            }
        }
    }

    createLayerCollsFromMapPreset(mapPreset: Common.MapPreset$v1): Common.LayerCollection$v1[] {
        const layerColls: Common.LayerCollection$v1[] = [];

        let layerColl = new Common.LayerCollection$v1({
            name: this.transStrings[this.tokens.baseMapsHeader],
            displayOnLayerPanel: true
        });
        (layerColl as any).id = Common.DefaultLayerCollectionIds$v1.BaseMaps;
        let layers = this.getMapLayers(mapPreset, Common.MapLayerType$v1.BaseMap);
        (layerColl as any).layersList = layers;
        (layerColl as any).layers.next(layers);
        layerColls.push(layerColl);

        layerColl = new Common.LayerCollection$v1({
            name: this.transStrings[this.tokens.overlaysHeader],
            displayOnLayerPanel: true
        });
        (layerColl as any).id = Common.DefaultLayerCollectionIds$v1.Overlays;
        layers = this.getMapLayers(mapPreset, Common.MapLayerType$v1.Overlay);
        (layerColl as any).layersList = layers;
        (layerColl as any).layers.next(layers);
        layerColls.push(layerColl);

        layerColl = new Common.LayerCollection$v1({
            name: this.transStrings[this.tokens.dataLayersHeader],
            displayOnLayerPanel: true
        });
        (layerColl as any).id = Common.DefaultLayerCollectionIds$v1.DataLayers;
        layers = this.getMapLayers(mapPreset, Common.MapLayerType$v1.Capability);
        (layerColl as any).layersList = layers;
        (layerColl as any).layers.next(layers);
        layerColls.push(layerColl);

        return (layerColls);
    }

    getCapabilityMapLayerData() {
        return (this.capabilityMapLayerData);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
