import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import {
    InternalDataSharingSetupInfoTranslatedTokens,
    InternalDataSharingSetupInfoTranslationTokens,
} from './internal-data-sharing-setup-info.translation';

@Component({
    selector: 'hxgn-commontenant-internal-data-sharing-setup-info',
    templateUrl: 'internal-data-sharing-setup-info.component.html',
    styleUrls: ['internal-data-sharing-setup-info.component.scss']
})
export class InternalDataSharingSetupInfoComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** A flag that is true if filter internally by groups is enable */
    @Input() filterByGroups = null;

    /** Expose InternalDataSharingSetupInfoTranslationTokens to HTML */
    tokens: typeof InternalDataSharingSetupInfoTranslationTokens = InternalDataSharingSetupInfoTranslationTokens;

    /** Translated tokens. */
    tTokens: InternalDataSharingSetupInfoTranslatedTokens = {} as InternalDataSharingSetupInfoTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        super();
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalizationAsync();
        this.setIsDirty(true);

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Called when the user tries to go to the next step.
     * Returns true if the wizard can go to the next step.
     * @returns Returns true if the step is completed
     */
    completeAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            resolve(true);
        });
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(InternalDataSharingSetupInfoTranslationTokens)
            .map(k => InternalDataSharingSetupInfoTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(InternalDataSharingSetupInfoTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[InternalDataSharingSetupInfoTranslationTokens[prop]];
        }
    }
}
