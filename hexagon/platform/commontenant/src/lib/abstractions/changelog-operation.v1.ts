import { ChangeOperator$v1 } from '@galileo/platform_common-libraries';

import { ChangelogPropertyName$v1 } from './changelog-property-name.v1';

/**
 * Operation performed in the Organization Manager
 */
export class ChangelogOperation$v1 {
    /** Flag to indicate that operation was redacted */
    redact?: boolean;

    /** Name of the changed property */
    propertyName?: ChangelogPropertyName$v1;

    /** Action performed */
    operator?: ChangeOperator$v1;

    /** Value to describe the operation */
    value?: any;
}