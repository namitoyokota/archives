import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import { CloneExternalTranslatedTokens, CloneExternalTranslationTokens } from './clone-external.translation';

@Component({
    selector: 'hxgn-commontenant-clone-external',
    templateUrl: 'clone-external.component.html',
    styleUrls: ['clone-external.component.scss']
})
export class CloneExternalComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** A flag that is true if external data sharing should be cloned */
    @Input() clone = false;

    /** A flag that is true if the clone option should be disabled */
    @Input() disable = false;

    /** Event the status of the clone checkbox */
    @Output() cloneExternal = new EventEmitter<boolean>();

    /** Export CloneExternalTranslationTokens to HTML */
    tokens: typeof CloneExternalTranslationTokens = CloneExternalTranslationTokens;

    /** Translated tokens */
    tTokens: CloneExternalTranslatedTokens = {} as CloneExternalTranslatedTokens;

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
        const tokens: string[] = Object.keys(CloneExternalTranslationTokens).map(k => CloneExternalTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.internalDataSharingSetup = translatedTokens[CloneExternalTranslationTokens.internalDataSharingSetup];
    }
}
