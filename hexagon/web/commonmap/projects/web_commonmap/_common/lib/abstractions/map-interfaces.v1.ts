import { MapDrawSetup$v1 } from "./map-draw.v1";
import { Geometry$v1, GeometryContextMenuItem$v1 } from "./geometry.v1";
import { MapLayer$v1 } from "./mapLayer.v1";
import { LayerCollection$v1 } from "./map-layer-collection.v1";
import { LayerPosition$v1 } from "./map-layers.v1";
import { VectorStyleProperties$v1 } from "./vectorStyleProps.v1";
import { PixelPoint$v1 } from "./pixelPoint.v1";

export interface DrawInterface$v1 {
    /** Activate the draw toolbar */
    activateDraw?(capabilityId: string, mapDrawSetup?: MapDrawSetup$v1);

    /** Deactivate the draw toolbar */
    deactivateDraw?();

    /** Edit a Geometry */
    edit?(geometry: Geometry$v1, centerGeometry?: boolean, padding?: PixelPoint$v1);

    /** Clears anything that is drawn */
    clear?();

    /** Set Style */
    setStyle(style: VectorStyleProperties$v1);

    /** Zoom the map to center the geometry in the map view */
    centerGeometry(padding?: PixelPoint$v1);
}

export interface LayersInterface$v1 {

    /** Add map layer collection to the map.  By default, the collection is added to to the top of the exiting collections. 
     * 
     * @param collection Collection to be added
     * @param position Optional parameter to specify position in the hierarchy
     * @param posRefCollId Optional parameter to specify the id of the reference collection when adding above or below.
    */
    addLayerCollection?(collection: LayerCollection$v1, position?: LayerPosition$v1, posRefCollId?: string): LayerCollection$v1;

    /** Remove map layer collection from the map.  Removing a collection will remove all associated layers. 
     * 
     * @param collectionId Id of collection to remove
    */
    removeLayerCollection?(collectionId: string);

    /** Update the map layer collection.  This will update the name, display property, and its layers.
     * 
     * @param collection Collection to be updated.  This must be a collection object that was returned from the addCollection method.
    */
    updateLayerCollection?(collection: LayerCollection$v1);

    /** Add layers to a collection.  By default, the layers are appended to the bottom of the exiting layers in the collection. 
     * 
     * @param collectionId Id of collection to add layers
     * @param layers List of layers to be added
     * @param position Optional parameter to specify position in the hierarchy
     * @param positionRefLayerId Optional parameter to specify the reference layer when using the above or below position.
    */
    addLayersToCollection?(collectionId: string, layers: MapLayer$v1[], position?: LayerPosition$v1, positionRefLayerId?: string): MapLayer$v1[];

    /** Remove layers from collection. 
     * 
     * @param collectionId Id of collection to remove layers
     * @param layerIds List of ids of layers to remove
    */
    removeLayersFromCollection?(collectionId: string, layerIds: string[]);

    /** Update the layers.  
     * 
     * @param collectionId Id of collection that owns geometry layer
     * @param layers List of layers to update.  This must be a layer objects that were returned from the addLayer method.
    */
    updateLayersInCollection?(collectionId: string, layers: MapLayer$v1[]);

    /** Add geometries to a layer. 
    * 
    * @param geometries List of geometries to be added
    * @param layerId Id of layer to add geometries.  Default layer will be the draw layer.
    * @param collectionId Id of collection that contains layer
   */
    upsertGeometries?(geometries: Geometry$v1[], collectionId?: string, layerId?: string);

    /** Remove geometries from layer. 
    * 
    * @param collectionId Id of collection that contains layer
    * @param layerId Id of layer to remove geometries
    * @param geometries List of geometry geometries to remove.
   */
    removeGeometries?(geometryIds: string[], collectionId?: string, layerId?: string);

    /** Remove all geometries from the layer.
    * 
    * @param collectionId Id of collection that contains layer
    * @param layerId Id of layer to remove geometries
   */
    clearGeometries?(collectionId?: string, layerId?: string);

    /** Update the style of a geometry.
    *
    * @param style New style information 
    * @param geometryId Id of geometry 
    * @param collectionId Id of collection that contains layer
    * @param layerId Id of layer that contains the geometry
   */
    setGeometryStyle?(style: VectorStyleProperties$v1, geometryId: string, collectionId?: string, layerId?: string);

    /** Set the context menu for a geometry.
    *
    * @param contextMenuItems Array of context menu items 
    * @param geometryId Id of geometry 
    * @param collectionId Id of collection that contains layer
    * @param layerId Id of layer that contains the geometry
   */
    setGeometryContextMenu?(contextMenuItems: GeometryContextMenuItem$v1[], geometryId: string, collectionId?: string, layerId?: string);
}

/** API interface that exposes methods and interfaces that used to call methods on the map object.  This interface is implemented by the Map component */
export interface MapInterface$v1 {

    /** Interface implementation of the draw functionality on the map.  If the map implementation does not support the draw functionality, this should return a null */
    iDraw?: DrawInterface$v1;

    /** Interface implementation of the layers functionality on the map.  If the map implementation does not support the layers functionality, this should return a null */
    iLayers?: LayersInterface$v1

    /** Zoom to Geometry */
    zoomToGeometry(geometry: Geometry$v1, padding?: PixelPoint$v1);

}
