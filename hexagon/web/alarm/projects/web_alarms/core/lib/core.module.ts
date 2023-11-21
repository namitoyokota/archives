import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {
    Alarm$v1,
    capabilityId,
    CommonMailboxService,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
    TranslationGroup,
} from '@galileo/web_alarms/_common';
import { AssetPanelModule, AssetsAdapterModule } from '@galileo/web_assets/adapter';
import {
    CommonCardModule,
    CommonChipModule,
    CommonConfirmDialogModule,
    CommonContactModule$v2,
    CommonCrossStreetModule,
    CommonDropdownModule$v2,
    CommonExpansionPanelModule,
    CommonFilterModule,
    CommonInfiniteScrollPaneModule,
    CommonInputModule$v2,
    CommonKeywordsModule,
    CommonMediaModule,
    CommonPopoverModule,
    CommonRemarksModule,
    DebounceDataService,
    EntityHistoryStoreService$v1,
    StoreService,
    TimeSinceModule,
    TooltipModule,
    VariableHeightVirtualScrollStrategyModule,
} from '@galileo/web_common-libraries';
import { CommonHyperlinksModule } from '@galileo/web_common-libraries/common-hyperlinks';
import { CommonPropertiesModule } from '@galileo/web_common-libraries/common-properties';
import { CommonAdapterService$v1 } from '@galileo/web_common/adapter';
import { CommonAssociationAdapterModule } from '@galileo/web_commonassociation/adapter';
import { CommonconversationsAdapterModule } from '@galileo/web_commonconversations/adapter';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';
import { CommonkeywordsAdapterService$v1, CompositeIcon$v2Module } from '@galileo/web_commonkeywords/adapter';
import {
    LayoutCompilerAdapterService,
    LayoutManagerFeatureModule$v2,
    MailBoxService,
} from '@galileo/web_commonlayoutmanager/adapter';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonLoggingAdapterService$v1 } from '@galileo/web_commonlogging/adapter';
import {
    ActiveDataFilterItemModule,
    RedactedBarModule,
    TenantNameModule,
    TenantSelectionModule,
} from '@galileo/web_commontenant/adapter';
import { AssociatedDevicesModule, DeviceCardModule } from '@galileo/web_devices/adapter';
import { ShapesAdapterModule } from '@galileo/web_shapes/adapter';

