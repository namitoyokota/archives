import { Subject } from 'rxjs';
import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { Point$v1 } from './point.v1';
import { PixelPoint$v1 } from './pixelPoint.v1';
import { Size$v1 } from './size.v1';
import { LayerInfo$v1 } from './layerInfo.v1';
import { AddMarkerMessage$v1 } from './addMarkerMessage.v1';
import { ClusterSettingsMessage$v1 } from './clusterSettingsMessage.v1';
import { ClusterSettings$v1 } from './clusterSettings.v1';
import { DisplayPopupMessage$v1 } from './displayPopupMessage.v1';
import { Marker$v1 } from './marker.v1';
import { MarkerSettings$v1 } from './markerSettings.v1';
import { MapPanZoomMessage$v1 } from './mapPanZoomMessage.v1';
import { ZoomToBoundsMessage$v1 } from './zoomToBoundsMessage.v1';
import { MapEvents$v1 } from './mapEvents.v1';
import { MapBounds$v1 } from './mapBounds.v1';
import { MapDraw$v1, MapDrawSetup$v1 } from './map-draw.v1';
import { MapLayers$v1 } from './map-layers.v1';
import { MapInterface$v1 } from './map-interfaces.v1';
import { Geometry$v1 } from './geometry.v1';

export enum MapType$v1 {
    Type2D,
    Type3D
}

/** Private class with subjects used in calling the map api */
export class MapCommunicationSubs$v1 {

    /** Event fired to add markers to the map.  A single marker or array of markers can
     *  be passed as parameters.  When adding markers that will be clustered, passing an array of markers
     *  (such as on initial load of data) will provide more efficient processing.
     */
    addMarkersSub = new Subject<MailBox<AddMarkerMessage$v1,
                                    Marker$v1 | Marker$v1[]>>();

    /** Event fired to remove all markers for a layer that has been added to the map */
    deleteAllMarkersSub = new Subject<string>();

    /** Event fired to get current zoom level and center coordinate of the map.
     */
    getMapViewSub = new Subject<MailBox<void, MapPanZoomMessage$v1>>();

    /**
     * Event fired to set current zoom level and center point of the map. To pan the map,
     * specify the map center coordinate and no zoom value.
     */
    setMapViewSub = new Subject<MapPanZoomMessage$v1>();

    /** Event fired to set the cluster marker settings needed to render cluster markers for a given layer */
    setClusterSettingsSub = new Subject<ClusterSettingsMessage$v1>();

    /** Event fired to pan map by a given amount defined in pixels.
     */
    panMapByPixelPointSub = new Subject<PixelPoint$v1>();

    /** Event fired to zoom the map to an area.
     */
    zoomToBoundsSub = new Subject<ZoomToBoundsMessage$v1>();

    /** Event fired to get the current pixel point in the window for a coordinate.
     */
    convertLatLonToPixelPointSub = new Subject<MailBox<Point$v1, PixelPoint$v1>>();

    /** Event fired to get the current lat/lng in the window for a pixel point.
     */
    convertPixelPointToLatLonSub = new Subject<MailBox<PixelPoint$v1, Point$v1>>();

    /** Enable/Disable the triggering of a map zoom when the scroll wheel is used */
    setScrollWheelZoomSub = new Subject<boolean>();

    /** Event fired to get the layer information corresponding to the layer id. */
    getLayerInfoSub = new Subject<MailBox<string, LayerInfo$v1>>();

}

/** Data sent by the map to the capability when a layer exposed by the capability is loaded on a map */
export class MapCommunication$v1 {


    /** Id assigned to the map where this data layer is being shown */
    mapId: string;

    /** Id assigned to the view by the Layout Manager where the map resides */
    mapContextId: string;

    /** Size in pixes of the map view */

    mapViewSize: Size$v1;

    /** Indicates if 2d or 3d map */
    mapType: MapType$v1;

    /** Interface that is used to listen to all map events fired from this map view */
    mapEvents?: MapEvents$v1;

    /** Private interface for event subjects */
    mapCommSubs: MapCommunicationSubs$v1 = new MapCommunicationSubs$v1();

    /** Draw api */
    draw: MapDraw$v1;

    /** Layers api */
    layers: MapLayers$v1;

    constructor(mapId?: string, mapContextId?: string, mapType = MapType$v1.Type2D, private iMap: MapInterface$v1 = null) {

        this.mapId = mapId;
        this.mapContextId = mapContextId;
        this.mapType = mapType;

        this.mapEvents = new MapEvents$v1();
        this.draw = new MapDraw$v1(iMap);
        this.layers = new MapLayers$v1(iMap);
    }

