import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  CommonCardModule,
  CommonChipModule,
  CommonContactModule$v2,
  CommonDescriptionModule,
  CommonDropdownModule$v2,
  CommonExpansionPanelModule,
  CommonFilterModule,
  CommonInfiniteScrollPaneModule,
  CommonInputModule$v2,
  CommonKeywordsModule,
  CommonPopoverModule,
  EntityHistoryStoreService$v1,
  TimeSinceModule,
  VariableHeightVirtualScrollStrategyModule,
} from '@galileo/web_common-libraries';
import { CommonPropertiesModule } from '@galileo/web_common-libraries/common-properties';
import { CommonAdapterService$v1 } from '@galileo/web_common/adapter';
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
import {
  ActiveDataFilterItemModule,
  RedactedBarModule,
  TenantNameModule,
  TenantSelectionModule,
} from '@galileo/web_commontenant/adapter';
import {
  capabilityId,
  CommonMailboxService,
  InjectableComponentNames,
  LAYOUT_MANAGER_SETTINGS,
  TranslationGroup,
} from '@galileo/web_shapes/_common';

import { ActionStoreService } from './action-store.service';
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
import { HighFilterComponent } from './data-sharing/create-data-filters/high-filter/high-filter.component';
import {
  StringActiveFilterComponent,
} from './data-sharing/create-data-filters/high-filter/string-active-filter/string-active-filter.component';
import { LowFilterComponent } from './data-sharing/create-data-filters/low-filter/low-filter.component';
import { MediumFilterComponent } from './data-sharing/create-data-filters/medium-filter/medium-filter.component';
import { AppNotificationComponent } from './injectable-component/app-notification/app-notification.component';
import { CardListInjectableComponent } from './injectable-component/card-list/card-list.component';
import { CountInjectableComponent } from './injectable-component/count/count.component';
import { HistoryItemInjectableComponent } from './injectable-component/history-item/history-item.component';
import { IconInjectableComponent } from './injectable-component/icon/icon.component';import { SimpleCardInjectableComponent } from './injectable-component/simple-card/simple-card.component';
import { MapService } from './map.service';
import { NotificationService } from './notification.service';
import { CreateEditComponent } from './shared/create-edit-dialog/create-edit-dialog.component';
import { FilterComponent } from './shared/filter/filter.component';
import { HistoryItemComponent } from './shared/history-item/history-item.component';
import { MapPreviewModule } from './shared/map-preview/map-preview.module';
import { ShapeEditorModule } from './shared/shape-editor/shape-editor.module';
import { ShapeIconModule } from './shared/shape-icon/shape-icon.module';
import { SortingComponent } from './shared/sorting/sorting.component';
import { TombstonedService } from './tombstoned.service';
import { CardComponent } from './views/list-view/card/card.component';
import { DetailPaneComponent } from './views/list-view/detail-pane/detail-pane.component';
import { HistoryDialogComponent } from './views/list-view/history/history-dialog/history-dialog.component';
import { HistoryComponent } from './views/list-view/history/history.component';
import { ListViewSettingsComponent } from './views/list-view/list-view-settings/list-view-settings.component';
import { ListViewComponent } from './views/list-view/list-view.component';
import { OptionPaneComponent } from './views/list-view/option-pane/option-pane.component';
import { CommonconversationsAdapterModule } from '@galileo/web_commonconversations/adapter';
import { ChannelAssociationHistoryItemComponent } from './injectable-component/channel-association-history-item/channel-association-history-item.component';
import { AppNotificationService } from './app-notification.service';
import { CommonHyperlinksModule } from '@galileo/web_common-libraries/common-hyperlinks';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';
import { DataAssociationSelectionService } from './data-association-selection.service';
import {
  CommonAssociationAdapterModule,
  LinkedDataModule$v1,
  ShapeWithManyAdapterService$v1
} from '@galileo/web_commonassociation/adapter';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    CommonCardModule,
    ShapeIconModule,
    CommonlocalizationAdapterModule,
    HxGNTranslateModule,
    CommonContactModule$v2,
    CommonDescriptionModule,
    TenantNameModule,
    CommonFilterModule,
    TenantSelectionModule,
    CommonExpansionPanelModule,
    CommonDropdownModule$v2,
    ScrollingModule,
    VariableHeightVirtualScrollStrategyModule,
    MatSlideToggleModule,
    CommonKeywordsModule,
    CommonPropertiesModule,
    ShapeEditorModule,
    MapPreviewModule,
    MatDialogModule,
    CommonPopoverModule,
    OverlayModule,
    MatCheckboxModule,
    CommonChipModule,
    CommonInputModule$v2,
    ActiveDataFilterItemModule,
    RedactedBarModule,
    CommonInfiniteScrollPaneModule,
    TimeSinceModule,
    MatProgressSpinnerModule,
    CommonconversationsAdapterModule,
    CommonHyperlinksModule,
    CommonfeatureflagsAdapterModule,
    CommonAssociationAdapterModule,
    LinkedDataModule$v1
  ],
  declarations: [
    ListViewComponent,
    CardComponent,
    DetailPaneComponent,
    OptionPaneComponent,
    FilterComponent,
    SortingComponent,
    CountInjectableComponent,
    ListViewSettingsComponent,
    CreateEditComponent,
    CreateDataSharingInjectableComponent,
    HighFilterComponent,
    MediumFilterComponent,
    LowFilterComponent,
    ActiveFilterComponent,
    StringActiveFilterComponent,
    HighActiveDataFilterComponent,
    MediumActiveDataFilterComponent,
    LowActiveDataFilterComponent,
    ActiveDataFiltersInjectableComponent,
    SimpleCardInjectableComponent,
    CardListInjectableComponent,
    IconInjectableComponent,
    HistoryComponent,
    HistoryDialogComponent,
    HistoryItemComponent,
    HistoryItemInjectableComponent,
    ChannelAssociationHistoryItemComponent,
    AppNotificationComponent
  ],
  exports: [],
  providers: [
    CoreService,
    MapService,
    ActionStoreService,
    CommonAdapterService$v1,
    TombstonedService,
    ChannelService,
    EntityHistoryStoreService$v1,
    AppNotificationService,
    DataAssociationSelectionService,
    ShapeWithManyAdapterService$v1
  ]
})
export class ShapesCoreModule extends LayoutManagerFeatureModule$v2 {

