import { ChangelogEntityType$v1 } from './changelog-entity-type.v1';
import { ChangeOperation$v1 } from './changelog-operation.v1';

/**
 * Represents an entity change that corresponds to a ChangeRecord and ChangeOperation(s) with additional fields.
 */
export class ChangelogRecord$v1 {
  /** The ID of the user creating the change. */
  user?: string;

  /** The time at which the change occurred. Stored as a string to preserve nano seconds */
  timestamp?: string;

  /** Date version of timestamp used for display. */
  timestampDate?: Date;

  /** The ID of the entity that was changed?. */
  entityId?: string;

  /** The type of change record. */
  entityType?: ChangelogEntityType$v1;

  /** The list of operations that comprise the change.  Each operation corresponds to a single
   * property whereas each record corresponds to a single persist to the data store.
   */
  operations?: ChangeOperation$v1[];

  constructor(params: ChangelogRecord$v1 = {} as ChangelogRecord$v1) {
    const {
      user = null,
      timestamp = null,
      timestampDate = null,
      operations = [],
      entityId = '',
      entityType = null,
    } = params;

    this.entityId = entityId;
    this.entityType = entityType;
    this.user = user;
    this.timestamp = timestamp;

    if (this.timestamp) {
      this.timestampDate = new Date(timestampDate);
    }

    this.operations = operations;
  }
}
