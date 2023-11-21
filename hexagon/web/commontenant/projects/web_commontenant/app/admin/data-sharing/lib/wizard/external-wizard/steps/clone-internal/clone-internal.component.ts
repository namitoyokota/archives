import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import { CloneInternalTranslatedTokens, CloneInternalTranslationTokens } from './clone-internal.translation';

@Component({
    selector: 'hxgn-commontenant-clone-internal',
    templateUrl: 'clone-internal.component.html',
    styleUrls: ['clone-internal.component.scss']
})
export class CloneInternalComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** A flag that is true if internal data sharing should be cloned */
    @Input() clone = false;

    /** A flag that is true if the clone option should be disabled */
    @Input() disable = false;

    /** Event the status of the clone checkbox */
    @Output() cloneInternal = new EventEmitter<boolean>();

    /** Export CloneInternalTranslationTokens to HTML */
    tokens: typeof CloneInternalTranslationTokens = CloneInternalTranslationTokens;

    /** Translated tokens */
    tTokens: CloneInternalTranslatedTokens = {} as CloneInternalTranslatedTokens;

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
        const tokens: string[] = Object.keys(CloneInternalTranslationTokens).map(k => CloneInternalTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.externalDataSharingSetup = translatedTokens[CloneInternalTranslationTokens.externalDataSharingSetup];
    }
}
