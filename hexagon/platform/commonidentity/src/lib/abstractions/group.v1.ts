import { GroupVisibility$v1 } from './visibility.v1';

/**
 * Represents a group in the identity system.
 */
export class Group$v1 {
  /**  Unique identifier for a group */
  id?: string;

  /** The name of the group */
  name: string;

  /** The tenant id the group belongs to */
  tenantId: string;

  /** Text that the user provides that describes a group */
  description: string;

  /** URL to group icon */
  groupIconUrl?: string;

  /** The priority of the group over others */
  priorityIndex?: number;

  /** The visibility of the group */
  visibility?: GroupVisibility$v1;

  /** The tombstoned value of the group */
  tombstoned?: boolean;

  constructor(params: Group$v1 = {} as Group$v1) {
    const {
      id = null,
      name = null,
      tenantId = null,
      description = null,
      groupIconUrl = null,
      priorityIndex = null,
      visibility = GroupVisibility$v1.internal,
      tombstoned = false,
    } = params;

    this.id = id;
    this.name = name;
    this.tenantId = tenantId;
    this.description = description;
    this.groupIconUrl = groupIconUrl;
    this.priorityIndex = priorityIndex;
    this.visibility = visibility;
    this.tombstoned = tombstoned;
  }
}
