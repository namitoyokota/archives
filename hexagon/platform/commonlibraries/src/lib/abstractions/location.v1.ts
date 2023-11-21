import { Coordinates$v1 } from './coordinates.v1';

/**
 * Object representing a location
 */
export class Location$v1 {
  /** The address of the location */
  formattedAddress?: string;

  /** The coordinates of the location */
  coordinates?: Coordinates$v1;

  /** The first cross street */
  crossStreet1?: string;

  /** The second cross street */
  crossStreet2?: string;

  constructor(params: Location$v1 = {} as Location$v1) {
    const {
      formattedAddress = null,
      coordinates = null,
      crossStreet1 = null,
      crossStreet2 = null,
    } = params;

    this.formattedAddress = formattedAddress;
    this.coordinates = coordinates;
    this.crossStreet1 = crossStreet1;
    this.crossStreet2 = crossStreet2;
  }
}
