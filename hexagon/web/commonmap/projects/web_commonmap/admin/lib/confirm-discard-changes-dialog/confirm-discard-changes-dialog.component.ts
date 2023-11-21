import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonmapAdminService } from '../admin.service';
import { ConfirmDiscardTranslationTokens } from './confirm-discard-changes-dialog.translation';

@Component({
    selector: 'hxgn-commonmap-admin-confirm-discard-changes-dialog',
    templateUrl: './confirm-discard-changes-dialog.component.html',
    styleUrls: ['./confirm-discard-changes-dialog.component.scss']
})
export class ConfirmDiscardChangesDialogComponent implements OnInit {

    /**  Expose translation tokens to html template */
    tokens: typeof ConfirmDiscardTranslationTokens = ConfirmDiscardTranslationTokens;

    type = 'layer';

    isProcessing = false;
    processingToken: string = null;

    constructor(public dialogRef: MatDialogRef<ConfirmDiscardChangesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private mapAdminSvc: CommonmapAdminService,
        private changeRef: ChangeDetectorRef) {
    }
    ngOnInit() {
        this.type = this.data.type;
    }
    isValid() {
        let isValid = this.mapAdminSvc.isMapPresetValid;
        if (this.mapAdminSvc.selectedMapLayer) {
            isValid = this.mapAdminSvc.selectedMapLayer.valid;
        }

        return (isValid);
   }

   showHideProcessing(show: boolean, token?: ConfirmDiscardTranslationTokens) {
        if (show) {
            this.isProcessing = true;
            this.processingToken = token;
        } else {
            this.isProcessing = false;
            this.processingToken = null;
        }
        this.changeRef.detectChanges();
   }

   isSaveDisabled(): boolean {
        let disable = false;
        if (!this.mapAdminSvc.isDirty || !this.isValid()) {
            disable = true;
        }
        return (disable);
    }

    cancel(): void {
        this.dialogRef.close(false);
    }

    async discard() {
        this.mapAdminSvc.beforeChangesDiscarded$.next();
        if (this.mapAdminSvc.selectedMapLayer) {
            const opt = this.mapAdminSvc.selectedMapLayer.getOption('workingLayer');
            if (opt) {
                if (opt.value && this.mapAdminSvc.selectedMapLayer.id !== opt.value) {
                    this.showHideProcessing(true, this.tokens.discardingMapLayerLabel);

                    await this.mapAdminSvc.deleteMapLayer(this.mapAdminSvc.selectedMapLayer);

                    this.showHideProcessing(false);

                    this.mapAdminSvc.selectedMapLayer.id = opt.value;
                }
                this.mapAdminSvc.selectedMapLayer.removeOption('workingLayer');
            }
        }
        this.mapAdminSvc.discardChanges();
        this.dialogRef.close(true);
    }

    async save() {
        try {
            this.mapAdminSvc.beforeChangesSaved$.next();
            if (this.mapAdminSvc.selectedMapLayer) {
                this.showHideProcessing(true, this.tokens.savingMapLayerLabel);
                this.mapAdminSvc.cleanupWorkingLayer(false);
                await this.mapAdminSvc.saveChanges().catch((reason) => {
                    this.showHideProcessing(false);
                    this.dialogRef.close(false);
                    console.log('Error saving map layer: ' + reason);
                }).then ((item) => {
                    this.showHideProcessing(false);
                    this.dialogRef.close(true);
                });
            } else {
                this.showHideProcessing(true, this.tokens.savingMapPresetLabel);
                await this.mapAdminSvc.saveChanges().catch((reason) => {
                    this.showHideProcessing(false);
                    this.dialogRef.close(false);
                    console.log('Error saving map preset: ' + reason);
                }).then ((item) => {
                    this.showHideProcessing(false);
                    this.dialogRef.close(true);
                });
            }
        } catch (err) {
            this.showHideProcessing(false);
            this.dialogRef.close(false);
        }
    }
}
