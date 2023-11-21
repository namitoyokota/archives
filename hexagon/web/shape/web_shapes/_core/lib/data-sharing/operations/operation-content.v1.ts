import { RestrictIds$v1 } from '@galileo/web_shapes/_common';

/**
 * Interface for operation content version 1
 */
export interface OperationContent$v1 {
    /** Restrict id */
    restrictId: RestrictIds$v1;
}

/**
 * Enum of all the possible operation ids for Shape
 */
export enum OperationIds$v1 {
    Redact = 'RedactV1',
    NoopRedact = 'NoopRedactV1',
    NumericOr = 'ShapeNumericOrV1',
    StringMatch = 'ShapeStringMatchV1',
    NoopFilter = 'NoopFilterV1'
}
