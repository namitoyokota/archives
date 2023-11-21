import { Point$v1 } from './point.v1';
import { MapLayerOption$v1 } from './mapLayerOption.v1';
import { MapLayerType$v1 } from './mapLayerType.v1';
import { LayerFormat$v1 } from './layerFormat.v1';
import { MapLayerPropertiesDtoLeaflet$v1 } from './mapLayerPropertiesDtoLeaflet.v1';
import { MapLayerAuthentication$v1 } from './mapLayerAuthentication.v1';
import { MapLayer$v1 } from './mapLayer.v1';
import { Guid } from '@galileo/web_common-libraries';

/** Storage and transfer class for map layers */
export class MapLayerDtoLeaflet$v1 {
    /** Id of layer */
    id?: string;
    /** Name assigned to layer */
    name?: string;
    /** Type of map layer */
    type?: MapLayerType$v1;
    /** Id of the capability if the layer is an data layer */
    capabilityModuleRef?: string;
    /** Flag to indicate a system defined layer */
    isSystemDefined?: boolean;
    /** Leaflet format for the layer */
    format?: LayerFormat$v1;
    /** URL that contains the data for the layer  */
    url?: string;
    /** WMS layer names if layer is an WMS type */
    wmsLayers?: string[];
    /** Rotation for the image of the image layer */
    rotation?: number;
    /** Origin of the image for an image layer */
    origin?: Point$v1;
    /** Name of the image for an image layer */
    imageName?: string;
    /** Size of the image */
    imageSize?: number[];
    /** Flag to indicate if image is constrained to a rectangle */
    constrainedTo90?: boolean;
    /** Flag to indicate if image must maintain aspect ratio */
    maintainAspect?: boolean;
    /** Array of map layer options */
    options?: MapLayerOption$v1[];
    /** Array of map layer options for sensitive data */
    secretOptions?: MapLayerOption$v1[];
    /** Contains Authentication details needed for requesting some map sources. */
    authentication?: MapLayerAuthentication$v1;
    /** Array of urlParams */
    urlParams?: MapLayerOption$v1[];
    /** Anchor points for image */
    anchors?: Point$v1[];
    /** Subdomains for the tileset */
    subdomains?: string[];

    // client side
    leafletLayer? = null;

    constructor(params = {} as MapLayerDtoLeaflet$v1) {
        const {
            id,
            name,
            type = MapLayerType$v1.BaseMap,
            isSystemDefined = false,
            capabilityModuleRef,
            url = null,
            format = LayerFormat$v1.Tile,
            rotation = 0,
            constrainedTo90 = true,
            maintainAspect = true,
            anchors = [],
            wmsLayers = [],
            options = [],
            urlParams = [],
            secretOptions = [],
            authentication,
            subdomains = ['a', 'b', 'c'],
            imageName,
            imageSize = null
        } = params;

        this.id = id ? id : Guid.NewGuid();
        this.name = name;
        this.type = type === MapLayerType$v1.DataLayer ? MapLayerType$v1.Overlay : type;
        this.isSystemDefined = isSystemDefined;
        this.capabilityModuleRef = capabilityModuleRef;
        this.url = url;
        this.format = format;
        this.rotation = rotation;
        this.constrainedTo90 = constrainedTo90;
        this.maintainAspect = maintainAspect;
        this.subdomains = subdomains;
        if (imageSize) {
            this.imageSize = imageSize.slice();
        }
        if (anchors) {
            this.anchors = anchors.slice();
        }

        if (wmsLayers) {
            this.wmsLayers = wmsLayers.slice();
        }
        if (options?.length > 0) {
            this.options = options.map((option) => {
                return(new MapLayerOption$v1(option));
            });
        } else {
            this.options = [];
        }

        if (urlParams?.length > 0) {
            const tempUrlParams = urlParams.map((option) => {
                return(new MapLayerOption$v1(option));
            });

            this.options = this.options.concat(tempUrlParams);
        }

        if (secretOptions) {
            this.secretOptions = secretOptions.map((option) => {
                return(new MapLayerOption$v1(option));
            });
        }

        if (authentication) {
            this.authentication = new MapLayerAuthentication$v1(authentication);
        }

        this.imageName = imageName;
        this.imageSize = imageSize;
    }

    /** Creates a MapLayer object from the MapLayerDto object
     *
     * @param layerProps - Optionally pass in the layer properties for this map layer from the
     * map preset where the layer is used.
     */
    createMapLayerFromDto?(layerProps?: MapLayerPropertiesDtoLeaflet$v1): MapLayer$v1 {
        const mapLayer = new MapLayer$v1();

        mapLayer.id = this.id;
        mapLayer.name = this.name;
        mapLayer.type = this.type;
        mapLayer.isSystemDefined = this.isSystemDefined;
        mapLayer.capabilityModuleRef = this.capabilityModuleRef;
        mapLayer.url = this.url;
        mapLayer.format = this.format;
        mapLayer.rotation = this.rotation;
        mapLayer.constrainedTo90 = this.constrainedTo90;
        mapLayer.maintainAspect = this.maintainAspect;
        mapLayer.anchors = this.anchors;
        mapLayer.wmsLayers = this.wmsLayers;
        mapLayer.secretOptions = this.secretOptions;
        mapLayer.authentication = this.authentication;
        mapLayer.imageName = this.imageName;
        mapLayer.imageSize = this.imageSize;
        if (layerProps) {
            mapLayer.shownOnStartup = layerProps.shownOnStartup;
            mapLayer.defineMaxZoom = layerProps.defineMaxZoom;
            mapLayer.defineMinZoom = layerProps.defineMinZoom;
            mapLayer.minZoomLevel = layerProps.minZoomLevel;
            mapLayer.maxZoomLevel = layerProps.maxZoomLevel;
            mapLayer.opacity = layerProps.opacity;
        }

        if (this.options) {
            mapLayer.options = this.options.filter((opt) => opt.type !== 'urlParam' && opt.type !== 'secret');
            mapLayer.urlParams = this.options.filter((opt) => opt.type === 'urlParam' || opt.type === 'secret');

        }
        mapLayer.setValid();
        return (mapLayer);
    }
    encode?() {
        this.url = encodeURIComponent(this.url);
        this.name = encodeURIComponent(this.name);
        if (this.capabilityModuleRef) {
            this.capabilityModuleRef = encodeURIComponent(this.capabilityModuleRef);
        }

        for (const option of this.options) {
            if (option.type === 'string') {
                option.value = encodeURIComponent(option.value);
            }
        }

        for (const option of this.urlParams) {
            option.value = encodeURIComponent(option.value);
        }

        for (const option of this.secretOptions) {
            option.value = encodeURIComponent(option.value);
        }

        if (this.authentication) {
            this.authentication.encode();
        }
    }

    decode?() {
        this.url = decodeURIComponent(this.url);
        this.name = decodeURIComponent(this.name);
        if (this.capabilityModuleRef) {
            this.capabilityModuleRef = decodeURIComponent(this.capabilityModuleRef);
        }

        for (const option of this.urlParams) {
            if (option.type === 'string') {
                option.value = decodeURIComponent(option.value);
            }
        }

        for (const option of this.options) {
            if (option.type === 'string') {
                option.value = decodeURIComponent(option.value);
            }
        }

        for (const option of this.secretOptions) {
            if (option.type === 'string') {
                option.value = decodeURIComponent(option.value);
            }
        }

        if (this.authentication) {
            this.authentication.decode();
        }
    }
}

