import { MapPresetDtoLeaflet$v1 } from './mapPresetDtoLeaflet.v1';
import { MapPresetOption$v1 } from './mapPresetOption.v1';
import { MapLayer$v1 } from './mapLayer.v1';

/** Defines all the map data to create a map and map layers */

export class MapPreset$v1 extends MapPresetDtoLeaflet$v1 {
    /** Map layers for this map preset */
    mapLayers: MapLayer$v1[];
    /** Flag to indicate if map preset is valid */
    valid: boolean;

    constructor (params = {} as MapPreset$v1) {
        const {
            mapLayers = [],
            valid = true
        } = params;

        super(params);

        this.valid = valid;
        this.mapLayers = mapLayers.map((mapLayer) => {
                return(new MapLayer$v1(mapLayer));
        });
    }

    clone? (): MapPreset$v1 {
        return(new MapPreset$v1(this));
    }
    
    upsertOption?(name: string, value: any, type = 'string'): MapPresetOption$v1 {
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
           option = new MapPresetOption$v1 ({
               name: name,
               value: valueStr,
               type: type
           });
           this.options.push(option);
        }

        return(option);
    }

    removeOption?(name: string): MapPresetOption$v1 {
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
        let option: MapPresetOption$v1;
        if (this.options && this.options.length > 0) {
            option = this.options.find((opt) => opt.name === name && typeof type === 'undefined' ? true : opt.type === type);
        }
        return(option);
    }

}
