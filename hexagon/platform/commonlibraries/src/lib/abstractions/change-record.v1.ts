import { ChangeOperation$v1 } from './change-operation.v1';

/**
 * Represents an entity change that corresponds to a single persist event to the data store.
 */
export class ChangeRecord$v1 {
  /** The ID of the user creating the change. */
  user?: string;

  /** The time at which the change occurred. Stored as a string to preserve nano seconds */
  timestamp?: string;

  /** Date version of timestamp used for display. */
  timestampDate?: Date;

  /** The list of operations that comprise the change.  Each operation corresponds to a single
   * property whereas each record corresponds to a single persist to the data store. */
  operations?: ChangeOperation$v1[];

  constructor(params: ChangeRecord$v1 = {} as ChangeRecord$v1) {
    const {
      user = null,
      timestamp = null,
      timestampDate = null,
      operations = [],
    } = params;

    this.user = user;
    this.timestamp = timestamp;

    if (this.timestamp) {
      this.timestampDate = new Date(this.timestamp);
    } else {
      this.timestampDate = timestampDate;
    }

    this.operations = operations;
  }
}
