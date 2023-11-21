import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { CloneTranslationTokens } from './clone-layer-map-preset-dialog.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-clone-layer-preset-dialog',
    templateUrl: './clone-layer-map-preset-dialog.component.html',
    styleUrls: ['./clone-layer-map-preset-dialog.component.scss']
})
export class CloneLayerMapPresetDialogComponent implements OnInit, OnDestroy {

    /**  Expose translation tokens to html template */
    tokens: typeof CloneTranslationTokens = CloneTranslationTokens;
    nameErrorToken: string;
    canSave = false;

    mapLayer: Common.MapLayer$v1;
    mapPreset: Common.MapPreset$v1;

    name: string;

    isProcessing = false;
    processingToken = this.tokens.cloningMapLayerLabel;

    preFetchTokensList = [
        this.tokens.baseMapNamePlaceholder,
        this.tokens.overlayNamePlaceholder,
        this.tokens.presetNamePlaceholder
    ];

    transStrings = {};

    btnLabelToken = this.tokens.cloneBaseMapBtnLabel;
    titleToken = this.tokens.cloneBaseMapTitle;
    stepPromptToken = this.tokens.cloneBaseMapStepPrompt;
    placeholderToken = this.tokens.baseMapNamePlaceholder;

    private destroy$ = new Subject<boolean>();

    MapLayerType: typeof Common.MapLayerType$v1 = Common.MapLayerType$v1;

    constructor(public dialogRef: MatDialogRef<CloneLayerMapPresetDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private mapAdminSvc: CommonmapAdminService,
        private changeRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.initLocalization();
        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        if (this.data != null && this.data.mapPreset != null) {
            this.mapPreset = this.data.mapPreset;
            this.name = this.mapPreset.name;
            this.mapLayer = null;
            this.titleToken = this.tokens.cloneMapPresetTitle;
            this.btnLabelToken = this.tokens.cloneMapPresetBtnLabel;
            this.placeholderToken = this.tokens.presetNamePlaceholder;
            this.stepPromptToken = this.tokens.cloneMapPresetStepPrompt;
        } else if (this.data?.mapLayer != null) {
            this.mapLayer = this.data.mapLayer;
            this.name = this.mapLayer.name;
            this.mapPreset = null;
            switch (this.mapLayer.type) {
                case Common.MapLayerType$v1.BaseMap: {
                    this.btnLabelToken = this.tokens.cloneBaseMapBtnLabel;
                    this.titleToken = this.tokens.cloneBaseMapTitle;
                    this.stepPromptToken = this.tokens.cloneBaseMapStepPrompt;
                    this.placeholderToken = this.tokens.baseMapNamePlaceholder;
                    break;
                }
                case Common.MapLayerType$v1.Overlay: {
                    this.btnLabelToken = this.tokens.cloneOverlayBtnLabel;
                    this.titleToken = this.tokens.cloneOverlayTitle;
                    this.stepPromptToken = this.tokens.cloneOverlayStepPrompt;
                    this.placeholderToken = this.tokens.overlayNamePlaceholder;
                    break;
                }
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    nameChanged(event: any) {
        let errorToken;
        this.name = event.target.value.trim();

        if (this.mapLayer) {
            const mapLayerId = this.mapLayer.id;

            this.mapLayer.id = null;
            this.mapLayer.name = this.name;

            errorToken = this.mapAdminSvc.validateLayerName(this.mapLayer);
            this.mapLayer.id = mapLayerId;
        } else if (this.mapPreset) {
            const mapPresetId = this.mapPreset.id;

            this.mapPreset.id = null;
            this.mapPreset.name = this.name;

            errorToken = this.mapAdminSvc.validateMapPresetName(this.mapPreset);
            this.mapPreset.id = mapPresetId;
        }

        if (errorToken) {
            this.canSave = false;
            this.nameErrorToken = errorToken;
        } else {
            this.nameErrorToken = null;
            this.canSave = true;
        }
    }

    setName(event: any) {
        this.name = event.target.value.trim();
        event.target.value = this.name;
        if (this.mapLayer) {
            this.mapLayer.name = this.name;
        } else {
            this.mapPreset.name = this.name;
        }
    }

    showHideProcessing(show: boolean, token?: CloneTranslationTokens) {
        if (show) {
            this.isProcessing = true;
            this.processingToken = token;
        } else {
            this.isProcessing = false;
            this.processingToken = null;
        }
        this.changeRef.detectChanges();
    }

    save() {
        this.mapAdminSvc.isNew = true;
        if (this.mapPreset != null) {
            this.showHideProcessing(true, this.tokens.cloningMapPresetLabel);

            this.mapAdminSvc.saveChanges(this.mapPreset).catch((reason) => {
                this.showHideProcessing(false);
                console.log('Error saving map preset during clone: ' + reason);
            }).then((preset) => {
                this.showHideProcessing(false);
                this.mapAdminSvc.isNew = false;
                if (preset) {
                    this.dialogRef.close();
                }
            });
        } else if (this.mapLayer != null) {
            this.showHideProcessing(true, this.tokens.cloningMapLayerLabel);
            this.mapAdminSvc.cloneMapLayer(this.mapLayer).catch((reason) => {
                this.showHideProcessing(false);
                console.log('Error cloning map layer: ' + reason);
            }).then((layer) => {
                this.mapAdminSvc.isNew = false;
                this.showHideProcessing(false);
                if (layer) {
                    this.dialogRef.close();
                }
            });
        }
    }

    close() {
        this.dialogRef.close();
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
