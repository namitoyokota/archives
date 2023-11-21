import { RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { PropertyOperationProcessor$v1, RestrictionOperation$v1 } from '@galileo/web_commontenant/adapter';

import { OperationContentNumericOr$v1 } from '../../../operations/operation-content-numeric-or.v1';
import { OperationIds$v1 } from '../../../operations/operation-content.v1';

/**
 * The different priority operations that can be performed
 */
export enum PriorityOperations {
    equalTo = 'EqualTo',
    greaterThan = 'GreaterThan',
    lessThan = 'LessThan',
    equalOrGreaterThan = 'EqualToOrGreaterThan',
    equalOrLessThan = 'EqualToOrLessThan'
}

/**
 * Processing logic for the priority operation
 */
export class PriorityOperationProcessor implements PropertyOperationProcessor$v1<any, any> {

    /** Selected operation. */
    selectedOperation: PriorityOperations = PriorityOperations.equalTo;

    /**
     * The value that the user sets as part of the operation
     */
    addFilterValue = null;

    /**
     * Expose Priority Operations enum
     */
    priorityOperations: typeof PriorityOperations = PriorityOperations;

    /**
     * Return list of possible priority operations
     */
    operationList(): PriorityOperations[] {
        return Object.keys(PriorityOperations).map(k => PriorityOperations[k]);
    }

    /**
     * Returns if the entered add filter value is valid
     */
    validate(): boolean {
        const isValid = !!(this.addFilterValue || this.addFilterValue === 0);
        if (isValid && this.addFilterValue >= 0 &&
            this.addFilterValue <= 9999) {
            // Check it is a number
            return !isNaN(this.addFilterValue);
        }

        return false;
    }


    /**
     * Process the add filter event
     */
    process(currentOperation: RestrictionOperation$v1<OperationIds$v1, OperationContentNumericOr$v1>)
        : RestrictionOperation$v1<OperationIds$v1, OperationContentNumericOr$v1> {
        // Remove if noop
        if (currentOperation && currentOperation.operationId === OperationIds$v1.NoopFilter) {
            currentOperation = null;
        }

        if (!currentOperation) {
            currentOperation = new RestrictionOperation$v1<OperationIds$v1, OperationContentNumericOr$v1>({
                operationId: OperationIds$v1.NumericOr,
                content: new OperationContentNumericOr$v1({
                    restrictId: RestrictIds$v1.priority,
                    rightHandConfigurationOperand: this.addFilterValue
                })
            });
        } else {
            currentOperation.content.rightHandConfigurationOperand = this.addFilterValue;
        }

        currentOperation.content = this.setOperationContent(currentOperation.content);

        // Clear the add filter text box
        this.addFilterValue = null;
        return currentOperation;
    }

    /**
     * Sets the content's equality flags based on the selected operation
     * @param content The operation content to update
     */
    private setOperationContent(content: OperationContentNumericOr$v1): OperationContentNumericOr$v1 {
        switch (this.selectedOperation) {
            case PriorityOperations.equalTo:
                content.equalTo = true;
                content.greaterThan = false;
                content.lessThan = false;
                break;
            case PriorityOperations.greaterThan:
                content.equalTo = false;
                content.greaterThan = true;
                content.lessThan = false;
                break;
            case PriorityOperations.lessThan:
                content.equalTo = false;
                content.greaterThan = false;
                content.lessThan = true;
                break;
            case PriorityOperations.equalOrGreaterThan:
                content.equalTo = true;
                content.greaterThan = true;
                content.lessThan = false;
                break;
            case PriorityOperations.equalOrLessThan:
                content.equalTo = true;
                content.greaterThan = false;
                content.lessThan = true;
                break;
        }

        return content;
    }
}
