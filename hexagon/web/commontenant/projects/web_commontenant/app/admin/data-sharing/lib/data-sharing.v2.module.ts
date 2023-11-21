import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {
    CommonChipModule,
    CommonConfirmDialogModule,
    CommonDropdownModule$v2,
    CommonExpansionPanelModule,
    CommonInfiniteScrollPaneModule,
    CommonInputModule$v2,
    CommonListStepsModule,
    CommonPopoverModule,
    CommonTabsModule,
} from '@galileo/web_common-libraries';
import {
    ChangelogCardModule,
    ChangelogFilterChipsModule,
    ChangelogSettingsPaneModule,
    CommonidentityAdapterModule,
    GroupListModule,
} from '@galileo/web_commonidentity/adapter';
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
    CommontenantMailboxService,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
} from '@galileo/web_commontenant/_common';
import { CommontenantCoreModule } from '@galileo/web_commontenant/app/_core';

import { DataSharingChangelogStoreService } from './changelog-store.service';
import { TooltipModule } from './common/common-tooltip/common-tooltip.module';
import { DataSharingTenantStoreService } from './data-sharing-tenant-store.service';
import { DataSharingComponent$v2 } from './data-sharing.component';
import { ExternalSetupComponent } from './external-setup/external-setup.component';
import { InternalSetupComponent } from './internal-setup/internal-setup.component';
import { ActiveDataFiltersComponent } from './manager/active-data-filters/active-data-filters.component';
import { ActiveFilterItemComponent } from './manager/active-data-filters/active-filter-item/active-filter-item.component';
import {
    EditOverrideDialogComponent,
} from './manager/active-data-filters/edit-override-dialog/edit-override-dialog.component';
import {
    RestrictionLevelSelectorComponent,
} from './manager/active-data-filters/restriction-level-selector/restriction-level-selector.component';
import { DataSharingChangelogDialogComponent } from './manager/changelog-dialog/changelog-dialog.component';
import { ChangelogListComponent } from './manager/changelog-dialog/changelog-list/changelog-list.component';
import { ConfirmSaveDialogComponent } from './manager/confirm-save-dialog/confirm-save-dialog.component';
import { CriteriaTableComponent } from './manager/criteria-table/criteria-table.component';
import { BadgeComponent } from './manager/external-list/badge/badge.component';
import { ExternalListComponent } from './manager/external-list/external-list.component';
import { ExternalRibbonComponent } from './manager/external-ribbon/external-ribbon.component';
import { InternalListComponent } from './manager/internal-list/internal-list.component';
import { InternalRibbonComponent } from './manager/internal-ribbon/internal-ribbon.component';
import { ManagerComponent } from './manager/manager.component';
import { ShareAllDialogComponent } from './share-all-dialog/share-all-dialog.component';
import { SharingCriteriaStoreService } from './sharing-criteria-store.service';
import { SharingPresetComponent } from './sharing-preset/sharing-preset.component';
import { UnconfiguredComponent } from './unconfigured/unconfigured.component';
import { DataSharingNoticeComponent } from './wizard/data-sharing-notice/data-sharing-notice.component';
import { ExternalWizardComponent } from './wizard/external-wizard/external-wizard.component';
import { CloneInternalComponent } from './wizard/external-wizard/steps/clone-internal/clone-internal.component';
import {
    ExternalDataSharingSetupComponent,
} from './wizard/external-wizard/steps/external-data-sharing-setup/external-data-sharing-setup.component';
import {
    ExternalShareDataComponent,
} from './wizard/external-wizard/steps/external-share-data/external-share-data.component';
import {
    ExternalSharingNetworkComponent,
} from './wizard/external-wizard/steps/external-sharing-network/external-sharing-network.component';
import { ReceiveDataComponent } from './wizard/external-wizard/steps/receive-data/receive-data.component';
import { InternalWizardComponent } from './wizard/internal-wizard/internal-wizard.component';
import { CloneExternalComponent } from './wizard/internal-wizard/steps/clone-external/clone-external.component';
import {
    InternalApplyPresetsComponent,
} from './wizard/internal-wizard/steps/internal-apply-presets/internal-apply-presets.component';
import {
    InternalDataSharingSetupInfoComponent,
} from './wizard/internal-wizard/steps/internal-data-sharing-setup-info/internal-data-sharing-setup-info.component';
import {
    InternalDataSharingSetupOptionsComponent,
} from './wizard/internal-wizard/steps/internal-data-sharing-setup-options/internal-data-sharing-setup-options.component';
import {
    InternalFilteringNetworkComponent,
} from './wizard/internal-wizard/steps/internal-filtering-network/internal-filtering-network.component';
import {
    DataSharingPresetInfoComponent,
} from './wizard/shared-steps/data-sharing-preset-info/data-sharing-preset-info.component';
import {
    DataSharingPresetSetupComponent,
} from './wizard/shared-steps/data-sharing-preset-setup/data-sharing-preset-setup.component';
import { InfoButtonComponent } from './wizard/shared-steps/info-button/info-button.component';
import { PresetDataTypesComponent } from './wizard/shared-steps/preset-data-types/preset-data-types.component';
import { StepDescriptionComponent } from './wizard/shared-steps/step-description/step-description.component';
import { StepIconComponent } from './wizard/shared-steps/step-icon/step-icon.component';
import { StepIndicatorComponent } from './wizard/shared-steps/step-indicator/step-indicator.component';
import {
    WizardStepLayoutComponent,
    WizardStepLayoutContentComponent,
    WizardStepLayoutDescriptionComponent,
} from './wizard/wizard-step/wizard-step-layout.component';
import { WizardStepComponent } from './wizard/wizard-step/wizard-step.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        MatDialogModule,
        MatTabsModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatRadioModule,
        CommonChipModule,
        CommonDropdownModule$v2,
        CommonTabsModule,
        FormsModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommontenantCoreModule,
        PortalModule,
        CommonInputModule$v2,
        CommonidentityAdapterModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        CommonConfirmDialogModule,
        CommonExpansionPanelModule,
        CommonListStepsModule,
        GroupListModule,
        CommonPopoverModule,
        OverlayModule,
        TooltipModule, // Need to move this to common lib
        ChangelogFilterChipsModule,
        ChangelogSettingsPaneModule,
        CommonInfiniteScrollPaneModule,
        ChangelogCardModule
    ],
    exports: [DataSharingComponent$v2],
    declarations: [
        DataSharingComponent$v2,
        UnconfiguredComponent,
        ManagerComponent,
        WizardStepLayoutComponent,
        WizardStepLayoutContentComponent,
        WizardStepLayoutDescriptionComponent,
        PresetDataTypesComponent,
        ExternalWizardComponent,
        ExternalDataSharingSetupComponent,
        ReceiveDataComponent,
        DataSharingPresetInfoComponent,
        DataSharingPresetSetupComponent,
        ExternalSharingNetworkComponent,
        ExternalShareDataComponent,
        StepIconComponent,
        InfoButtonComponent,
        StepDescriptionComponent,
        WizardStepComponent,
        StepIndicatorComponent,
        SharingPresetComponent,
        DataSharingNoticeComponent,
        InternalWizardComponent,
        InternalDataSharingSetupOptionsComponent,
        InternalDataSharingSetupInfoComponent,
        InternalFilteringNetworkComponent,
        InternalApplyPresetsComponent,
        ExternalRibbonComponent,
        ExternalListComponent,
        BadgeComponent,
        CriteriaTableComponent,
        RestrictionLevelSelectorComponent,
        ActiveDataFiltersComponent,
        EditOverrideDialogComponent,
        ConfirmSaveDialogComponent,
        InternalSetupComponent,
        InternalListComponent,
        InternalRibbonComponent,
        ExternalSetupComponent,
        CloneInternalComponent,
        CloneExternalComponent,
        ActiveFilterItemComponent,
        ShareAllDialogComponent,
        DataSharingChangelogDialogComponent,
        ChangelogListComponent
    ],
    providers: [
        SharingCriteriaStoreService,
        DataSharingTenantStoreService,
        DataSharingChangelogStoreService
    ]
})
export class CommontenantDataSharing$v2Module extends LayoutManagerFeatureModule$v2 {
    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommontenantMailboxService
    ) {
      super(layoutCompiler, componentFactoryResolver,
        injector, mailbox as MailBoxService,
        `@hxgn/commontenant/admin/datasharing`, LAYOUT_MANAGER_SETTINGS
      );

      this.layoutCompiler.coreIsLoadedAsync(`@hxgn/commontenant/admin/datasharing`);
    }

    /**
   * Given a string component name should return the component type.
   */
   getComponentType(componentName: string): any {
    switch (componentName) {
        case InjectableComponentNames.DataSharingComponent:
          return DataSharingComponent$v2;
        default:
            console.error(`HxGN Connect:: admin data sharing :: Cannot find component for ${componentName}`);
            return null;
    }
  }
}
