import { DefaultLayerCollectionIds$v1 } from "./map-layer-collection.v1";

/** Parameters that uniquely defines a component marker on the map */
export class MarkerDescriptor$v1 {
    /** Id assigned by the map to the marker when added to the map */
    markerId: string;
    /** Id for the map layer associated with this marker.  Default is dynamics layer */
    layerId?: string;
    /** Id for the collection where the layer resides */
    collectionId?: string

    constructor(markerId: string, layerId?: string, collectionId?: string) {
        this.markerId = markerId;
        this.layerId = layerId ? layerId : 'dynamics';
        this.collectionId = collectionId ? collectionId : DefaultLayerCollectionIds$v1.DataLayers;
    }
}
