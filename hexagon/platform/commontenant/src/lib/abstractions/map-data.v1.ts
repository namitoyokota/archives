/**
 * Object used to describe the central location of tenant
 */
export class MapData$v1 {
    /** Latitude coordinates of central point on map. */
    centerLatitude?: string;

    /** Longitude coordinates of central point on map. */
    centerLongitude?: string;

    /** Altitude of central point on map. */
    centerAltitude?: string;

    /** Default map zoom level. */
    zoomLevel?: string;

    constructor(params: MapData$v1 = {} as MapData$v1) {
        const {
            centerLatitude = null,
            centerLongitude = null,
            centerAltitude = null,
            zoomLevel = null
        } = params;

        this.centerLatitude = centerLatitude;
        this.centerLongitude = centerLongitude;
        this.centerAltitude = centerAltitude;
        this.zoomLevel = zoomLevel;
    }
}
