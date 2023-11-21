import { RestrictIds$v1 } from '@galileo/web_alarms/_common';

import { OperationContent$v1 } from './operation-content.v1';

export class StringMatchOperation$v1 implements OperationContent$v1 {

    /**
     * Property restrict id
     */
    restrictId: RestrictIds$v1;

    /**
     *  A list of strings that are compared to the contentOperand using case-insensitive equality for message inclusion
     */
    exactIncludeConfigurationOperand?: string[];

    /**
     * A list of strings that are compared to the contentOperand using a case-insensitive substring search for message inclusion
     */
    partialIncludeConfigurationOperand?: string[];

    /**
     * A list of strings that are compared to the contentOperand using case-insensitive equality for message exclusion
     */
    exactExcludeConfigurationOperand?: string[];

    /**
     * A list of string that are compared to the contentOperand using a case-insensitive substring search for message exclusion
     */
    partialExcludeConfigurationOperand?: string[];

    constructor(params: StringMatchOperation$v1 = {} as StringMatchOperation$v1) {
        const {
            restrictId,
            exactIncludeConfigurationOperand = [],
            partialIncludeConfigurationOperand = [],
            exactExcludeConfigurationOperand = [],
            partialExcludeConfigurationOperand = []
        } = params;

        this.restrictId = restrictId;
        this.exactIncludeConfigurationOperand = exactIncludeConfigurationOperand;
        this.partialIncludeConfigurationOperand = partialIncludeConfigurationOperand;
        this.exactExcludeConfigurationOperand = exactExcludeConfigurationOperand;
        this.partialExcludeConfigurationOperand = partialExcludeConfigurationOperand;
    }
}
