import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CommonFaultPoliciesModule, CommonHttpClient, CommonWindowCommunicationService } from '@galileo/web_common-http';
import {
  CommonfeatureflagsAdapterModule,
  FeatureFlagGlobalEditorModule,
  FeatureFlagGroupsMenuModule,
  FeatureFlagTenantEditorModule,
} from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterModule, CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonidentityCoreModule } from '@galileo/web_commonidentity/app/_core';
import { LayoutCompilerCoreModule } from '@galileo/web_commonlayoutmanager/_core';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommontenantCoreModule } from '@galileo/web_commontenant/app/_core';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { ImporterService } from './import-modules/importer.service';
import {
  ProxyExampleComponent,
  ProxyExampleComponent_boldText,
  ProxyExampleComponent_proxy,
} from './proxy-component-example/proxy-component-example';

const appRoutes: Routes = [
    { path: '', component: AppComponent }
];

@NgModule({
    declarations: [
        AppComponent,
        ProxyExampleComponent,
        ProxyExampleComponent_proxy,
        ProxyExampleComponent_boldText
    ],
    imports: [
        RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
        BrowserModule,
        BrowserAnimationsModule,
        LayoutCompilerCoreModule,
        CommonFaultPoliciesModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        TranslateModule.forRoot({}),
        CommonidentityCoreModule,
        CommontenantCoreModule,
        CommonidentityAdapterModule,
        CommonfeatureflagsAdapterModule,
        FeatureFlagGlobalEditorModule,
        FeatureFlagTenantEditorModule,
        FeatureFlagGroupsMenuModule
    ],
    providers: [
        HttpClient,
        CommonHttpClient,
        CommonWindowCommunicationService,
        CommonidentityAdapterService$v1
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(private importer: ImporterService) { }
}
