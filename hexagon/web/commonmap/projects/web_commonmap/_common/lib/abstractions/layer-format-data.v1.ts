import { LayerFormat$v1 } from './layerFormat.v1';
import { MapLayerOption$v1 } from './mapLayerOption.v1';

export class LayerFormatData {
    format?: LayerFormat$v1;
    nameToken?: string;
    defaultOptions?: MapLayerOption$v1[];

    constructor(params = {} as LayerFormatData) {
        const {
            format,
            nameToken,
            defaultOptions = []
        } = params;

        this.format = format;
        this.nameToken = nameToken;
        this.defaultOptions = defaultOptions;
    }
}
