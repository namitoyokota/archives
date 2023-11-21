import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {

    /** Title. Used to pass in additional text after the translated titleToken */
    title: string;

    /** Message. Used to pass in additional text after the translated msgToken */
    msg: string;

    /** Title token for translation */
    titleToken?: string;

    /** Message token for translation */
    msgToken?: string;

    /** Accept interpolation parameters in the object format {stringKey1: stringValue1, stringKey2:stringValue} */
    titleInterpolateParams?: any;

    /** Accept interpolation parameters in the object format {stringKey1: stringValue1, stringKey2:stringValue} */
    msgInterpolateParams?: any;

    /** Flag that is true if the warning icon should be shown */
    showWarningIcon?: boolean;

    /** String to show on confirm button */
    confirmBtnText?: string;
}

export enum ConfirmDialogTranslationTokens {

    /** Cancel */
    cancel = 'commonlibraries-main.component.cancel',

    /** Confirm */
    confirm = 'commonlibraries-main.component.confirm'
}

@Component({
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class CommonConfirmDialogComponent {

    /**  Expose translation tokens to html template */
    tokens: typeof ConfirmDialogTranslationTokens = ConfirmDialogTranslationTokens;

    constructor(private dialogRef: MatDialogRef<CommonConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }

    /**
     * Closes a dialog with the value of the selected button
     * @param result The value of the button selected. True for confirm, false for cancel
     */
    onAction(result: boolean): void {
        this.dialogRef.close(result);
    }
}
