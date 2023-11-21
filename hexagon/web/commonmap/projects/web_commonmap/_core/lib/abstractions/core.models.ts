import { ComponentRef } from '@angular/core';
import * as Common from '@galileo/web_commonmap/_common';
import { Subject } from 'rxjs';

import * as L from 'leaflet';
import 'leaflet.markercluster';

export enum MarkerType {
    Basic,
    Component,
    Cluster
}

export class MapviewOverrides {
    mapPresetId: string;
    reorderedLayers: any;
    layerProperties: any;
    baseMapId: string;

     constructor(input: any) {
        this.layerProperties = {};
        this.baseMapId = null;
        this.reorderedLayers = {};

        if (input) {
            this.mapPresetId = input.mapPresetId;
            this.reorderedLayers = input.reorderedLayers;
            this.layerProperties = input.layerProperties;
            this.baseMapId = input.baseMapId;
        }
    }
}

export class MarkerInfo {
    type?: MarkerType;
    displayPriority?: Common.DisplayPriority$v1 = Common.DisplayPriority$v1.Normal;
    marker?: Common.Marker$v1;
    markerId?: string;
    portalId?: string;
    layerId?: string;
    mapLayer?: Common.MapLayer$v1;
    clustered: boolean;
    clusterMarker?: Common.ClusterMarker$v1;
    focusedZIndexOffset?: number;
    compRef?: ComponentRef<any>;
    settings?: Common.MarkerSettings$v1<any>;
    clusterSettings?: Common.ClusterSettings$v1<any>;


    constructor(params = {} as MarkerInfo) {
        const {
            type,
            displayPriority = Common.DisplayPriority$v1.Normal,
            marker,
            markerId,
            portalId,
            mapLayer,
            layerId,
            clusterMarker,
            focusedZIndexOffset,
            compRef,
            settings,
            clusterSettings,
        } = params;
        this.type = type;
        this.displayPriority = displayPriority;
        this.marker = marker;
        this.markerId = markerId;
        this.portalId = portalId;
        this.mapLayer = mapLayer;
        this.layerId = layerId;
        this.clusterMarker = clusterMarker;
        this.focusedZIndexOffset = focusedZIndexOffset;
        this.compRef = compRef;
        this.settings = settings;
        this.clusterSettings = clusterSettings;
    }
}

export class LayerPanelNotification {
    resetToDefaultSelected$ = new Subject<void>();
    fitMapLayerSelected$ = new Subject<Common.MapLayer$v1>();
    fitToHomeSelected$ = new Subject<void>();
    closeLayerPanel$ = new Subject<void>();
    layerPropertyChanged$ = new Subject<any>();
    layersReordered$ = new Subject<any>();
    baseMapChanged$ = new Subject<any>();
    layerPanelDisplayStateChanged$ =  new Subject<boolean>();

    constructor() {}
}

export class LayerGroupInfo {
    mapLayer: Common.MapLayer$v1;
    layerId: string;
    leafletLayer: L.Layer;
    featureGroup: L.FeatureGroup;
    clusterGroup: L.MarkerClusterGroup;
    clusterSettings: Common.ClusterSettings$v1<any>;
    zIndexOffset: number;
    displayedOnMap: boolean;
    paneName: string;
    pane: any;
    maskPaneName: string;
    maskPane: any;
    geomPaneName: string;
    geomPane: any;
    leafletMarkers: any;
    leafletClusterMarkers: any;
    focusedFeatureGroup: L.FeatureGroup;
    focusedMarkers: any;
    geoms: any;
    leafletGeoms: any;
    mapDataRequest: Common.MapDataRequest$v1;

    loaded: boolean;

    constructor() {
        this.leafletMarkers = {};
        this.leafletClusterMarkers = {};
        this.focusedMarkers = {};
        this.loaded = false;
        this.zIndexOffset = 0;
        this.displayedOnMap = false;
        this.geoms = {};
        this.leafletGeoms = {};
        this.mapDataRequest = null;
    }
}

export class LayerCollectionInfo {
    collection: Common.LayerCollection$v1;
    layerGroupInfos: any;
    featureGroup: L.FeatureGroup;
    leafletLayers: any;
    zIndexOffset: number;
    paneName: string;
    pane: any;

