import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayerPanelDialogComponent } from '../layer-panel-dialog/layer-panel-dialog.component';
import { LayerPanelNotification} from '../../abstractions/core.models';
import { CommonmapCoreService$v1 } from '../../commonmap-core.service';
import * as Common from '@galileo/web_commonmap/_common';
import { LayerPanelTranslationTokens } from './layer-panel.translation';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-layer-panel',
    templateUrl: './layer-panel.component.html',
    styleUrls: ['./layer-panel.component.scss']
})
export class LayerPanelComponent implements OnInit, OnDestroy {
    @Input() mapPreset: Common.MapPreset$v1;
    @Input() layerCollections: Common.LayerCollection$v1[];
    @Input() position: Common.LayerPanelControlPositions$v1 = Common.LayerPanelControlPositions$v1.TopRight;
    @Input() allowLayerReorder: boolean;
    @Input() displayOnDialog = false;
    @Input() notification: LayerPanelNotification;
    @Input() isPresetOverridden = false;

    searchString: string;
    expandLayerPanel = false;
    showIcon = true;
    dialogRef: any;
    modifiedFromDefault: boolean;

    /**  Expose translation tokens to html template */
    tokens: typeof LayerPanelTranslationTokens = LayerPanelTranslationTokens;

    preFetchTokensList = [
        this.tokens.layerPanelOpenTooltip
    ];

    transStrings = {};

    LayerPanelControlPositions: typeof Common.LayerPanelControlPositions$v1 = Common.LayerPanelControlPositions$v1;

    private destroy$ = new Subject<boolean>();

    constructor(private coreSvc: CommonmapCoreService$v1,
        public dialog: MatDialog) { }

    ngOnInit() {
        this.initLocalization();

        this.coreSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        if (this.expandLayerPanel) {
            this.showIcon = false;
        }

        this.notification.closeLayerPanel$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.closeLayerPanel();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    toggleShowLayerPanel() {
        if (!this.expandLayerPanel && this.displayOnDialog) {
                this.showIcon = false;
                this.dialogRef = this.dialog.open(LayerPanelDialogComponent, {
                    disableClose: true,
                    panelClass: 'layer-panel-dialog',
                    data: {
                        mapPreset: this.mapPreset,
                        layerCollections: this.layerCollections,
                        allowLayerReorder: this.allowLayerReorder,
                        layerPanelNotification: this.notification,
                        isPresetOverridden: this.isPresetOverridden
                    }
            });

            this.fireLayerPanelDisplayStateChanged(true);

            this.dialogRef.afterClosed().subscribe( (changes: any) => {
                this.showIcon = true;
                this.fireLayerPanelDisplayStateChanged(false);
            });
        } else {
            this.expandLayerPanel = !this.expandLayerPanel;
            this.fireLayerPanelDisplayStateChanged(this.expandLayerPanel);
        }
    }

    fireLayerPanelDisplayStateChanged(state: boolean) {
        this.notification.layerPanelDisplayStateChanged$.next(state);
    }

    // Exposed to allow map to close the layer panel
    closeLayerPanel() {
        this.expandLayerPanel = false;
        this.fireLayerPanelDisplayStateChanged(this.expandLayerPanel);
        this.showIcon = true;
        if (this.dialogRef) {
            this.dialogRef.close();
        }
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
