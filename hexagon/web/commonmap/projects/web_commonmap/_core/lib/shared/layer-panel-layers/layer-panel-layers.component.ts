import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayerPanelNotification } from '../../abstractions/core.models';
import { CommonmapCoreService$v1 } from '../../commonmap-core.service';
import * as Common from '@galileo/web_commonmap/_common';
import { LayerPanelLayersTranslationTokens } from './layer-panel-layers.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-layer-panel-layers',
    templateUrl: './layer-panel-layers.component.html',
    styleUrls: ['./layer-panel-layers.component.scss']
})
export class LayerPanelLayersComponent implements OnInit, OnDestroy {
    @Input() mapPreset: Common.MapPreset$v1;
    @Input() layerCollections: Common.LayerCollection$v1[];
    @Input() position: Common.LayerPanelControlPositions$v1;
    @Input() allowLayerReorder: boolean;
    @Input() notification: LayerPanelNotification;
    @Input() isPresetOverridden = false;

    searchString: string;
    showIcon = true;
    dialogRef: any;
    modifiedFromDefault: boolean;

    /**  Expose translation tokens to html template */
    tokens: typeof LayerPanelLayersTranslationTokens = LayerPanelLayersTranslationTokens;

    preFetchTokensList = [
        this.tokens.searchPlaceholder
    ];

    transStrings = {};
    private destroy$ = new Subject<boolean>();

    LayerPanelControlPositions: typeof Common.LayerPanelControlPositions$v1 = Common.LayerPanelControlPositions$v1;

    constructor(private coreSvc: CommonmapCoreService$v1,
        public dialog: MatDialog) { }

    ngOnInit() {
        this.initLocalization();

        this.coreSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    checkSearchString(): boolean {
        return this.searchString !== undefined
            && this.searchString !== null
            && this.searchString !== '';
    }

    fireLayerPropertyChanged(event: any) {
        this.notification.layerPropertyChanged$.next(event);
    }

    fireBaseMapChanged(event: any) {
        this.notification.baseMapChanged$.next(event);
    }

    fireLayersReordered(event: any) {
        this.notification.layersReordered$.next(event);
    }

    fireResetToDefault() {
        this.notification.resetToDefaultSelected$.next();
    }

    fireLayerPanelDisplayStateChanged(state: boolean) {
        this.notification.layerPanelDisplayStateChanged$.next(state);
    }

    clearText() {
        this.searchString = null;
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.coreSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
