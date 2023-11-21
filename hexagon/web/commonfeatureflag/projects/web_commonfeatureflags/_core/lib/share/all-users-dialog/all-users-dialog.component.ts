import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslationTokens } from './all-users-dialog.translation';

@Component({
    templateUrl: 'all-users-dialog.component.html',
    styleUrls: ['all-users-dialog.component.scss']
})
export class AllUsersDialogComponent {

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor(private dialogRef: MatDialogRef<AllUsersDialogComponent>
    ) { }

    /**
     * Closes the dialog and emits the cancel flag
     */
    cancel(): void {
        this.dialogRef.close(false);
    }

    /**
     * Closes the dialog and emits the continue flag
     */
    continue(): void {
        this.dialogRef.close(true);
    }
}
