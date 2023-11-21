import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { NotificationSettings$v1 } from '@galileo/web_commonnotifications/_common';
import { DataService, SettingsStoreService } from '@galileo/web_commonnotifications/_core';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { CreationPreset } from '../creation-preset';
import { ExistingPresetTranslatedTokens, ExistingPresetTranslationTokens } from './existing-preset.translation';

@Component({
    selector: 'hxgn-commonnotifications-existing-preset',
    templateUrl: 'existing-preset.component.html',
    styleUrls: ['existing-preset.component.scss', '../../shared/common-dialog-styles.scss']
})
export class ExistingPresetComponent implements OnInit, OnDestroy {

    /** Tracks the selected preset option from previous page. Either System Template (0) or Clone Existing (1). */
    @Input() selectedPresetOption: number = null;

    /** Output for when back button is clicked. */
    @Output() back: EventEmitter<void> = new EventEmitter<void>();

    /** Output for when cancel button is clicked. */
    @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

    /** Output for when create preset button is clicked. */
    @Output() create: EventEmitter<CreationPreset> = new EventEmitter<CreationPreset>();

    /** Preset description form element. */
    presetDescription: string = null;

    /** Preset name form element. */
    presetName: string = null;

    /** Selected preset. Either system template or user defined template. */
    selectedTemplate: NotificationSettings$v1 = null;

    /** List of templates to choose from. */
    templates: NotificationSettings$v1[] = [];

    /** Expose translation tokens to html. */
    tokens: typeof ExistingPresetTranslationTokens = ExistingPresetTranslationTokens;

    /** Translated tokens. */
    tTokens: ExistingPresetTranslatedTokens = {} as ExistingPresetTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dataSrv: DataService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private settingsStore: SettingsStoreService
    ) { }

    /**
     * On init life cycle hook
     */
    async ngOnInit(): Promise<void> {
        this.initLocalizationAsync();

        if (this.selectedPresetOption === 0) {
            const templates: NotificationSettings$v1[] = await this.dataSrv.setting.getSystemDefined$().toPromise();
            this.templates = templates.filter(x => x.preset !== '00000000-0000-0000-0000-000000000002');

            this.localizeTemplates();
        } else {
            this.settingsStore.entity$.pipe(first()).subscribe(settings => {
                this.templates = settings;
            });
        }

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
            this.localizeTemplates();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Builds created preset object and emits value on create preset button click.
     */
    createPreset(): void {
        const createdPreset = {
            description: this.presetDescription,
            presetName: this.presetName,
            template: this.selectedTemplate
        } as CreationPreset;

        this.create.emit(createdPreset);
    }

    /**
     * Sets selected template
     * @param template Template to select
     */
    setSelectedTemplate(template: NotificationSettings$v1): void {
        this.selectedTemplate = template;
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(ExistingPresetTranslationTokens).map(k => ExistingPresetTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.notificationDescriptionPlaceholder =
            translatedTokens[ExistingPresetTranslationTokens.notificationDescriptionPlaceholder];
        this.tTokens.presetNamePlaceholder = translatedTokens[ExistingPresetTranslationTokens.presetNamePlaceholder];
    }

    private localizeTemplates() {
        const presetNames: string[] = this.templates.map(x => x.presetName);
        this.localizationSrv.localizeStringsAsync(presetNames);

        const descriptions: string[] = this.templates.map(x => x.description);
        this.localizationSrv.localizeStringsAsync(descriptions);
    }
}
