import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CommonFaultPoliciesModule, CommonHttpClient, CommonWindowCommunicationService } from '@galileo/web_common-http';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonidentityCoreModule } from '@galileo/web_commonidentity/app/_core';
import { LayoutCompilerCoreModule } from '@galileo/web_commonlayoutmanager/_core';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import {
  CommontenantAdapterModule,
  OrganizationListModule,
  OrganizationSelectModule$v2,
  TenantNameModule,
  TenantSelectionModule,
} from '@galileo/web_commontenant/adapter';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { ImporterService } from './import-modules/importer.service';

// import {
//     OnboardingModule
// } from '@galileo/web_commontenant/app/_core';


const appRoutes: Routes = [
    { path: '', component: AppComponent }
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        RouterModule.forRoot(appRoutes),
        BrowserModule,
        BrowserAnimationsModule,
        LayoutCompilerCoreModule,
        CommonFaultPoliciesModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        TranslateModule.forRoot({}),
        CommontenantAdapterModule,
        CommonidentityCoreModule,
        // CommonChipModule,
        BrowserAnimationsModule,
        TenantNameModule,
        TenantSelectionModule,
        // OnboardingModule,
        // RedactedBarModule,
        OrganizationSelectModule$v2,
        OrganizationListModule
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
    constructor(private importer: ImporterService) {}
}
