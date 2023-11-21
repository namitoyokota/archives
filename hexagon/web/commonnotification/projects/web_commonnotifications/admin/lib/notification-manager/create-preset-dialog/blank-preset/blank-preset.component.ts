import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { NotificationSettings$v1 } from '@galileo/web_commonnotifications/_common';
import { DataService } from '@galileo/web_commonnotifications/_core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CreationPreset } from '../creation-preset';
import { BlankPresetTranslatedTokens, BlankPresetTranslationTokens } from './blank-preset.translation';

@Component({
    selector: 'hxgn-commonnotifications-blank-preset',
    templateUrl: 'blank-preset.component.html',
    styleUrls: ['blank-preset.component.scss', '../../shared/common-dialog-styles.scss']
})
export class BlankPresetComponent implements OnInit, OnDestroy {

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

    /** Expose translation tokens to html. */
    tokens: typeof BlankPresetTranslationTokens = BlankPresetTranslationTokens;

    /** Translated tokens */
    tTokens: BlankPresetTranslatedTokens = {} as BlankPresetTranslatedTokens;

    /** Blank preset info. */
    private blankPreset: NotificationSettings$v1;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dataSrv: DataService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init life cycle hook
     */
    async ngOnInit(): Promise<void> {
        this.initLocalizationAsync();

        const systemSettings = await this.dataSrv.setting.getSystemDefined$().toPromise();
        this.blankPreset = systemSettings.find(x => x.preset === '00000000-0000-0000-0000-000000000002');

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
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
     * Builds created preset object and emits value on create preset button click.
     */
    createPreset(): void {
        const createdPreset = {
            description: this.presetDescription,
            presetName: this.presetName,
            template: this.blankPreset
        } as CreationPreset;

        this.create.emit(createdPreset);
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(BlankPresetTranslationTokens).map(k => BlankPresetTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.notificationDescriptionPlaceholder = translatedTokens[BlankPresetTranslationTokens.notificationDescriptionPlaceholder];
        this.tTokens.presetNamePlaceholder = translatedTokens[BlankPresetTranslationTokens.presetNamePlaceholder];
    }
}
