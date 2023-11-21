import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CommonDropdownModule$v2, CommonInputModule$v2, CommonTabsModule } from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
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
import * as Common from '@galileo/web_commonmap/_common';

import { CommonmapCoreService$v1 } from './commonmap-core.service';
import { HxDRHelperService } from './HxDRHelper.service';
import { AddressSearchComponent } from './shared/address-search/address-search.component';
import { LocationSelectInjectableComponent } from './injectable-components/location-select/location-select.component';
import { PinMarkerInjectableComponent } from './injectable-components/pin-marker/pin-marker.component';
import {
    OverlappingMarkersListInjectableComponent,
} from './injectable-components/overlapping-markers-list/overlapping-markers-list.component';
import { LayerOpacityModule } from './shared/layer-opacity/layer-opacity.module';
import { LayerPanelConfigModule } from './shared/layer-panel-config/layer-panel-config.module';
import { LayerPanelDialogComponent } from './shared/layer-panel-dialog/layer-panel-dialog.component';
import { LayerPanelModule } from './shared/layer-panel/layer-panel.module';
import { LayerPanelLayersModule } from './shared/layer-panel-layers/layer-panel-layers.module';
import { LayerZoomControlModule } from './shared/layer-zoom-control/layer-zoom-control.module';
import { DrawToolbarComponent } from './shared/map/draw-toolbar/draw-toolbar.component';
import { MapComponent$v1, MapComponentInjectable$v1 } from './shared/map/map.component';
import { OverlappingMarkerComponent } from './shared/overlapping-marker/overlapping-marker.component';
import { MapviewSettingsComponentInjectable$v1 } from './views/mapview-settings/mapview-settings.component';
import { MapviewComponentInjectable$v1 } from './views/mapview/mapview.component';
import { WazeSettingsInjectableComponent$v1 } from './views/waze-settings/waze-settings.component';
import { SafeUrlPipe } from './views/waze/safe-url-pipe.component';
import { WazeComponent$v1, WazeInjectableComponent$v1 } from './views/waze/waze.component';
import { LayerPropsCmdModule } from './shared/layer-props-cmd/layer-props-cmd.module';
import { MapLayerSelectionService$v1 } from './shared/map/map-layer-selection.service';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        LeafletModule,
        CommonDropdownModule$v2,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        MatDialogModule,
        MatTabsModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatRadioModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        CommonTabsModule,
        CommonInputModule$v2,
        LayerOpacityModule,
        LayerPanelConfigModule,
        LayerPanelModule,
        LayerPanelLayersModule,
        LayerZoomControlModule,
        CommonfeatureflagsAdapterModule,
        LayerPropsCmdModule
    ],
    declarations: [
        SafeUrlPipe,
        MapComponent$v1,
        MapComponentInjectable$v1,
        OverlappingMarkersListInjectableComponent,
        OverlappingMarkerComponent,
        MapviewComponentInjectable$v1,
        MapviewSettingsComponentInjectable$v1,
        WazeInjectableComponent$v1,
        WazeSettingsInjectableComponent$v1,
        WazeComponent$v1,
        LayerPanelDialogComponent,
        DrawToolbarComponent,
        AddressSearchComponent,
        LocationSelectInjectableComponent,
        PinMarkerInjectableComponent
    ],
    providers: [
        CommonidentityAdapterService$v1,
        MapLayerSelectionService$v1
    ],
    exports: []
})

export class CommonmapCoreModule extends LayoutManagerFeatureModule$v2 {

    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: Common.CommonmapMailboxService,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private coreSvc: CommonmapCoreService$v1, // Needed to bootstrap
        private hxdrSvc: HxDRHelperService // Needed to bootstrap
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            Common.capabilityId, Common.LAYOUT_MANAGER_SETTINGS
        );

        this.localizationAdapter.localizeGroup([Common.TranslationGroup.core, Common.TranslationGroup.shared]); // Localized core tokens

        // Load needed styles
        const head: HTMLElement = document.getElementsByTagName('head')[0];
        let style = document.createElement('link');
        style.href = 'assets/commonmap-core/styles/leaflet.draw.css';
        style.media = 'all';
        style.rel = 'stylesheet';
        style.type = 'text/css';
        head.append(style);
    }


    /**
    * Given a string component name should return the component type.
    * A enum for possible component name has been created in Commonmap-common
    */
    getComponentType(componentName: string): any {
        if (this.localizationAdapter) {
            this.localizationAdapter.localizeGroup(Common.TranslationGroup.main); // Localized main tokens
        }
        switch (componentName) {
            case Common.InjectableComponentNames.MapComponent:
                return MapComponentInjectable$v1;
            case Common.InjectableComponentNames.MapviewComponent:
                return MapviewComponentInjectable$v1;
            case Common.InjectableComponentNames.OverlappingMarkersListComponent:
                return OverlappingMarkersListInjectableComponent;
            case Common.InjectableComponentNames.MapviewSettingsComponent:
                return MapviewSettingsComponentInjectable$v1;
            case Common.InjectableComponentNames.WazeInjectableComponent$v1:
                return WazeInjectableComponent$v1;
            case Common.InjectableComponentNames.WazeSettingsInjectableComponent$v1:
                return WazeSettingsInjectableComponent$v1;
            case Common.InjectableComponentNames.LocationSelectComponent:
                return LocationSelectInjectableComponent;
            case Common.InjectableComponentNames.PinMarkerComponent:
                return PinMarkerInjectableComponent;
        }
    }
}