    constructor() {
        this.zIndexOffset = 1000;
        this.leafletLayers = {};
        this.layerGroupInfos = {};
    }
}

export class WMTSInfo {
    layers?: WMTSLayerInfo[];
    tileMatrixSets?: WMTSTileMatrixSet[];
    constructor(params = {} as WMTSInfo) {
        const {
            layers = [],
            tileMatrixSets = []
        } = params;
        this.layers = layers;
        this.tileMatrixSets = tileMatrixSets;
    }
}

export class WMTSLayerInfo {
    id?: string;
    title?: string;
    abstract?: string;
    tooltip?: string;
    formats?: string[];
    tileMatrixSetIds?: string[];
    styles?: WMTSLayerStyle[];

    constructor(params = {} as WMTSLayerInfo) {
        const {
            id,
            title,
            abstract,
            tooltip,
            formats = [],
            tileMatrixSetIds = [],
            styles = []
        } = params;
        this.id = id;
        this.title = title;
        this.abstract = abstract;
        this.tooltip = tooltip;
        this.formats = formats;
        this.tileMatrixSetIds = tileMatrixSetIds;
        this.styles = styles;
    }
}

export class WMTSTileMatrixSet {
    id?: string;
    title?: string;
    abstract?: string;
    tooltip?: string;
    crs?: string;
    tileMatrices?: WMTSTileMatrix[];

    constructor(params = {} as WMTSTileMatrixSet) {
        const {
            id,
            title,
            abstract,
            tooltip,
            crs,
            tileMatrices = []
        } = params;
        this.id = id;
        this.title = title;
        this.abstract = abstract;
        this.tooltip = tooltip;
        this.crs = crs;
        this.tileMatrices = tileMatrices;
    }
}

export class WMTSTileMatrix {
    id?: string;
    scale?: number;
    topLeftCorner?: string;
    tileWidth?: number;
    tileHeight?: number;
    matrixWidth?: number;
    matrixHeight?: number;

    constructor(params = {} as WMTSTileMatrix) {
        const {
            id,
            scale,
            topLeftCorner,
            tileWidth,
            tileHeight,
            matrixWidth,
            matrixHeight
        } = params;
        this.id = id;
        this.scale = scale;
        this.topLeftCorner = topLeftCorner;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.matrixWidth = matrixWidth;
        this.matrixHeight = matrixHeight;
    }
}

export class WMTSLayerStyle {
    id?: string;
    title?: string;
    abstract?: string;
    isDefault?: boolean;

    constructor(params = {} as WMTSLayerStyle) {
        const {
            id,
            title,
            abstract,
            isDefault = false
        } = params;
        this.id = id;
        this.title = title;
        this.abstract = abstract;
        this.isDefault = isDefault;
    }
}

export class AutoRefreshLayerInfo {
    mapId?: string;
    layerId?: string;
    shutdownTrigger$?: Subject<boolean>;

    constructor(params = {} as AutoRefreshLayerInfo) {
        const {
            mapId,
            shutdownTrigger$,
            layerId,
        } = params;
        this.mapId = mapId;
        this.shutdownTrigger$ = shutdownTrigger$;
        this.layerId = layerId;
    }
}

export class GeometryInfo {
    displayPriority?: Common.DisplayPriority$v1 = Common.DisplayPriority$v1.Normal;
    geom?: Common.Geometry$v1;
    portalId?: string;
    layerId?: string;
    collectionId?: string;
    mapLayer?: Common.MapLayer$v1;
    focusedZIndexOffset?: number;

    constructor(params = {} as GeometryInfo) {
        const {
            displayPriority = Common.DisplayPriority$v1.Normal,
            geom,
            portalId,
            mapLayer,
            layerId,
            collectionId,
            focusedZIndexOffset
        } = params;
        this.displayPriority = displayPriority;
        this.geom = geom;
        this.portalId = portalId;
        this.mapLayer = mapLayer;
        this.layerId = layerId;
        this.collectionId = collectionId;
        this.focusedZIndexOffset = focusedZIndexOffset;
    }
}

