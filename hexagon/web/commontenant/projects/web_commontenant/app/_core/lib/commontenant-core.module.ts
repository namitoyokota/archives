import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { CommonInputModule$v2 } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
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
  CommontenantMailboxService,
  InjectableComponentNames,
  LAYOUT_MANAGER_SETTINGS,
  moduleRefId,
  TranslationGroup,
} from '@galileo/web_commontenant/_common';

import { IconListComponent } from '../lib/shared/tenant-icon-list/tenant-icon-list.component';
import { TenantIconModule } from '../lib/shared/tenant-icon/tenant-icon.module';
import { CoreService } from './core.service';
import { LocationMarkerInjectableComponent } from './injectable-components/location-marker/location-marker.component';
import { NetworkListInjectableComponent } from './injectable-components/network-list/network-list.component';
import {
  OnboardingInjectableComponent,
} from './injectable-components/onboarding-injectable/onboarding-injectable.component.v1';
import { OrganizationListInjectableComponent } from './injectable-components/organization-list/organization-list.component';
import {
  OrganizationSelectInjectableComponent$v2,
} from './injectable-components/organization-select-v2/organization-select.v2.component';
import { TenantIconListInjectableComponent } from './injectable-components/tenant-icon-list/tenant-icon-list.component';
import { NotificationService } from './notification.service';
import { NetworkListModule } from './shared/network-list/network-list.module';
import { OrganizationListModule } from './shared/organization-list/organization-list.module';
import { OrganizationSelectComponent$v2 } from './shared/organization-select-v2/organization-select.v2.component';
import { CountDownComponent } from './shared/refresh-dialog/count-down/count-down.component';
import { RefreshDialogComponent } from './shared/refresh-dialog/refresh-dialog.component';
import { TenantConfigModule } from './shared/tenant-config/tenant-config.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        CommonInputModule$v2,
        TenantConfigModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        TenantIconModule,
        MatCheckboxModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatSliderModule,
        OrganizationListModule,
        NetworkListModule
    ],
    providers: [
        CommonidentityAdapterService$v1
    ],
    declarations: [
        OnboardingInjectableComponent,
        LocationMarkerInjectableComponent,
        IconListComponent,
        OrganizationSelectInjectableComponent$v2,
        TenantIconListInjectableComponent,
        OrganizationSelectComponent$v2,
        OrganizationListInjectableComponent,
        RefreshDialogComponent,
        CountDownComponent,
        NetworkListInjectableComponent
    ],
    exports: [
        IconListComponent,
        OrganizationSelectComponent$v2,
        OrganizationSelectInjectableComponent$v2,
        TenantIconListInjectableComponent,
        NetworkListInjectableComponent
    ]
})
export class CommontenantCoreModule extends LayoutManagerFeatureModule$v2 {

    constructor(protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommontenantMailboxService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private notificationSrv: NotificationService,
        private coreSrv: CoreService
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            moduleRefId, LAYOUT_MANAGER_SETTINGS
        );

        this.localizationSrv.localizeGroup([
            TranslationGroup.common,
            TranslationGroup.core
        ]);
    }

    /**
    * Given a string component name should return the component type.
    * A enum for possible component name has been created in Commontenant-common
    */
    getComponentType(componentName: string): any {
        this.localizationSrv.localizeGroup(TranslationGroup.main);

        switch (componentName) {
            case InjectableComponentNames.TenantOnboardingComponent:
                return OnboardingInjectableComponent;
            case InjectableComponentNames.LocationMarkerComponent:
                return LocationMarkerInjectableComponent;
            case InjectableComponentNames.TenantIconListComponent:
                return TenantIconListInjectableComponent;
            case InjectableComponentNames.OrganizationSelectComponent$v2:
                return OrganizationSelectInjectableComponent$v2;
            case InjectableComponentNames.OrganizationListComponent:
                return OrganizationListInjectableComponent;
            case InjectableComponentNames.NetworkListComponent:
                return NetworkListInjectableComponent;
            default:
                throw Error('Component mapping not found for ' + componentName);
        }
    }
}
