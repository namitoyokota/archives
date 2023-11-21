import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import { PopoverPosition } from '@galileo/web_common-libraries';

import { TranslationTokens } from './help-menu.translation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-help-menu',
    templateUrl: 'help-menu.component.html',
    styleUrls: ['help-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpMenuComponent {

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** Translation Tokens */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor(private windowCommSrv: CommonWindowCommunicationService) { }

    /** Opens help window. */
    openHelp() {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'ADMIN_HELP',
                handleId: null,
                data: null
            });
        } else {
            const hostname = window.location.hostname;
            let screenUrl = '/help/admin';
            const handle = 'admin-help';

            if (hostname !== 'localhost') {
                screenUrl = '/webroot/help/admin';
            }

            if (this.windowCommSrv.hasHandle(handle)) {
                this.windowCommSrv.setFocus(handle);
            } else {
                this.windowCommSrv.createHandle(handle,
                    window.open(`${screenUrl}`));
            }
        }
    }


    /** Opens help window. */
    openProvisionerHelp(): void {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'ADMIN_HELP_PROVISIONER',
                handleId: null,
                data: null
            });
        } else {
            const hostname = window.location.hostname;
            let screenUrl = '/help/provisioner';
            const handle = 'admin-help-provisioner';

            if (hostname !== 'localhost') {
                screenUrl = '/webroot/help/provisioner';
            }

            if (this.windowCommSrv.hasHandle(handle)) {
                this.windowCommSrv.setFocus(handle);
            } else {
                this.windowCommSrv.createHandle(handle,
                    window.open(`${screenUrl}`));
            }
        }
    }
}
