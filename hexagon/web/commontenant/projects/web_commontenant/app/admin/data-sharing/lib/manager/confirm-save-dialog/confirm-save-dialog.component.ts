import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { ConfirmSaveDialogTranslationTokens } from './confirm-save-dialog.translation';

@Component({
    templateUrl: 'confirm-save-dialog.component.html',
    styleUrls: ['confirm-save-dialog.component.scss']
})

export class ConfirmSaveDialogComponent {

    /** Expose ConfirmSaveDialogTranslationTokens to HTML */
    tokens: typeof ConfirmSaveDialogTranslationTokens = ConfirmSaveDialogTranslationTokens;

    constructor(
        private dialogRef: MatDialogRef<ConfirmSaveDialogComponent>
    ) { }

    /**
     * Closes the dialog
     */
    close(accept: boolean): void {
        this.dialogRef.close(accept);
    }
}
