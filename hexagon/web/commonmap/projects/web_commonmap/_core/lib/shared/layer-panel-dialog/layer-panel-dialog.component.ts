import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Common from '@galileo/web_commonmap/_common';
import { LayerPanelNotification } from '../../abstractions/core.models';
import { LayerPanelDialogTranslationTokens } from './layer-panel-dialog.translation';

@Component({
    selector: 'hxgn-commonmap-layer-panel-dialog',
    templateUrl: './layer-panel-dialog.component.html',
    styleUrls: ['./layer-panel-dialog.component.scss']
})
export class LayerPanelDialogComponent implements OnInit {

    /**  Expose translation tokens to html template */
    tokens: typeof LayerPanelDialogTranslationTokens = LayerPanelDialogTranslationTokens;

    mapPreset: Common.MapPreset$v1;
    layerCollections: Common.LayerCollection$v1[];
    allowLayerReorder = true;
    layerPanelNotification: LayerPanelNotification;
    isPresetOverridden = false;

    constructor(public dialogRef: MatDialogRef<LayerPanelDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any) { }

    ngOnInit() {
        this.mapPreset = this.data.mapPreset;
        this.layerCollections = this.data.layerCollections;
        this.allowLayerReorder = this.data.allowLayerReorder;
        this.layerPanelNotification = this.data.layerPanelNotification;
        this.isPresetOverridden = this.data.isPresetOverridden;
    }

    closeLayerPanelDialog() {
        this.dialogRef.close();
    }
}
