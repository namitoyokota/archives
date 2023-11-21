import { Point$v1 } from './point.v1';
import { MapLayerPropertiesDtoLeaflet$v1 } from './mapLayerPropertiesDtoLeaflet.v1';
import { MapLayerDtoLeaflet$v1 } from './mapLayerDtoLeaflet.v1';
import { MapPreset$v1 } from './mapPreset.v1';
import { MapPresetOption$v1 } from './mapPresetOption.v1';
import { MapPresetOptionName } from './mapPresetOptionName.v1';
import { DefaultHighlightStyle, DefaultSelectionStyle } from './systemDefaults.v1';

/** Defines the map layers and information for a map preset */
export class MapPresetDtoLeaflet$v1 {
    id: string;
    name: string;
    isSystemDefined: boolean;
    zoomLevel: number;
    mapCenter: Point$v1;
    mapLayers: MapLayerPropertiesDtoLeaflet$v1[];
    options?: MapPresetOption$v1[];

    constructor(params = {} as MapPresetDtoLeaflet$v1) {
        const {
            id,
            name,
            isSystemDefined = false,
            zoomLevel = 10,
            mapCenter  = new Point$v1(34.674310, -86.742810, 0.0),
            mapLayers = [],
            options = [],
        } = params;
        this.id = id;
        this.name = name,
        this.isSystemDefined = isSystemDefined;
        this.zoomLevel = zoomLevel;
        this.mapCenter = mapCenter;
        if (mapLayers) {
            this.mapLayers = mapLayers.map((mapLayer) => {
                return(new MapLayerPropertiesDtoLeaflet$v1(mapLayer));
            });
        }

        if (options?.length > 0) {
            this.options = options.map((option) => {
                return(new MapPresetOption$v1(option));
            });
        } else {
            this.options = [];
        }
        let opt = this.options.find((opt) => opt.name === MapPresetOptionName.HighlightLineColor);
        if (!opt) {
            this.options.push(new MapPresetOption$v1({
                name: MapPresetOptionName.HighlightLineColor,
                value: DefaultHighlightStyle.color,
                type: 'string'
            }));           
        }
        opt = this.options.find((opt) => opt.name === MapPresetOptionName.HighlightFillColor);
        if (!opt) {
            this.options.push(new MapPresetOption$v1({
                name: MapPresetOptionName.HighlightFillColor,
                value: DefaultHighlightStyle.fillColor,
                type: 'string'
            }));           
        }
        opt = this.options.find((opt) => opt.name === MapPresetOptionName.SelectionLineColor);
        if (!opt) {
            this.options.push(new MapPresetOption$v1({
                name: MapPresetOptionName.SelectionLineColor,
                value: DefaultSelectionStyle.color,
                type: 'string'
            }));           
        }
        opt = this.options.find((opt) => opt.name === MapPresetOptionName.SelectionFillColor);
        if (!opt) {
            this.options.push(new MapPresetOption$v1({
                name: MapPresetOptionName.SelectionFillColor,
                value: DefaultSelectionStyle.fillColor,
                type: 'string'
            }));           
        }
    }

    /** Creates a MapPreset object from the MapPresetDto object
     *
     * @param layerDtos - array of the map layer dtos used to populate the properties of the map layers for this preset
    */
    createMapPresetFromDto (layerDtos: MapLayerDtoLeaflet$v1[]): MapPreset$v1 {
        const mapPreset = new MapPreset$v1();
        mapPreset.id = this.id;
        mapPreset.isSystemDefined = this.isSystemDefined;
        mapPreset.mapCenter = this.mapCenter;
        mapPreset.name = this.name;
        mapPreset.zoomLevel = this.zoomLevel;
        mapPreset.options = this.options;
        mapPreset.mapLayers = [];
        if (this.mapLayers && layerDtos) {
            for (const layerProps of this.mapLayers) {
                const layerDto = layerDtos.find(dto => dto.id === layerProps.id);
                if (layerDto) {
                    mapPreset.mapLayers.push(layerDto.createMapLayerFromDto(layerProps));
                } else {
                    mapPreset.valid = false;
                }
            }
        }

        return(mapPreset);
    }
}