export enum CommandIds {
    CreateSmartShape = 'createSmartShape',
    UseAsFilter = 'useAsFilter'
}

export class ContextMenuItem {
    text?: string;
    icon?: string;
    disabled?: boolean;
    index?: number;
    context?: any;
    callback?: any;
    alwaysLast?: boolean;
    tooltip?: boolean;

    constructor(params = {} as ContextMenuItem) {
        const {
            text,
            icon,
            disabled = false,
            index = 0,
            context,
            callback,
            tooltip,
            alwaysLast = true
        } = params;
        this.text = text;
        this.icon = icon;
        this.disabled = disabled;
        this.index = index;
        this.context = context;
        this.callback = callback;
        this.tooltip = tooltip;
        this.alwaysLast = alwaysLast;
    }
}

export enum GetFeatInfoFormats {
    Text = 'text/plain',
    XML = 'text/xml',
    HTML = 'text/html',
    JSON = 'application/json',
    ESRI_RAW_XML = 'application/vnd.esri.wms_raw_xml',
    ESRI_FEATURE_INFO = 'application/vnd.esri.wms_featureinfo_xml',
    OGC_XML = 'application/vnd.ogc.wms_xml',
    GEOJSON = 'application/geojson'
}

export enum FeatInfoDisplayType {
    Text = 'text',
    Html = 'html',
    Table = 'table',
    GeoJSON = 'geojson',
    None = 'none'
}
export class FeatInfoData {
    type?: FeatInfoDisplayType;
    geoJSONFeatures?: any;
    queryInfo?: string;
    dataLoaded?: boolean;
    errLoadingData?: boolean;

    constructor(params = {} as FeatInfoData) {
        const {
            type = FeatInfoDisplayType.Text,
            geoJSONFeatures,
            queryInfo,
            dataLoaded = false,
            errLoadingData = false
        } = params;
        this.type = type;
        this.geoJSONFeatures = geoJSONFeatures;
        this.queryInfo = queryInfo;
        this.dataLoaded = dataLoaded;
        this.errLoadingData = errLoadingData;
    }
}

export class LayerPropsCmdLayerInfo {
    mapLayer?: Common.MapLayer$v1;
    leafletLayer?: any;
    parentLayer?: any;
    featInfoData?: FeatInfoData;
    panelExpanded?: boolean;
    constructor(params = {} as LayerPropsCmdLayerInfo) {
        const {
            mapLayer = {name: null},
            leafletLayer,
            parentLayer,
            featInfoData,
            panelExpanded = false
        } = params;
        this.mapLayer = mapLayer;
        this.leafletLayer = leafletLayer;
        this.parentLayer = parentLayer;
        this.featInfoData = featInfoData;
        this.panelExpanded = panelExpanded;
    }
}

export class LayerInfoLayerProp {
    name: string;
    value: string;
    constructor(params = {} as LayerInfoLayerProp) {
        const {
            name,
            value
        } = params;
        this.name = name;
        this.value = value;
    }
}
export class LayerInfoData {
    layerName?: string;
    layerProps?: LayerInfoLayerProp[]; 
    constructor(params = {} as LayerInfoData) {
        const {
            layerName,
            layerProps = []
        } = params;
        this.layerName = layerName;
        this.layerProps = layerProps;
    }
}

export enum HxDRQueryOutputType {
    WMS = 'WMS'
}

export class HxDRQuery {

    addressWMS = `    ... on AddressWmsOutput {
        id
        endpoint
        datasetId
        type
    }`;

    layerAddressWMS = `... on LayerAddressWms {
        id
        endpoint
        label
        datasetId
        type
        bounds
        reference
        imageFormat
        versions
    }`;

