export interface TombstoneEntity$v1 {
  /** Id of entity */
  id?: string;

  /** A value indicating whether this entity has been tombstoned. */
  tombstoned?: boolean;

  /** The time the entity was tombstoned */
  tombstonedTime?: Date;
}
