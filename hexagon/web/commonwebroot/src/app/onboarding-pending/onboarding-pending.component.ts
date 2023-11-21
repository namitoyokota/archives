import { Component, OnInit } from '@angular/core';
import { OnboardingPendingTranslationTokens } from './onboarding-pending.translation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-commonwebroot-onboarding-pending',
    templateUrl: 'onboarding-pending.component.html',
    styleUrls: ['onboarding-pending.component.scss']
})
export class OnboardingPendingComponent {

    /** Expose OnboardingPendingTranslationTokens to HTML */
    tokens: typeof OnboardingPendingTranslationTokens = OnboardingPendingTranslationTokens;

    constructor() { }
}