    /**
     * Method used to add markers to the map
     *
     * @param compMarkers - array of component marker objects to be added to the map
     * @param layerId - layerId of the map layer that is associated with the markers
     */
    addMarkersAsync(markerSettings: MarkerSettings$v1<any> | MarkerSettings$v1<any>[],
                                layerId?: string): Promise<Marker$v1 | Marker$v1[]> {
        return new Promise<Marker$v1 | Marker$v1[]>((resolve) => {

            const addMarkersMessage = new AddMarkerMessage$v1({
                markerSettings: markerSettings,
                layerId: layerId ? layerId : 'dynamics'
            } as AddMarkerMessage$v1);
            const mailbox = new MailBox<AddMarkerMessage$v1,
                                Marker$v1 | Marker$v1[]>(addMarkersMessage);

            // Listen for response in the mailbox
            mailbox.response.subscribe((retMarkers) => {
                resolve(retMarkers);
                mailbox.close();
            });

            this.mapCommSubs.addMarkersSub.next(mailbox);
        });
    }

    /**
     * Method used to delete all markers from the map.  Many times it is more efficient to remove
     * all the markers and recreate them when you are updating may markers.
     */
    deleteAllMarkers(layerId?: string) {
        this.mapCommSubs.deleteAllMarkersSub.next(layerId ? layerId : 'dynamics');
    }

    /**
     * Method used to add geometries to a layer on the map
     * @returns 
     */

    /**
     * Add or update geometries to layer
     * 
     * @param geometries Geometries to be added/updated
     * @param layerId Id of layer where geometries to be added/updated.  The default is the dynamics layer.
     * @param collectionId Id of collection where layer resides.  Default collection is the data layer.
     */
     upsertGeometries?(geometries: Geometry$v1[], layerId?: string, collectionId?: string) {
        if (this.iMap?.iLayers) {
            this.iMap.iLayers.upsertGeometries(geometries, collectionId, layerId);
        }
    }

    /**
     * Remove geometries from layer
     * 
     * @param geometries Geometries to be removed
     * @param layerId Id of layer where geometries to be removed.  The default is the dynamics layer.
     * @param collectionId Id of collection where layer resides.  Default collection is the data layer.
     */
     removeGeometries?(geometries: Geometry$v1[], layerId?: string, collectionId?: string) {
        if (this.iMap?.iLayers) {
            this.iMap.iLayers.upsertGeometries(geometries, collectionId, layerId);
        }
    }

    /**
     * Method used to get the current zoom level and center point of map
     *
     */
    getMapView(): Promise<MapPanZoomMessage$v1> {
        return new Promise<MapPanZoomMessage$v1>((resolve) => {

            const mailbox = new MailBox<void, MapPanZoomMessage$v1>();

            // Listen for response in the mailbox
            mailbox.response.subscribe((mapViewParams) => {
                resolve(mapViewParams);
                mailbox.close();
            });

            this.mapCommSubs.getMapViewSub.next(mailbox);
        });
    }

    /**
     * Method used to set the current zoom level and center point of map.  To set the zoom only,
     * pass a null value for the map center property. To set the center point only, pass a null value
     * for the zoom level
     *
     * @param zoomLevel - value to zoom.  If null, no zoom will be performed.
     * @param mapCenter - location to center the map view.  If null, the map will stay centered on the current location
     *
     */
    async setMapView(zoomLevel: any, mapCenter: Point$v1) {
        const mvParam = new MapPanZoomMessage$v1();

        if (zoomLevel !== null || mapCenter !== null) {
            if (zoomLevel !== null) {
                mvParam.zoomLevel = zoomLevel;
            }

            if (mapCenter !== null) {
                mvParam.mapCenter = mapCenter;
            }
            this.mapCommSubs.setMapViewSub.next(mvParam);
        }
    }

    /**
     * Method used to set the cluster settings for a layer to cluster markers on the map
     *
     * @param layerId - id of the layer.
     * @param clusterSettings - cluster setting information
     */
    async setClusterSettingsForLayer(clusterSettings: ClusterSettings$v1<any>, layerId?: string) {
        const clusterMsg = new ClusterSettingsMessage$v1({
            layerId: layerId ? layerId : 'dynamics',
            clusterSettings: clusterSettings
        });
        this.mapCommSubs.setClusterSettingsSub.next(clusterMsg);
    }

