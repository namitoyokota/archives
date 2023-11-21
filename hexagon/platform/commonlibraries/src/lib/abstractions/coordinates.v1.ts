/**
 * Object representing coordinate data
 */
export class Coordinates$v1 {
  /** The latitude */
  latitude?: string;

  /** The longitude */
  longitude?: string;

  /** The altitude */
  altitude?: string;

  constructor(params: Coordinates$v1 = {} as Coordinates$v1) {
    const { latitude = null, longitude = null, altitude = null } = params;

    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
  }
}
