import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { GlobalFeaturesDialogTranslationTokens } from './global-features-dialog.translation';

@Component({
   templateUrl: 'global-features-dialog.component.html',
   styleUrls: ['global-features-dialog.component.scss']
})

export class GlobalFeaturesDialogComponent {

    /** Expose ExperimentalFeaturesDialogTranslationTokens to HTML */
    tokens: typeof GlobalFeaturesDialogTranslationTokens = GlobalFeaturesDialogTranslationTokens;

    constructor(
        public dialogRef: MatDialogRef<GlobalFeaturesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public tenantId: string
    ) { }

    /**
     * Closes dialog
     */
    close(): void {
        this.dialogRef.close();
    }
}
