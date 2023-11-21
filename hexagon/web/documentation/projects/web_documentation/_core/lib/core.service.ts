import { Injectable } from '@angular/core';
import { CommonMailboxService } from '@galileo/web_documentation/_common';

import { EventService } from './event.service';

/**
 * The core service is the place where you tie all your other service
 * together. It should not be provided to any component or service. This
 * is where you will set up the listeners to the common mailbox, and
 * set up converting notifications into events.
 */
@Injectable({
    providedIn: 'root'
})
export class CoreService {

    constructor(
        private mailbox: CommonMailboxService,
        private eventSrv: EventService)
    {
        this.initPostOffice();
    }

    /**
     * Listen to all messages in the mailbox service
     */
    private initPostOffice(): void { }
}