import { ActionStoreService } from './action-store.service';
import { AppNotificationService } from './app-notification.service';
import { ChannelService } from './channel.service';
import { CoreService } from './core.service';
import { ActiveDataFiltersInjectableComponent } from './data-sharing/active-data-filters/active-data-filters.component';
import {
    HighActiveDataFilterComponent,
} from './data-sharing/active-data-filters/high-active-data-filter/high-active-data-filter.component';
import {
    LowActiveDataFilterComponent,
} from './data-sharing/active-data-filters/low-active-data-filter/low-active-data-filter.component';
import {
    MediumActiveDataFilterComponent,
} from './data-sharing/active-data-filters/medium-active-data-filter/medium-active-data-filter.component';
import { CreateDataSharingInjectableComponent } from './data-sharing/create-data-filters/create-data-filters.component';
import { ActiveFilterComponent } from './data-sharing/create-data-filters/high-filter/active-filter/active-filter.component';
import {
    PriorityActiveFilterComponent,
} from './data-sharing/create-data-filters/high-filter/active-filter/priority-active-filter/priority-active-filter.component';
import { HighFilterComponent } from './data-sharing/create-data-filters/high-filter/high-filter.component';
import {
    StringActiveFilterComponent,
} from './data-sharing/create-data-filters/high-filter/string-active-filter/string-active-filter.component';
import { LowFilterComponent } from './data-sharing/create-data-filters/low-filter/low-filter.component';
import { MediumFilterComponent } from './data-sharing/create-data-filters/medium-filter/medium-filter.component';
import { DataSharingService } from './data-sharing/data-sharing.service';
import { DataService } from './data.service';
import { EventService } from './event.service';
import { AlarmClearIconComponent } from './injectable-components/alarm-clear-icon/alarm-clear-icon.component';
import { AlarmFilterInjectableComponent } from './injectable-components/alarm-filter/alarm-filter.component';
import { AlarmListPanelComponent } from './injectable-components/alarm-list-panel/alarm-list-panel.component';
import { AlarmMediaComponent } from './injectable-components/alarm-media/alarm-media.component';
import { AlarmPriorityInjectableComponent } from './injectable-components/alarm-priority/alarm-priority.component';
import { AlarmStatusComponent } from './injectable-components/alarm-status/alarm-status.component';
import { AlarmTitleComponent } from './injectable-components/alarm-title/alarm-title.component';
import { AppNotificationComponent } from './injectable-components/app-notification/app-notification.component';
import { CardListInjectableComponent } from './injectable-components/card-list/card-list.component';
import {
    ChannelAssociationHistoryItemComponent,
} from './injectable-components/channel-association-history-item/channel-association-history-item.component';
import { CountInjectableComponent } from './injectable-components/count/count.component';
import { HistoryItemInjectableComponent } from './injectable-components/history-item/history-item.component';
import { IconInjectableComponent } from './injectable-components/icon/icon.component';
import { SimpleCardInjectableComponent } from './injectable-components/simple-card/simple-card.component';
import { MapClusterDetailsMarkerComponent } from './map/map-cluster-details-marker/map-cluster-details-marker.component';
import { MapClusterDetailsInjectableComponent } from './map/map-cluster-details/map-cluster-details.component';
import { MapClusterMarkerInjectableComponent } from './map/map-cluster-marker/map-cluster-marker.component';
import { MapMarkerInjectableComponent } from './map/map-marker/map-marker.component';
import { MapService } from './map/map.service';
import { NotificationService } from './notification.service';
import { AlarmFilterComponent } from './shared/alarm-filter/alarm-filter.component';
import { AlarmPriorityIconComponent } from './shared/alarm-priority-icon/alarm-priority-icon.component';
import { AlarmPriorityComponent } from './shared/alarm-priority/alarm-priority.component';
import { AlarmsMenuComponent } from './shared/alarms-menu/alarms-menu.component';
import { ClearAlarmsDialogComponent } from './shared/clear-alarms-dialog/clear-alarms-dialog.component';
import { DevicesMenuComponent } from './shared/devices-menu/devices-menu.component';
import { FilterComponent } from './shared/filter/filter.component';
import { HistoryItemComponent } from './shared/history-item/history-item.component';
import { IconComponent } from './shared/icon/icon.component';
import { NonClearableAlarmsComponent } from './shared/non-clearable-alarms/non-clearable-alarms.component';
import { SortingComponent } from './shared/sorting/sorting.component';
import { TombstonedService } from './tombstoned.service';
import {
    AlarmListViewSettingsComponent,
} from './views/alarm-list-view/alarm-list-view-settings/alarm-list-view-settings.component';
import { AlarmListViewComponent } from './views/alarm-list-view/alarm-list-view.component';
import { CardComponent } from './views/alarm-list-view/card/card.component';
import { BarComponent } from './views/alarm-list-view/detail-pane/bar/bar.component';
import { DetailPaneComponent } from './views/alarm-list-view/detail-pane/detail-pane.component';
import { HistoryDialogComponent } from './views/alarm-list-view/history/history-dialog/history-dialog.component';
import { HistoryComponent } from './views/alarm-list-view/history/history.component';
import { OptionPaneComponent } from './views/alarm-list-view/option-pane/option-pane.component';
import { DataAssociationSelectionService } from './data-association-selection.service';
import { MiniCardComponent } from './shared/mini-card/mini-card.component';
import { MiniCardInjectableComponent } from './injectable-components/mini-card/mini-card.component';

