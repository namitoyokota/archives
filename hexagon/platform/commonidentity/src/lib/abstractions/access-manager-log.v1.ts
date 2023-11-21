import { AccessManagerOperation$v1 } from './access-manager-operation.v1';
import { ChangelogEntityType$v1 } from './changelog-entity-type.v1';

export class AccessManagerLog$v1 {
  /** Refresh token of user that action was performed */
  entityId?: string;

  /** Type of the changed record */
  entityType?: ChangelogEntityType$v1;

  /** User id of the performed user */
  user?: string;

  /** Tenant id in which the operation happened */
  tenant?: string;

  /** The timestamp of when change happened */
  timestamp?: string;

  /** List of performed operations */
  operations?: AccessManagerOperation$v1[];

  constructor(params: AccessManagerLog$v1 = {} as AccessManagerLog$v1) {
    const {
      entityId = null,
      entityType = null,
      user = null,
      tenant = null,
      timestamp = null,
      operations = [],
    } = params;

    this.entityId = entityId;
    this.entityType = entityType;
    this.user = user;
    this.tenant = tenant;
    this.timestamp = timestamp;
    this.operations = operations;
  }
}
