import { MapInterface$v1 } from './map-interfaces.v1'
import { LayerCollection$v1 } from "./map-layer-collection.v1";
import { BehaviorSubject, Observable } from 'rxjs';

export enum LayerPosition$v1 {
    Above = 'above',
    Below = 'below',
    Top = 'top',
    Bottom = 'bottom'
}
export class MapLayers$v1 {
    private layerColl = new BehaviorSubject<LayerCollection$v1[]>(null);

    
    /** List of map layer collections being displayed on the map */
    layerCollections$: Observable<LayerCollection$v1[]>;


    constructor (private iMap: MapInterface$v1) {

        this.layerCollections$ = this.layerColl.asObservable();
    }

    /** Add Layer Collection to the corresponding map 
     * 
     * @param collection Object describing collection being added to the map layer collection list.
     * @param position: Optional parameter indicating where in the list the collection should be added.  By default, the collection is added
     * above the Overlays collection.  If a position is indicated, a reference collection id must be included.
     * @param refCollectionId Optional parameter indicating the id of the collection that is relative to the collection being added above or below.  The collection must already
     * exist and added to the map.
     * 
     * @returns The map layer collection object with a valid id
    */
    addLayerCollection(collection: LayerCollection$v1, position?: LayerPosition$v1, refCollectionId?: string): LayerCollection$v1 {
        let coll;
        if (this.iMap?.iLayers) {
            coll = this.iMap.iLayers.addLayerCollection(collection, position, refCollectionId);
        }

        return(coll);
    };

    /** Remove Layer Collection to the corresponding map 
     * 
     * @param collectionId Id of layer collection to remove.  Remove the collection will also remove all the containing layers.
    */
     removeLayerCollection(collectionId: string) {
        if (this.iMap?.iLayers) {
            this.iMap.iLayers.removeLayerCollection(collectionId);
        }
    }

    /** Update the map layer collection.  This will update the name, display property, and its layers.
     * 
     * @param collection MapLayerCollection to be updated.  This must be a collection object that was returned from the addCollection method.
    */
     updateLayerCollection(collection: LayerCollection$v1) {
        if (this.iMap?.iLayers) {
            this.iMap.iLayers.updateLayerCollection(collection);
        }
     }
}
