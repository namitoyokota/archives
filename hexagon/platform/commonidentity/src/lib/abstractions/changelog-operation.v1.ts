/**
 * Describes a type of change to an entity.
 */
export enum ChangeOperator$v1 {
  /** Change a property to the specified value. */
  update = 'Update',

  /** Initialize a property to the specified value. */
  addition = 'Addition',

  /** Remove the value of the property. */
  removal = 'Removal',

  /** Capture the current state of the entity.  Typically, snapshots should NOT include the
   * history (i.e. timeline) of the entity since this will be duplicate in the timeline itself.*/
  snapshot = 'Snapshot',

  /** Insert each element of the supplied value in the property, which is itself a collection. */
  insertEach = 'InsertEach',

  /** Update each element of the supplied value in the property, which is itself a collection. */
  updateEach = 'UpdateEach',

  /** Remove each element of the supplied value in the property, which is itself a collection. */
  removeEach = 'RemoveEach',

  /** Reopens a previously tombstoned entity. */
  reopen = 'Reopen',
}

/** Represents a change to a property of an entity. */
export class ChangeOperation$v1 {
  /** Whether or not this operation's value was redacted. */
  redact?: boolean;

  /** The name of the changed property. */
  propertyName?: string;

  /** A value indicating how the property changed. */
  operator?: ChangeOperator$v1;

  /** The operand corresponding to the operator.  Typically, this value
   * indicates the changes to the property rather than the new state of the property
   * unless the two happen to coincide. */
  value?: any;

  constructor(params: ChangeOperation$v1 = {} as ChangeOperation$v1) {
    const {
      redact = null,
      propertyName = null,
      operator = null,
      value = null,
    } = params;

    this.redact = redact;
    this.propertyName = propertyName;
    this.operator = operator;
    this.value = value;
  }
}
