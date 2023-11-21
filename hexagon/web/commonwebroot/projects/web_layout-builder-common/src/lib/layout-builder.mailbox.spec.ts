import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MailboxService } from './layout-builder.mailbox';

describe('MailboxService', () => {
    let service: MailboxService;

    beforeEach(() => {
        service = new MailboxService();
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
