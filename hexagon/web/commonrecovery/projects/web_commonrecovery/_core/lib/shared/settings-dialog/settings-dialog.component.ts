import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataService } from '../../data.service';
import { TranslatedTokens, TranslationTokens } from './settings-dialog.translation';

@Component({
    templateUrl: 'settings-dialog.component.html',
    styleUrls: ['settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit, OnDestroy {

    /** Map of settings key and value */
    configurations: Map<string, string> = new Map<string, string>();

    /** True until capabilities are loaded */
    isLoading = true;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    /** List of config tokens to translate */
    private configTokens: string[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private dialogRef: MatDialogRef<SettingsDialogComponent>,
        private dataSrv: DataService,
        private localizationSrv: CommonlocalizationAdapterService$v1) { }

    /** On init lifecycle hook */
    async ngOnInit() {
        this.initLocalizationAsync();

        this.configurations = await this.dataSrv.getConfigurations$().toPromise();
        this.configTokens = [];

        this.configurations.forEach((value: string, key: string) => {
            this.configTokens.push(key);
            if (key === this.tokens.nextBackup) {
                const date = new Date(value + ' GMT');
                if (date.toString() === 'Invalid Date') {
                    this.configurations.set(key, value);
                } else {
                    this.configurations.set(key, date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
                }
            }
            if (key === this.tokens.expiration) {
                this.configurations.set(key, value.concat(' ' + this.tTokens.days));
            }
        });
        this.localizationSrv.localizeStringsAsync(this.configTokens);

        this.isLoading = false;

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
            this.localizationSrv.localizeStringsAsync(this.configTokens);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Closes the dialog and emits the cancel flag */
    close() {
        this.dialogRef.close();
    }

    /** Set up routine for localization. */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.days = translatedTokens[TranslationTokens.days];
    }
}
