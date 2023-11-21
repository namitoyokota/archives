import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonDropdownModule$v2, CommonExpansionPanelModule } from '@galileo/web_common-libraries';
import {
    capabilityId,
    CommonkeywordsMailboxService,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
    TranslationGroup,
} from '@galileo/web_commonkeywords/_common';
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
import { DataService } from './data.service';
import { IconInjectableComponent } from './injectable/icon-injectable/icon-injectable.component';
import { OnboardingInjectableComponent } from './onboarding-injectable/onboarding-injectable.component';
import { RuleSetSelectionComponent } from './onboarding-injectable/rule-set-selection/rule-set-selection.component';
import { SampleComponent } from './sample.component';
import { IconComponent } from './shared/icon/icon.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        CommonExpansionPanelModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonDropdownModule$v2,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatMenuModule
    ],
    declarations: [
        SampleComponent,
        OnboardingInjectableComponent,
        RuleSetSelectionComponent,
        IconInjectableComponent,
        IconComponent
    ],
    providers: [
        CoreService,
        DataService
    ]
})
export class CommonkeywordsCoreModule extends LayoutManagerFeatureModule$v2 {

    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommonkeywordsMailboxService,
        private coreSrv: CoreService,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            capabilityId, LAYOUT_MANAGER_SETTINGS
        );

        this.localizationAdapter.localizeGroup([
            TranslationGroup.core,
            TranslationGroup.main
        ]);
    }

    /**
    * Given a string component name should return the component type.
    * A enum for possible component name has been created in commonkeywords-common
    */
    getComponentType(componentName: string): any {
        switch (componentName) {
            case InjectableComponentNames.SampleComponent:
                return SampleComponent;
            case InjectableComponentNames.OnboardingComponent:
                return OnboardingInjectableComponent;
            case InjectableComponentNames.IconComponent:
                return IconInjectableComponent;
            default:
                throw Error('Component not found: ' + componentName);
        }
    }
}
