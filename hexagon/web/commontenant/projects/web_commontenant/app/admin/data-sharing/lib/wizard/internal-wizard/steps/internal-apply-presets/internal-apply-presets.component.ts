import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import {
    InternalApplyPresetsTranslatedTokens,
    InternalApplyPresetsTranslationTokens,
} from './internal-apply-presets.translation';

@Component({
    selector: 'hxgn-commontenant-internal-apply-presets',
    templateUrl: 'internal-apply-presets.component.html',
    styleUrls: ['internal-apply-presets.component.scss']
})
export class InternalApplyPresetsComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** A flag that is true if filter by groups is enabled */
    @Input() filterByGroups = false;

    /** A flag that is true if the presets are turned on for groups */
    @Input() applyToGroups = false;

    /** A flag that is true if the presets are turned on for the other group */
    @Input() applyToOther = false;

    /** A flag that is true if option to apply to newly selected groups should be shown */
    @Input() applyToNewlySelected = false;

    /** Emit when the apply to groups flag changes */
    @Output() applyToGroupsChange = new EventEmitter<boolean>();

    /** Emit when the apply to other group flag changes */
    @Output() applyToOtherChange = new EventEmitter<boolean>();

    /** Expose InternalApplyPresetsTranslationTokens to HTML */
    tokens: typeof InternalApplyPresetsTranslationTokens = InternalApplyPresetsTranslationTokens;

    /** Translated tokens */
    tTokens: InternalApplyPresetsTranslatedTokens = {} as InternalApplyPresetsTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        super();
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalizationAsync();
        this.setIsDirty(false);

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
     * Changes the state of the apply to groups flag
     * @param isChecked What the flag should be changed to
     */
    toggleApplyToGroups(isChecked: boolean) {
        this.applyToGroupsChange.emit(isChecked);
    }

    /**
     * Changes the state of the apply to other group flag
     * @param isChecked What the flag should be changed to
     */
    toggleApplyToOtherGroup(isChecked: boolean) {
        this.applyToOtherChange.emit(isChecked);
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(InternalApplyPresetsTranslationTokens).map(k => InternalApplyPresetsTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(InternalApplyPresetsTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[InternalApplyPresetsTranslationTokens[prop]];
        }
    }
}
