import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CompositeIcon$v1 } from '@galileo/web_commonkeywords/_common';

import { CompositeIconService } from '../composite-icon.service';
import { IconEditorDialogData } from '../icon-editor-dialog/icon-editor-dialog-data';
import { IconEditorDialogComponent } from '../icon-editor-dialog/icon-editor-dialog.component';
import { IconListType } from '../icon-library/icon-library.component';
import { TranslationTokens } from './add-default-icon.translation';

@Component({
    selector: 'hxgn-commonkeywords-add-default-icon',
    templateUrl: 'add-default-icon.component.html',
    styleUrls: ['add-default-icon.component.scss']
})

export class AddDefaultIconComponent {

    /** The friendly name of the group */
    @Input() groupName: string;

    /** Event that is fired when a new node is created */
    @Output() created = new EventEmitter<CompositeIcon$v1>();

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor(private dialog: MatDialog,
        private compositeIconSrv: CompositeIconService) { }

    /**
     * Opens the icon editor dialog to create a default icon
     */
    addDefaultIcon(): void {
        const dialogRef = this.dialog.open(IconEditorDialogComponent, {
            disableClose: true,
            autoFocus: false,
            data: {
                compositeIcon: null,
                maxLayers: 10,
                titleToken: TranslationTokens.chooseDefaultIcon,
                descriptionToken: TranslationTokens.chooseDefaultIconDialogMsg,
                allowCancel: true,
                ruleFriendlyName: this.groupName,
                iconType: IconListType.groupIcon
            } as IconEditorDialogData
        });

        dialogRef.afterClosed().subscribe((compositeIcon: CompositeIcon$v1) => {
            if (compositeIcon.iconStack.length) {
                this.compositeIconSrv.addNew(compositeIcon);
                this.created.emit(compositeIcon);
            }
        });
    }
}
