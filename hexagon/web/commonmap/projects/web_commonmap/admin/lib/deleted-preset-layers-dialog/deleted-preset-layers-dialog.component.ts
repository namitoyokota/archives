import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as Common from '@galileo/web_commonmap/_common';
import { DeletedPresetLayersTranslationTokens } from './deleted-preset-layers-dialog.translation';

@Component({
    selector: 'hxgn-commonmap-admin-deleted-preset-layers-dialog',
    templateUrl: './deleted-preset-layers-dialog.component.html',
    styleUrls: ['./deleted-preset-layers-dialog.component.scss']
})
export class DeletedPresetLayersDialogComponent {

    /**  Expose translation tokens to html template */
    tokens: typeof DeletedPresetLayersTranslationTokens = DeletedPresetLayersTranslationTokens;

    type: Common.MapLayerType$v1;
    MapLayerType: typeof Common.MapLayerType$v1 = Common.MapLayerType$v1;

    constructor(public dialogRef: MatDialogRef<DeletedPresetLayersDialogComponent>) { }


    cancel(): void {
        this.dialogRef.close(false);
    }

    verify(): void {
        this.dialogRef.close(true);
    }

}
