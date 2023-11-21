import { MapLayerDtoLeaflet$v1 } from './mapLayerDtoLeaflet.v1';
import { MapLayerOption$v1 } from './mapLayerOption.v1';
import { MapLayerType$v1 } from './mapLayerType.v1';
import { LayerFormat$v1 } from './layerFormat.v1';
import { MapLayerAuthentication$v1 } from './mapLayerAuthentication.v1';
import { VectorStyleProperties$v1 } from './vectorStyleProps.v1';
import { Geometry$v1 } from './geometry.v1';
import { MapInterface$v1 } from "./map-interfaces.v1";

/** Defines the data needed for a map layer */
export class MapLayer$v1 extends MapLayerDtoLeaflet$v1 {
    private iMap?: MapInterface$v1;
    private collId?: string;

    /** Flag to indicate if layer data should be displayed when layer is added to map */
    shownOnStartup?: boolean;
    /** Flag to indicate if layer has a min zoom level */
    defineMinZoom?: boolean;
    /** Flag to indicate if layer has a max zoom level */
    defineMaxZoom?: boolean;
    /** Min zoom level for a layer */
    minZoomLevel?: number;
    /** Max zoom level for a layer */
    maxZoomLevel?: number;
    /** Opacity for the layer */
    opacity?: number;
    /** List or url params.  This is stored in options list when written to storage */
    urlParams?: MapLayerOption$v1[];
    /** Local flag to indicate if MapLayer is valid */
    valid?: boolean;
    /** Style for the geometries */
    style?: VectorStyleProperties$v1;
    /** Geometries associated with this layer */
    geometries?: Geometry$v1[];

    constructor (params = {} as MapLayer$v1) {
        const {
            shownOnStartup = true,
            defineMinZoom = false,
            defineMaxZoom = false,
            minZoomLevel = 0,
            maxZoomLevel = 18,
            opacity = 1,
            valid = true,
            style = new VectorStyleProperties$v1(),
            geometries = []
        } = params;
        super(params);

        this.shownOnStartup = shownOnStartup;
        this.defineMinZoom = defineMinZoom;
        this.defineMaxZoom = defineMaxZoom;
        this.minZoomLevel = minZoomLevel;
        this.maxZoomLevel = maxZoomLevel;
        this.opacity = opacity;
        this.style = style;
        this.geometries = geometries;

        // Need to split out the urlParams into its on list.
        if (this.options?.length > 0) {
            this.urlParams = this.options.filter((opt) => opt.type === 'urlParam' || opt.type === 'secret');
            this.options = this.options.filter((opt) => opt.type !== 'urlParam' && opt.type !== 'secret');
        } else {
            this.urlParams = [];
        }

        this.setValid();
    }

    clone?() {
        return(new MapLayer$v1(this));
    }
    upsertOption?(name: string, value: any, type = 'string'): MapLayerOption$v1 {
        let valueStr;
        if (type === 'any') {
            try {
                valueStr = JSON.stringify(value);
            } catch (err) {
                console.log('Error converting option value to str');
            }
        } else {
            valueStr = value;
        }
        let option = this.options.find(opt => opt.name === name);
        if (option) {
            option.value = valueStr;
            option.type = type;
        } else {
           option = new MapLayerOption$v1 ({
               name: name,
               value: valueStr,
               type: type
           });
           this.options.push(option);
        }

        return(option);
    }

    removeOption?(name: string): MapLayerOption$v1 {
        let mapOption;
        if (this.options && this.options.length > 0) {
            for (let ii = 0; ii < this.options.length; ii++) {
                if (this.options[ii].name === name) {
                    mapOption = this.options[ii];
                    this.options.splice(ii, 1);
                    break;
                }
            }
        }

        return(mapOption);
    }

    getOption?(name: string, type?: string) {
        let option: MapLayerOption$v1;
        if (this.options && this.options.length > 0) {
            option = this.options.find((opt) => opt.name === name && typeof type === 'undefined' ? true : opt.type === type);
        }
        return(option);
    }


