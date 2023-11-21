import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import * as L from 'leaflet';
import { takeUntil, filter } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { ConfirmDiscardChangesService } from '../confirm-discard-changes-dialog/confirm-discard-changes.service';
import { Title } from '@angular/platform-browser';
import { DirtyComponent$v1 } from '@galileo/web_common-libraries';
import { ConfigTranslationTokens } from './commonmap-config.translation';
import {
    MapLayerSelectionService$v1,
    GeoSpatialService$v1
} from '@galileo/web_commonmap/_core';
@Component({
    selector: 'hxgn-commonmap-configuration',
    templateUrl: './commonmap-config.component.html',
    styleUrls: ['./commonmap-config.component.scss']
})
export class CommonMapConfigurationComponent implements OnInit, OnDestroy, DirtyComponent$v1 {

    @ViewChild('previewMap') previewMap: any;

    /**  Expose translation tokens to html template */
    tokens: typeof ConfigTranslationTokens = ConfigTranslationTokens;

    preFetchTokensList = [
        this.tokens.mapSetup,
        this.tokens.setViewToHomeTooltip
    ];

    transStrings = {};

    selectedTabIndex = 0;
    selectedMapPreset: Common.MapPreset$v1;
    selectedItem: any = null;

    mapOptions: L.MapOptions;

    mapDataLoaded = false;
    initZoomLevel = 0;
    initMapCenter: Common.Point$v1 = null;
    map: L.Map;
    zoomChanged = false;
    mapCenterChanged = false;

    isSetZoomCenter = false;

    inputElement: any;

    setZoomTimeout = -1;

    numPresets = 0;
    numLayers = 0;

    mouseOverTimer: any = null;

    isProcessing = false;
    processingToken: string = null;

    selectionSvc: MapLayerSelectionService$v1;

    saveBeforePreview = false;
    previewNeedsRefresh = false;

    noPreviewTitleToken = this.tokens.noPreviewAvailableTitle;
    noPreviewTextToken: ConfigTranslationTokens;

    showNoPreview = false;

    mapUpdating = false;

    displayLayerPropsCmd = false;
    layerPropsCmdPoint: Common.PixelPoint$v1;
    layerPropsCmdLayerInfos: any;
    maxHeight: number;
    
    isDirty$: Observable<boolean>;

    mapOptions$: Observable<L.MapOptions>;
    private mapOptionsSub = new BehaviorSubject<L.MapOptions>(null);

    FeatureFlags: typeof Common.FeatureFlags = Common.FeatureFlags;

    private destroy$ = new Subject<boolean>();

    private isDirtyBeforeZoom = false;
    private tempCenter: Common.Point$v1;
    private tempZoom: number;

    constructor(public mapAdminSvc: CommonmapAdminService,
        private confirmDiscardSvc: ConfirmDiscardChangesService,
        private changeRef: ChangeDetectorRef,
        private titleSrv: Title) {

        this.mapAdminSvc.mapDataLoaded$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (dataLoaded) => {
            if (!dataLoaded) {
                return;
            }
            this.selectedMapPreset = await this.mapAdminSvc.getDefaultMapPreset();
            if (this.selectedMapPreset) {
                this.initZoomLevel = this.selectedMapPreset.zoomLevel;
                this.initMapCenter = this.selectedMapPreset.mapCenter;
            }

            this.mapDataLoaded = true;
            this.isDirty$ = this.mapAdminSvc.isDirty$.asObservable();
        });

        this.mapAdminSvc.mapPresetChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((mapPreset) => {
            if (this.mapDataLoaded) {
                if (mapPreset) {
                    this.isSetZoomCenter = false;
                    if (this.selectedMapPreset) {
                        this.selectedMapPreset = null;
                        this.changeRef.detectChanges();
                        if (this.map) {
                            this.map = null;
                        }
                    }

                    this.selectedItem = mapPreset;
                    this.selectedMapPreset = mapPreset;
                    this.mcGetMapOptions();
                    this.changeRef.detectChanges();
                    this.initZoomLevel = mapPreset.zoomLevel;
                    this.initMapCenter = mapPreset.mapCenter;
                } else {
                    this.selectedItem = mapPreset;
                    this.selectedMapPreset = mapPreset;
                    this.mcGetMapOptions();
                    this.changeRef.detectChanges();
                    if (this.map) {
                        this.map = null;
                    }
                }


            }
        });

        this.mapAdminSvc.mapLayerChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((mapLayer) => {
            this.isSetZoomCenter = false;
            this.selectedItem = mapLayer;
            this.previewNeedsRefresh = false;
            this.saveBeforePreview = false;
            this.changeRef.detectChanges();
        });

