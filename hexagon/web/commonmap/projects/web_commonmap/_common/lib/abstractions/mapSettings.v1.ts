
import { MapPreset$v1 } from './mapPreset.v1';
import { ZoomControlPositions$v1 } from './zoomControlPositions.v1';
import { LayerPanelControlPositions$v1 } from './layerPanelControlPositions.v1';
import { BehaviorSubject } from 'rxjs';
import { Point$v1 } from './point.v1';

export interface MapControlsOptions$v1 {
    /** Flag to indicate if zoom control should be displayed on map */
    displayZoomControl: boolean;
    /** Location on map where zoom control should be displayed */
    zoomControlLocation: ZoomControlPositions$v1;
    /** Flag to indicate if layer panel control should be displayed on map */
    displayLayerPanel: boolean;
    /** Location on map where zoom control should be displayed */
    layerPanelLocation: LayerPanelControlPositions$v1;
    /** Flag to indicate if layers can be reordered on the layer panel */
    allowLayerReorder: boolean;
    /** Show the draw control */
    showDrawControl: boolean;
    /** Show the Layer Property command */
    showLayerProperties?: boolean;
}

/** Object that contains information needed to display map data */
export class MapSettings$v1 {
    /** Map preset with initial layer data to display on map */
    mapPreset?: MapPreset$v1;
    /** Flag to indicate if system default map preset should be displayed if no preset defined  */
    showSystemDefaultMapPreset?: boolean;
    /** Zoom level for map.  This will override the value set in the map preset */
    zoomLevel?: number;
    /** Center point for map.  This will override the value set in the map preset */
    mapCenter?: Point$v1;

    /** Flag to indicate the map is read-only and can not be manipulated */
    readOnly?: boolean;
    /** Options for map controls  */
    mapControls?: MapControlsOptions$v1;
    /** Context id for view injecting the map component */
    contextId?: string;
    /** Flag to indicate that the data for capability layers should be requested
     *  via RequestData event.
     */
    requestDataForCapabilityLayers?: boolean;

    constructor(params = {} as MapSettings$v1) {
        const {
            mapPreset = null,
            showSystemDefaultMapPreset = false,
            readOnly = false,
            mapControls = {
                displayZoomControl: true,
                zoomControlLocation: ZoomControlPositions$v1.BottomRight,
                displayLayerPanel: true,
                layerPanelLocation: LayerPanelControlPositions$v1.TopRight,
                allowLayerReorder: true,
                showDrawControl: false,
                showLayerProperties: false
            } as MapControlsOptions$v1,
            zoomLevel,
            mapCenter,
            contextId = null,
            requestDataForCapabilityLayers = true
        } = params;

        this.mapPreset = mapPreset;
        this.showSystemDefaultMapPreset = showSystemDefaultMapPreset;
        this.readOnly = readOnly;
        this.mapControls = mapControls;
        this.contextId = contextId;
        this.zoomLevel = zoomLevel;
        this.mapCenter = mapCenter;
        this.requestDataForCapabilityLayers = requestDataForCapabilityLayers;
    }
}
