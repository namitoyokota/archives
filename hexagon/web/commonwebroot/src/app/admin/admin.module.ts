import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {
    CommonPopoverModule,
    CommonTabsModule,
    CommonUnsavedChangesDialogModule,
    CommonOpenUserProfileModule
} from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';
import { ClaimGuard$v1, CommonidentityAdapterModule, UserIconModule$v2 } from '@galileo/web_commonidentity/adapter';
import { DashboardModule } from '@galileo/web_commonlicensing/adapter';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { TenantNameModule } from '@galileo/web_commontenant/adapter';

import { HelpPageModule } from '../help-page/help-page.module';
import { MainMenuModule } from '../main-menu/main-menu.module';
import { TenantMenuModule } from '../tenant-menu/tenant-menu.module';
import { TranslationGroup } from '../translation-groups';
import { ActionItemsTableComponent } from './admin-hub/action-items-table/action-items-table.component';
import { AdminHubComponent } from './admin-hub/admin-hub.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminMenuComponent } from './admin-shell/admin-menu/admin-menu.component';
import { AdminShellComponent } from './admin-shell/admin-shell.component';
import { HelpMenuComponent } from './admin-shell/help-menu/help-menu.component';
import { AdminWrapperComponent } from './admin-wrapper.component';
import { AdminService } from './admin.service';
import { ExpirationPipe } from './expiration.pipe';

@NgModule({
    imports: [
        CommonModule,
        AdminRoutingModule,
        MainMenuModule,
        HelpPageModule,
        TenantMenuModule,
        CommonidentityAdapterModule,
        MatTableModule,
        MatSortModule,
        MatProgressSpinnerModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonfeatureflagsAdapterModule,
        CommonTabsModule,
        DashboardModule,
        MatTabsModule,
        TenantNameModule,
        UserIconModule$v2,
        CommonUnsavedChangesDialogModule,
        CommonPopoverModule,
        OverlayModule,
        CommonOpenUserProfileModule
    ],
    providers: [
        AdminService,
        ClaimGuard$v1
    ],
    declarations: [
        AdminShellComponent,
        AdminHubComponent,
        AdminMenuComponent,
        ExpirationPipe,
        ActionItemsTableComponent,
        HelpMenuComponent,
        AdminWrapperComponent
    ]
})
export class AdminModule {

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup(TranslationGroup.admin);
    }
}
