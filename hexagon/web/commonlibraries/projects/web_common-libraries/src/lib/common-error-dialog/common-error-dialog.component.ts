import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CommonErrorDialogTranslationTokens } from './common-error-dialog.translation';

export interface CommonErrorDialogData {
    /** Title string to display */
    title: string;

    /** Message string to display */
    message: string;
}

@Component({
    templateUrl: 'common-error-dialog.component.html',
    styleUrls: ['common-error-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonErrorDialogComponent implements OnInit {

    /** Title string passed in from the caller */
    title: string;

    /** Message string passed in from the caller */
    message: string;

    /** Expose translation tokens to html. */
    tokens: typeof CommonErrorDialogTranslationTokens = CommonErrorDialogTranslationTokens;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: CommonErrorDialogData,
        private dialogRef: MatDialogRef<CommonErrorDialogComponent>
    ) { }

    /** On init lifecycle hook */
    ngOnInit(): void {
        if (this.data) {
            this.title = this.data.title;
            this.message = this.data.message;
        }
    }

    /** Closes dialog */
    close(): void {
        this.dialogRef.close();
    }
}
