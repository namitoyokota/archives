import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Common from '@galileo/web_commonmap/_common';
import { ConfirmDeleteTranslationTokens } from './confirm-delete-dialog.translation';

@Component({
    selector: 'hxgn-commonmap-admin-confirm-delete-dialog',
    templateUrl: './confirm-delete-dialog.component.html',
    styleUrls: ['./confirm-delete-dialog.component.scss']
})
export class ConfirmDeleteDialogComponent implements OnInit {

    /**  Expose translation tokens to html template */
    tokens: typeof ConfirmDeleteTranslationTokens = ConfirmDeleteTranslationTokens;
    confirmToken = this.tokens.confirmDeleteOfBaseMap;
    type: Common.MapLayerType$v1;
    MapLayerType: typeof Common.MapLayerType$v1 = Common.MapLayerType$v1;

    constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any) { }

    ngOnInit() {
        this.type = this.data.type;
        if (this.type) {
            switch (this.type) {
                case Common.MapLayerType$v1.BaseMap: {
                    this.confirmToken = this.tokens.confirmDeleteOfBaseMap;
                    break;
                }
                case Common.MapLayerType$v1.Overlay: {
                    this.confirmToken = this.tokens.confirmDeleteOfOverlay;
                    break;
                }
            }
        } else {
            this.confirmToken = this.tokens.confirmDeleteOfMapPreset;
        }
    }

    cancel(): void {
        this.dialogRef.close(false);
    }

    delete(): void {
        this.dialogRef.close(true);
    }

}