    upsertUrlParam?(name: string, value: string, type = 'urlParam'): MapLayerOption$v1 {
        let option = this.urlParams.find(opt => opt.name === name);
        if (option) {
            option.value = value;
            option.type = type;
        } else {
           option = new MapLayerOption$v1 ({
               name: name,
               value: value,
               type: type
           });
           this.urlParams.push(option);
        }

        return(option);
    }

    removeUrlParam?(name: string): MapLayerOption$v1 {
        let option;
        if (this.urlParams?.length > 0) {
            for (let ii = 0; ii < this.urlParams.length; ii++) {
                if (this.urlParams[ii].name === name) {
                    option = this.urlParams[ii];
                    this.urlParams.splice(ii, 1);
                    break;
                }
            }
        }

        return(option);
    }

    getUrlParam?(name: string) {
        let option: MapLayerOption$v1;
        if (this.urlParams?.length > 0) {
            option = this.urlParams.find((opt) => opt.name === name);
        }
        return(option);
    }

    upsertSecretOption?(name: string, value: string, type = 'string'): MapLayerOption$v1 {
        let option = this.secretOptions.find(opt => opt.name === name);
        if (option) {
            option.value = value;
            option.type = type;
        } else {
           option = new MapLayerOption$v1 ({
               name: name,
               value: value,
               type: type
           });
           this.secretOptions.push(option);
        }

        return(option);
    }

    removeSecretOption?(name: string): MapLayerOption$v1 {
        let option;
        if (this.secretOptions?.length > 0) {
            for (let ii = 0; ii < this.secretOptions.length; ii++) {
                if (this.secretOptions[ii].name === name) {
                    option = this.secretOptions[ii];
                    this.secretOptions.splice(ii, 1);
                    break;
                }
            }
        }

        return(option);
    }

    getSecretOption?(name: string, type?: string) {
        let option: MapLayerOption$v1;
        if (this.secretOptions?.length > 0) {
            option = this.secretOptions.find((opt) => opt.name === name);
        }
        return(option);
    }

    upsertAuthOption?(name: string, value: string, type = 'string'): MapLayerOption$v1 {
        let option: MapLayerOption$v1;
        if (!this.authentication) {
            this.authentication = new MapLayerAuthentication$v1();
            option = new MapLayerOption$v1({
                name: name,
                value: value,
                type: type
            });

            this.authentication.options.push(option);
        } else {
            option = this.authentication.options.find(opt => opt.name === name);
            if (option) {
                option.value = value;
                option.type = type;
            } else {
               option = new MapLayerOption$v1 ({
                   name: name,
                   value: value,
                   type: type
               });
               this.authentication.options.push(option);
            }
        }

        return(option);
    }

    removeAuthOption?(name: string): MapLayerOption$v1 {
        let option;
        if (this.authentication?.options?.length > 0) {
            for (let ii = 0; ii < this.authentication.options.length; ii++) {
                if (this.authentication.options[ii].name === name) {
                    option = this.authentication.options[ii];
                    this.authentication.options.splice(ii, 1);
                    break;
                }
            }
        }

        return(option);
    }

    /**
     * Add or update geometries on this geometry layer
     * 
     * @param geometries Geometries to be added/updated
     */
    upsertGeometries?(geometries: Geometry$v1[]) {
        geometries.map((geom) => {
            if (this.geometries) {
                const tmp = this.geometries.find((item) => item.id === geom.id);
                if (tmp) { 
                    tmp.coordinates = geom.coordinates;
                    tmp.radius = geom.radius;
                    tmp.style = geom.style;
                    tmp.type = geom.type;
                    if (this.iMap?.iLayers && this.collId) {
                        this.iMap.iLayers.upsertGeometries([tmp], this.collId, this.id);
                    }
                } else {
                    this.geometries.push(geom);
                    if (this.iMap?.iLayers && this.collId) {
                        this.iMap.iLayers.upsertGeometries(this.geometries, this.collId, this.id);
                    }
                }
            } else {
                this.geometries = [];
                this.geometries.push(geom);
                if (this.iMap?.iLayers && this.collId) {
                    this.iMap.iLayers.upsertGeometries(this.geometries, this.collId, this.id);
                }

            }

        });
    }