        this.mapAdminSvc.mapZoomChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((zoomInfo) => {
            if (zoomInfo != null) {
                this.zoomChanged = true;
                this.initZoomLevel = zoomInfo.zoomLevel;

                if (this.isSetZoomCenter) {
                    this.mapAdminSvc.setIsDirty(true);
                    this.changeRef.detectChanges();
                }
            }
        });

        this.mapAdminSvc.mapCenterChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((mapCenterInfo) => {
            if (mapCenterInfo != null) {
                this.mapCenterChanged = true;
                this.initMapCenter = mapCenterInfo.mapCenter;
                if (this.isSetZoomCenter) {
                    this.mapAdminSvc.setIsDirty(true);
                    this.changeRef.detectChanges();
                }
            }
        });

        // These will show processing from when getting WMS layers and such

        this.mapAdminSvc.processing$.pipe(
            filter(params => !params.isNew),
            takeUntil(this.destroy$)
        ).subscribe((params: any) => {
            setTimeout(() => {
                this.processingToken = params.token;
                this.isProcessing = true;
            }, 100);
        });

        this.mapAdminSvc.processingComplete$.pipe(
            filter(params => !params.isNew),
            takeUntil(this.destroy$)
        ).subscribe((success) => {
            setTimeout(() => {
                this.processingToken = null;
                this.isProcessing = false;
            }, 100);
        });

        this.mapAdminSvc.mapUpdating$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((updating: boolean) => {
            this.mapUpdating = updating;
        });

        this.mapAdminSvc.displayLayerPropsCmd$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((info: any) => {
            this.layerPropsCmd(info);
        });

        this.mapAdminSvc.closeLayerPropsCmd$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((clearSelection: boolean) => {
            this.layerPropsCmdClose(clearSelection);
        });

