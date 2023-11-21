import { CompositeIconOptions$v1 } from './composite-icon-options.v1';

/**
 * Represents a layer in a composite icon
 */
export class CompositeIconMember$v1 {
    /** The ID of a primitive icon */
    primitiveIconId?: string;

    /** Options for arranging the primitive icon within the composite */
    options?: CompositeIconOptions$v1;

    constructor(params: CompositeIconMember$v1 = {} as CompositeIconMember$v1) {
        const {
            primitiveIconId,
            options
        } = params;

        this.primitiveIconId = primitiveIconId;
        this.options = options;
    }
}
