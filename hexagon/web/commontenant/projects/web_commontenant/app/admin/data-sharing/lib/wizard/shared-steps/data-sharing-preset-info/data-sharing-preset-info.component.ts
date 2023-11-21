import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../wizard-step/wizard-step.component';
import {
    DataSharingPresetInfoTranslatedTokens,
    DataSharingPresetInfoTranslationTokens,
} from './data-sharing-preset-info.translation';

@Component({
    selector: 'hxgn-commontenant-preset-info',
    templateUrl: 'data-sharing-preset-info.component.html',
    styleUrls: ['data-sharing-preset-info.component.scss']
})
export class DataSharingPresetInfoComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** A flag that is true if data sharing is for internal sharing */
    @Input() internalSharing = false;

    /** Expose DataSharingPresetInfoTranslationTokens to HTML */
    tokens: typeof DataSharingPresetInfoTranslationTokens = DataSharingPresetInfoTranslationTokens;

    /** Translated tokens */
    tTokens: DataSharingPresetInfoTranslatedTokens = {} as DataSharingPresetInfoTranslatedTokens;

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
        const tokens: string[] = Object.keys(DataSharingPresetInfoTranslationTokens).map(k => DataSharingPresetInfoTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(DataSharingPresetInfoTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[DataSharingPresetInfoTranslationTokens[prop]];
        }
    }
}