  constructor(
    protected layoutCompiler: LayoutCompilerAdapterService,
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected injector: Injector,
    protected mailbox: CommonMailboxService,
    private localizationAdapter: CommonlocalizationAdapterService$v1,
    private coreSrv: CoreService, // Bootstrap service
    private mapSrv: MapService,  // Bootstrap service
    private channelService: ChannelService, // Bootstrap
    private appNotificationSrv: AppNotificationService, // Bootstrap
    private dataAssociationSelectionSrv: DataAssociationSelectionService // Bootstrap
  ) {
    super(
      layoutCompiler,
      componentFactoryResolver,
      injector,
      mailbox as MailBoxService,
      capabilityId,
      LAYOUT_MANAGER_SETTINGS
    );

    this.localizationAdapter.localizeGroup(TranslationGroup.main); // Localized main tokens
  }

  /**
   * Given a string component name should return the component type.
   * A enum for possible component name has been created in Shapes/_common
   */
  getComponentType(componentName: string): any {
    switch (componentName) {
      case InjectableComponentNames.list:
        return ListViewComponent;
      case InjectableComponentNames.countComponent:
        return CountInjectableComponent;
      case InjectableComponentNames.listSettings:
        return ListViewSettingsComponent;
      case InjectableComponentNames.createDataSharingComponent:
        return CreateDataSharingInjectableComponent;
      case InjectableComponentNames.activeDataSharingComponent:
        return ActiveDataFiltersInjectableComponent;
      case InjectableComponentNames.appNotificationComponent:
        return AppNotificationComponent;
      case InjectableComponentNames.iconComponent:
        return IconInjectableComponent;
      case InjectableComponentNames.simpleCardComponent:
        return SimpleCardInjectableComponent;
      case InjectableComponentNames.cardListComponent:
        return CardListInjectableComponent;
      case InjectableComponentNames.historyItemComponent:
        return HistoryItemInjectableComponent;
      case InjectableComponentNames.channelAssociatedHistoryItem:
        return ChannelAssociationHistoryItemComponent;
      default:
        console.error(`HxGN Connect:: shapes :: Cannot find component for ${componentName}`);
        return null;
    }
  }
}
