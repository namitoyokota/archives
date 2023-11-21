import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  capabilityId,
  CommonMailboxService,
  InjectableComponentNames,
  LAYOUT_MANAGER_SETTINGS,
  TranslationGroup,
} from '@galileo/web_commonfeatureflags/_common';
import {
  AllUsersItemModule,
  CommonidentityAdapterService$v1,
  GroupListModule,
  GroupMenuModule,
} from '@galileo/web_commonidentity/adapter';
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

import { CoreService } from './core.service';
import { DataService$v2 } from './data.service.v2';
import { EventService } from './event.service';
import {
  FeatureFlagGlobalEditorComponent,
} from './injectable-components/feature-flag-global-editor/feature-flag-editor.component';
import {
  FeatureFlagGroupsEditorComponent,
} from './injectable-components/feature-flag-groups-menu/feature-flag-groups-editor/feature-flag-editor.component';
import {
  FeatureFlagGroupsMenuComponent,
} from './injectable-components/feature-flag-groups-menu/feature-flag-groups-menu.component';
import {
  FeatureFlagTenantEditorComponent,
} from './injectable-components/feature-flag-tenant-editor/feature-flag-editor.component';
import { NotificationService } from './notification.service';
import { AllUsersDialogComponent } from './share/all-users-dialog/all-users-dialog.component';
import { FeatureFlagsListItemComponent$v2 } from './share/feature-flag-list-item/feature-flag-list-item.component';
import { FeatureFlagsListComponent$v2 } from './share/feature-flag-list/feature-flag-list.component';
import { ForcePushViewDialogComponent } from './share/force-push-dialog/force-push-dialog.component';
import { CountDownComponent } from './share/refresh-dialog/count-down/count-down.component';
import { RefreshDialogComponent } from './share/refresh-dialog/refresh-dialog.component';
import { SelectGroupsDialogComponent } from './share/select-groups-dialog/select-groups-dialog.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDialogModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        AllUsersItemModule,
        GroupListModule,
        GroupMenuModule,
        MatProgressSpinnerModule
    ],
    declarations: [
        FeatureFlagGlobalEditorComponent,
        FeatureFlagTenantEditorComponent,
        FeatureFlagGroupsMenuComponent,
        FeatureFlagGroupsEditorComponent,
        FeatureFlagsListComponent$v2,
        FeatureFlagsListItemComponent$v2,
        ForcePushViewDialogComponent,
        AllUsersDialogComponent,
        SelectGroupsDialogComponent,
        RefreshDialogComponent,
        CountDownComponent
    ],
    exports: [],
    providers: [
        CoreService,
        EventService,
        DataService$v2,
        NotificationService,
        CommonidentityAdapterService$v1,
    ]
})
export class CommonfeatureflagsCoreModule extends LayoutManagerFeatureModule$v2 {

    constructor(protected layoutCompiler: LayoutCompilerAdapterService,
                protected componentFactoryResolver: ComponentFactoryResolver,
                protected injector: Injector,
                protected mailbox: CommonMailboxService,
                private coreSrv: CoreService, // Bootstrap service
                private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            capabilityId, LAYOUT_MANAGER_SETTINGS
        );
        this.localizationAdapter.localizeGroup([
            TranslationGroup.core
        ]);
    }

    /**
     * Given a string component name should return the component type.
     * A enum for possible component name has been created in Commonfeatureflags-common
     */
    getComponentType(componentName: string): any {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
        switch (componentName) {
            case InjectableComponentNames.featureFlagGlobalEditor:
                return FeatureFlagGlobalEditorComponent;
            case InjectableComponentNames.featureFlagTenantEditor:
                return FeatureFlagTenantEditorComponent;
            case InjectableComponentNames.featureFlagGroupsMenu:
                return FeatureFlagGroupsMenuComponent;
            default:
                console.error(`HxGN Connect:: commonfeatureflags :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
