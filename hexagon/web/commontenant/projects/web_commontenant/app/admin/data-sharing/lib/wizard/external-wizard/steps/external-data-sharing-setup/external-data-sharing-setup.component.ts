import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import {
    ExternalDataSharingSetupTranslatedTokens,
    ExternalDataSharingSetupTranslationTokens,
} from './external-data-sharing-setup.translation';

@Component({
    selector: 'hxgn-commontenant-external-data-sharing-setup',
    templateUrl: 'external-data-sharing-setup.component.html',
    styleUrls: ['external-data-sharing-setup.component.scss']
})
export class ExternalDataSharingSetupComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** Expose ExternalDataSharingSetupTranslationTokens to HTML */
    tokens: typeof ExternalDataSharingSetupTranslationTokens = ExternalDataSharingSetupTranslationTokens;

    /** Translated tokens */
    tTokens: ExternalDataSharingSetupTranslatedTokens = {} as ExternalDataSharingSetupTranslatedTokens;

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

    /** Set up routine for localization. */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(ExternalDataSharingSetupTranslationTokens)
            .map(k => ExternalDataSharingSetupTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(ExternalDataSharingSetupTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[ExternalDataSharingSetupTranslationTokens[prop]];
        }
    }
}
