import { Component } from '@angular/core';

export enum TranslationTokens {
    workspaceScreenBlocked = 'commonwebroot-main.component.workspaceScreenBlocked',
    workspaceScreenBlockedMsg = 'commonwebroot-main.component.workspaceScreenBlockedMsg'
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-commonwebroot-pop-up-blocker-notification',
    templateUrl: 'pop-up-blocker-notification.component.html',
    styleUrls: ['pop-up-blocker-notification.component.scss']
})
export class PopUpBlockerNotificationComponent {

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }
}
