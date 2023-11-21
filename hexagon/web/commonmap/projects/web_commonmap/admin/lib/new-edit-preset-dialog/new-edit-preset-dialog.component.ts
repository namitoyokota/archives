import { Component, OnInit, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { NewPresetDialogTranslationTokens } from './new-edit-preset-dialog.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-new-edit-preset-dialog',
    templateUrl: './new-edit-preset-dialog.component.html',
    styleUrls: ['./new-edit-preset-dialog.component.scss']
})
export class NewEditPresetDialogComponent implements OnInit, OnDestroy {

    /**  Expose translation tokens to html template */
    tokens: typeof NewPresetDialogTranslationTokens = NewPresetDialogTranslationTokens;

    preFetchTokensList = [
        this.tokens.presetNamePlaceholder,
        this.tokens.searchPlaceholder
    ];

    transStrings = {};

    nameErrorMsg: string;
    baseMapErrorMsg: string;
    isNew = false;
    isEdited = false;
    mapPreset: Common.MapPreset$v1;
    selectedLayers: Common.MapLayer$v1[];
    MapLayerType: typeof Common.MapLayerType$v1 = Common.MapLayerType$v1;
    searchString: string;

    baseMaps: Common.MapLayer$v1[];
    overlays: Common.MapLayer$v1[];
    dataLayers: Common.MapLayer$v1[];

    isProcessing = false;
    processingToken = this.tokens.savingMapPresetLabel;

    private destroy$ = new Subject<boolean>();

    constructor(public dialogRef: MatDialogRef<NewEditPresetDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private mapAdminSvc: CommonmapAdminService,
        private changeRef: ChangeDetectorRef) { }

    async ngOnInit() {
        this.initLocalization();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        if (this.data === null || this.data.mapPreset === null) {
            this.mapPreset = new Common.MapPreset$v1();
            if (this.mapAdminSvc.defaultMapPreset) {
                this.mapPreset.zoomLevel = this.mapAdminSvc.defaultMapPreset.zoomLevel;
                this.mapPreset.mapCenter = this.mapAdminSvc.defaultMapPreset.mapCenter;
            }

            this.isNew = true;
        } else if (this.data.mapPreset) {
            this.mapPreset = this.data.mapPreset;
            this.isNew = false;
            if (this.data.verify) {
                this.isEdited = true;
            }
        }

        this.baseMaps = this.getAvailableBaseMaps();
        this.overlays = this.getAvailableOverlays();
        this.dataLayers = this.getAvailableDataLayers();

        this.mapAdminSvc.mapDataTranslated$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.baseMaps = this.getAvailableBaseMaps();
            this.overlays = this.getAvailableOverlays();
            this.dataLayers = this.getAvailableDataLayers();
        });
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    } 
    nameChanged() {
        this.isEdited = true;
        this.mapPreset.name.trim();
        this.validateName();
    }

    isLayerSelected(mapLayer: Common.MapLayer$v1): boolean {
        let itemFound;
        itemFound = this.mapPreset.mapLayers.filter(layer => layer.id === mapLayer.id);
        return (itemFound.length > 0);
    }

    toggleLayerSelected(mapLayer: Common.MapLayer$v1) {
        this.isEdited = true;
        if (this.isLayerSelected(mapLayer) === true) {
            this.removeSelectedLayer(mapLayer);
        } else {
            this.addSelectedLayer(mapLayer);
        }
        this.validateBaseMap();
    }

    clearText() {
        this.searchString = null;
        this.searchList();
    }

    searchList() {
        this.dataLayers = this.getAvailableDataLayers();
        this.overlays = this.getAvailableOverlays();
        this.baseMaps = this.getAvailableBaseMaps();
    }

    isDiscardDisabled() {
        return (!this.isEdited) && !this.isNew;
    }

    isSaveDisabled() {
        return (!this.canSave() || !this.isEdited);
    }

    canSave(): boolean {
        if (!this.mapAdminSvc.validateMapPreset(this.mapPreset)) {
            return (true);
        } else {
            return (false);
        }
    }

    showHideProcessing(show: boolean, token?: NewPresetDialogTranslationTokens) {
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
        try {
            this.showHideProcessing(true, this.tokens.savingMapPresetLabel);
            this.mapAdminSvc.isNew = this.isNew;
            this.mapAdminSvc.saveChanges(this.mapPreset).catch((reason) => {
                this.showHideProcessing(false);
                console.log('Error saving map preset: ' + reason);
            }).then((preset) => {
                this.mapAdminSvc.isNew = false;
                this.showHideProcessing(false);
                if (preset) {
                    preset.valid = true;
                    this.dialogRef.close(true);
                }
            });
        } catch (err) {
            this.showHideProcessing(false);
            console.log('Error saving map preset');
        }
    }

    close() {
        this.dialogRef.close(false);
    }

    private getAvailableDataLayers(): Common.MapLayer$v1[] {
        let dataLayers: any = this.mapAdminSvc.getDataLayersFromMapLayers(this.searchString).filter((layer) => layer.valid);
        dataLayers = dataLayers.sort(this.mapAdminSvc.sortByName);
        return (dataLayers);
    }

    private getAvailableOverlays(): Common.MapLayer$v1[] {
        let overlays: any = this.mapAdminSvc.getOverlaysFromMapLayers(this.searchString).filter((layer) => layer.valid);
        overlays = overlays.sort(this.mapAdminSvc.sortByName);
        return (overlays);
    }

    private getAvailableBaseMaps(): Common.MapLayer$v1[] {
        let baseMaps: any = this.mapAdminSvc.getBaseMapsFromMapLayers(this.searchString).filter((layer) => layer.valid);
        baseMaps = baseMaps.sort(this.mapAdminSvc.sortByName);
        return (baseMaps);
    }

    private validateName() {
        this.nameErrorMsg = this.mapAdminSvc.validateMapPresetName(this.mapPreset);
    }

    private validateBaseMap() {
        this.baseMapErrorMsg = this.mapAdminSvc.validateMapPresetBaseMap(this.mapPreset);
    }

    private addSelectedLayer(mapLayer: Common.MapLayer$v1) {
        if (mapLayer.type === this.MapLayerType.BaseMap) {
            if (this.mapAdminSvc.getBaseMaps(this.mapPreset.mapLayers).length > 0) {
                mapLayer.shownOnStartup = false;
            } else {
                mapLayer.shownOnStartup = true;
            }
        }
        this.mapPreset.mapLayers.push(mapLayer);
    }

    private removeSelectedLayer(mapLayer: Common.MapLayer$v1) {
        for (let ii = 0; ii < this.mapPreset.mapLayers.length; ii++) {
            if (this.mapPreset.mapLayers[ii].id === mapLayer.id) {
                const shownOnStartup = this.mapPreset.mapLayers[ii].shownOnStartup;
                this.mapPreset.mapLayers.splice(ii, 1);
                if (mapLayer.type === this.MapLayerType.BaseMap && shownOnStartup) {
                    const baseMaps = this.mapAdminSvc.getBaseMaps(this.mapPreset.mapLayers);
                    if (baseMaps.length > 0) {
                        baseMaps[0].shownOnStartup = true;
                    }
                }
                break;
            }
        }
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
