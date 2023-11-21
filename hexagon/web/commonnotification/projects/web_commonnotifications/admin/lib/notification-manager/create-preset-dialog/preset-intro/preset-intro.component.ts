import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';

import { PresetIntroTranslationTokens } from './preset-intro.translation';

@Component({
    selector: 'hxgn-commonnotifications-preset-intro',
    templateUrl: 'preset-intro.component.html',
    styleUrls: ['preset-intro.component.scss', '../../shared/common-dialog-styles.scss']
})
export class PresetIntroComponent {

    /** Current user's info. */
    @Input() userInfo: UserInfo$v1 = null;

    /** Event for when cancel button is clicked. */
    @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

    /** Output for when next button is clicked. */
    @Output() next: EventEmitter<void> = new EventEmitter<void>();

    /** Used for storing user personalization of showing initial preset intro pane. */
    dontShowPresetIntro = false;

    /** Expose translation tokens to html. */
    tokens: typeof PresetIntroTranslationTokens = PresetIntroTranslationTokens;

    constructor(
        private identitySrv: CommonidentityAdapterService$v1
    ) { }

    /**
     * Function ran when next button is clicked.
     */
    goToNext(): void {
        this.setCreateIntroAsync();
        this.next.emit();
    }

    /**
     * Stores "don't show this again" value in user personalization
     */
    private async setCreateIntroAsync(): Promise<void> {
        await this.identitySrv.saveUserPersonalizationSettingsAsync(this.userInfo.id,
            'CreateNotificationPreset', this.dontShowPresetIntro);
    }
}
