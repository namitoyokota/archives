import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonInfiniteScrollPaneModule } from '@galileo/web_common-libraries';
import { TenantConfigModule } from '@galileo/web_commontenant/app/_core';
import { LayoutCompilerAdapterService, LayoutManagerFeatureModule$v2, MailBoxService } from '@galileo/web_commonlayoutmanager/adapter';
import { TenantConfigurationComponent } from './tenant-configuration.component';
import {
  CommontenantMailboxService,
  InjectableComponentNames,
  LAYOUT_MANAGER_SETTINGS
} from '@galileo/web_commontenant/_common';
import {
   CommonidentityAdapterService$v1,
   ChangelogCardModule,
   ChangelogSettingsPaneModule,
   ChangelogFilterChipsModule,
   AwayModeSettingsModule
} from '@galileo/web_commonidentity/adapter';
import { OrganizationChangelogStoreService } from './organization-changelog-store.service';
import { OrganizationChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';
import { OrganizationChangelogListComponent } from './changelog-dialog/changelog-list/changelog-list.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
    imports: [
        CommonfeatureflagsAdapterModule,
        CommonModule,
        FormsModule,
        HxGNTranslateModule,
        MatDialogModule,
        TenantConfigModule,
        MatProgressSpinnerModule,
        CommonlocalizationAdapterModule,
        ChangelogCardModule,
        ChangelogFilterChipsModule,
        ChangelogSettingsPaneModule,
        CommonInfiniteScrollPaneModule,
        MatSlideToggleModule,
        AwayModeSettingsModule,
        MatSnackBarModule
    ],
    exports: [TenantConfigurationComponent],
    declarations: [
      TenantConfigurationComponent,
      OrganizationChangelogDialogComponent,
      OrganizationChangelogListComponent
    ],
    providers: [
        CommonidentityAdapterService$v1,
        OrganizationChangelogStoreService
    ]
})
export class CommontenantConfigurationModule extends LayoutManagerFeatureModule$v2  {
    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommontenantMailboxService
    ) {
      super(layoutCompiler, componentFactoryResolver,
        injector, mailbox as MailBoxService,
        `@hxgn/commontenant/admin/tenantconfiguration`, LAYOUT_MANAGER_SETTINGS
      );

      this.layoutCompiler.coreIsLoadedAsync(`@hxgn/commontenant/admin/tenantconfiguration`);
    }

    /**
   * Given a string component name should return the component type.
   */
   getComponentType(componentName: string): any {
    switch (componentName) {
        case InjectableComponentNames.TenantConfigurationComponent:
          return TenantConfigurationComponent;
        default:
            console.error(`HxGN Connect:: tenant configuration admin :: Cannot find component for ${componentName}`);
            return null;
    }
  }
}
