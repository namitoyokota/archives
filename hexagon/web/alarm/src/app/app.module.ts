import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import {
    AlarmClearIconModule,
    AlarmFilterModule,
    AlarmMediaModule,
    AlarmPanelModule,
    AlarmPriorityModule,
    AlarmsAdapterModule,
    AlarmStatusModule,
    AlarmTitleModule,
} from '@galileo/web_alarms/adapter';
import { CommonFaultPoliciesModule, CommonHttpClient, CommonWindowCommunicationService } from '@galileo/web_common-http';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterModule, CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonidentityCoreModule } from '@galileo/web_commonidentity/app/_core';
import { LayoutCompilerCoreModule, LinkedViewService } from '@galileo/web_commonlayoutmanager/_core';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonnotificationsAdapterService$v1, NotificationBtnModule } from '@galileo/web_commonnotifications/adapter';
import { CommontenantCoreModule } from '@galileo/web_commontenant/app/_core';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { ImporterService } from './import-modules/importer.service';
import { LinkedViewSimService } from './linked-view-sim.service';

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
        CommonidentityAdapterModule,
        AlarmsAdapterModule,
        CommonfeatureflagsAdapterModule,
        AlarmStatusModule,
        AlarmMediaModule,
        AlarmPriorityModule,
        AlarmClearIconModule,
        AlarmTitleModule,
        AlarmFilterModule,
        AlarmPanelModule,
        NotificationBtnModule
    ],
    providers: [
        HttpClient,
        CommonHttpClient,
        CommonWindowCommunicationService,
        CommonidentityAdapterService$v1,
        {
            provide: LinkedViewService,
            useClass: LinkedViewSimService
        },
        CommonnotificationsAdapterService$v1
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(private importer: ImporterService) {}
}
