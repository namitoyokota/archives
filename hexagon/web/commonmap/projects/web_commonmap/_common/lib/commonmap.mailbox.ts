import { Injectable } from '@angular/core';
import * as LayoutCompiler from '@galileo/web_commonlayoutmanager/adapter';
import { Mailbox$v1 } from './mailboxes/mailbox.v1';

@Injectable({
    providedIn: 'root'
})

export class CommonmapMailboxService extends LayoutCompiler.MailBoxService {
    /** Version 1 of the mailbox */
    mailbox$v1: Mailbox$v1 = new Mailbox$v1();
}
