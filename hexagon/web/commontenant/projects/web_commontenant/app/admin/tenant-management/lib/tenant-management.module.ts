import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
    CommonConfirmDialogModule,
    CommonDropdownModule$v2,
    CommonExpansionPanelModule,
    CommonInputModule$v2,
    FileUploadModule,
} from '@galileo/web_common-libraries';
import {
    CommonfeatureflagsAdapterModule,
    FeatureFlagGlobalEditorModule,
    FeatureFlagTenantEditorModule,
} from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import {
    LayoutCompilerAdapterService,
    LayoutManagerFeatureModule$v2,
    MailBoxService,
} from '@galileo/web_commonlayoutmanager/adapter';
import { UpsertServerEntityModule } from '@galileo/web_commonlicensing/adapter';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import {
    AwayModeSettingsModule
} from '@galileo/web_commonidentity/adapter';

import {
    CommontenantMailboxService,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
} from '@galileo/web_commontenant/_common';
import {
    IndustriesSelectorModule,
    OrganizationListModule,
    NetworkListModule,
    TenantIconModule,
    TenantMapModule
} from '@galileo/web_commontenant/app/_core';

import { AddTenantDialogComponent } from './add-tenant-dialog/add-tenant-dialog.component';
import { ApplicationSelectionComponent } from './application-selection/application-selection.component';
import { EditTenantComponent } from './edit-tenant/edit-tenant.component';
import { ExperimentalFeaturesDialogComponent } from './experimental-features-dialog/experimental-features-dialog.component';
import { GlobalFeaturesDialogComponent } from './global-features-dialog/global-features-dialog.component';
import { SendInvitationEmailBtnComponent } from './send-invitation-email-btn/send-invitation-email-btn.component';
import { TenantManagementComponent } from './tenant-management.component';
import { UploadLicencingDialogComponent } from './upload-licensing-dialog/upload-licensing-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TooltipModule } from '@galileo/web_common-libraries';


@NgModule({
    imports: [
        CommonConfirmDialogModule,
        CommonDropdownModule$v2,
        CommonExpansionPanelModule,
        CommonInputModule$v2,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonModule,
        FileUploadModule,
        FormsModule,
        MatCheckboxModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        TenantMapModule,
        IndustriesSelectorModule,
        TenantIconModule,
        UpsertServerEntityModule,
        FeatureFlagTenantEditorModule,
        FeatureFlagGlobalEditorModule,
        CommonfeatureflagsAdapterModule,
        OrganizationListModule,
        NetworkListModule,
        MatSnackBarModule,
        TooltipModule,
        AwayModeSettingsModule
    ],
    declarations: [
        GlobalFeaturesDialogComponent,
        AddTenantDialogComponent,
        TenantManagementComponent,
        SendInvitationEmailBtnComponent,
        EditTenantComponent,
        UploadLicencingDialogComponent,
        ApplicationSelectionComponent,
        ExperimentalFeaturesDialogComponent
    ],
    exports: [
        TenantManagementComponent
    ],
    providers: [
        CommonidentityAdapterService$v1
    ]
})
export class CommontenantManagementModule extends LayoutManagerFeatureModule$v2 {
    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommontenantMailboxService
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            `@hxgn/commontenant/admin/tenantmanagement`, LAYOUT_MANAGER_SETTINGS
        );

        this.layoutCompiler.coreIsLoadedAsync(`@hxgn/commontenant/admin/tenantmanagement`);
    }

    /**
   * Given a string component name should return the component type.
   */
    getComponentType(componentName: string): any {
        switch (componentName) {
            case InjectableComponentNames.TenantManagementComponent:
                return TenantManagementComponent;
            default:
                console.error(`HxGN Connect:: tenant management admin :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
