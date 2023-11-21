import { Component, Output, EventEmitter, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as Common from '@galileo/web_commonmap/_common';
import { NewLayerService } from '../new-layer-dialog/new-layer.service';
import { CloneLayerMapPresetDialogComponent } from '../clone-layer-map-preset-dialog/clone-layer-map-preset-dialog.component';
import { CommonmapAdminService } from '../admin.service';
import { ConfirmDiscardChangesService } from '../confirm-discard-changes-dialog/confirm-discard-changes.service';
import { ConfirmDeleteService } from '../confirm-delete-dialog/confirm-delete.service';
import { LayersPaneTranslationTokens } from './layers-pane.translation';

@Component({
    selector: 'hxgn-commonmap-admin-layers-pane',
    templateUrl: './layers-pane.component.html',
    styleUrls: ['./layers-pane.component.scss']
})
export class LayersPaneComponent implements OnDestroy {

    @Output() previewNeedsRefresh: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof LayersPaneTranslationTokens = LayersPaneTranslationTokens;

    dataLayers: Common.MapLayer$v1[];
    overlays: Common.MapLayer$v1[];
    baseMaps: Common.MapLayer$v1[];

    isProcessing = false;
    processingToken = this.tokens.retrievingWMSInformationLabel;

    selectedTabIndex = 0;
    public selectedLayer: Common.MapLayer$v1;
    MapLayerType: typeof Common.MapLayerType$v1 = Common.MapLayerType$v1;

    detailsHeaderToken = this.tokens.selectedBaseMapDetailsHeader;
    needToSave = false;

    private destroy$ = new Subject();
    private changingSelection = false;

    constructor(private mapAdminSvc: CommonmapAdminService,
                private confirmDiscardSvc: ConfirmDiscardChangesService,
                private confirmDeleteSvc: ConfirmDeleteService,
                private newLayerSvc: NewLayerService,
                public dialog: MatDialog,
                private changeRef: ChangeDetectorRef) {

        this.mapAdminSvc.beforeChangesDiscarded$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            if (this.selectedLayer) {
                this.mapAdminSvc.removeLayerFromMap(this.selectedLayer, true);
            }
        });
            
        this.mapAdminSvc.changesDiscarded$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((selectedLayer) => {

            this.dataLayers = [];
            this.overlays = [];
            this.baseMaps = [];
            this.needToSave = false;

            if (!this.changingSelection) {
                this.mapAdminSvc.lastLayerAction = {
                    id: selectedLayer.id,
                    action: 'discard'
                };

                this.selectedLayer = this.mapAdminSvc.setSelectedMapLayer(selectedLayer);
                this.mapAdminSvc.addLayerToMap(selectedLayer);

                if (this.mapAdminSvc.defaultMapPreset) {
                    this.mapAdminSvc.setMapZoomCenter(this.mapAdminSvc.defaultMapPreset.zoomLevel,
                        this.mapAdminSvc.defaultMapPreset.mapCenter, true);
                }
            }
            this.baseMaps = this.getAvailableBaseMaps();
            this.dataLayers = this.getAvailableDataLayers();
            this.overlays = this.getAvailableOverlays();

            this.changingSelection = false;

        });

        this.mapAdminSvc.changesSaved$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((selectedLayer) => {
            this.dataLayers = [];
            this.overlays = [];
            this.baseMaps = [];

            this.needToSave = false;

            this.baseMaps = this.getAvailableBaseMaps();
            this.dataLayers = this.getAvailableDataLayers();
            this.overlays = this.getAvailableOverlays();
            this.changeRef.detectChanges();

            if (!this.changingSelection) {
                this.mapAdminSvc.lastLayerAction = {
                    id: selectedLayer.id,
                    action: 'save'
                };

                this.selectedLayer = this.mapAdminSvc.setSelectedMapLayer(selectedLayer);
                switch (this.selectedLayer.type) {
                    case Common.MapLayerType$v1.BaseMap: {
                        this.detailsHeaderToken = this.tokens.selectedBaseMapDetailsHeader;
                        break;
                    }
                    case Common.MapLayerType$v1.Overlay: {
                        this.detailsHeaderToken = this.tokens.selectedOverlayDetailsHeader;
                        break;
                    }
                }
                this.mapAdminSvc.addLayerToMap(selectedLayer);

                // if (this.mapAdminSvc.defaultMapPreset) {
                //     this.mapAdminSvc.setMapZoomCenter(this.mapAdminSvc.defaultMapPreset.zoomLevel,
                //         this.mapAdminSvc.defaultMapPreset.mapCenter, true);
                // }
            }

            this.changingSelection = false;
        });

        this.mapAdminSvc.mapLayerDeleted$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((layer) => {
            this.dataLayers = [];
            this.overlays = [];
            this.baseMaps = [];

            this.needToSave = false;
            this.selectedLayer = null;

            this.baseMaps = this.getAvailableBaseMaps();
            this.dataLayers = this.getAvailableDataLayers();
            this.overlays = this.getAvailableOverlays();
        });


        this.mapAdminSvc.mapLayerCloned$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((layer) => {
            this.dataLayers = [];
            this.overlays = [];
            this.baseMaps = [];

            this.needToSave = false;
            this.selectedLayer = null;

            this.baseMaps = this.getAvailableBaseMaps();
            this.dataLayers = this.getAvailableDataLayers();
            this.overlays = this.getAvailableOverlays();
        });

        this.mapAdminSvc.refreshPreview$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (needToSave: boolean) => {
            if (this.selectedLayer) {
                if (needToSave) {
                    const opt = this.selectedLayer.getOption('workingLayer');
                    if (!(opt?.value)) {
                        await this.mapAdminSvc.cloneMapLayer(this.selectedLayer, false).catch((reason) => {
                            reason = decodeURIComponent(reason);
                            console.log('Error cloning working layer before refreshing preview: ' + reason);
                        }).then((layer) => {
                            if (layer) {
                                opt.value = this.selectedLayer.id;
                                this.selectedLayer.id = layer.id;
                                this.needToSave = false;
                                this.mapAdminSvc.redrawLayer(this.selectedLayer);
                            } else {
                                console.log('No layer was returned when cloning map layer');
                            }
                        });
                    } else {
                        await this.mapAdminSvc.saveChanges(this.selectedLayer, false, true).catch((reason) => {
                            reason = decodeURIComponent(reason);
                            console.log('Error saving working layer before getting wms info: ' + reason);
                        }).then((layer) => {
                            if (layer) {
                                this.needToSave = false;
                                this.mapAdminSvc.redrawLayer(this.selectedLayer);
                            } else {
                                console.log('Error - No layer was returned when saving map layer');
                            }
                        });
                    }
                } else {
                    this.mapAdminSvc.redrawLayer(this.selectedLayer);
                }
            }
        });

        this.mapAdminSvc.mapDataTranslated$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((l) => {
            this.dataLayers = [];
            this.overlays = [];
            this.baseMaps = [];

            this.baseMaps = this.getAvailableBaseMaps();
            this.dataLayers = this.getAvailableDataLayers();
            this.overlays = this.getAvailableOverlays();
        });

        this.baseMaps = this.getAvailableBaseMaps();
        this.dataLayers = this.getAvailableDataLayers();
        this.overlays = this.getAvailableOverlays();
    }

    ngOnDestroy() {
        this.mapAdminSvc.cleanupWorkingLayer();

        this.destroy$.next();
        this.destroy$.complete();
        this.selectedLayer = null;
        this.mapAdminSvc.setSelectedMapLayer(null);
    }

    isSelected(mapLayer: Common.MapLayer$v1): boolean {
        let selected = false;
        if (this.mapAdminSvc.selectedMapLayer) {
            if (mapLayer.id === this.mapAdminSvc.selectedMapLayer.id) {
                selected = true;
            } else {
                const opt = this.mapAdminSvc.selectedMapLayer.getOption('workingLayer');
                if (opt) {
                    if (opt.value === mapLayer.id) {
                        selected = true;
                    }
                }
            }
        }

        return (selected);
    }

    getAvailableDataLayers(): Common.MapLayer$v1[] {
        this.dataLayers = this.mapAdminSvc.getDataLayersFromMapLayers(null);
        return (this.dataLayers);
    }

    getAvailableOverlays(): Common.MapLayer$v1[] {
        this.overlays = this.mapAdminSvc.getOverlaysFromMapLayers(null);
        return (this.overlays);
    }

    getAvailableBaseMaps(): Common.MapLayer$v1[] {
        this.baseMaps = this.mapAdminSvc.getBaseMapsFromMapLayers(null);
        return (this.baseMaps);
    }

    getSelectedLayer(): Common.MapLayer$v1 {
        return (this.selectedLayer);
    }

    async setSelectedLayer(selectedLayer) {

        this.mapAdminSvc.fireCloseLayerPropsCmd();
        if (this.selectedLayer && this.mapAdminSvc.isDirty) {
            this.changingSelection = true;
        }

        if (await this.confirmDiscardSvc.checkForUnsaveChangesAsync()) {
            switch (selectedLayer.type) {
                case Common.MapLayerType$v1.BaseMap: {
                    this.detailsHeaderToken = this.tokens.selectedBaseMapDetailsHeader;
                    break;
                }
                case Common.MapLayerType$v1.Overlay: {
                    this.detailsHeaderToken = this.tokens.selectedOverlayDetailsHeader;
                    break;
                }
            }
            if (this.selectedLayer) {
                if (!selectedLayer || selectedLayer.id === this.selectedLayer.id) {
                    this.mapAdminSvc.removeLayerFromMap(this.selectedLayer);
                    this.mapAdminSvc.setSelectedMapLayer(null);
                    this.selectedLayer = null;
                    this.mapAdminSvc.addDefaultMapLayer();
                } else {
                    this.mapAdminSvc.loadingLayerInfo$.next(true);
                    this.mapAdminSvc.removeLayerFromMap(this.selectedLayer);
                    this.selectedLayer = this.mapAdminSvc.setSelectedMapLayer(selectedLayer);
                    if (this.selectedLayer?.isSystemDefined) {
                        this.setLayerLoaded(true);
                    }
                }
            } else {
                this.mapAdminSvc.loadingLayerInfo$.next(true);
                this.selectedLayer = this.mapAdminSvc.setSelectedMapLayer(selectedLayer);
                if (this.selectedLayer?.isSystemDefined) {
                    this.setLayerLoaded(true);
                }
            }
        } else {
            this.changingSelection = false;
        }
    }

    async clearSelectedLayerFromActionIcon(event, selectedLayer, menuTrigger: any) {
        event.stopPropagation();
        this.mapAdminSvc.fireCloseLayerPropsCmd();
        if (this.selectedLayer && this.mapAdminSvc.isDirty) {
            this.changingSelection = true;
        }
        if (await this.confirmDiscardSvc.checkForUnsaveChangesAsync()) {
            if (this.selectedLayer) {
                this.mapAdminSvc.removeLayerFromMap(this.selectedLayer);
                this.mapAdminSvc.setSelectedMapLayer(null);
                this.selectedLayer = null;
            }
        } else {
            this.changingSelection = false;
            menuTrigger.closeMenu();
        }
    }

    async setLayerLoaded(success: boolean) {
        this.mapAdminSvc.loadingLayerInfo$.next(false);
        if (success && this.selectedLayer && this.selectedLayer.valid) {
            setTimeout(async () => {
                this.mapAdminSvc.mapUpdating$.next(true);
                await this.mapAdminSvc.addLayerToMap(this.selectedLayer);
                this.mapAdminSvc.mapUpdating$.next(false);
            }, 100);
        }
    }
    propertyChanged(info: Common.PropsChangedMsg) {

        switch (info.type) {
            case 'url':
            case 'urlParams':
            case 'localAccessOnly':
            case 'layerProperties': {
                if (info.redrawOnly) {
                    if (this.selectedLayer) {
                        this.mapAdminSvc.redrawLayer(this.selectedLayer);
                    }
                } else {
                    this.needToSave = this.needToSave || info.needToSave;
                    if (info.needToRefresh) {
                        if (this.selectedLayer) {
                            this.mapAdminSvc.removeLayerFromMap(this.selectedLayer);
                        }
                        this.previewNeedsRefresh.emit(this.needToSave);
                    }
                }
 
                break;
            }
            case 'vectorStyleProps': {
                if (this.selectedLayer) {
                    this.mapAdminSvc.redrawLayer(this.selectedLayer);
                }
                break;
            }
        }
        this.mapAdminSvc.setIsDirty(true);
    }

    setIsValid(valid) {
        this.mapAdminSvc.setMapLayerValid(valid);
        if (!valid && this.selectedLayer) {
            this.mapAdminSvc.removeLayerFromMap(this.selectedLayer);
        }
    }

    async addNewLayer() {
        this.mapAdminSvc.fireCloseLayerPropsCmd();
        if (this.selectedLayer && this.mapAdminSvc.isDirty) {
            this.changingSelection = true;
        }

        if (await this.confirmDiscardSvc.checkForUnsaveChangesAsync()) {
            if (this.selectedLayer) {
                this.mapAdminSvc.setSelectedMapLayer(null);
                this.mapAdminSvc.removeLayerFromMap(this.selectedLayer);
                this.selectedLayer = null;
                this.mapAdminSvc.addDefaultMapLayer();
            }
            const mapLayer = await this.newLayerSvc.createNewLayer();

        }
    }

    async cloneLayer(mapLayer) {
        const newMapLayer = mapLayer.clone();
        newMapLayer.name = null;
        const dialogRef = this.dialog.open(CloneLayerMapPresetDialogComponent, {
            disableClose: true,
            data: { mapPreset: null, mapLayer: newMapLayer }
        });
    }

    async deleteLayer(mapLayer) {
        if (await this.confirmDeleteSvc.confirmDeleteAsync(mapLayer.type)) {
            this.mapAdminSvc.removeLayerFromMap(mapLayer);
            this.mapAdminSvc.processing$.next({
                mapLayer: mapLayer,
                token: this.tokens.deletingMapLayerLabel,
                isNew: false
            });
            this.mapAdminSvc.deleteMapLayer(mapLayer).catch((err) => {
                this.mapAdminSvc.processingComplete$.next({
                    success: false,
                    isNew: false
                });
                this.mapAdminSvc.addDefaultMapLayer();
                console.log(err);
            }).then((status) => {
                this.mapAdminSvc.processingComplete$.next({
                    success: true,
                    isNew: false
                });
                this.mapAdminSvc.addDefaultMapLayer();
            });
        }
    }
}
