import { RestrictIds$v1 } from '@galileo/web_alarms/_common';

import { OperationContent$v1 } from './operation-content.v1';

/**
 * Describes what the "redaction" operation should do
 */
export class OperationContentRedaction$v1 implements OperationContent$v1 {

    /** Restrict id the operation is for */
    restrictId: RestrictIds$v1;

    constructor(params: OperationContentRedaction$v1 = {} as OperationContentRedaction$v1) {
        const {
            restrictId
        } = params;

        this.restrictId = restrictId;
    }
}
