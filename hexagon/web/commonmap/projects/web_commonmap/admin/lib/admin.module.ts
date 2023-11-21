import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import {
    CommonDropdownModule$v2,
    CommonTabsModule,
    CommonExpansionPanelModule,
    CommonInputModule$v2,
    CommonColorPickerModule
} from '@galileo/web_common-libraries';
import { CommontenantAdapterModule, CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CommonlocalizationAdapterModule, CommonlocalizationAdapterService$v1, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { CommonMapConfigurationComponent } from './commonmap-config/commonmap-config.component';
import { MapConfigurationComponent } from './map-config/map-configuration.component';
import { LayersPaneComponent } from './layers-pane/layers-pane.component';
import { PresetsPaneComponent } from './presets-pane/presets-pane.component';
import { LayerPropertiesComponent } from './layer-properties/layer-properties.component';
import { NewLayerDialogComponent } from './new-layer-dialog/new-layer-dialog.component';
import { NewEditPresetDialogComponent } from './new-edit-preset-dialog/new-edit-preset-dialog.component';
import { CloneLayerMapPresetDialogComponent } from './clone-layer-map-preset-dialog/clone-layer-map-preset-dialog.component';
import { ConfirmDiscardChangesDialogComponent } from './confirm-discard-changes-dialog/confirm-discard-changes-dialog.component';
import { ConfirmDiscardChangesService } from './confirm-discard-changes-dialog/confirm-discard-changes.service';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmDeleteService } from './confirm-delete-dialog/confirm-delete.service';
import { DeletedPresetLayersDialogComponent } from './deleted-preset-layers-dialog/deleted-preset-layers-dialog.component';
import { LocalAccessOnlyComponent } from './local-access-only/local-access-only.component';
import { AutoRefreshComponent } from './auto-refresh/auto-refresh.component';
import { CommonmapAdminService } from './admin.service';
import { NewLayerService } from './new-layer-dialog/new-layer.service';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';

import {
    CommonmapDataService$v1,
    LayerOpacityModule,
    LayerZoomControlModule,
    LayerPanelConfigModule,
    LayerPropsCmdModule,
    MapLayerSelectionService$v1,
    MapDisplayPropertiesModule
} from '@galileo/web_commonmap/_core';

