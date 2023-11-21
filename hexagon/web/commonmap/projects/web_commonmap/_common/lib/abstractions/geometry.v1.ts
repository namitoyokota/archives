import { Coordinates$v1, Guid } from '@galileo/web_common-libraries';
import { Observable, Subject } from 'rxjs';
import * as L from 'leaflet';
import { MapInterface$v1 } from './map-interfaces.v1';
import { PixelPoint$v1 } from './pixelPoint.v1';
import { VectorStyleProperties$v1 } from './vectorStyleProps.v1';
import { AllGeoJSON, centroid, Geometry, Position } from '@turf/turf';


/** The different types a geometry can be */
export enum GeometryType$v1 {
    polygon = 'Polygon',
    rectangle = 'Rectangle',
    circle = 'Circle',
    line = 'Line'
}

export class GeometryEvents$v1 {

    private clicked = new Subject<Geometry$v1>();

    private contextMenuItemClicked = new Subject<GeometryContextMenuItem$v1>();

    private geom: Geometry$v1;

    /** Fired when a geometry is clickedCollections */
    clicked$?: Observable<Geometry$v1>;

    /** Context menu item clicked */
    contextMenuItemClicked$?: Observable<GeometryContextMenuItem$v1>;

    constructor(private geometry: Geometry$v1) {
        this.geom = geometry;
        this.clicked$ = this.clicked.asObservable();
        this.contextMenuItemClicked$ = this.contextMenuItemClicked.asObservable();
    }

}

export class GeometryContextMenuItem$v1 {

    /** Menu item id */
    id: string;

    /** Menu item Label */
    label?: string;

    /** Menu item icon */
    icon?: string;

    /** Flag indicating if menu item is disabled  */
    disabled?: boolean;

    /** Submenus */
    submenuItems?: GeometryContextMenuItem$v1[];

    constructor (params = {} as GeometryContextMenuItem$v1) {
        const {
            id,
            label,
            icon,
            disabled = false,
            submenuItems
        } = params;

        this.id = id;
        this.label = label;
        this.icon = icon;
        this.disabled = disabled;
        this.submenuItems = submenuItems;
    }
}

export class Geometry$v1 {

    private iMap?: MapInterface$v1;

    /** Id of geometry */
    id?: string;

    /** Id of layer where geometry resides */
    layerId?: string;

    /** Id of layer collection */
    collectionId?: string;

    /** CapabilityId that owns geometry */
    capabilityId?: string;

    /** Type of geometry */
    type?: GeometryType$v1;

    /** Coordinates for the geometry. */
    coordinates?:  [[number[]]] | [number[]] | number[];

    /** Radius used for Circle geometry */
    radius?: number;

    /** Style for Geometry. Will be used to override style defined on geometry layer */
    style?: VectorStyleProperties$v1;

    /** Flag to indicate that this geometry should mask all items outside */
    useAsMask?: boolean;

    /** Id that can be used to reference a source for the geometry */
    sourceId?: string;

    /** List of context menu items */
    contextMenu?: GeometryContextMenuItem$v1[];

    /** Events fired for the geometry */
    events?: GeometryEvents$v1;

    /** Layer used for displaying buffer */
    bufferLayer?: L.LayerGroup;

    constructor (params = {} as Geometry$v1) {
        const {
            id,
            layerId,
            collectionId,
            capabilityId,
            type = GeometryType$v1.polygon,
            coordinates,
            radius,
            style,
            useAsMask = false,
            sourceId,
            contextMenu,
            bufferLayer
        } = params;

        this.id = Guid.NewGuid();
        this.layerId = layerId,
        this.collectionId = collectionId;
        this.capabilityId = capabilityId;
        this.type = type;
        this.radius = radius;
        this.coordinates = coordinates;
        this.style = style;
        this.useAsMask = useAsMask;
        this.sourceId = sourceId;
        this.contextMenu = contextMenu;
        this.events = new GeometryEvents$v1(this);
        this.bufferLayer = bufferLayer;
    } 

    /** 
     * Set the style of the geometry.  This will update the style on the map if the geometry is 
     * already added to a layer.
     */
    setStyle?(style: VectorStyleProperties$v1) {
        this.style = style;
        if (this.iMap?.iLayers?.setGeometryStyle) {
            this.iMap.iLayers?.setGeometryStyle(style, this.id, this.collectionId, this.layerId);
        }
    }

    /**  
     * Set the context menu for a geometry
     * @param contextMenuItems Array of commands for the context menu
    */
    setContextMenu?(contextMenuItems: GeometryContextMenuItem$v1[]) {
        this.contextMenu = contextMenuItems;
        if (this.iMap?.iLayers?.setGeometryContextMenu) {
            this.iMap.iLayers.setGeometryContextMenu(contextMenuItems, this.id, this.collectionId, this.layerId);
        }
    }

    /** 
     * Set the context menu for a geometry 
     * @param contextMenuItems Array of commands for the context menu
    */
    zoomTo?(padding?: PixelPoint$v1) {
        if (this.iMap?.zoomToGeometry) {
            this.iMap.zoomToGeometry(this);
        }
    }

    /**
     * Returns centroid of current geometry
     */
    centroid?() {
        if (!this.coordinates) {
            return null;
        }

        if (this.type === GeometryType$v1.circle) {
            return new Coordinates$v1({
                latitude: this.coordinates[1].toString(),
                longitude: this.coordinates[0].toString()
            } as Coordinates$v1);
        }

        const geoJson = {
            type:"FeatureCollection",
            features:[{
                type:"Feature",
                properties:{},
                geometry:{
                    type: this.type === GeometryType$v1.line ? "LineString" : "Polygon",
                    coordinates: this.coordinates
                }
            }]
        } as AllGeoJSON;
        
        const center = centroid(geoJson)?.geometry?.coordinates;

        if (!center) {
            return null;
        }

        return new Coordinates$v1({
            latitude: center[1].toString(),
            longitude: center[0].toString()
        } as Coordinates$v1);
    }

}
