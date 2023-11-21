import { MapLayer$v1 } from "./mapLayer.v1";
import { BehaviorSubject, Observable } from "rxjs";
import { MapInterface$v1 } from "./map-interfaces.v1";
import { LayerPosition$v1 } from "./map-layers.v1";
import { Guid } from '@galileo/web_common-libraries';

export enum DefaultLayerCollectionIds$v1 {
    BaseMaps = 'basemaps',
    Overlays = 'overlays',
    DataLayers = 'datalayers'
}

/** Object describing a collection of layers that can be displayed on the map. If indicated, the collection will be
 * visible on the layer panel using the name given The list of layers in the collection will be added to 
 * the map with the first layer in the list having the lowest z order and the last layer displayed with the highest z order.
 */
export class LayerCollection$v1 {
    private layersList?: (MapLayer$v1)[] = [];
    private layers?: BehaviorSubject<MapLayer$v1[]> = new BehaviorSubject<MapLayer$v1[]>(null);
    private iMap?: MapInterface$v1;

    /** Collection Id */
    readonly id?: string;
    /** Collection name */
    name?: string;
    /** Observable that returns the current list of layers.  */
    layers$?: Observable<(MapLayer$v1)[] >;
    /** Flag to indicate if collection should be visible on the layer panel */
    displayOnLayerPanel?: boolean;
    /** Flag to indicate if user can reorder layers inside the collection when displayed on layer panel */
    canReorder?: boolean;

    constructor(params = {} as LayerCollection$v1) {
        const {
            id,
            name = 'Layer Collection',
            displayOnLayerPanel = false,
            canReorder = false
        } = params;
        this.name = name;
        this.displayOnLayerPanel = displayOnLayerPanel;
        this.canReorder = canReorder;
        this.layers$ = this.layers.asObservable();
        this.id = Guid.NewGuid(); 
        
    }

    /** Add layers to a collection.  By default, the layers are added to the end of the list and will be displayed on top. 
     * 
     * @param layers List of layers to be added.  
     * @param position Optional parameter to specify position in the display order to add the layers
     * @param positionRefLayerId Optional parameter to specify the reference layer when using the above or below position.
    */
    addLayers?(layers: MapLayer$v1[], position?: LayerPosition$v1, positionRefLayerId?: string): MapLayer$v1[] {
        let refPos = this.layersList.length;

        // Remove layers that are already in the list
        const newLayers = layers.filter ((layer) => {

            const temp = (this.layersList).find((item) => layer.id === item.id);
            if (!temp) {
                (layer as any).collId = this.id;
            }
            return(!temp); 
        })
        const pos = position ? position : LayerPosition$v1.Top;
        if (pos) {
            switch (pos) {
                case LayerPosition$v1.Top: {
``
                    this.layersList = this.layersList.concat(newLayers);
                    if (this.iMap?.iLayers) {
                        this.iMap.iLayers.addLayersToCollection(this.id, newLayers);
                    }
                    break;
                }
                case LayerPosition$v1.Bottom: {
                    refPos = 0;
                    this.layersList = [].concat(newLayers.concat, this.layersList);

                    break;
                }
                case LayerPosition$v1.Above: {
                    if (positionRefLayerId) {
                        const index = this.layersList.findIndex((item) => item.id === positionRefLayerId);
                        if (index) {
                            this.layersList = this.layersList.slice(0,index).concat(newLayers).concat(this.layersList.slice(index+1));
                            refPos = index;
                        }
                    }
                    break;
                }
                case LayerPosition$v1.Below: {
                    if (positionRefLayerId) {
                        const index = this.layersList.findIndex((item) => item.id === positionRefLayerId);
                        if (index) {
                            refPos = index;
                        }
                    }
                    break;
                }
            }

            this.layers.next(this.layersList);
        }

        return (layers);

    }

    /** Remove layers from collection. 
     * 
     * @param layerIds List of ids of geometry layers to remove
    */
    removeLayers?(layerIds: string[]) {

    }

    /** Update the layer.
     * 
     * @param layers List of layers to update.  This must be a layer objects that were returned from the addLayer method.
    */
    updateLayer?(layers: MapLayer$v1[]) {

    }

}