import { URLParamsComponent } from './url-params/url-params.component';
import { URLControlComponent } from './url-control/url-control.component';
import { URLSubdomainsComponent } from './url-subdomains/url-subdomains.component';
import { CoordSystemsControlComponent } from './coord-systems-control/coord-systems-control.component';
import { ProcessingPaneComponent } from './processing-pane/processing-pane.component';
import { LayerPropertiesWMSComponent } from './layer-properties-wms/layer-properties-wms.component';
import { LayerPropertiesWFSComponent } from './layer-properties-wfs/layer-properties-wfs.component';
import { LayerPropertiesWMTSComponent } from './layer-properties-wmts/layer-properties-wmts.component';
import { LayerPropertiesHxCPWMSComponent } from './layer-properties-hxcpWMS/layer-properties-hxcpWMS.component';
import { LayerPropertiesHxCPWMTSComponent } from './layer-properties-hxcpWMTS/layer-properties-hxcpWMTS.component';
import { LayerPropertiesTileComponent } from './layer-properties-tile/layer-properties-tile.component';
import { LayerPropertiesGeoJSONComponent } from './layer-properties-geojson/layer-properties-geojson.component';
import { LayerPropertiesHxDRWMSComponent } from './layer-properties-hxdrWMS/layer-properties-hxdrWMS.component';
import { AuthParamsHxCPComponent } from './auth-params-hxcp/auth-params-hxcp.component';
import { AuthParamsHxDRComponent } from './auth-params-hxdr/auth-params-hxdr.component';
import { AdminCompCardComponent } from './admin-comp-card/admin-comp-card.component';
import { TranslationGroup } from '@galileo/web_commonmap/_common';
import { LayoutManagerFeatureModule$v2, MailBoxService } from '@galileo/web_commonlayoutmanager/adapter';
import { VectorStylesModule } from './vector-styles/vector-styles.module';
import {
    capabilityId,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
    CommonmapMailboxService
} from '@galileo/web_commonmap/_common';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { DropdownTreeComponent } from './dropdown-tree/dropdown-tree.component';
import { HxDRLayerExplorerComponent } from './hxdr-layer-explorer/hxdr-layer-explorer.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        LeafletModule,
        CommonDropdownModule$v2,
        CommonlocalizationAdapterModule,
        CommonColorPickerModule,
        HxGNTranslateModule,
        CommonExpansionPanelModule,
        MatTabsModule,
        MatInputModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatRadioModule,
        CommonTabsModule,
        CommonInputModule$v2,
        MatDialogModule,
        MatMenuModule,
        LayerOpacityModule,
        LayerZoomControlModule,
        LayerPanelConfigModule,
        CommontenantAdapterModule,
        MatTreeModule,
        MatIconModule,
        CommonfeatureflagsAdapterModule,
        LayerPropsCmdModule,
        VectorStylesModule,
        MapDisplayPropertiesModule
    ],
    declarations: [
        MapConfigurationComponent,
        CommonMapConfigurationComponent,
        LayersPaneComponent,
        PresetsPaneComponent,
        LayerPropertiesComponent,
        LayerPropertiesWMSComponent,
        LayerPropertiesWFSComponent,
        LayerPropertiesWMTSComponent,
        LayerPropertiesTileComponent,
        LayerPropertiesGeoJSONComponent,
        LayerPropertiesHxCPWMSComponent,
        LayerPropertiesHxCPWMTSComponent,
        LayerPropertiesHxDRWMSComponent,
        AuthParamsHxDRComponent,
        AuthParamsHxCPComponent,
        LocalAccessOnlyComponent,
        NewLayerDialogComponent,
        NewEditPresetDialogComponent,
        CloneLayerMapPresetDialogComponent,
        ConfirmDiscardChangesDialogComponent,
        ConfirmDeleteDialogComponent,
        DeletedPresetLayersDialogComponent,
        ProcessingPaneComponent,
        URLParamsComponent,
        URLControlComponent,
        URLSubdomainsComponent,
        CoordSystemsControlComponent,
        AdminCompCardComponent,
        DropdownTreeComponent,
        HxDRLayerExplorerComponent,
        AutoRefreshComponent
    ],
    providers: [
        CommonmapAdminService,
        ConfirmDiscardChangesService,
        ConfirmDeleteService,
        NewLayerService,
        MapLayerSelectionService$v1,
        CommonmapDataService$v1,
        CommontenantAdapterService$v1,
        { provide: MatDialogRef, useValue: {} }
    ],
    exports: [MapConfigurationComponent]
})
export class CommonmapAdminModule extends LayoutManagerFeatureModule$v2 {
    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommonmapMailboxService
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            `${capabilityId}/admin`, LAYOUT_MANAGER_SETTINGS
        );

        this.layoutCompiler.coreIsLoadedAsync(`${capabilityId}/admin`);
        this.localizationAdapter.localizeGroup([TranslationGroup.admin, TranslationGroup.shared, TranslationGroup.core] ); // Localized admin tokens
        // // Load needed styles
        // const head: HTMLElement = document.getElementsByTagName('head')[0];
        // const contextMenuStyle = document.createElement('link');
        // contextMenuStyle.href = 'assets/commonmap-core/styles/leaflet.contextmenu.css';
        // contextMenuStyle.media = 'all';
        // contextMenuStyle.rel = 'stylesheet';
        // contextMenuStyle.type = 'text/css';
        // head.append(contextMenuStyle);
    }

   /**
    * Given a string component name should return the component type.
    */
   getComponentType(componentName: string): any {
    switch (componentName) {
        case InjectableComponentNames.MapConfigurationComponent:
          return MapConfigurationComponent;
        default:
            console.error(`HxGN Connect:: ${capabilityId}/admin :: Cannot find component for ${componentName}`);
            return null;
    }
  }
}
