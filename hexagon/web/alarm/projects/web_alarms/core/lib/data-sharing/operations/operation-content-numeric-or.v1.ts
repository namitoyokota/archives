import { RestrictIds$v1 } from '@galileo/web_alarms/_common';

import { OperationContent$v1 } from './operation-content.v1';

/**
 * Compares two integers using GreaterThan, LessThan, or EqualTo operators.  When multiple operators are enabled, the results
 * of applying the operators are OR-ed together.
 */
export class OperationContentNumericOr$v1 implements OperationContent$v1 {
    /**
     * Property restrict id
     */
    restrictId: RestrictIds$v1;

    /**
     * The value to compare against the corresponding restrictable value
     */
    rightHandConfigurationOperand?: number;

    /**
     * A value indicating whether to apply the EqualTo operator (contentOperand is EqualTo configOperand)
     */
    equalTo?: boolean;

    /**
     * A value indicating whether to apply the GreaterThan operator (contendOperand is GreaterThan configOperand)
     */
    greaterThan?: boolean;

    /**
     * A value indicating whether to apply the LessThan operator (contentOperand is LessThen configOperand)
     */
    lessThan?: boolean;

    /**
     * Flag use to toggle between only share and don't share
     */
    negate?: boolean;

    constructor(params: OperationContentNumericOr$v1 = {} as OperationContentNumericOr$v1) {
        const {
            restrictId,
            rightHandConfigurationOperand: rightHandConfigurationOperand,
            equalTo = false,
            greaterThan = false,
            lessThan = false,
            negate = true
        } = params;

        this.restrictId = restrictId;
        this.rightHandConfigurationOperand = rightHandConfigurationOperand;
        this.equalTo = equalTo;
        this.greaterThan = greaterThan;
        this.lessThan = lessThan;
        this.negate = negate;
    }
}
