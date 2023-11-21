import { Component, OnInit, Inject } from '@angular/core';
import { takeUntil, filter, first } from 'rxjs/operators';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapCoreService$v1 } from '../../commonmap-core.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'hxgn-commonmap-mapview-v1',
    templateUrl: './mapview.component.html',
    styleUrls: ['./mapview.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class MapviewComponentInjectable$v1 implements OnInit {

    mapDataLoaded = false;
    mapCreateMessage: Common.MapCreateMessage$v1;
    mapPreset: Common.MapPreset$v1;
    destroy$ = new Subject();

    constructor (private mapCoreSvc: CommonmapCoreService$v1,
        private mailboxSvc: Common.CommonmapMailboxService,
        @Inject(Common.LAYOUT_MANAGER_SETTINGS) public settings: Common.MapviewSettings$v1)  {

    }

    ngOnInit() {
        this.mapDataLoaded = false;

        this.mapCoreSvc.mapDataReady$.pipe(
                filter(data => !!data),
                takeUntil(this.destroy$)
        ).subscribe(async () => {

            this.mapPreset = this.mapCoreSvc.getMapPreset(this.settings.mapSetup.mapPresetId);

            const mapSettings = new Common.MapSettings$v1({
                mapPreset: this.mapPreset,
                mapControls: {
                    displayLayerPanel: this.settings.layerPanel.displayLayerPanel,
                    layerPanelLocation: this.settings.layerPanel.layerPanelLocation,
                    allowLayerReorder: this.settings.layerPanel.allowLayerReorder,
                    displayZoomControl: this.settings.mapSetup.displayZoomControl,
                    zoomControlLocation: this.settings.mapSetup.zoomControlLocation,
                    showDrawControl: true,
                    showLayerProperties: true
                },
                readOnly: this.settings.layerPanel.lockMapAndLayers,
                contextId: this.settings.contextId,
                requestDataForCapabilityLayers: true
            } as Common.MapSettings$v1);

            this.mapCreateMessage = new Common.MapCreateMessage$v1({
                mapSettings: mapSettings
            });

            this.mapCreateMessage.mapReady$.pipe(
                filter(item => !!item)
            ).subscribe((mapComm: Common.MapCommunication$v1) => {
                this.mailboxSvc.mailbox$v1.mapViewLoaded$.next(mapComm);
            });

            this.mapDataLoaded = true;
        });
    }
}
