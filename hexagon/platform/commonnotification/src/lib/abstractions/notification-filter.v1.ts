/**
 * Represents notification grouping filter
 */
export class NotificationFilter$v1 {
    /** Filter operation id. */
    operationId?: string;

    /** Filter content. */
    content?: any;

    constructor(params: NotificationFilter$v1 = {} as NotificationFilter$v1) {
        const { operationId = null, content = null } = params;

        this.operationId = operationId;
        this.content = content;
    }
}