    createCollectionsQuery(format: Common.LayerFormat$v1) {
        let output;
        switch (format) {
            case Common.LayerFormat$v1.HxDRWMS: {
                output = this.layerAddressWMS;
                break;
            }
        }

        const query = `{
            collections {
                title
                id
                features(limit: 2000) {
                    total
                    contents {
                        id
                        type
                        properties {
                            title
                            format
                            layerAddress {
                                ${output}
                            }
                        }
                    }
                }
            }
        }`;
        return (query);
    }
    createGetProjectsQuery(format: Common.LayerFormat$v1) {
        let output;
        switch (format) {
            case Common.LayerFormat$v1.HxDRWMS: {
                output = this.addressWMS;
                break;
            }
        }
        const query = `{
            getProjects(params: { filter: {byProjectName:""} }) {
                total
                contents {
                    totalAssets
                    name
                    id
                    description
                    rootFolder {
                        id
                        name
                        isRootFolder
                        project {
                            id
                        }
                        parentFolder {
                            id
                        }
                        assets {
                            total
                            contents {
                                id
                                name
                                description
                                groupedAssetGeoreferences {
                                    total
                                    contents {
                                        id
                                        name
                                        anchorX
                                        anchorY
                                        anchorZ
                                        scaleX
                                        scaleY
                                        scaleZ
                                        latitude
                                        longitude
                                        altitude
                                        roll
                                        pitch
                                        yaw
                                    }
                                }
                                asset {
                                    id
                                    anchorPoint {
                                        x
                                        y
                                        z
                                    }
                                    withEmbeddedGeoreference
                                    artifacts {
                                        total
                                        contents {
                                            id
                                            type
                                            addresses {
                                                total
                                                contents {
                                                    ${output}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        folders {
                            total
                            contents {
                                id
                                name
                                description
                                isRootFolder
                                project {
                                    id
                                }
                                parentFolder {
                                    id
                                }
                            }
                        }
                    }
                }
            }
        }`;

        return (query);
    }

    createGetMyAssetsProjectQuery(format: Common.LayerFormat$v1) {
        let output;
        switch (format) {
            case Common.LayerFormat$v1.HxDRWMS: {
                output = this.addressWMS;
                break;
            }
        }
        const query = `{
            getMyAssetsProject {
                totalAssets
                id
                name
                description
                rootFolder {
                    id
                    name
                    description
                    isRootFolder
                    project {
                        id
                    }
                    assets {
                        total
                        contents {
                            id
                            name
                            description
                            groupedAssetGeoreferences {
                                total
                                contents {
                                    id
                                    name
                                    anchorX
                                    anchorY
                                    anchorZ
                                    scaleX
                                    scaleY
                                    scaleZ
                                    latitude
                                    longitude
                                    altitude
                                    roll
                                    pitch
                                    yaw
                                }
                            }
                            asset {
                                id
                                anchorPoint {
                                    x
                                    y
                                    z
                                }
                                withEmbeddedGeoreference
                                artifacts {
                                    total
                                    contents {
                                        id
                                        type
                                        addresses {
                                            total
                                            contents {
                                                ${output}
                                            }
                                         }
                                    }
                                }
                            }
                        }
                    }
                    folders {
                        total
                        contents {
                            id
                            name
                            description
                            isRootFolder
                            project {
                                id
                            }
                            parentFolder {
                                id
                            }
                        }
                    }
                }
            }
        }`;

        return (query);
    }


    createGetFolderQuery(folderId: string, format: Common.LayerFormat$v1) {
        let output;
        switch (format) {
            case Common.LayerFormat$v1.HxDRWMS: {
                output = this.addressWMS;
                break;
            }
        }
        const query = `{
            getFolder(folderId: "${folderId}") {
                id
                name
                description
                isRootFolder
                project {
                    id
                }
                parentFolder {
                    id
                }
                assets {
                    total
                    contents {
                        id
                        name
                        description
                        groupedAssetGeoreferences {
                            total
                            contents {
                                id
                                name
                                anchorX
                                anchorY
                                anchorZ
                                scaleX
                                scaleY
                                scaleZ
                                latitude
                                longitude
                                altitude
                                roll
                                pitch
                                yaw
                            }
                        }
                        asset {
                            id
                            anchorPoint {
                                x
                                y
                                z
                            }
                            withEmbeddedGeoreference
                            artifacts {
                                total
                                contents {
                                    id
                                    type
                                    addresses {
                                        total
                                        contents {
                                            ${output}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                folders {
                    total
                    contents {
                        id
                        name
                        description
                        isRootFolder
                        project {
                            id
                        }
                        parentFolder {
                            id
                        }
                    }
                }
            }
        }`;

        return (query);
    }
}
