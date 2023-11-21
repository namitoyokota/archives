import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, Subject } from 'rxjs';

import { AddFeedbackMessage$v1 } from '../abstractions/add-feedback-message.v1';

/**
 * Version 1 of the methods used by the adapter and the core to communicate.
 */
export class Mailbox$v1 {

    /** Flag that is true when the core is loaded */
    coreIsLoaded$ = new BehaviorSubject<boolean>(false);

    /** Event that a call to save feedback has been made. */
    saveFeedbackMessage$ = new Subject<MailBox<AddFeedbackMessage$v1, void>>();
}
