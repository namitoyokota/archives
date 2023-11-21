import { Person$v1 } from '@galileo/web_common-libraries';

export class FeedbackMessage$v1 {

    /** Tenant id. */
    tenantId?: string;

    /** Feedback message id. */
    id?: string;

    /** Feedback message. */
    message: string;

    /** Contact information. */
    contactInfo?: Person$v1;

    /** Related feature flag id. */
    category: string;

    /** Feedback message created time stamp. */
    createdTime?: string;

    constructor(params: FeedbackMessage$v1 = {} as FeedbackMessage$v1) {
        const {
            tenantId = null,
            id = null,
            message = '',
            contactInfo = null,
            category = '',
            createdTime = null
        } = params;

        this.tenantId = tenantId;
        this.id = id;
        this.message = message;
        this.contactInfo = contactInfo;
        this.category = category;
        this.createdTime = createdTime;
    }
}
