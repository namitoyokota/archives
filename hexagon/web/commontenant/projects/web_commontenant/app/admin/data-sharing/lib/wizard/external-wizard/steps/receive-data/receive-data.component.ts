import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepComponent } from '../../../wizard-step/wizard-step.component';
import { ReceiveDataTranslatedTokens, ReceiveDataTranslationTokens } from './receive-data.translation';

@Component({
    selector: 'hxgn-commontenant-receive-data',
    templateUrl: 'receive-data.component.html',
    styleUrls: ['receive-data.component.scss']
})
export class ReceiveDataComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** A flag that is true if the tenant wants to receive data */
    @Input('receiveData')
    set setReceiveDataFlag(rd: boolean) {

        if (rd !== null && rd !== undefined) {
            this.setIsDirty(true);
        }

        this.receiveData = rd;
    }

    /** A flag that is true if the tenant wants to receive data */
    receiveData: boolean;

    /** Emit when receiving data option changes */
    @Output() receiveDataChange = new EventEmitter<boolean>();

    /** Expose ReceiveDataTranslationTokens to HTML */
    tokens: typeof ReceiveDataTranslationTokens = ReceiveDataTranslationTokens;

    /** Translated tokens */
    tTokens: ReceiveDataTranslatedTokens = {} as ReceiveDataTranslatedTokens;

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
     * Sets the opt in value
     * @param optIn Does the user want to receive data
     */
    setReceiveData(optIn: boolean): void {
        this.setIsDirty(true);
        this.receiveDataChange.emit(optIn);
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
        const tokens: string[] = Object.keys(ReceiveDataTranslationTokens).map(k => ReceiveDataTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(ReceiveDataTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[ReceiveDataTranslationTokens[prop]];
        }
    }
}
