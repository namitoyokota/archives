/** Additional Layer properties for layers when used in a map preset */
export class MapLayerPropertiesDtoLeaflet$v1 {
    /** Id of the map layer dto corresponding to these properties */
    id?: string;
    /** Flag to indicate if layer data should be displayed when layer is added to map */
    shownOnStartup?: boolean;
    /** Flag to indicate if layer has a min zoom level */
    defineMinZoom?: boolean;
    /** Flag to indicate if layer has a max zoom level */
    defineMaxZoom?: boolean;
    /** Min zoom level for a layer */
    minZoomLevel?: number;
    /** Max zoom level for a layer */
    maxZoomLevel?: number;
    /** Opacity for the layer */
    opacity?: number;

    constructor(params = {} as MapLayerPropertiesDtoLeaflet$v1) {
        const {
            id,
            shownOnStartup = true,
            defineMinZoom = false,
            defineMaxZoom = false,
            minZoomLevel = 0,
            maxZoomLevel = 18,
            opacity = 1
        } = params;

        this.id = id;
        this.shownOnStartup = shownOnStartup;
        this.defineMinZoom = defineMinZoom;
        this.defineMaxZoom = defineMaxZoom;
        this.minZoomLevel = minZoomLevel;
        this.maxZoomLevel = maxZoomLevel;
        this.opacity = opacity;
    }
}

