import { ClusterSettings$v1 } from './clusterSettings.v1';
/** Parameters passed when adding component markers to the map */
export class ClusterSettingsMessage$v1 {

    /** Cluster settings */
    clusterSettings: ClusterSettings$v1<any>;

    /** Id of the layer to define cluster settings */
    layerId: string;

    constructor (params = {} as ClusterSettingsMessage$v1) {
        const {
            clusterSettings = null,
            layerId
        } = params;

        this.clusterSettings = clusterSettings;
        this.layerId = layerId;
    }
}
