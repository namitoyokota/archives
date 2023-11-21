import { DefaultLayerCollectionIds$v1 } from "./map-layer-collection.v1";
import { MapInterface$v1 } from './map-interfaces.v1';
import { Geometry$v1 } from './geometry.v1';

/** Data sent by the map to the capability when a layer exposed by the capability is loaded on a map */
export class MapDataRequest$v1 {
    private iMap?: MapInterface$v1;

    /** Capability id assign to the capability represented by the data layer being loaded on the map */
    capabilityId?: string;

    /** Id assigned by the capability to the layer that can be represented as an layer on the map.  This
     *  is the data that the capability has to register when needing to expose data to the map.
     */
    mapLayerDataId?: string;

    /** Id assigned to the map where this data layer is being shown */
    mapId?: string;

    /** Id assigned to the layer being loaded on the map */
    layerId?: string;

    /** Id assigned to the layer collection where the layer resides. */
    layerCollectionId?: string = DefaultLayerCollectionIds$v1.DataLayers;

    constructor(capabilityId?: string, mapId?: string, layerId?: string, mapLayerDataId?: string,
        layerCollectionId = DefaultLayerCollectionIds$v1.DataLayers) {

        this.capabilityId = capabilityId;
        this.mapId = mapId;
        this.layerId = layerId;
        this.mapLayerDataId = mapLayerDataId;
        this.layerCollectionId = layerCollectionId;
    }

    /**
     * Add or update geometries to layer
     * 
     * @param geometries Geometries to be added/updated
     */
     upsertGeometries?(geometries: Geometry$v1[]) {
        if (this.iMap?.iLayers) {
            if (geometries?.length > 0) {
                this.iMap.iLayers.upsertGeometries(geometries, this.layerCollectionId, this.layerId);
            }
        }
    }

    /**
     * Remove geometries from layer
     * 
     * @param geometryIds Ids of geometries to remove
     */
     removeGeometries?(geometryIds: string[]) {
        if (this.iMap?.iLayers) {
            if (geometryIds.length > 0) {
                this.iMap.iLayers.removeGeometries(geometryIds, this.layerCollectionId, this.layerId);
            }
        }
    }

    /**
     * Remove all geometries from layer
     * 
     */
    clearGeometries?() {
        if (this.iMap?.iLayers) {
            this.iMap.iLayers.clearGeometries(this.layerCollectionId, this.layerId);
        }
    }

}
