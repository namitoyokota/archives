import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CapabilityManifest$v1 } from '@galileo/web_commontenant/_common';
import { CoreService } from '@galileo/web_commontenant/app/_core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WizardStepType } from '../../wizard-step/wizard-step-type';
import { WizardStepComponent } from '../../wizard-step/wizard-step.component';
import { PresetDataTypesTranslatedTokens, PresetDataTypesTranslationTokens } from './preset-data-types.translation';

@Component({
    selector: 'hxgn-commontenant-preset-data-types',
    templateUrl: 'preset-data-types.component.html',
    styleUrls: ['preset-data-types.component.scss']
})
export class PresetDataTypesComponent extends WizardStepComponent implements OnInit, OnDestroy {

    /** The capabilities that are currently enabled */
    @Input('enabledCapabilities')
    set setSelectedCapabilities(ids: string[]) {
        if (ids?.length) {
            this.selectedCapabilities = [...ids];
            this.setIsDirty(true);
        } else {
            this.selectedCapabilities = [];
            this.setIsDirty(false);
        }
    }

    /** A flag that is true if data sharing is for internal sharing */
    @Input() internalSharing = false;

    /** Event when the list of enabled capabilities change */
    @Output() enabledChange = new EventEmitter<string[]>();

    /** Expose WizardStepType to HTML */
    wizardStepType: typeof WizardStepType = WizardStepType;

    /** List of capabilities that support data sharing */
    capabilities: CapabilityManifest$v1[] = [];

    /** List of selected capabilities */
    selectedCapabilities: string[] = [];

    /** Expose PresetDataTypesTranslationTokens to HTML */
    tokens: typeof PresetDataTypesTranslationTokens = PresetDataTypesTranslationTokens;

    /** Translated tokens */
    tTokens: PresetDataTypesTranslatedTokens = {} as PresetDataTypesTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private coreSrv: CoreService,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private layoutCompiler: LayoutCompilerAdapterService
    ) {
        super();
    }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalizationAsync();

        this.capabilities = this.coreSrv.getCapabilityList(null, true, this.internalSharing, !this.internalSharing);
        this.loadCapabilities();

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
            this.loadCapabilities();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Localize capabilities and sort them */
    private loadCapabilities() {
        const capabilityNameTokens = this.capabilities.map(x => x.nameToken);
        this.localizationAdapter.localizeStringsAsync(capabilityNameTokens).then(async () => {
            const translatedTokens = await this.localizationAdapter.getTranslationAsync(capabilityNameTokens);
            this.capabilities.sort((a, b) => translatedTokens[a.nameToken] > translatedTokens[b.nameToken] ? 1 : -1);
        });
    }

    /**
     * Adds or removes a capability from the selected capability list
     * @param event Angular material checkbox change event
     * @param capabilityId The capability to add or remove
     */
    toggleCapabilityAsync(event: MatCheckboxChange, capabilityId: string) {
        if (event.checked) {
            // First load the core
            this.selectedCapabilities = [...this.selectedCapabilities, capabilityId];
            this.layoutCompiler.loadCapabilityCoreAsync(capabilityId);
        } else {
            this.selectedCapabilities = this.selectedCapabilities.filter(id => {
                return id !== capabilityId;
            });
        }

        this.setIsDirty(!!this.selectedCapabilities.length);
        this.enabledChange.emit([...this.selectedCapabilities]);
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
     * Returns true if the given capability is selected
     * @param capabilityId Capability Id to check
     * @returns Returns true if the capability is selected
     */
    isSelected(capabilityId: string): boolean {
        return !!this.selectedCapabilities.find(id => id === capabilityId);
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(PresetDataTypesTranslationTokens).map(k => PresetDataTypesTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        const keys = Object.keys(PresetDataTypesTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[PresetDataTypesTranslationTokens[prop]];
        }
    }
}
