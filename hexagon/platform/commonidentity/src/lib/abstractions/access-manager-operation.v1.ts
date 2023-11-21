import { ChangeOperator$v1 } from './changelog-operation.v1';
import { ChangelogPropertyName$v1 } from './changelog-property-name.v1';

export class AccessManagerOperation$v1 {
  /** Flag to indicate that operation was redacted */
  redact?: boolean;

  /** Name of the changed property */
  propertyName?: ChangelogPropertyName$v1;

  /** Action performed */
  operator?: ChangeOperator$v1;

  /** Value to describe the operation */
  value?: any; // TODO - Need to track down the real type
}
