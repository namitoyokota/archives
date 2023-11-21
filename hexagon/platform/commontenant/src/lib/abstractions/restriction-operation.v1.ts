import { Guid } from '@galileo/platform_common-libraries';

/**
 * A representation of a data transform operation.
 * T is the type for operationId (often is a enum)
 * V is the type fot the content
 */
export class RestrictionOperation$v1<T, V> {
    /** Unique id for a restriction operation */
    id?: string;

    /** The operation to be applied to the operation. */
    operationId: T;

    /** Describes what the operation should do. */
    content: V;

    constructor(params: RestrictionOperation$v1<T, V> = {} as RestrictionOperation$v1<T, V>) {
        const {
            id = Guid.NewGuid(),
            operationId: operation,
            content
        } = params;

        this.id = id;
        this.operationId = operation;

        if (content) {
            this.content = JSON.parse(JSON.stringify(content)) as V;
        } else {
            this.content = content;
        }
    }
}
