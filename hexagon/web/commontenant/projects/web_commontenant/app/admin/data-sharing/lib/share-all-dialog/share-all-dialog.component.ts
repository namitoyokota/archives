import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ShareAllDialogTranslationTokens } from './share-all-dialog.translation';

@Component({
    templateUrl: 'share-all-dialog.component.html',
    styleUrls: ['share-all-dialog.component.scss']
})

export class ShareAllDialogComponent {

    /** Expose ShareAllDialogTranslationTokens to HTML */
    tokens: typeof ShareAllDialogTranslationTokens = ShareAllDialogTranslationTokens;

    constructor(private dialogRef: MatDialogRef<ShareAllDialogComponent>) { }

    /** Close the dialog */
    close(): void {
        this.dialogRef.close();
    }
}
