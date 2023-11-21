import { PropertyOperationProcessor$v1, RestrictionOperation$v1 } from '@galileo/web_commontenant/adapter';
import { RestrictIds$v1 } from '@galileo/web_shapes/_common';

import { OperationIds$v1 } from '../../operations/operation-content.v1';
import { StringMatchOperation$v1 } from '../../operations/string-match-operation.v1';

export enum StringOperations {
    equals = 'Equals',
    contains = 'Contains'
}

export class EqualContainsOperationProcessor implements PropertyOperationProcessor$v1<any, any> {

    /** The operation that is currently selected */
    selectedOperation: StringOperations = StringOperations.equals;

    /** Restrict id the operation is for */
    restrictId: RestrictIds$v1;

    /** The value that the user sets as part of the operation */
    addFilterValue: string = null;

    constructor(
        restrictId: RestrictIds$v1
    ) {
        this.restrictId = restrictId;
    }

    /** Return list of possible priority operations */
    operationList(): StringOperations[] {
        return Object.keys(StringOperations).map(k => StringOperations[k]);
    }

    /** Returns if the entered add filter value is valid */
    validate(): boolean {
        return !!(this.addFilterValue && this.addFilterValue.trim());
    }

    /** Process the add filter event */
    process(
        currentOperation: RestrictionOperation$v1<OperationIds$v1, StringMatchOperation$v1>
    ) : RestrictionOperation$v1<OperationIds$v1, StringMatchOperation$v1> {
        if (!currentOperation) {
            currentOperation = new RestrictionOperation$v1<OperationIds$v1, StringMatchOperation$v1>({
                operationId: OperationIds$v1.StringMatch,
                content: new StringMatchOperation$v1({
                    restrictId: this.restrictId
                })
            });
        }

        // Add to the correct list
        if (this.selectedOperation === StringOperations.equals) {
            if (!currentOperation.content.exactExcludeConfigurationOperand
                .find(item => item.toLocaleLowerCase() === this.addFilterValue.toLocaleLowerCase().trim())) {
                currentOperation.content.exactExcludeConfigurationOperand.push(
                    this.addFilterValue.trim()
                );
            }
        } else {
            if (!currentOperation.content.partialExcludeConfigurationOperand
                .find(item => item.toLocaleLowerCase() === this.addFilterValue.toLocaleLowerCase().trim())) {
                currentOperation.content.partialExcludeConfigurationOperand.push(
                    this.addFilterValue.trim()
                );
            }
        }

        // Clear the add filter text box
        this.addFilterValue = null;
        return currentOperation;
    }
}