    /**
     * Method used to shift the center of the map a specified number of pixels in the x and/or y
     * direction
     *
     * @param pixelPoint - pixel values in x and y direction to shift map.
     */
    async panMapByPixelPoint(pixelPoint: PixelPoint$v1) {
        this.mapCommSubs.panMapByPixelPointSub.next(pixelPoint);
    }

    /**
     * Method used zoom the map view so that it will center on an area using a map
     * bounds as input
     *
     * @param bounds - area to zoom defined as a MapBounds$v1 object.
     * @param padding - optional parameter to set a padding value for the top and left
     *                  of the map window.
     * @param maxZoom - optional parameter to set the maximum value to zoom in when
     *                  zooming to the area.
     */
    async zoomToBounds(bounds: MapBounds$v1, padding: PixelPoint$v1, maxZoom: number) {
        this.mapCommSubs.zoomToBoundsSub.next({
            bounds: bounds,
            padding: padding,
            maxZoom: maxZoom
        } as ZoomToBoundsMessage$v1);
    }
    /**
     * Method used zoom the map view so that it will center on an area using an array
     * of coordinates as input
     *
     * @param coordinates - area to zoom defined as an array of coordinate values
     * @param padding - optional parameter to set a padding value for the top and left
     *                  of the map window.
     * @param maxZoom - optional parameter to set the maximum value to zoom in when
     *                  zooming to the area.
     */
    async zoomToArea(coordinates: Point$v1[], padding: PixelPoint$v1, maxZoom: number) {
        this.mapCommSubs.zoomToBoundsSub.next({
            coordinates: coordinates,
            padding: padding,
            maxZoom: maxZoom
        } as ZoomToBoundsMessage$v1);
    }

    /**
     * Method used zoom the map view so that it will center on a geometry
     *
     * @param geometry - area to zoom defined as an array of coordinate values
     * @param padding - optional parameter to set a padding value for the top and left
     *                  of the map window.
     */
     async zoomToGeometry(geometry: Geometry$v1, padding: PixelPoint$v1) {
        if (this.iMap?.zoomToGeometry) {
            this.iMap.zoomToGeometry(geometry);
        }
    }
    /**
     * Method used to convert a geographic coordinate to the corresponding screen coordinates
     *
     * @param latLon - coordinate to convert to pixels.
     */
    convertLatLonToPixelPoint(latLon: Point$v1): Promise<PixelPoint$v1> {
        return new Promise<PixelPoint$v1>((resolve) => {

            const mailbox = new MailBox<Point$v1, PixelPoint$v1>(latLon);

            // Listen for response in the mailbox
            mailbox.response.subscribe((pixelPoint) => {
               resolve(pixelPoint);
                mailbox.close();
            });

            this.mapCommSubs.convertLatLonToPixelPointSub.next(mailbox);
        });
    }
    /**
     * Method used to convert screen coordinates to corresponding geographic coordinates
     *
     * @param pixelPt - screen coordinates to convert
     */
    convertPixelPointToLatLon(pixelPt: PixelPoint$v1): Promise<Point$v1> {
        return new Promise<Point$v1>((resolve) => {

            const mailbox = new MailBox<PixelPoint$v1, Point$v1>(pixelPt);

            // Listen for response in the mailbox
            mailbox.response.subscribe((latLon) => {
               resolve(latLon);
                mailbox.close();
            });

            this.mapCommSubs.convertPixelPointToLatLonSub.next(mailbox);
        });
    }

    /**
     * Method used to enable the triggering of a zoom on the map when the scroll wheel is used.
     */
    enableScrollWheelZoom() {
        this.mapCommSubs.setScrollWheelZoomSub.next(true);
    }

    /**
     * Method used to enable the triggering of a zoom on the map when the scroll wheel is used.
     */
    disableScrollWheelZoom() {
        this.mapCommSubs.setScrollWheelZoomSub.next(false);
    }

    /**
     * Method used to get the map layer information
     *
     */
    getLayerInfo(layerId: string ): Promise<LayerInfo$v1> {
        return new Promise<LayerInfo$v1>((resolve) => {

            const mailbox = new MailBox<string, LayerInfo$v1>(layerId);

            // Listen for response in the mailbox
            mailbox.response.subscribe((layerInfo: LayerInfo$v1) => {
                resolve(layerInfo);
                mailbox.close();
            });

            this.mapCommSubs.getLayerInfoSub.next(mailbox);
        });
    }
}
