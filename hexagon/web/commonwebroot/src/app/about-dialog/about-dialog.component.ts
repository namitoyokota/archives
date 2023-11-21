import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment.prod';
import { AppSettingsService$v1 } from '../app-settings/app-settings-service.v1';

import { TranslationTokens } from './about-dialog.translation';

@Component({
    selector: 'app-about-dialog',
    templateUrl: './about-dialog.component.html',
    styleUrls: ['./about-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutDialogComponent implements OnInit {

    /** Whether or not to show the admin dialog. */
    isAdmin = false;

    /**  Expose translation tokens to html template */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Sets privacy policy pdf URL. */
    url: SafeResourceUrl;

    /** product version number */
    productVersion: string;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
        private appSettingSrv: AppSettingsService$v1,
        private dialogRef: MatDialogRef<AboutDialogComponent>) { 
            this.productVersion = this.appSettingSrv.getProductVersion();
        }

    /** Init */
    ngOnInit() {
        this.buildLink();

        if (this.data) {
            this.isAdmin = this.data.isAdmin;
        }
    }

    /** Closes dialog. */
    close() {
        this.dialogRef.close();
    }

    /**
     * Builds link to privacy policy pdf.
     */
    private buildLink(): void {
        let host = '/';
        const port = window.location.port;
        if (port !== '4200') {
            host = '/webroot/';
        }

        this.url = `${host}${environment.buildNumber}/help/HxGN_Connect_Open_Source_Software_Notices.pdf`;
    }

}
