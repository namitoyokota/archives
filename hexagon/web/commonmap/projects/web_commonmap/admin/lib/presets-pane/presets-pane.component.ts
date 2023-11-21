import { Component, OnInit, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { NewEditPresetDialogComponent } from '../new-edit-preset-dialog/new-edit-preset-dialog.component';
import { CloneLayerMapPresetDialogComponent } from '../clone-layer-map-preset-dialog/clone-layer-map-preset-dialog.component';
import { ConfirmDiscardChangesService } from '../confirm-discard-changes-dialog/confirm-discard-changes.service';
import { ConfirmDeleteService } from '../confirm-delete-dialog/confirm-delete.service';
import { CommonmapEventService$v1 } from '@galileo/web_commonmap/_core';
import { DeletedPresetLayersDialogComponent } from '../deleted-preset-layers-dialog/deleted-preset-layers-dialog.component';
import { PresetsPaneTranslationTokens } from './presets-pane.translation';
@Component({
    selector: 'hxgn-commonmap-admin-presets-pane',
    templateUrl: './presets-pane.component.html',
    styleUrls: ['./presets-pane.component.scss']
})
export class PresetsPaneComponent implements OnInit, OnDestroy {

    @Output() setPresetZoomCenter: EventEmitter<any> = new EventEmitter<any>();

    /**  Expose translation tokens to html template */
    tokens: typeof PresetsPaneTranslationTokens = PresetsPaneTranslationTokens;

    selectedTabIndex = 0;
    selectedLayer: Common.MapLayer$v1;
    selectedMapPreset: Common.MapPreset$v1;
    mapPresets: Common.MapPreset$v1[];
    isCheckForChanges = false;

    showMapDisplayProps = false;
    mapDisplayPropsValid = true;

    FeatureFlags: typeof Common.FeatureFlags = Common.FeatureFlags;

    private destroy$ = new Subject();
    private changingSelection = false;

    constructor(private mapAdminSvc: CommonmapAdminService,
        private confirmDiscardSvc: ConfirmDiscardChangesService,
        private confirmDeleteSvc: ConfirmDeleteService,
        public dialog: MatDialog,
        private eventSvc: CommonmapEventService$v1,
        private changeRef: ChangeDetectorRef) {

        this.mapAdminSvc.changesDiscarded$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (mapPreset) => {

            this.mapAdminSvc.setSelectedMapPreset(null);
            this.selectedMapPreset = null;
            this.selectedLayer = null;
            this.showMapDisplayProps = false;
            this.changeRef.detectChanges();

            if (!this.changingSelection && !this.mapAdminSvc.changingTabs) {
                this.selectedMapPreset = await this.mapAdminSvc.setSelectedMapPreset(mapPreset);
            }

            this.mapPresets = this.mapAdminSvc.mapPresets;

        });

        this.mapAdminSvc.changesSaved$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (mapPreset) => {

            if (!this.changingSelection && !this.mapAdminSvc.changingTabs) {
                this.selectedMapPreset = await this.mapAdminSvc.setSelectedMapPreset(mapPreset);
            }
            this.mapPresets = this.mapAdminSvc.mapPresets;
            this.selectedLayer = null;
            this.showMapDisplayProps = false;

        });

        this.eventSvc.mapPresetDeleted$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (mapPreset) => {
            this.selectedMapPreset = null;
            this.mapPresets = this.mapAdminSvc.mapPresets;
        });

        this.mapAdminSvc.mapDataTranslated$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.mapPresets = this.mapAdminSvc.mapPresets;
        })
    }

    ngOnInit() {
        this.mapPresets = this.mapAdminSvc.mapPresets;
    }

    ngOnDestroy() {
        this.mapAdminSvc.fireCloseLayerPropsCmd();
        this.destroy$.next();
        this.destroy$.complete();
        this.selectedMapPreset = null;
        this.mapAdminSvc.setSelectedMapPreset(null);
    }

    isSelected(mapPreset: Common.MapPreset$v1): boolean {
        let selected = false;
        if (this.mapAdminSvc.selectedMapPreset && mapPreset.id === this.mapAdminSvc.selectedMapPreset.id) {
            selected = true;
        }

        return (selected);
    }

    getMap() {
        return (this.mapAdminSvc.map);
    }

    async setSelectedPreset(selectedPreset) {
        this.selectedLayer = null;
        this.showMapDisplayProps = false;
        this.mapAdminSvc.fireCloseLayerPropsCmd();
        if (this.selectedMapPreset && this.mapAdminSvc.isDirty) {
            this.changingSelection = true;
        }
        this.isCheckForChanges = true;
        if (await this.confirmDiscardSvc.checkForUnsaveChangesAsync()) {
            this.isCheckForChanges = false;
            if (selectedPreset && !selectedPreset.valid) {
                this.mapAdminSvc.setSelectedMapPreset(null);
                this.selectedMapPreset = null;
                    const dialogRef = this.dialog.open(DeletedPresetLayersDialogComponent, {
                    disableClose: true
                });

                dialogRef.afterClosed().subscribe(async (val) => {
                    if (val) {
                        this.editPreset(selectedPreset, true);
                    }
                });
            } else {
                if (this.selectedMapPreset) {
                    if (selectedPreset === null || this.selectedMapPreset.id === selectedPreset.id) {
                        this.mapAdminSvc.setSelectedMapPreset(null);
                        this.selectedMapPreset = null;
                    } else {
                        this.mapAdminSvc.setSelectedMapPreset(null);
                        this.selectedMapPreset = null;
                        setTimeout(async () => {
                            this.selectedMapPreset = await this.mapAdminSvc.setSelectedMapPreset(selectedPreset);
                        }, 200);
                    }
                } else {
                    this.selectedMapPreset = await this.mapAdminSvc.setSelectedMapPreset(selectedPreset);
                }
            }
        } else {
            this.changingSelection = false;
        }
        this.isCheckForChanges = false;
    }

    async clearSelectedPresetFromActionIcon(event, selectedPreset, menuTrigger: any) {
        event.stopPropagation();
        this.mapAdminSvc.fireCloseLayerPropsCmd();
        if (this.selectedMapPreset && this.mapAdminSvc.isDirty) {
            this.changingSelection = true;
        }

        this.isCheckForChanges = true;
        this.selectedLayer = null;
        this.showMapDisplayProps = false;

        if (await this.confirmDiscardSvc.checkForUnsaveChangesAsync()) {
            this.isCheckForChanges = false;
            if (selectedPreset && !selectedPreset.valid) {
                menuTrigger.closeMenu();
                this.mapAdminSvc.setSelectedMapPreset(null);
                this.selectedMapPreset = null;
                const dialogRef = this.dialog.open(DeletedPresetLayersDialogComponent, {
                    disableClose: true
                });

                dialogRef.afterClosed().subscribe(async (val) => {
                    if (val) {
                        this.editPreset(selectedPreset, true);
                    }
                });
            } else {
                if (this.selectedMapPreset) {
                    this.mapAdminSvc.setSelectedMapPreset(null);
                    this.selectedMapPreset = null;
                } else {
                    this.mapAdminSvc.setSelectedMapPreset(null);
                    this.selectedMapPreset = null;
                }
            }
        } else {
            this.changingSelection = false;
            menuTrigger.closeMenu();
        }
        this.isCheckForChanges = false;
    }

    async addNewPreset() {

        this.mapAdminSvc.fireCloseLayerPropsCmd();
        if (this.selectedMapPreset && this.mapAdminSvc.isDirty) {
            this.changingSelection = true;
        }

        this.isCheckForChanges = true;
        if (await this.confirmDiscardSvc.checkForUnsaveChangesAsync()) {
            this.isCheckForChanges = false;
            this.mapAdminSvc.setSelectedMapPreset(null);
            this.selectedMapPreset = null;
            const dialogRef = this.dialog.open(NewEditPresetDialogComponent, {
                disableClose: true,
                data: { mapPreset: null }
            });
        }
        this.isCheckForChanges = false;
        //    }
    }

    async deletePreset(mapPreset: Common.MapPreset$v1) {
        if (await this.confirmDeleteSvc.confirmDeleteAsync()) {
            this.mapAdminSvc.processing$.next({
                mapPreset: mapPreset,
                token: this.tokens.deletingMapPresetLabel,
                isNew: false
            });
            this.mapAdminSvc.deleteMapPreset(mapPreset).catch((err) => {
                this.mapAdminSvc.processingComplete$.next({
                    success: false,
                    isNew: false
                });
                console.log(err);
            }).then((status) => {
                this.mapAdminSvc.processingComplete$.next({
                    success: true,
                    isNew: false
                });
                this.selectedMapPreset = null;
            });
        }
    }

    async editPreset(mapPreset: Common.MapPreset$v1, verify = false) {
        const newMapPreset = mapPreset.clone();

        const dialogRef = this.dialog.open(NewEditPresetDialogComponent, {
            disableClose: true,
            data: { mapPreset: newMapPreset,
                    verify: verify }
        });

        dialogRef.afterClosed().subscribe(async (val) => {
            if (val) {
                this.selectedMapPreset = await this.mapAdminSvc.setSelectedMapPreset(newMapPreset);
                this.changeRef.detectChanges();
            }
        });
    }

    async clonePreset(mapPreset: Common.MapPreset$v1) {
        const newMapPreset = mapPreset.clone();
        newMapPreset.name = '';
        newMapPreset.id = '';
        newMapPreset.isSystemDefined = false;

        const dialogRef = this.dialog.open(CloneLayerMapPresetDialogComponent, {
            disableClose: true,
            data: { mapPreset: newMapPreset, mapLayer: null }
        });
    }

    layerPropertyChanged(event: any) {
        switch (event.name) {
            case 'opacity': {
                this.mapAdminSvc.setLeafletLayerOpacity(event.mapLayer, event.value);
                break;
            }
            case 'shownOnStartup': {
                this.mapAdminSvc.setLayerDisplay(event.mapLayer, event.value);
                this.mapAdminSvc.setIsDirty(true);
                break;
            }
        }

        this.mapAdminSvc.setIsDirty(true);
    }

    setSelectedLayer(event: any) {
        this.selectedLayer = event.mapLayer;
        this.showMapDisplayProps = false;
    }

    setMinZoom(minZoomLevel: number) {
        this.selectedLayer.minZoomLevel = minZoomLevel;
        this.mapAdminSvc.removeLayerFromMap(this.selectedLayer, false);
        this.mapAdminSvc.addLayerToMap(this.selectedLayer);
        this.mapAdminSvc.setIsDirty(true);
    }

    setMaxZoom(maxZoomLevel: number) {
        this.selectedLayer.maxZoomLevel = maxZoomLevel;
        this.mapAdminSvc.removeLayerFromMap(this.selectedLayer, false);
        this.mapAdminSvc.addLayerToMap(this.selectedLayer);
        this.mapAdminSvc.setIsDirty(true);
    }

    setDefineMinZoom(defineMinZoom: boolean) {
        this.selectedLayer.defineMinZoom = defineMinZoom;
        this.mapAdminSvc.removeLayerFromMap(this.selectedLayer, false);
        this.mapAdminSvc.addLayerToMap(this.selectedLayer);
        this.mapAdminSvc.setIsDirty(true);
    }

    setDefineMaxZoom(defineMaxZoom: boolean) {
        this.selectedLayer.defineMaxZoom = defineMaxZoom;
        this.mapAdminSvc.removeLayerFromMap(this.selectedLayer, false);
        this.mapAdminSvc.addLayerToMap(this.selectedLayer);
        this.mapAdminSvc.setIsDirty(true);
    }

    returnToPanel() {
        this.selectedLayer = null;
        this.showMapDisplayProps = false;
    }

    setZoomCenter() {
        this.setPresetZoomCenter.emit(null);
    }

    setMapDisplayProperties() {
        this.showMapDisplayProps = true;
    }
 
    setMapDisplayPropsValid(valid) {
        this.mapDisplayPropsValid = valid;
    }

    mapDisplayPropertiesChanged(event: any) {
        switch (event.name) {
            case 'highlightColor': {
                this.mapAdminSvc.setHighlightColor(event.value.lineColor, event.value.fillColor);
                break;
            }
            case 'selectionColor': {
                this.mapAdminSvc.setSelectionColor(event.value.lineColor, event.value.fillColor);
                break;
            }
        }

        this.mapAdminSvc.setIsDirty(true);
    }

    async baseMapChanged(event: any) {
        this.mapAdminSvc.removeLayerFromMap(event.prevBaseMapLayer);
        this.changeRef.detectChanges();

        this.mapAdminSvc.addLayerToMap(event.baseMapLayer);
        this.changeRef.detectChanges();

        this.mapAdminSvc.setIsDirty(true);
    }

    layersReordered(collId: string) {
        if (collId === Common.DefaultLayerCollectionIds$v1.Overlays) {
            this.mapAdminSvc.reorderOverlays();
        } else {
            this.mapAdminSvc.reorderDataLayers();
        }
        this.mapAdminSvc.displayedMapPreset.mapLayers =
            this.mapAdminSvc.mapPresetBaseMaps.concat(this.mapAdminSvc.mapPresetOverlays.concat(
                                                        this.mapAdminSvc.mapPresetDataLayers));
        this.mapAdminSvc.setIsDirty(true);
    }
}
