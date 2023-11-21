import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    LayoutCompilerAdapterService,
    LayoutManagerFeatureModule$v2,
    MailBoxService,
} from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    capabilityId,
    CommonMailboxService,
    LAYOUT_MANAGER_SETTINGS,
    TranslationGroup,
} from '@galileo/web_documentation/_common';

import { CoreService } from './core.service';
import { EventService } from './event.service';

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    declarations: [],
    exports: [],
    providers: [
        CoreService,
        EventService
    ]
})
export class DocumentationCoreModule extends LayoutManagerFeatureModule$v2 {

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
     * A enum for possible component name has been created in Documentation-common
     */
    getComponentType(componentName: string): any {
        switch (componentName) {
            default:
                console.error(`HxGN Connect:: Documentation :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
