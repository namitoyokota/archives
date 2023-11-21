import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonUnsavedChangesDialogTranslationTokens } from './common-unsaved-changes-dialog.translation';

export enum CommonUnsavedChangesDialogOptions {
    cancel = 'Cancel',
    discardChanges = 'DiscardChanges',
    saveChanges = 'SaveChanges'
}

export interface CommonUnsavedChangesDialogData {
    /** Disabled Save value */
    disabledSave: boolean;
}

@Component({
    templateUrl: 'common-unsaved-changes-dialog.component.html',
    styleUrls: ['common-unsaved-changes-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonUnsavedChangesDialogComponent implements OnInit {

    /** Tracks disabled save. Enabled by default. */
    disabledSave = false;

    /** Expose translation tokens to html. */
    tokens: typeof CommonUnsavedChangesDialogTranslationTokens = CommonUnsavedChangesDialogTranslationTokens;

    /** Expose unsaved changes options to html. */
    unsavedChangesOptions: typeof CommonUnsavedChangesDialogOptions = CommonUnsavedChangesDialogOptions;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: CommonUnsavedChangesDialogData,
        private dialogRef: MatDialogRef<CommonUnsavedChangesDialogComponent>
    ) { }

    /** Ng */
    ngOnInit(): void {
        if (this.data) {
            this.disabledSave = this.data.disabledSave;
        }
    }

    /**
     * Closes dialog
     * @param selection CommonUnsavedChangesDialogOptions selection
     */
    close(selection: string): void {
        this.dialogRef.close({
            selection
        });
    }

}
