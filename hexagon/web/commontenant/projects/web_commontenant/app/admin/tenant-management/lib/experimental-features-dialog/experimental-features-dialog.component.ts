import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { FeatureFlags } from '@galileo/web_commontenant/_common';

import { ExperimentalFeaturesDialogTranslationTokens } from './experimental-features-dialog.translation';

@Component({
   templateUrl: 'experimental-features-dialog.component.html',
   styleUrls: ['experimental-features-dialog.component.scss']
})
export class ExperimentalFeaturesDialogComponent {

    /** Expose ExperimentalFeaturesDialogTranslationTokens to HTML */
    tokens: typeof ExperimentalFeaturesDialogTranslationTokens = ExperimentalFeaturesDialogTranslationTokens;

    /** Expose feature flags to html. */
    featureFlags: typeof FeatureFlags = FeatureFlags;

    constructor(
        public dialogRef: MatDialogRef<ExperimentalFeaturesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public tenantId: string,
        private ffAdapter: CommonfeatureflagsAdapterService$v1
    ) { }

    /**
     * Closes dialog
     */
    close(): void {
        this.dialogRef.close();
    }
}
