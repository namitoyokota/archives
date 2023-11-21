import { Component, Input } from '@angular/core';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { SendInvitationEmailBtnTranslationTokens } from './send-invitation-email-btn.translation';

@Component({
    selector: 'hxgn-commontenant-send-invitation-email-btn',
    templateUrl: 'send-invitation-email-btn.component.html',
    styleUrls: ['send-invitation-email-btn.component.scss']
})
export class SendInvitationEmailBtnComponent {

    /** Id of the tenant to send invitation to */
    @Input() tenantId: string;

    /** Flag that is true if the element is disabled */
    @Input() disabled = false;

    /** Flag that is true when data is loading */
    isLoading = false;

    /** Expose translation tokens to html. */
    tokens: typeof SendInvitationEmailBtnTranslationTokens = SendInvitationEmailBtnTranslationTokens;

    constructor(
        private identitySrv: CommonidentityAdapterService$v1
    ) { }

    /**
     * Sends the tenant's poc and invite email
     */
    async sendInvitationEmail() {
        this.isLoading = true;
        await this.identitySrv.inviteTenantAsync(this.tenantId);
        this.isLoading = false;
    }
}
