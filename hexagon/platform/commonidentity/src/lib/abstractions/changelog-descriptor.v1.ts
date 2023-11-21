/** Copy of Descriptors$1 with an extra field (continuationToken)
 * common-libraries has a reference to this project so we can't extend base classes
 */
export class ChangelogDescriptor$v1 {
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

  /** the token that the userAndGroups timeline requires for paging */
  continuationToken?: string;

  constructor(params: ChangelogDescriptor$v1 = {} as ChangelogDescriptor$v1) {
    const {
      id = null,
      changeRecordCreationTime = null,
      pageSize = null,
      continuationToken = null,
    } = params;

    this.id = id;
    this.changeRecordCreationTime = changeRecordCreationTime;
    this.pageSize = pageSize;
    this.continuationToken = continuationToken;
  }
}
