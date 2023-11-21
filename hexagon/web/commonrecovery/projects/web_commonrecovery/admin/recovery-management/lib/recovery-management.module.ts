import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonInputModule$v2, CommonPopoverModule, CommonTabsModule } from '@galileo/web_common-libraries';
import {
    LayoutCompilerAdapterService,
    LayoutManagerFeatureModule$v2,
    MailBoxService,
} from '@galileo/web_commonlayoutmanager/adapter';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import {
    capabilityId,
    CommonMailboxService,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
} from '@galileo/web_commonrecovery/_common';
import { CommonrecoveryCoreModule, PipelineCardListModule, PipelineTableModule } from '@galileo/web_commonrecovery/_core';
import { OrganizationListModule, TenantNameModule } from '@galileo/web_commontenant/adapter';

import { GlobalManagementComponent } from './global-management/global-management.component';
import { OrganizationsManagementComponent } from './organizations-management/organizations-management.component';
import { RecoveryManagementComponent } from './recovery-management.component';

@NgModule({
    imports: [
        CommonTabsModule,
        MatDialogModule,
        CommonInputModule$v2,
        CommonPopoverModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonModule,
        OverlayModule,
        MatMenuModule,
        MatTableModule,
        MatTabsModule,
        TenantNameModule,
        OrganizationListModule,
        PipelineTableModule,
        PipelineCardListModule,
        MatProgressSpinnerModule,
        CommonrecoveryCoreModule,
        MatSlideToggleModule
    ],
    declarations: [
        GlobalManagementComponent,
        OrganizationsManagementComponent,
        RecoveryManagementComponent
    ],
    exports: [
        RecoveryManagementComponent
    ]
})
export class RecoveryManagementModule extends LayoutManagerFeatureModule$v2 {
    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommonMailboxService,
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            `${capabilityId}/admin/recoverymanagement`, LAYOUT_MANAGER_SETTINGS
        );

        this.layoutCompiler.coreIsLoadedAsync(`${capabilityId}/admin/recoverymanagement`);
    }

    /**
    * Given a string component name should return the component type.
    */
    getComponentType(componentName: string): any {
        switch (componentName) {
            case InjectableComponentNames.adminRecoveryManagement:
                return RecoveryManagementComponent;
            default:
                console.error(`HxGN Connect:: ${capabilityId}/admin/recoverymanagement :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
