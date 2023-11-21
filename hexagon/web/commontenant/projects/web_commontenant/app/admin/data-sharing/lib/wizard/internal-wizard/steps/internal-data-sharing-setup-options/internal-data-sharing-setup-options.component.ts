import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import {
    InternalDataSharingSetupOptionsTranslatedTokens,
    InternalDataSharingSetupOptionsTranslationTokens,
} from './internal-data-sharing-setup-options.translation';

@Component({
    selector: 'hxgn-commontenant-internal-data-sharing-setup-options',
    templateUrl: 'internal-data-sharing-setup-options.component.html',
    styleUrls: ['internal-data-sharing-setup-options.component.scss']
})
export class InternalDataSharingSetupOptionsComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** A flag that is true if filter internally by groups is enable */
    @Input('filterByGroups')
    set setFilterByGroups(option: boolean) {
        this.filterByGroups = option;
        if (option !== undefined) {
            this.setIsDirty(true);
        } else {
            this.setIsDirty(false);
        }
    }

    /** A flag that is true if filter internally by groups is enable. This is the value that is current in the db. */
    @Input() filterByGroupsSource: Boolean;

    /** A flag that is true if the show all option should be shown */
    @Input() showShareAllOption = false;

    /** A flag that is true if filter internally by groups is enable */
    filterByGroups = undefined;

    /** Event when the filter by group option changes */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() change = new EventEmitter<boolean>();

    /** Expose InternalDataSharingSetupOptionsTranslationTokens to HTML */
    tokens: typeof InternalDataSharingSetupOptionsTranslationTokens = InternalDataSharingSetupOptionsTranslationTokens;

    /** Translated tokens */
    tTokens: InternalDataSharingSetupOptionsTranslatedTokens = {} as InternalDataSharingSetupOptionsTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        super();
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalizationAsync();

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
     * Sets if filter by group is enabled
     * @param isEnabled Is group filter enabled
     */
    setFilterOption(isEnabled: boolean): void {
        this.change.emit(isEnabled);
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(InternalDataSharingSetupOptionsTranslationTokens)
            .map(k => InternalDataSharingSetupOptionsTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.internalDataSharingSetup = translatedTokens[InternalDataSharingSetupOptionsTranslationTokens.internalDataSharingSetup];
    }
}
