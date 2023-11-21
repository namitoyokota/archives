import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import {
    CommonConfirmDialogModule,
    CommonDropdownModule$v2,
    CommonInputModule$v2,
    CommonPopoverModule,
    CommonUnsavedChangesDialogModule,
    TooltipModule,
} from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';
import { GroupListModule } from '@galileo/web_commonidentity/adapter';
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
} from '@galileo/web_commonnotifications/_common';
import { CoreService } from '@galileo/web_commonnotifications/_core';

import { BlankPresetComponent } from './create-preset-dialog/blank-preset/blank-preset.component';
import { CreatePresetDialogComponent } from './create-preset-dialog/create-preset-dialog.component';
import { ExistingPresetComponent } from './create-preset-dialog/existing-preset/existing-preset.component';
import { PresetIntroComponent } from './create-preset-dialog/preset-intro/preset-intro.component';
import { PresetOptionsComponent } from './create-preset-dialog/preset-options/preset-options.component';
import { EditPresetDialogComponent } from './edit-preset-dialog/edit-preset-dialog.component';
import { ManageGroupsDialogComponent } from './manage-groups-dialog/manage-groups-dialog.component';
import { NotificationManagerComponent } from './notification-manager.component';
import { SettingsItemComponent } from './shared/settings-item/settings-item.component';

@NgModule({
    declarations: [
        BlankPresetComponent,
        CreatePresetDialogComponent,
        EditPresetDialogComponent,
        ExistingPresetComponent,
        ManageGroupsDialogComponent,
        NotificationManagerComponent,
        PresetIntroComponent,
        PresetOptionsComponent,
        SettingsItemComponent
    ],
    imports: [
        CommonConfirmDialogModule,
        CommonDropdownModule$v2,
        CommonfeatureflagsAdapterModule,
        CommonInputModule$v2,
        CommonlocalizationAdapterModule,
        CommonModule,
        CommonPopoverModule,
        CommonUnsavedChangesDialogModule,
        FormsModule,
        GroupListModule,
        HxGNTranslateModule,
        MatCheckboxModule,
        MatDialogModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTableModule,
        OverlayModule,
        TooltipModule
    ],
    exports: [
        NotificationManagerComponent
    ]
})
export class NotificationManagerModule extends LayoutManagerFeatureModule$v2 {

    constructor(
        private coreSrv: CoreService,
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommonMailboxService
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            `${capabilityId}/admin/notificationmanager`, LAYOUT_MANAGER_SETTINGS
        );

        this.layoutCompiler.coreIsLoadedAsync(`${capabilityId}/admin/notificationmanager`);
    }

    /**
     * Given a string component name should return the component type.
     */
    getComponentType(componentName: string): any {
        switch (componentName) {
            case InjectableComponentNames.notificationManager:
                return NotificationManagerComponent;
            default:
                console.error(`HxGN Connect:: ${capabilityId}/admin/notificationmanager :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
