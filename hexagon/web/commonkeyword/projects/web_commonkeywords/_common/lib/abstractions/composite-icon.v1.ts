import { Guid } from '@galileo/web_common-libraries';

import { CompositeIconMember$v1 } from './composite-icon-member.v1';

/**
 * Represents an icon composed of primitive icons
 */
export class CompositeIcon$v1 {

    /** The server-provided etag for concurrency control */
    etag?: string;

    /** Unique identifier for the composite icon */
    id?: string;

    /** An ordered collection of primitive icons with metadata */
    iconStack?: CompositeIconMember$v1[];

    constructor(params: CompositeIcon$v1 = {} as CompositeIcon$v1) {
        const {
            id = Guid.NewGuid(),
            iconStack = [],
            etag = null
        } = params;

        this.id = id;
        this.iconStack = iconStack;
        this.etag = etag;
    }
}
