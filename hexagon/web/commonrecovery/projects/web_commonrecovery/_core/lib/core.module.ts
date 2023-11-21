import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonConfirmDialogModule, CommonInputModule$v2, CommonPopoverModule } from '@galileo/web_common-libraries';
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
import {
    capabilityId,
    CommonMailboxService,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
    TranslationGroup,
} from '@galileo/web_commonrecovery/_common';

import { CoreService } from './core.service';
import { EventService } from './event.service';
import { TenantRecoveryComponent } from './injectable-component/tenant-recovery/tenant-recovery.component';
import { NotificationService } from './notification.service';
import { PipelineCardListModule } from './shared/pipeline-card-list/pipeline-card-list.module';
import { PipelineTableModule } from './shared/pipeline-table/pipeline-table.module';
import { SettingsDialogModule } from './shared/settings-dialog/settings-dialog.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        MatDialogModule,
        CommonInputModule$v2,
        OverlayModule,
        CommonPopoverModule,
        CommonConfirmDialogModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        PipelineTableModule,
        PipelineCardListModule,
        MatProgressSpinnerModule,
        SettingsDialogModule
    ],
    declarations: [TenantRecoveryComponent],
    exports: [],
    providers: [
        CoreService,
        EventService,
        NotificationService
    ]
})
export class CommonrecoveryCoreModule extends LayoutManagerFeatureModule$v2 {

    constructor(protected layoutCompiler: LayoutCompilerAdapterService,
                protected componentFactoryResolver: ComponentFactoryResolver,
                protected injector: Injector,
                protected mailbox: CommonMailboxService,
                private notificationSrv: NotificationService,
                private coreSrv: CoreService, // Bootstrap service
                private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            capabilityId, LAYOUT_MANAGER_SETTINGS
        );

        this.localizationAdapter.localizeGroup(TranslationGroup.core);
    }

    /**
     * Given a string component name should return the component type.
     * A enum for possible component name has been created in Commonrecovery-common
     */
    getComponentType(componentName: string): any {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.common,
            TranslationGroup.main
        ]);

        switch (componentName) {
            case InjectableComponentNames.tenantManagementComponent:
                return TenantRecoveryComponent;
            default:
                throw Error('Component mapping not found for ' + componentName);
        }
    }
}