@NgModule({
    imports: [
        ActiveDataFilterItemModule,
        AssetPanelModule,
        AssetsAdapterModule,
        AssociatedDevicesModule,
        CommonAssociationAdapterModule,
        CommonCardModule,
        CommonChipModule,
        CommonConfirmDialogModule,
        CommonContactModule$v2,
        CommonconversationsAdapterModule,
        CommonCrossStreetModule,
        CommonDropdownModule$v2,
        CommonExpansionPanelModule,
        CommonfeatureflagsAdapterModule,
        CommonFilterModule,
        CommonInfiniteScrollPaneModule,
        CommonInputModule$v2,
        CommonKeywordsModule,
        CommonlocalizationAdapterModule,
        CommonMediaModule,
        CommonModule,
        CommonPopoverModule,
        CommonPropertiesModule,
        CommonRemarksModule,
        CompositeIcon$v2Module,
        DeviceCardModule,
        FormsModule,
        HxGNTranslateModule,
        MatCheckboxModule,
        MatDialogModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTableModule,
        OverlayModule,
        RedactedBarModule,
        ScrollingModule,
        TenantNameModule,
        TenantSelectionModule,
        TimeSinceModule,
        VariableHeightVirtualScrollStrategyModule,
        TooltipModule,
        ShapesAdapterModule,
        CommonHyperlinksModule
    ],
    declarations: [
        ActiveDataFiltersInjectableComponent,
        ActiveFilterComponent,
        AlarmFilterComponent,
        AlarmMediaComponent,
        AlarmStatusComponent,
        CardListInjectableComponent,
        ChannelAssociationHistoryItemComponent,
        CountInjectableComponent,
        CreateDataSharingInjectableComponent,
        HighActiveDataFilterComponent,
        HighFilterComponent,
        HistoryComponent,
        HistoryDialogComponent,
        HistoryItemComponent,
        HistoryItemInjectableComponent,
        IconInjectableComponent,
        LowActiveDataFilterComponent,
        LowFilterComponent,
        MediumActiveDataFilterComponent,
        MediumFilterComponent,
        PriorityActiveFilterComponent,
        SimpleCardInjectableComponent,
        StringActiveFilterComponent,
        AlarmPriorityInjectableComponent,
        ClearAlarmsDialogComponent,
        AlarmClearIconComponent,
        AlarmTitleComponent,
        AlarmPriorityComponent,
        AlarmPriorityIconComponent,
        AlarmsMenuComponent,
        NonClearableAlarmsComponent,
        DevicesMenuComponent,
        AlarmListViewComponent,
        CardComponent,
        IconComponent,
        AlarmListViewSettingsComponent,
        SortingComponent,
        FilterComponent,
        OptionPaneComponent,
        MapMarkerInjectableComponent,
        MapClusterMarkerInjectableComponent,
        MapClusterDetailsMarkerComponent,
        MapClusterDetailsInjectableComponent,
        MiniCardComponent,
        AlarmListPanelComponent,
        AlarmFilterInjectableComponent,
        DetailPaneComponent,
        BarComponent,
        AppNotificationComponent,
        MiniCardInjectableComponent
    ],
    exports: [
        CardListInjectableComponent,
        ChannelAssociationHistoryItemComponent,
        CountInjectableComponent,
        IconInjectableComponent,
        SimpleCardInjectableComponent
    ],
    providers: [
        ChannelService,
        CoreService,
        EntityHistoryStoreService$v1,
        EventService,
        DataService,
        NotificationService,
        DataSharingService,
        CommonkeywordsAdapterService$v1,
        ActionStoreService,
        CommonAdapterService$v1,
        MapService,
        TombstonedService,
        AppNotificationService,
        CommonLoggingAdapterService$v1,
        StoreService,
        {provide: 'sourceKey', useValue: 'id'},
        {provide: 'sourceType', useValue: Alarm$v1},
        DebounceDataService,
        DataAssociationSelectionService
    ]
})
export class AlarmsCoreModule extends LayoutManagerFeatureModule$v2 {

    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommonMailboxService,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private coreSrv: CoreService, // Bootstrap service
        private dataSharingSrv: DataSharingService, // Bootstrap service
        private mapSrv: MapService, // Bootstrap service
        private channelSrv: ChannelService, // Bootstrap service
        private AppNotificationSrv: AppNotificationService, // Bootstrap service
        private dataAssociationSelectionSrv: DataAssociationSelectionService // Bootstrap
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            capabilityId, LAYOUT_MANAGER_SETTINGS
        );

        this.localizationAdapter.localizeGroup(TranslationGroup.core); // Localized core tokens
    }

    /**
     * Given a string component name should return the component type.
     * A enum for possible component name has been created in Alarms-common
     */
    getComponentType(componentName: string): any {
        this.localizationAdapter.localizeGroup(TranslationGroup.main); // Localized main tokens
        switch (componentName) {
            case InjectableComponentNames.activeDataSharingComponent:
                return ActiveDataFiltersInjectableComponent;
            case InjectableComponentNames.alarmStatus:
                return AlarmStatusComponent;
            case InjectableComponentNames.alarmMedia:
                return AlarmMediaComponent;
            case InjectableComponentNames.createDataSharingComponent:
                return CreateDataSharingInjectableComponent;
            case InjectableComponentNames.alarmPriority:
                return AlarmPriorityInjectableComponent;
            case InjectableComponentNames.alarmClearIcon:
                return AlarmClearIconComponent;
            case InjectableComponentNames.alarmTitleComponent:
                return AlarmTitleComponent;
            case InjectableComponentNames.alarmFilter:
                return AlarmFilterInjectableComponent;
            case InjectableComponentNames.alarmList:
                return AlarmListViewComponent;
            case InjectableComponentNames.alarmListSettings:
                return AlarmListViewSettingsComponent;
            case InjectableComponentNames.channelAssociationHistoryItem:
                return ChannelAssociationHistoryItemComponent;
            case InjectableComponentNames.mapMarkerComponent:
                return MapMarkerInjectableComponent;
            case InjectableComponentNames.mapClusterMarkerComponent:
                return MapClusterMarkerInjectableComponent;
            case InjectableComponentNames.mapClusterDetailsComponent:
                return MapClusterDetailsInjectableComponent;
            case InjectableComponentNames.alarmPanelComponent:
                return AlarmListPanelComponent;
            case InjectableComponentNames.historyItemComponent:
                return HistoryItemInjectableComponent;
            case InjectableComponentNames.iconComponent:
                return IconInjectableComponent;
            case InjectableComponentNames.simpleCardComponent:
                return SimpleCardInjectableComponent;
            case InjectableComponentNames.cardListComponent:
                return CardListInjectableComponent;
            case InjectableComponentNames.appNotificationComponent:
                return AppNotificationComponent;
            case InjectableComponentNames.countComponent:
                return CountInjectableComponent;
            case InjectableComponentNames.miniCardComponent:
                return MiniCardInjectableComponent;
            default:
                console.error(`HxGN Connect:: alarms :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
