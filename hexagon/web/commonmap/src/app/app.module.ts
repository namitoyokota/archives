// tslint:disable
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CommonFaultPoliciesModule, CommonHttpClient, CommonWindowCommunicationService } from '@galileo/web_common-http';
import { CommonTabsModule } from '@galileo/web_common-libraries';
import { CommonAssociationAdapterService$v1 } from '@galileo/web_commonassociation/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonidentityCoreModule } from '@galileo/web_commonidentity/app/_core';
import { LayoutCompilerCoreModule, LinkedViewService } from '@galileo/web_commonlayoutmanager/_core';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { LocationSelectModule, CommonmapAdapterModule, PinMarkerModule$v1 } from '@galileo/web_commonmap/adapter';
import { CommontenantCoreModule } from '@galileo/web_commontenant/app/_core';
import { TranslateModule } from '@ngx-translate/core';

import {
    AppComponent,
    ListComponentWrapper,
    MapConfigurationWrapperComponent,
    MapviewComponentWrapper,
    MapviewSettingsWrapperComponent,
    WazeSettingsWrapperComponent,
    WazeWrapperComponent,
} from './app.component';
import { CommonmapLinkedViewSimService } from './commonmap-linked-view-sim.service';
import { ImporterService } from './import-modules/importer.service';
import { LineTypeModule$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { LineWeightModule$v1 } from '@galileo/web_common-libraries/graphical/line-weight';
import { ColorSelectorModule$v1 } from '@galileo/web_common-libraries/graphical/color-selector';

const appRoutes: Routes = [
    { path: '', component: AppComponent }
];

@NgModule({
    declarations: [
        AppComponent,
        ListComponentWrapper,
        MapviewComponentWrapper,
        MapviewSettingsWrapperComponent,
        MapConfigurationWrapperComponent,
        WazeWrapperComponent,
        WazeSettingsWrapperComponent
    ],
    imports: [
        RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
        BrowserModule,
        LayoutCompilerCoreModule,
        BrowserAnimationsModule,
        CommonFaultPoliciesModule,
        CommonmapAdapterModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        MatTabsModule,
        CommonTabsModule,
        CommonidentityCoreModule,
        CommontenantCoreModule,
        TranslateModule.forRoot({}),
        CommontenantCoreModule,
        LineTypeModule$v1,
        LineWeightModule$v1,
        ColorSelectorModule$v1,
        LocationSelectModule,
        PinMarkerModule$v1
    ],
    providers: [
        HttpClient,
        CommonHttpClient,
        CommonAssociationAdapterService$v1,
        CommonWindowCommunicationService,
        {
            provide: LinkedViewService,
            useClass: CommonmapLinkedViewSimService
        },
        CommonidentityAdapterService$v1
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
    constructor(
        private importer: ImporterService,
        private cmnAssSvc: CommonAssociationAdapterService$v1
    ) { }
}
