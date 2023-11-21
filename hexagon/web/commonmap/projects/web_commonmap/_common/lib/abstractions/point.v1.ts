/** Defines point information */
export class Point$v1 {

    /** Latitude of coordinate */
    latitude: number;

    /** Longitude of coordinate */
    longitude: number;

    /** Optional altitude for coordinate */
    altitude?: number;

    constructor(latitude?: number, longitude?: number, altitude?: number) {
        this.latitude = typeof latitude === 'undefined' ? 0.0 : latitude;
        this.longitude = typeof longitude === 'undefined' ? 0.0 : longitude;
        this.altitude = altitude;
    }
}
