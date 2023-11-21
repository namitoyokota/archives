import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CommonFaultPoliciesModule, CommonHttpClient, CommonWindowCommunicationService } from '@galileo/web_common-http';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonidentityCoreModule } from '@galileo/web_commonidentity/app/_core';
import {
  CommonkeywordsAdapterModule,
  CommonkeywordsAdapterService$v1,
  CompositeIcon$v2Module,
  CompositeIconModule,
} from '@galileo/web_commonkeywords/adapter';
import { LayoutCompilerCoreModule } from '@galileo/web_commonlayoutmanager/_core';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommontenantCoreModule } from '@galileo/web_commontenant/app/_core';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { ImporterService } from './import-modules/importer.service';

// Angular
// Other
// Galileo
// Local
const appRoutes: Routes = [
    { path: '', component: AppComponent }
];

@NgModule({
    declarations: [
        AppComponent
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
        CommonkeywordsAdapterModule,
        CompositeIconModule,
        // IconManagementModule,
        CompositeIcon$v2Module
    ],
    providers: [
        HttpClient,
        CommonHttpClient,
        CommonkeywordsAdapterService$v1,
        CommonWindowCommunicationService,
        CommonidentityAdapterService$v1

    ],
    bootstrap: [AppComponent]
})
export class AppModule {

    constructor(private importer: ImporterService) { }

}
