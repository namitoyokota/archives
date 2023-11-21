export class Telemetry$v1 {
  /** The timestamp */
  timestamp?: Date;

  /** The units of measure */
  unitsOfMeasure?: string;

  /** The value of the telemetry */
  value?: string;

  constructor(params: Telemetry$v1 = {} as Telemetry$v1) {
    const {
      timestamp = null,
      unitsOfMeasure = null,
      value = null
    } = params;

    this.timestamp = timestamp;
    this.unitsOfMeasure = unitsOfMeasure;
    this.value = value;
  }
}
