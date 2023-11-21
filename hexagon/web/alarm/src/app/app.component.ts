import { AfterViewInit, Component } from '@angular/core';
import { AlarmHistoryItemSettings$v1, capabilityId, InjectableComponentNames } from '@galileo/web_alarms/_common';
import { AlarmsAdapterService$v1 } from '@galileo/web_alarms/adapter';
import { ChangeOperation$v1, ChangeOperator$v1 } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { LayerPanelControlPositions$v1, ZoomControlPositions$v1 } from '@galileo/web_commonmap/_common';
import {
    CommontenantAdapterService$v1,
    FilterCriteriaEditorSettings,
    RestrictionGrouping$v1,
    RestrictionLevels,
} from '@galileo/web_commontenant/adapter';
import { BehaviorSubject, from, Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/* tslint:disable */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

    /** Stream of custom overlays */
    customOverlays$ = from(this.layoutCompilerSrv.getCustomOverlaysAsync()).pipe(
        mergeMap(data => data)
    );

    // alarmsIds = new BehaviorSubject<string[]>(['be001fcb-86c7-4fad-9c45-c912598a6ef2', '2c5edbfa-2e35-4639-8a6f-52c5ec635134', '298c0e3d-8de0-4c83-9019-aecdf1d37ac7']);
    alarmsIds = new BehaviorSubject<string[]>([]);

    alarmIds$ = this.alarmsIds.asObservable();

    /** Expose RestrictionLevel to the HTML */
    RestrictionLevels: typeof RestrictionLevels = RestrictionLevels;

    constructor(
        private layoutCompilerSrv: LayoutCompilerAdapterService,
        private tenantSrv: CommontenantAdapterService$v1,
        private adapterSrv: AlarmsAdapterService$v1,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        this.localizationAdapter.changeLanguageAsync('en');

        this.alarmsIds.next(['500ecb5c-1965-48cb-8eac-b4494a3b6840']);
        // from(this.adapterSrv.filterAlarmDeviceAssociationsByPriorityAsync(0)).pipe(
        //     flatMap(a => a),
        // ).subscribe(data => {
        //     console.log('associations 0', data);
        // });

        // from(this.adapterSrv.filterAlarmDeviceAssociationsByPriorityAsync(1)).pipe(
        //     flatMap(a => a),
        // ).subscribe(data => {
        //     console.log('associations 1', data);
        // });

        // from(this.adapterSrv.filterAlarmDeviceAssociationsByPriorityAsync(2)).pipe(
        //     flatMap(a => a),
        // ).subscribe(data => {
        //     console.log('associations 2', data);
        // });

        let ids = this.alarmsIds.getValue();

        // Unmanaged - Managed by connect
        // ids = ids.concat([
        //     'f456bdec-7f63-4234-83f9-95d2f0ba2a66',
        //     '6a64b1c8-a4d0-44a3-9ec7-f38a24f9e786'
        // ]);

        // Managed - managed by external system
        // ids = ids.concat([
        //     '46897e62-8104-4c2e-908b-4a1b5eab5103',
        //     '861e8308-4eeb-494e-81b0-7b292434d4eb',
        //     '9318257d-6485-42a6-9889-5539585e884b'
        // ]);

        // this.alarmsIds.next(ids);
    }

    async ngAfterViewInit() {
        await this.adapterSrv.loadCore();
        this.injectListComponentAsync();
        // this.injectSettingsComponentAsync();
        //this.injectDataSharingAsync();
        // this.injectHistoryItemAsync();
        // this.injectAlarmCardListComponentAsync();
        this.injectMiniCardComponentAsync();
    }

    private async injectDataSharingAsync() {
        const dataSharingSettings: FilterCriteriaEditorSettings = {
            editableFilterCriteria: [],
            filterNotify$: new Subject<RestrictionGrouping$v1<any, any>[]>(),
            editableRedactionCriteria: [],
            redactionNotify$: new Subject<RestrictionGrouping$v1<any, any>[]>(),
            readOnlyRedactionCriteria: [],
            readOnlyFilterCriteria: [],
            isOverride: true
        };

        this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.createDataSharingComponent,
            capabilityId, '#data-sharing', dataSharingSettings, 'dataSharing');
    }

    private async injectListComponentAsync() {
        await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.alarmList,
            capabilityId, '#list', {
            sortBy: 'timeAsc',
            enableCardExpansion: true,
            enableKeywords: true,
            enableRemarks: true,
            enableMedia: true,
            enablePortalFormatting: false,
            headerTitle: 'Alarm List',
            contextId: 'workspaceId;screenId;tabId;list-a',
            customHeaderId: 'customHeader_abc-123'
        }, 'workspaceId;screenId;tabId;list-a');

        await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            '@hxgn/commonmap/mapview/v1',
            '@hxgn/commonmap', '#map', {
            headerTitle: 'Map List',
            contextId: 'workspaceId;screenId;tabId;map-a',
            customHeaderId: 'customHeader_abc-1234',
            mapSetup: {
                mapPresetId: '55276344-000D-42A8-8321-9A19762A26D1',
                displayZoomControl: true,
                zoomControlLocation: ZoomControlPositions$v1.BottomRight,
                zoomLevel: -1,
                mapCenter: null
            },
            layerPanel: {
                lockMapAndLayers: false,
                displayLayerPanel: true,
                layerPanelLocation: LayerPanelControlPositions$v1.TopRight,
                allowLayerReorder: true,
            }
        }, 'workspaceId;screenId;tabId;map-a');
    }

    private async injectSettingsComponentAsync() {
        await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.alarmListSettings,
            capabilityId, '#settings', {
            updateMailBox: new Subject<any>(),
            viewSettings: {
                sortBy: 'titleDesc',
                enableCardExpansion: true,
                enableRemarks: true,
                enableMedia: true,
                enableKeywords: true,
                contextId: '',
                headerTitle: '',
                enablePortalFormatting: true
            }
        }, 'list-a');
    }

    private async injectHistoryItemAsync() {
        const operations: ChangeOperation$v1[] = [
            new ChangeOperation$v1({
                propertyName: 'Title',
                operator: ChangeOperator$v1.update,
                value: 'Test'
            })
        ];

        const historyItemSettings: AlarmHistoryItemSettings$v1 = new AlarmHistoryItemSettings$v1({
            concise: false,
            operations: operations,
            alarmId: ''
        });

        this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.historyItemComponent,
            capabilityId, '#history-item', historyItemSettings
        );
    }

    private async injectAlarmCardListComponentAsync() {
        const alarmIds = ['a7ac1245-3c20-47c4-acdb-26ae5638da53'];
        const alarmBus = new BehaviorSubject<string[]>(alarmIds);
        const alarmIds$ = alarmBus.asObservable();

        this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.cardListComponent,
            capabilityId, '#alarm-card-list', alarmIds$
        );
    }

    private injectMiniCardComponentAsync() {
        this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.miniCardComponent,
            capabilityId,
            '#mini-card',
            '500ecb5c-1965-48cb-8eac-b4494a3b6840'
        );

        this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.miniCardComponent,
            capabilityId,
            '#empty-mini-card',
            'abc'
        );
    }

    logAlarmIds(event: any) {
        console.log('logAlarmIds', event);
    }

    logStatus(event: any) {
        console.log('logStatus', event);
    }

    /**
     * Sets the selected filter level
     * @param level The level to set as the selected filter level
     */
    setFilterLevel(level: string) {
        this.tenantSrv.notifications.onAdminDataFilterLevelChange$.next(level);
    }

    echo(obj: any) {
        console.log('Echo', obj);
    }
}
