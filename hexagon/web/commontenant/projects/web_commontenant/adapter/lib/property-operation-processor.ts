import { RestrictionOperation$v1 } from '@galileo/web_commontenant/_common';


/**
 * Interface for property operation processors
 * T is the type for operationId (often is a enum)
 * V is the type fot the content
 */
export interface PropertyOperationProcessor$v1<T, V> {
    /**
     * The operation that is currently selected
     */
    selectedOperation: any;

    /**
     * List of all operations that can be selected.
     */
    operationList(): any[];

    /**
     * Returns true if operation is valid.
     */
    validate(): boolean;

    /**
     * Logic for adding and editing an operation.
     * @param operation The operation to process
     */
    process(operation: RestrictionOperation$v1<T, V>)
        : RestrictionOperation$v1<T, V>;
}
