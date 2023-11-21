import { MarkerSettings$v1 } from './markerSettings.v1';
/** Parameters passed when adding component markers to the map */
export class AddMarkerMessage$v1 {

    /** Array of settings for markers to add */
    markerSettings: MarkerSettings$v1<any> | MarkerSettings$v1<any>[];

    /** Id of the layer that owns the markers added to the map */
    layerId: string;

    constructor (params = {} as AddMarkerMessage$v1) {
        const {
            markerSettings = null,
            layerId
        } = params;

        this.markerSettings = markerSettings;
        this.layerId = layerId;
    }
}
