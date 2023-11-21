/** An object used to get a page for the history of any given capability. */
export class Descriptor$v1 {
  /**
   * The id of the object to get the history for.
   * Ex: incidentId, unitId, etc.
   */
  id?: string;

  /**
   * A timestamp used for specifying the time frame to start getting objects.
   * If specified, all objects returned will occur after this timestamp.
   * Leaving this property null will get the most recent objects instead.
   */
  changeRecordCreationTime?: string;

  /** The number of objects to return per page. */
  pageSize?: number;

  constructor(params: Descriptor$v1 = {} as Descriptor$v1) {
    const {
      id = null,
      changeRecordCreationTime = null,
      pageSize = null,
    } = params;

    this.id = id;
    this.changeRecordCreationTime = changeRecordCreationTime;
    this.pageSize = pageSize;
  }
}
