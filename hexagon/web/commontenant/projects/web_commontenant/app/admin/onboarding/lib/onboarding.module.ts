import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { OnboardingCommunicationService } from './onboarding-communication.service';
import { OnboardingStore } from './onboarding-store.service';
import { OnboardingComponent } from './onboarding.component';
import { StepPaneComponent } from './step-pane/step-pane.component';

import {
    CommontenantMailboxService,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS
} from '@galileo/web_commontenant/_common';
import { LayoutCompilerAdapterService, LayoutManagerFeatureModule$v2, MailBoxService } from '@galileo/web_commonlayoutmanager/adapter';

@NgModule({
    imports: [
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonModule,
        MatProgressSpinnerModule
    ],
    exports: [OnboardingComponent],
    declarations: [
        OnboardingComponent,
        StepPaneComponent
    ],
    providers: [
        OnboardingStore,
        OnboardingCommunicationService
    ],
})
export class OnboardingModule extends LayoutManagerFeatureModule$v2 {
    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommontenantMailboxService
    ) {
      super(layoutCompiler, componentFactoryResolver,
        injector, mailbox as MailBoxService,
        `@hxgn/commontenant/admin/onboarding`, LAYOUT_MANAGER_SETTINGS
      );

      this.layoutCompiler.coreIsLoadedAsync(`@hxgn/commontenant/admin/onboarding`);
    }

    /**
   * Given a string component name should return the component type.
   */
   getComponentType(componentName: string): any {
    switch (componentName) {
        case InjectableComponentNames.OnboardingComponent:
          return OnboardingComponent;
        default:
            console.error(`HxGN Connect:: activity monitoring admin :: Cannot find component for ${componentName}`);
            return null;
    }
  }
}
