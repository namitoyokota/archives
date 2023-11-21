import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonFaultPoliciesModule, CommonHttpClient, CommonWindowCommunicationService } from '@galileo/web_common-http';
import { CommonConstants, CommonDropdownModule$v2, CommonTabsModule } from '@galileo/web_common-libraries';
import { ChannelBtnModule, ChatBtnModule, CommonconversationsAdapterModule } from '@galileo/web_commonconversations/adapter';
import { CommonfeatureflagsAdapterModule, CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { ClaimGuard$v1, CommonidentityAdapterModule } from '@galileo/web_commonidentity/adapter';
import { CommonidentityCoreModule } from '@galileo/web_commonidentity/app/_core';
import { LayoutCompilerCoreModule, LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';
import { CommonlocalizationCoreModule } from '@galileo/web_commonlocalization/_core';
import {
    capabilityId as CommonLocalizationCapabilityId,
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonnotificationsAdapterModule, NotificationBtnModule } from '@galileo/web_commonnotifications/adapter';
import { CommontenantCoreModule } from '@galileo/web_commontenant/app/_core';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutCompilerComponent } from 'src/app/layout-compiler/layout-compiler.component';
import { RenderModule } from 'src/app/layout-compiler/render/render.module';
import { TenantMenuModule } from 'src/app/tenant-menu/tenant-menu.module';

import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import { DirtyGuard$v1 } from './admin/dirty-guard.v1.service';
import { AppBarModule } from './app-bar/app-bar.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelpPageModule } from './help-page/help-page.module';
import { ImporterService } from './import-modules/importer.service';
import { LayoutCompilerService } from './layout-compiler/layout-compiler.service';
import { LoaderComponent } from './layout-compiler/loader/loader.component';
import {
    PopUpBlockerNotificationComponent,
} from './layout-compiler/pop-up-blocker-notification/pop-up-blocker-notification.component';
import { ScreenComponent } from './layout-compiler/screen/screen.component';
import { WorkspaceSettingsComponent } from './layout-compiler/workspace-settings/workspace-settings.component';
import { LicenseIssueComponent } from './license-issue/license-issue.component';
import { NotificationService } from './notification.service';
import { OnboardingPendingComponent } from './onboarding-pending/onboarding-pending.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TranslationGroup } from './translation-groups';
import { UserIssueComponent } from './user-issue/user-issue.component';
import { UserProfileModule } from './user-profile/user-profile.module';
import { WebRootConstants } from './webroot.constants';
import { AppSettingsService$v1 } from './app-settings/app-settings-service.v1';

import {
    TooltipModule,
    CommonOpenUserProfileModule
} from '@galileo/web_common-libraries';
import { MainMenuModule } from './main-menu/main-menu.module';


@NgModule({
    declarations: [
        AppComponent,
        LayoutCompilerComponent,
        ScreenComponent,
        WorkspaceSettingsComponent,
        PopUpBlockerNotificationComponent,
        AboutDialogComponent,
        LoaderComponent,
        PageNotFoundComponent,
        OnboardingPendingComponent,
        LicenseIssueComponent,
        UserIssueComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        LayoutCompilerCoreModule,
        AppRoutingModule,
        MatTabsModule,
        RenderModule,
        CommonFaultPoliciesModule,
        MainMenuModule,
        CommonTabsModule,
        CommonDropdownModule$v2,
        TranslateModule.forRoot({}),
        MatSliderModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        CommonidentityCoreModule,
        CommonidentityAdapterModule,
        CommontenantCoreModule,
        HelpPageModule,
        MatMenuModule,
        TenantMenuModule,
        MatDialogModule,
        MatButtonModule,
        CommonlocalizationCoreModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        AppBarModule,
        UserProfileModule,
        CommonfeatureflagsAdapterModule,
        CommonconversationsAdapterModule,
        ChannelBtnModule,
        ChatBtnModule,
        CommonnotificationsAdapterModule,
        NotificationBtnModule,
        TooltipModule,
        CommonOpenUserProfileModule
    ],
    providers: [
        HttpClient,
        CommonWindowCommunicationService,
        CommonHttpClient,
        {
            provide: CommonConstants,
            useValue: WebRootConstants
        },
        LayoutCompilerService,
        ClaimGuard$v1,
        NotificationService,
        DirtyGuard$v1,
        AppSettingsService$v1
    ],
    bootstrap: [AppComponent],
    exports: [
        ScreenComponent
    ]
})
export class AppModule {

    constructor(private windowCommSrv: CommonWindowCommunicationService,
        private layoutCoreSrv: LayoutCompilerCoreService,
        private notificationSrv: NotificationService,
        private importerSrv: ImporterService,
        private featureFlags: CommonfeatureflagsAdapterService$v1,
        private localizationAdapter: CommonlocalizationAdapterService$v1) {
        // Localization core is loaded at compile time. Let the runtime know about it.
        layoutCoreSrv.loadedModuleRefIds
            .push(CommonLocalizationCapabilityId);

        this.localizationAdapter.localizeGroup(TranslationGroup.main);
    }
}
