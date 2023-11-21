import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonDropdownModule$v2, CommonExpansionPanelModule, TooltipModule } from '@galileo/web_common-libraries';
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
} from '@galileo/web_commonnotifications/_common';
import { MomentModule } from 'ngx-moment';

import { CoreService } from './core.service';
import { NotificationBtnComponent } from './injectable-components/notification-btn/notification-btn.component';
import {
    FullNotificationPaneComponent,
} from './injectable-components/notification-overlay/full-notification-pane/full-notification-panel.component';
import {
    SettingsPaneComponent,
} from './injectable-components/notification-overlay/full-notification-pane/settings-pane/settings-pane.component';
import {
    SortPaneComponent,
} from './injectable-components/notification-overlay/full-notification-pane/sort-pane/sort-pane.component';
import {
    NotificationItemComponent,
} from './injectable-components/notification-overlay/notification-item/notification-item.component';
import { NotificationOverlayComponent } from './injectable-components/notification-overlay/notification-overlay.component';
import {
    ToastNotificationItemComponent,
} from './injectable-components/notification-overlay/toast-notification-pane/toast-notification-item/toast-notification-item.component';
import {
    ToastNotificationPaneComponent,
} from './injectable-components/notification-overlay/toast-notification-pane/toast-notification-pane.component';
import { OnboardingInjectableComponent } from './onboarding-injectable/onboarding-injectable.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        SharedModule,
        CommonExpansionPanelModule,
        CommonDropdownModule$v2,
        MatMenuModule,
        MatCheckboxModule,
        MomentModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        DragDropModule,
        MatSlideToggleModule,
        TooltipModule
    ],
    declarations: [
        NotificationOverlayComponent,
        NotificationBtnComponent,
        OnboardingInjectableComponent,
        ToastNotificationPaneComponent,
        FullNotificationPaneComponent,
        NotificationItemComponent,
        ToastNotificationItemComponent,
        SortPaneComponent,
        SettingsPaneComponent
    ],
    exports: [],
    providers: []
})
export class CommonnotificationsCoreModule extends LayoutManagerFeatureModule$v2 {

    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommonMailboxService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private coreSrv: CoreService // Bootstrap service
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            capabilityId, LAYOUT_MANAGER_SETTINGS
        );

        this.localizationSrv.localizeGroup(TranslationGroup.core);
    }

    /**
     * Given a string component name should return the component type.
     * A enum for possible component name has been created in Commonnotifications-common
     */
    getComponentType(componentName: string): any {
        // Wait for next angular tick
        setTimeout(() => {
            this.localizationSrv.localizeGroup([
                TranslationGroup.common,
                TranslationGroup.main
            ]);
        });

        switch (componentName) {
            case InjectableComponentNames.notificationOverlay:
                return NotificationOverlayComponent;
            case InjectableComponentNames.notificationBtn:
                return NotificationBtnComponent;
            case InjectableComponentNames.onboarding:
                return OnboardingInjectableComponent;
            default:
                console.error(`HxGN Connect:: commonnotifications :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
