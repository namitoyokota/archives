import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServerEntity$v1 } from '@galileo/web_commonlicensing/adapter';

import { UploadLicencingDialogTranslationTokens } from './upload-licensing-dialog.translation';

@Component({
    selector: 'hxgn-commontenant-upload-licensing-dialog',
    templateUrl: 'upload-licensing-dialog.component.html'
})
export class UploadLicencingDialogComponent {

    /** Licensing data */
    serverEntity = new ServerEntity$v1();

    /** Expose UploadLicencingDialogTranslationTokens to html */
    tokens: typeof UploadLicencingDialogTranslationTokens = UploadLicencingDialogTranslationTokens;

    constructor(
        public dialogRef: MatDialogRef<UploadLicencingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private tenantId: string
    ) { }

    /**
     * Returns true if server entity is valid
     */
    isValid(): boolean {
        return !!(this.serverEntity?.licenseFileContents);
    }

    /**
     * Closes the dialog
     * @param serverEntity obj that will be returned from the dialog
     */
    close(serverEntity: ServerEntity$v1) {
        if (serverEntity) {
            serverEntity.tenantId = this.tenantId;
        }

        this.dialogRef.close(serverEntity);
    }
}
