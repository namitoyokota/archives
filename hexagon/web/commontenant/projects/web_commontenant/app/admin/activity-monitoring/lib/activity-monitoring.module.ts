import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CommonInputModule$v2, CommonPopoverModule } from '@galileo/web_common-libraries';
import { PatProgressBarModule } from '@galileo/web_commonidentity/adapter';
import {
    LayoutCompilerAdapterService,
    LayoutManagerFeatureModule$v2,
    MailBoxService,
} from '@galileo/web_commonlayoutmanager/adapter';
import { DataUsageModule } from '@galileo/web_commonlicensing/adapter/data-usage';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import {
    CommontenantMailboxService,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
} from '@galileo/web_commontenant/_common';
import { OrganizationListModule, TenantIconModule } from '@galileo/web_commontenant/app/_core';

import { ActivityMonitoringComponent } from './activity-monitoring.component';
import {
    SystemActivityEmailsDialogComponent,
} from './system-activity-emails-dialog/system-activity-emails-dialog.component';

@NgModule({
    declarations: [
        ActivityMonitoringComponent,
        SystemActivityEmailsDialogComponent
    ],
    imports: [
        CommonInputModule$v2,
        CommonlocalizationAdapterModule,
        CommonModule,
        CommonPopoverModule,
        DataUsageModule,
        FormsModule,
        HxGNTranslateModule,
        MatProgressSpinnerModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTableModule,
        PatProgressBarModule,
        TenantIconModule,
        OrganizationListModule,
        OverlayModule
    ],
    exports: [
        ActivityMonitoringComponent
    ]
})
export class CommontenantActivityMonitoringModule extends LayoutManagerFeatureModule$v2 {
    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommontenantMailboxService
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            `@hxgn/commontenant/admin/activitymonitoring`, LAYOUT_MANAGER_SETTINGS
        );

        this.layoutCompiler.coreIsLoadedAsync(`@hxgn/commontenant/admin/activitymonitoring`);
    }

    /**
   * Given a string component name should return the component type.
   */
    getComponentType(componentName: string): any {
        switch (componentName) {
            case InjectableComponentNames.ActivityMonitoringComponent:
                return ActivityMonitoringComponent;
            default:
                console.error(`HxGN Connect:: activity monitoring admin :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