        this.mapAdminSvc.mapClicked$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((pt: Common.Point$v1) => {
            this.layerPropsCmdClose(true);
        });
    }
    ngOnInit() {
        this.titleSrv.setTitle('HxGN Connect');
        this.initLocalization();

        this.mapOptions$ = this.mapOptionsSub.asObservable();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        this.mcGetMapOptions();

        this.isProcessing = false;
    }

    ngOnDestroy() {
        if (this.mapAdminSvc.isDirty) {
            this.discardChanges();
        }
        if (this.mapAdminSvc.map) {
            this.mapAdminSvc.setMap(null);
        }
        this.selectedMapPreset = null;
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    mcGetSelectedTenantName(): string {
        const tenantName = 'Hexagon';
        return (tenantName);
    }

    mcGetMapOptions() {
        let mapPreset;
        if (!this.mapAdminSvc.map) {
            if (this.selectedTabIndex === 0) {
                mapPreset = this.mapAdminSvc.defaultMapPreset;
            } else {
                mapPreset = this.mapAdminSvc.selectedMapPreset;
            }

            if (mapPreset != null) {
                this.mapOptions = this.mapAdminSvc.getLeafletMapOptions(mapPreset);
            }
        }
        this.mapOptionsSub.next(this.mapOptions);
    }

    mcGetLeafletLayers() {
        return (this.mapAdminSvc.getLeafletLayers());
    }

    mcLeafletMapReady(leafletMap: L.Map) {
        this.map = leafletMap;
        this.mapAdminSvc.leafletMapReady(leafletMap);
        this.mapAdminSvc.addMapControls();
        this.changeRef.detectChanges();
        this.zoomChanged = false;
        this.mapCenterChanged = false;
    }

    isTabDisabled(tabIndex: number) {
        return (this.isSetZoomCenter || (this.selectedTabIndex !== tabIndex && this.hasChanges()));
    }

    tabChanged(event: any) {
        // this.mapAdminSvc.initialize();

        this.mapAdminSvc.setSelectedMapPreset(null);

        if (event.index === 0) {
            if (this.mapAdminSvc.defaultMapPreset) {
                this.selectedMapPreset = this.mapAdminSvc.defaultMapPreset;
                this.initZoomLevel = this.selectedMapPreset.zoomLevel;
                this.initMapCenter = this.selectedMapPreset.mapCenter;
            }
        }
    }

    async mouseTabClick(tabIndex) {
        this.layerPropsCmdClose(true);
        if (this.isTabDisabled(tabIndex)) {
            this.isSetZoomCenter = false;
            this.mapAdminSvc.changingTabs = true;
            if (await this.confirmDiscardSvc.checkForUnsaveChangesAsync()) {
                this.mapAdminSvc.changingTabs = false;
                this.mapAdminSvc.setSelectedMapLayer(null);
                this.mapAdminSvc.setSelectedMapPreset(null);
                this.selectedTabIndex = tabIndex;
            }
            this.mapAdminSvc.changingTabs = false;
        }
    }

    mouseOverTab(tabIndex) {
        if (this.isTabDisabled(tabIndex) && !this.mouseOverTimer) {
            this.mouseOverTimer = window.setTimeout(() => { this.showToolTip(); }, 500);
        }
    }

    mouseOutTab(tabIndex) {
        if (this.mouseOverTimer) {
            window.clearTimeout(this.mouseOverTimer);
            this.mouseOverTimer = null;
        }
    }

    showToolTip() {
        this.mouseOverTimer = null;
    }

    hasChanges(): boolean {
        return (this.mapAdminSvc.isDirty);
    }

    initializeZoomCenter() {
        this.isDirtyBeforeZoom = this.mapAdminSvc.isDirty;

        this.tempCenter = this.getInitMapCenter();
        this.tempZoom = this.getInitZoomLevel();
        this.isSetZoomCenter = true;
    }

    isValid() {
         let isValid = this.mapAdminSvc.isMapPresetValid;
         if (this.mapAdminSvc.selectedMapLayer) {
             isValid = this.mapAdminSvc.selectedMapLayer.valid;
         }

        return (isValid);
    }

    getZoomCenter(): number {
        const zoomLevel = this.getInitZoomLevel();
        this.getInitMapCenter();
        return (zoomLevel);
    }

    getInitZoomLevel(): number {
        if (this.mapAdminSvc.getCurrentZoom() !== -1) {
            this.initZoomLevel = this.mapAdminSvc.getCurrentZoom();
        } else {
            this.initZoomLevel = this.mapAdminSvc.selectedMapPreset.zoomLevel;
        }

        return (this.initZoomLevel);
    }

    getInitMapCenter(): Common.Point$v1 {
        if (this.mapAdminSvc.getCurrentZoom() !== -1) {
            const center = this.mapAdminSvc.map.getCenter();

            const mapCenter: Common.Point$v1 = { latitude: center.lat, longitude: center.lng, altitude: 0 };
            this.initMapCenter = this.mapAdminSvc.getCurrentCenter();
        } else {
            this.initMapCenter = this.mapAdminSvc.selectedMapPreset.mapCenter;
        }
        return (this.initMapCenter);
    }

    setInitZoomLevel(event: any) {
        if (this.setZoomTimeout !== -1) {
            window.clearTimeout(this.setZoomTimeout);
            this.setZoomTimeout = -1;
        }

        this.setZoomTimeout = window.setTimeout(() => {
            this.mapAdminSvc.setMapZoom(this.initZoomLevel);
            this.setZoomTimeout = -1;
        }, 300);
    }

    cancelSetZoomCenter() {
        this.isSetZoomCenter = false;
        this.mapAdminSvc.setIsDirty(this.isDirtyBeforeZoom);
        this.inputElement = null;
        this.zoomChanged = false;
        this.mapCenterChanged = false;
        this.mapAdminSvc.setMapZoomCenter(this.tempZoom, this.tempCenter, true);
    }

    setMapViewToPresetZoomCenter() {
        if (this.map && this.selectedMapPreset) {
            this.layerPropsCmdClose(true);
            this.map.setView(new L.LatLng(this.selectedMapPreset.mapCenter.latitude,
                 this.selectedMapPreset.mapCenter.longitude), this.selectedMapPreset.zoomLevel);
        }

    }

    finishSetZoomCenter() {
        if (this.mapAdminSvc.selectedMapPreset) {
            if (this.zoomChanged) {
                this.mapAdminSvc.selectedMapPreset.zoomLevel = this.initZoomLevel;
                this.mapAdminSvc.setIsDirty(true);
            }
            if (this.mapCenterChanged) {
                this.mapAdminSvc.selectedMapPreset.mapCenter = this.initMapCenter;
                this.mapAdminSvc.setIsDirty(true);
            }
        }
        this.isSetZoomCenter = false;
        this.inputElement = null;
    }

    async layerPropsCmd(info: any) {
        this.layerPropsCmdPoint = info.point;
        this.layerPropsCmdLayerInfos = info.layerInfos;

        if (!this.displayLayerPropsCmd) {
            this.displayLayerPropsCmd = true;
            this.changeRef.markForCheck()
            this.changeRef.detectChanges();
    
            if (this.previewMap?.nativeElement) {
                this.maxHeight = this.previewMap.nativeElement.offsetHeight - 20;
            }
        }
    }

    layerPropsCmdClose(clearSelection: boolean) {
        if (this.displayLayerPropsCmd) {
            if (clearSelection) {
                this.mapAdminSvc.clearSelectedLayer();
            }
            this.displayLayerPropsCmd = false;
            this.changeRef.markForCheck();
            this.changeRef.detectChanges();
        }
    }

    isDiscardDisabled(): boolean {
        let disable = false;
        if (this.isSetZoomCenter || !this.hasChanges()) {
            disable = true;
        }
        return (disable);
    }

    isSaveDisabled(): boolean {
        let disable = false;
        if (!this.mapAdminSvc.isDirty || !this.isValid() || this.isSetZoomCenter ) {
            disable = true;
        }
        return (disable);
    }

    refreshPreview() {
        this.previewNeedsRefresh = false;
        this.changeRef.detectChanges();

        setTimeout(() => {
            this.mapAdminSvc.refreshPreview$.next(this.saveBeforePreview);
            this.saveBeforePreview = false;
        }, 100);
    }

    setPreviewNeedsRefresh(mustSave: boolean) {
        this.layerPropsCmdClose(true);
        this.saveBeforePreview = this.saveBeforePreview || mustSave;
        this.previewNeedsRefresh = true;
    }

    showNoPreviewPane(): boolean {
        let show = false;
        if (this.mapAdminSvc.selectedMapLayer) {
            if (!this.mapAdminSvc.selectedMapLayer.valid) {
                this.noPreviewTextToken = this.tokens.noPreviewOfInvalidLayer;
                this.noPreviewTitleToken = this.tokens.noPreviewAvailableTitle;
                this.previewNeedsRefresh = true;
                show = true;
            } else if (this.previewNeedsRefresh) {
                this.noPreviewTextToken = this.tokens.refreshPreviewPrompt;
                this.noPreviewTitleToken = this.tokens.previewNeedsRefreshedTitle;
                show = true;
            }
        }
        if (!show && this.showNoPreview) {
            setTimeout(() => {
                this.mapAdminSvc.refreshMap();
            }, 100);
        }
        this.showNoPreview = show;
        return (show);
    }

    showHideProcessing(show: boolean, token?: ConfigTranslationTokens) {
        if (show) {
            this.isProcessing = true;
            this.processingToken = token;
        } else {
            this.isProcessing = false;
            this.processingToken = null;
        }
        this.changeRef.detectChanges();
    }

    async saveChanges() {
        this.layerPropsCmdClose(true);
        this.isSetZoomCenter = false;
        this.inputElement = null;
        if (this.mapAdminSvc.isDirty) {
            try {
                this.mapAdminSvc.beforeChangesSaved$.next();
                if (this.mapAdminSvc.selectedMapLayer) {
                    this.showHideProcessing(true, this.tokens.savingMapLayerLabel);

                    await this.mapAdminSvc.cleanupWorkingLayer(false);

                    await this.mapAdminSvc.saveChanges().catch((reason) => {
                        this.showHideProcessing(false);
                        console.log('Error saving map layer: ' + reason);
                    }).then ((item) => {
                        this.showHideProcessing(false);
                        this.refreshPreview();
                    });
                } else {
                    this.showHideProcessing(true, this.tokens.savingMapPresetLabel);
                    await this.mapAdminSvc.saveChanges().catch((reason) => {
                        this.showHideProcessing(false);
                        console.log('Error saving map preset: ' + reason);
                    }).then ((item) => {
                        this.showHideProcessing(false);
                    });
                }
            } catch (err) {
                this.showHideProcessing(false);
                console.log('Error in saving item');
            }
        }

        this.zoomChanged = false;
        this.mapCenterChanged = false;
    }

    async discardChanges() {
        this.layerPropsCmdClose(true);
        this.isSetZoomCenter = false;
        this.inputElement = null;
        this.zoomChanged = false;
        this.mapCenterChanged = false;
        this.mapAdminSvc.beforeChangesDiscarded$.next()
        await this.mapAdminSvc.cleanupWorkingLayer();
        this.mapAdminSvc.discardChanges();
    }

    /** Method called when navigating away from map setup admin page and changes need to be saved */
    saveChangesAsync(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            await this.saveChanges();
            resolve();
        });
    }
    /** Set up routine for localization. */
    /**
     * Set up routine for localization.
     */
     private async initLocalization(): Promise<void> {
        return new Promise<void> ((resolve) => {
            this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
                this.transStrings = response;
                this.titleSrv.setTitle(`HxGN Connect - ${this.transStrings[ConfigTranslationTokens.mapSetup]}`);
                resolve();
            });
    
        });
    }
}
