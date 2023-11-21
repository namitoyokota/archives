export class MonitorResponse$v1 {
  /** Id of feature that is licensed */
  licenseFeatureId?: string;

  /** Initial date of license period */
  startDate?: string;

  /** Final date of license period */
  endDate?: string;

  /** Maximum number writes for license period */
  maximumWrites?: number;

  /** Month data for previous month. */
  previousMonth?: MonthData$v1;

  /** Month data for current month. */
  currentMonth?: MonthData$v1;

  /** Data on a per month basis */
  accumulatedData?: MonthData$v1[];

  constructor(params: MonitorResponse$v1 = {} as MonitorResponse$v1) {
    const {
      licenseFeatureId = null,
      startDate = null,
      endDate = null,
      maximumWrites = null,
      previousMonth = null,
      currentMonth = null,
      accumulatedData = [],
    } = params;

    this.licenseFeatureId = licenseFeatureId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.maximumWrites = maximumWrites;
    this.previousMonth = previousMonth;
    this.currentMonth = currentMonth;
    this.accumulatedData = accumulatedData;
  }
}

export class MonthData$v1 {
  /** The month the data is for from 1-12 */
  month?: number;

  /** Year of data. */
  year?: number;

  /** Number of monthly writes */
  writes?: number;

  /** Number of monthly reads */
  reads?: number;

  /** Collection of writes per PAT */
  tokenWrites?: KeyValuePair[];

  /** Collection of reads per PAT */
  tokenReads?: KeyValuePair[];

  constructor(params: MonthData$v1 = {} as MonthData$v1) {
    const {
      month = null,
      year = null,
      writes = null,
      reads = null,
      tokenWrites = [],
      tokenReads = [],
    } = params;

    this.month = month;
    this.year = year;
    this.writes = writes;
    this.reads = reads;
    this.tokenWrites = tokenWrites;
    this.tokenReads = tokenReads;
  }
}

export interface KeyValuePair {
  key: string;
  value: number;
}
