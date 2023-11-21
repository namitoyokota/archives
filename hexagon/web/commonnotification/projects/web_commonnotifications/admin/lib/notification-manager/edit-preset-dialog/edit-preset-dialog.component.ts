import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Utils } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { NotificationSettings$v1 } from '@galileo/web_commonnotifications/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditPresetDialogTranslatedTokens, EditPresetDialogTranslationTokens } from './edit-preset-dialog.translation';

@Component({
    templateUrl: 'edit-preset-dialog.component.html',
    styleUrls: ['edit-preset-dialog.component.scss', '../shared/common-dialog-styles.scss']
})
export class EditPresetDialogComponent implements OnInit, OnDestroy {

    /** Tracks preset name validation. */
    isValidName = true;

    /** Existing preset to edit. */
    preset: NotificationSettings$v1;

    /** Expose translation tokens to html. */
    tokens: typeof EditPresetDialogTranslationTokens = EditPresetDialogTranslationTokens;

    /** Translated tokens */
    tTokens: EditPresetDialogTranslatedTokens = {} as EditPresetDialogTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<EditPresetDialogComponent>,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    ngOnInit(): void {
        this.initLocalizationAsync();
        this.preset = Utils.deepCopy(this.data.preset);

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
     * Closes dialog
     */
    close(): void {
        this.dialogRef.close();
    }

    /**
     * Saves changes on button click
     */
    saveChanges(): void {
        this.dialogRef.close({
            preset: this.preset
        });
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(EditPresetDialogTranslationTokens).map(k => EditPresetDialogTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.notificationDescriptionPlaceholder =
            translatedTokens[EditPresetDialogTranslationTokens.notificationDescriptionPlaceholder];
        this.tTokens.presetNamePlaceholder = translatedTokens[EditPresetDialogTranslationTokens.presetNamePlaceholder];
    }
}
