import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import { ExternalShareDataTranslatedTokens, ExternalShareDataTranslationTokens } from './external-share-data.translation';

@Component({
    selector: 'hxgn-commontenant-external-share-data',
    templateUrl: 'external-share-data.component.html',
    styleUrls: ['external-share-data.component.scss']
})
export class ExternalShareDataComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** A flag that is true if data should be shared */
    @Input('shareData')
    set setShareData(isShared: boolean) {
        if (isShared !== null) {
            this.shareData = isShared;
            this.setIsDirty(true);
        }
    }

    /** A flag that is true if the settings should only be applied to new */
    @Input() applyToNewOnly = false;

    /** A flag that is true if data should be shared */
    shareData: boolean = null;

    /** Event when share data option changes */
    @Output() shareDataChange = new EventEmitter<boolean>();

    /** Expose ExternalShareDataTranslationTokens to HTML */
    tokens: typeof ExternalShareDataTranslationTokens = ExternalShareDataTranslationTokens;

    /** Translated tokens. */
    tTokens: ExternalShareDataTranslatedTokens = {} as ExternalShareDataTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        super();
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalizationAsync();
        if (this.shareData === null) {
            this.setIsDirty(false);
        }

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
     * Change if share data is enabled
     * @param event Mat radio change object
     */
    toggleShareData(event: MatRadioChange) {

        this.shareDataChange.emit(event.value);
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
        const tokens: string[] = Object.keys(ExternalShareDataTranslationTokens).map(k => ExternalShareDataTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(ExternalShareDataTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[ExternalShareDataTranslationTokens[prop]];
        }
    }
}
