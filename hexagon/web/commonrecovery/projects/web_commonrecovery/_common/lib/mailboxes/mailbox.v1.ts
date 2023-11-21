import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { Pipeline$v1 } from '../abstractions/pipeline.v1';

/**
 * Version 1 of the methods used by the adapter and the core to communicate.
 */
export class Mailbox$v1 {

    /** Flag that is true when the core is loaded */
    coreIsLoaded$ = new BehaviorSubject<boolean>(false);

    /** Event that a call to get a pipeline has been made. */
    getPipeline$ = new ReplaySubject<MailBox<string, Pipeline$v1>>(100);

    /** Event when an pipeline has been updated */
    updated$ = new BehaviorSubject<Pipeline$v1>(null);
}
