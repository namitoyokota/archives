import { Injectable } from '@angular/core';
import * as LayoutCompiler from '@galileo/web_commonlayoutmanager/adapter';

import { Mailbox$v1 } from './mailboxes/mailbox.v1';

@Injectable({
  providedIn: 'root'
})
export class CommonkeywordsMailboxService extends LayoutCompiler.MailBoxService {
  /** Mailbox version 1. */
  mailbox$v1: Mailbox$v1 = new Mailbox$v1();
}
