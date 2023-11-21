import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ViewEditorSettings, LayoutManagerEditorSettings } from '@galileo/web_commonlayoutmanager/adapter';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapCoreService$v1 } from '../../commonmap-core.service';
import { CommonmapEventService$v1 } from '../../commonmap-events.service';
import { MapViewSettingsTranslationTokens } from './mapview-settings.translation';
import { Subject } from 'rxjs';
import { takeWhile, filter, takeUntil } from 'rxjs/operators';

@Component({
    templateUrl: './mapview-settings.component.html',
    styleUrls: ['./mapview-settings.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class MapviewSettingsComponentInjectable$v1 extends
    LayoutManagerEditorSettings<Common.MapviewSettings$v1> implements OnInit, OnDestroy {

    /**  Expose translation tokens to html template */
    tokens: typeof MapViewSettingsTranslationTokens = MapViewSettingsTranslationTokens;

    preFetchTokensList = [
        this.tokens.selectMapPreset
    ];

    transStrings = {};

    selectedTabIndex = 0;
    selectedPresetName: string = null;
    mapPreset: Common.MapPreset$v1;
    mapPresetNames: string[];

    baseMaps: Common.MapLayer$v1[];
    overlays: Common.MapLayer$v1[];
    dataLayers: Common.MapLayer$v1[];

    mapDataLoaded = false;

    LayerPanelControlPositions: typeof Common.LayerPanelControlPositions$v1 = Common.LayerPanelControlPositions$v1;
    MapLayerType: typeof Common.MapLayerType$v1 = Common.MapLayerType$v1;

    private destroy$ = new Subject<boolean>();

    constructor(public mapCoreSvc: CommonmapCoreService$v1,
        private eventSvc: CommonmapEventService$v1,
        @Inject(Common.LAYOUT_MANAGER_SETTINGS) public editorSettings: ViewEditorSettings<Common.MapviewSettings$v1>) {
        super(editorSettings);
    }

    ngOnInit() {
        this.initLocalization();

        this.mapCoreSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        this.mapDataLoaded = false;
        this.mapPresetNames = [];

        this.mapCoreSvc.mapDataReady$.pipe(
            filter(data => !!data),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.mapDataLoaded = true;
            this.mapPreset = this.getSelectedPreset();

            if (this.mapPreset != null) {
                this.mapCoreSvc.mapPresets.forEach((mapPreset) => this.mapPresetNames.push(mapPreset.name));
                this.selectedPresetName = this.mapPreset.name;
            }

            this.eventSvc.mapPresetAdded$.pipe(
                takeUntil(this.destroy$)
            ).subscribe(() => {
                this.mapPresetNames = [];
                this.mapCoreSvc.mapPresets.forEach((mapPreset) => this.mapPresetNames.push(mapPreset.name));
            });

            this.eventSvc.mapPresetUpdated$.pipe(
                takeUntil(this.destroy$)
            ).subscribe(() => {
                this.mapPresetNames = [];
                this.mapPreset = this.getSelectedPreset();
            });

            this.eventSvc.mapPresetDeleted$.pipe(
                takeUntil(this.destroy$)
            ).subscribe(() => {
                this.mapPresetNames = [];
                this.mapCoreSvc.mapPresets.forEach((mapPreset) => this.mapPresetNames.push(mapPreset.name));
            });
        });
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    initializeSettings() {
        this.settings.mapSetup.displayZoomControl = true;
        this.settings.mapSetup.mapCenter = null;
        this.settings.mapSetup.mapPresetId = '';
        this.settings.mapSetup.zoomControlLocation = Common.ZoomControlPositions$v1.BottomRight;
        this.settings.mapSetup.zoomLevel = -1;
        this.settings.layerPanel.lockMapAndLayers = false;
        this.settings.layerPanel.displayLayerPanel = true;
        this.settings.layerPanel.layerPanelLocation = Common.LayerPanelControlPositions$v1.TopRight;
        this.settings.layerPanel.allowLayerReorder = true;
    }

    getSelectedPreset(): Common.MapPreset$v1 {
        let mapPreset: Common.MapPreset$v1;
        const settingsPresetId = this.settings.mapSetup != null ? this.settings.mapSetup.mapPresetId : '';

        mapPreset = this.mapCoreSvc.mapPresets.find((preset) => preset.id === settingsPresetId);

        if (!mapPreset) {
            mapPreset = this.mapCoreSvc.defaultMapPreset;
        }
        return (mapPreset);
    }

    setSelectedPresetName(selectionEvent: any): void {
        this.dataLayers = [];
        this.baseMaps = [];
        this.overlays = [];

        this.initializeSettings();
        this.settings.mapSetup.mapPresetId = selectionEvent.value.id;
        this.selectedPresetName = selectionEvent.value.name;

        this.mapPreset = this.getSelectedPreset();

        this.emitUpdate();
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapCoreSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
