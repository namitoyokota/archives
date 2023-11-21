import { Person$v1 } from '@galileo/web_common-libraries';

export class AddFeedbackMessage$v1 {

    /** List of associated feature flag ids. */
    category: string[];

    /** Feedback message. */
    message: string;

    /** Contact information */
    contactInfo?: Person$v1;

    constructor(params: AddFeedbackMessage$v1 = {} as AddFeedbackMessage$v1) {
        const {
            category = [],
            message = '',
            contactInfo = null
        } = params;

        this.category = category;
        this.message = message;
        this.contactInfo = contactInfo;
    }
}
