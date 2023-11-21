import { Component, OnInit, OnDestroy, ViewChild, HostBinding, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayerPropertiesComponent } from '../layer-properties/layer-properties.component';
import { NewLayerDialogTranslationTokens } from './new-layer-dialog.translation';

@Component({
    selector: 'hxgn-commonmap-admin-new-layer-dialog',
    templateUrl: './new-layer-dialog.component.html',
    styleUrls: ['./new-layer-dialog.component.scss']
})

export class NewLayerDialogComponent implements OnInit, OnDestroy {

    @ViewChild('layerPropsRight1', { static: false }) layerPropsRight1Comp: LayerPropertiesComponent;
    @ViewChild('layerPropsRight2', { static: false }) layerPropsRight2Comp: LayerPropertiesComponent;
    @HostBinding('class.saving') isSaving = false;

    /**  Expose translation tokens to html template */
    tokens: typeof NewLayerDialogTranslationTokens = NewLayerDialogTranslationTokens;

    preFetchTokensList = [
        this.tokens.addingLayerTypePlaceholder,
        this.tokens.baseMapNamePlaceholder,
        this.tokens.overlayNamePlaceholder
    ];

    transStrings = {};

    nameErrorMsg: string;
    nameValid = false;

    propsValid = false;
    connPropsValid = false;

    mapLayerType: Common.MapLayerType$v1;

    isProcessing = false;
    processingToken = this.tokens.retrievingWMSInformationLabel;

    page = 1;

    nameToken = this.tokens.addingBaseMapNameStep;
    namePlaceholderToken = this.tokens.baseMapNamePlaceholder;
    settingsToken = this.tokens.addingBaseMapSettingsStep;
    optionsToken = this.tokens.chooseBaseMapOptionsStep;
    saveBtnToken = this.tokens.addingBaseMapBtnLabel;

    MapLayerType: typeof Common.MapLayerType$v1 = Common.MapLayerType$v1;
    LayerFormat: typeof Common.LayerFormat$v1 = Common.LayerFormat$v1;
    mapLayer: Common.MapLayer$v1;

    private destroy$ = new Subject<boolean>();

    constructor(public dialogRef: MatDialogRef<NewLayerDialogComponent>,
                private mapAdminSvc: CommonmapAdminService,
                private changeRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.initLocalization();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        this.mapLayer = new Common.MapLayer$v1();
        this.mapLayer.type = this.MapLayerType.BaseMap;
        this.mapLayer.upsertOption('workingLayer', null);

        this.propsValid = this.mapLayer.valid;
        this.connPropsValid = this.mapLayer.valid;

        this.mapAdminSvc.isNew = true;

        this.mapAdminSvc.changesSaved$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((savedLayer) => {
            this.mapLayer = savedLayer;
        });

        // These will show processing from when getting WMS layers and such

        this.mapAdminSvc.processing$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((params: any) => {
            setTimeout(() => {
                this.processingToken = params.token;
                this.isProcessing = true;
            }, 100);
        });

        this.mapAdminSvc.processingComplete$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((success) => {
            setTimeout(() => {
                this.processingToken = null;
                this.isProcessing = false;
            }, 100);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    nameChanged(event: any) {
        this.mapLayer.name = event.target.value.trim();
        this.nameErrorMsg = this.mapAdminSvc.validateLayerName(this.mapLayer);
        if (this.nameErrorMsg) {
            this.nameValid = false;
            this.mapLayer.valid = false;
            return;
        } else {
            this.nameValid = true;
            this.mapLayer.valid = !this.mapAdminSvc.validateMapLayer(this.mapLayer);
        }
    }

    setName(event: any) {
        this.mapLayer.name = event.target.value.trim();
        event.target.value = this.mapLayer.name;
    }

    setMapLayerType(event: any) {
        this.mapLayer.type = event.value;
        switch (this.mapLayer.type) {
            case Common.MapLayerType$v1.BaseMap: {
                this.nameToken = this.tokens.addingBaseMapNameStep;
                this.namePlaceholderToken = this.tokens.baseMapNamePlaceholder;
                this.settingsToken = this.tokens.addingBaseMapSettingsStep;
                this.optionsToken = this.tokens.chooseBaseMapOptionsStep;
                this.saveBtnToken = this.tokens.addingBaseMapBtnLabel;
                break;
            }
            case Common.MapLayerType$v1.Overlay: {
                this.nameToken = this.tokens.addingOverlayNameStep;
                this.namePlaceholderToken = this.tokens.overlayNamePlaceholder;
                this.settingsToken = this.tokens.addingOverlaySettingsStep;
                this.optionsToken = this.tokens.chooseOverlayOptionsStep;
                this.saveBtnToken = this.tokens.addingOverlayBtnLabel;
                break;
            }
        }

        if (this.layerPropsRight1Comp) {
            this.layerPropsRight1Comp.mapLayerTypeChanged();
        }
    }

    propertyChanged(info: Common.PropsChangedMsg) {
        if (this.page === 2) {
            switch (info.type) {
                case 'url':
                case 'subdomains':
                case 'localAccessOnly':
                case 'authentication':
                case 'urlParams': {
                    if (this.layerPropsRight2Comp.layerPropsComp.connectionPropertiesUpdated) {
                        this.layerPropsRight2Comp.layerPropsComp.connectionPropertiesUpdated(info);
                    }
                    break;
                }
            }
        }
    }

    setIsValid(propsValid: boolean) {
        this.propsValid = propsValid;
    }

    setConnectionPropsValid(connPropsValid: boolean) {
        this.connPropsValid = connPropsValid;
    }

    showHideProcessing(show: boolean, token?: NewLayerDialogTranslationTokens) {
        if (show) {
            this.isProcessing = true;
            this.processingToken = token;
        } else {
            this.isProcessing = false;
            this.processingToken = null;
        }
        this.changeRef.detectChanges();
    }

    async next() {
        try {
            this.isSaving = true;
            await this.mapAdminSvc.saveChanges(this.mapLayer, false).catch((reason) => {
                console.log('Error saving working layer: ' + reason);
            }).then((mapLayer) => {
                this.isSaving = false;
                this.mapAdminSvc.isNew = false;
                this.mapLayer.id = mapLayer.id;
                const opt = this.mapLayer.getOption('workingLayer');
                if (opt) {
                    opt.value = this.mapLayer.id;
                }
            });
            this.page = 2;
        } catch (ex) {
            console.log('Error saving new layer: ' + ex);
        }
    }

    save() {
        try {
            this.mapLayer.removeOption('workingLayer');
            this.showHideProcessing(true, this.tokens.savingMapLayerLabel);
            this.mapAdminSvc.saveChanges(this.mapLayer).catch((reason) => {
                this.showHideProcessing(false);
                console.log('Error saving map layer: ' + reason);
            }).then((mapLayer) => {
                this.showHideProcessing(false);
                this.mapLayer = mapLayer;
                this.mapAdminSvc.isNew = false;
                this.mapAdminSvc.processingComplete$.next({
                    success: true,
                    isNew: true
                });
                if (mapLayer) {
                    this.mapAdminSvc.setIsDirty(false);
                    this.dialogRef.close(mapLayer);
                }
            });
        } catch (ex) {
            this.showHideProcessing(false);
            console.log('Error saving new layer: ' + ex);
        }
    }

    close() {
        if (!this.mapAdminSvc.isNew) {
            this.mapAdminSvc.deleteMapLayer(this.mapLayer);
        } else {
            this.mapAdminSvc.isNew = false;
        }
        this.mapAdminSvc.setIsDirty(false);
        this.dialogRef.close(null);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
