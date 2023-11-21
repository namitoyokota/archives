import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HTTPCode } from '@galileo/web_common-http';
import { CompositeIcon$v1 } from '@galileo/web_commonkeywords/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { first } from 'rxjs/operators';

import { CompositeIconService } from '../../../composite-icon.service';
import { IconEditorDialogData } from '../../../icon-editor-dialog/icon-editor-dialog-data';
import { IconEditorDialogComponent } from '../../../icon-editor-dialog/icon-editor-dialog.component';
import { IconListType } from '../../../icon-library/icon-library.component';
import { RuleGridIconTranslationTokens } from './rule-grid-icon.translation';

@Component({
    selector: 'hxgn-commonkeywords-rule-grid-icon',
    templateUrl: 'rule-grid-icon.component.html',
    styleUrls: ['rule-grid-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleGridIconComponent implements OnInit {

    /** Resource id of the composite icon */
    @Input() resourceId: string;

    /** Rule's friendly name */
    @Input() ruleName: string;

    /** Composite icon for the rule */
    compositeIcon: CompositeIcon$v1;

    constructor(private compositeIconSrv: CompositeIconService,
        private dialog: MatDialog,
        private errorNotification: MatSnackBar,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private cdr: ChangeDetectorRef) { }

    async ngOnInit() {
        this.compositeIcon = await this.compositeIconSrv.getAsync(this.resourceId) as CompositeIcon$v1;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
    }

    editIcon() {
        const dialogRef = this.dialog.open(IconEditorDialogComponent, {
            disableClose: true,
            autoFocus: false,
            data: {
                compositeIcon: this.compositeIcon,
                maxLayers: 10,
                titleToken: RuleGridIconTranslationTokens.chooseModifierIcon,
                descriptionToken: RuleGridIconTranslationTokens.chooseModifierIconMsg,
                allowCancel: true,
                ruleFriendlyName: this.ruleName,
                iconType: IconListType.modifierIcon
            } as IconEditorDialogData
        });

        dialogRef.afterClosed().pipe(
            first()
        ).subscribe(async updatedIcon => {
            this.compositeIcon = null;

            this.cdr.detectChanges();
            this.cdr.markForCheck();

            await this.compositeIconSrv.updateAsync(updatedIcon).then(icon => {
                this.compositeIcon = icon;

                this.cdr.detectChanges();
                this.cdr.markForCheck();
            }).catch(async (err) => {
                let errorMsg: string;
                if (err.statusCode === HTTPCode.Conflict) {
                    errorMsg = await this.localizationAdapter.getTranslationAsync(RuleGridIconTranslationTokens.cannotSaveIconConflict);
                } else {
                    errorMsg = await this.localizationAdapter.getTranslationAsync(RuleGridIconTranslationTokens.cannotSaveUnexpectedError);
                }

                this.errorNotification.open(errorMsg, err.status, {
                    duration: 8000
                });
            });
        });
    }
}
