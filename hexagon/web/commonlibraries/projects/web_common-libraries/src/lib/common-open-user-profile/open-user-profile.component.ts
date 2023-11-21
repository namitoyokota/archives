import { Component } from '@angular/core';
import { TranslationTokens } from './open-user-profile.translation';

@Component({
    selector: 'hxgn-common-open-user-profile',
    template: `
        <img src="assets/common-libraries/images/open-user-profile-icon.svg" height="17" width="17" />
        <span class="ellipsis">
            <hxgn-commonlocalization-translate-v1 [token]="tokens.openUserProfile" ignoreSkeleton="true">
            </hxgn-commonlocalization-translate-v1>
        </span>
    `,
    styles: [`
        :host {
            display: grid;
            grid-template-columns: min-content 1fr;
            column-gap: 10px;
            align-items: center;
            color: #ffffff;
            cursor: pointer;
            font-size: 13px;
            line-height: 17px;
            margin-top: 5px;
            text-decoration: underline;
        }

        .ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `]
})
export class CommonOpenUserProfileComponent {

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;
}