    /**
     * Remove geometries from this layer
     * @param geometries Geometries to be removed
     */
    removeGeometries?(geometries: Geometry$v1[]) {
        geometries.map((geom) => {
            const index = this.geometries.findIndex((item) => item.id === geom.id);
            if (index !== -1) {
                this.geometries.splice(index,1);
                if (this.iMap?.iLayers && this.collId) {
                    this.iMap.iLayers.removeGeometries([geom.id], this.collId, this.id);
                }
            }
        }); 
    }

    /**
     * Remove all geometries from this layer
     */
    clearAllGeometries?() {
        if (this.geometries) {
            this.geometries = [];
            if (this.iMap?.iLayers && this.collId) {
                this.iMap.iLayers.clearGeometries(this.collId, this.id);
            }
        }
    }

    setValid?() {
        this.valid = this.validateName();
        if (this.valid)  {
            if (this.format === LayerFormat$v1.Geometry) {
                return true;
            } else {
                if (this.type === MapLayerType$v1.BaseMap || this.type === MapLayerType$v1.Overlay) {
                    this.valid = this.validateUrl() && this.validateUrlParams();
                    if (this.valid) {
                        if (this.format === LayerFormat$v1.Tile) {
                            this.valid = this.validateTile();
                        } else if (this.format === LayerFormat$v1.WMS || this.format === LayerFormat$v1.HxCPWMS) {
                            this.valid = this.validateWMS();
                        } else if (this.format === LayerFormat$v1.WMTS || this.format === LayerFormat$v1.HxCPWMTS) {
                            this.valid = this.validateWMTS();
                        } else if (this.format === LayerFormat$v1.WFS) {
                            this.valid = this.validateWFS();
                        } else if (this.format === LayerFormat$v1.HxDRWMS) {
                            this.valid = this.validateHxDRWMS();
                        }
                    }
                }
            }
        }
    }

    validateName?(): boolean {
        return(!!this.name);
    }

    validateUrl?(): boolean {
        let valid = true;
        if (!this.url) {
            valid = false;
        } else {
            valid = this.url.toLowerCase().indexOf('http://') !== 0 || this.url.toLowerCase().indexOf('https://') !== 0;
        }

        return (valid);
    }

    validateUrlParams?(): boolean {
        for (const param of this.urlParams) {
            if (!param.name || !param.value) {
                return(false);
            }
        }
        return(true);
    }

    validateWMS?(): boolean {
        let valid = true;
        valid = (this.wmsLayers.length > 0) && this.validateSubdomains();
        return (valid);
    }

    validateWFS?(): boolean {
        let valid = true;
        valid = (this.wmsLayers.length > 0);
        return (valid);
    }

    validateWMTS?(): boolean {
        let valid = true;
        const opt = this.getOption('wmtsLayerId');
        if (!opt || !opt.value) {
            valid = false;
        }
        return(valid && this.validateSubdomains());
    }

    validateTile?(): boolean {
        let valid = true;
        valid = this.validateSubdomains();

        return (valid);
    }

    validateHxDRWMS?(): boolean {
        let valid = true;
        if (!this.authentication || !this.authentication.options || this.authentication.options.length !== 2) {
            valid = false;
        } else {
            if (this.format === LayerFormat$v1.HxDRWMS) {
                const opt = this.getOption('hxdrLayerId');
                if (!opt || !opt.value) {
                    valid = false;
                } else if (this.wmsLayers?.length === 0) {
                    valid = false;
                }
            }
        }

        return (valid);
    }

    validateSubdomains?() {
        let valid = true;
        if (this.url.includes('{s}')) {
            if (!this.subdomains || this.subdomains.length === 0 ) {
                valid = false;
            }
        }
        return (valid);
    }

    validateTileSize?(tileSize) {
        let valid = true;
        if (!tileSize)  {
            valid = false;
        } else {
            const value = parseInt(tileSize, 10);
            if (isNaN(value)) {
                valid = false;
            }
        }
        return (valid);
    }
}
