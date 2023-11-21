import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFactoryResolver, Injector, NgModule, SecurityContext } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonInputModule$v2 } from '@galileo/web_common-libraries';
import {
    LayoutCompilerAdapterService,
    LayoutManagerFeatureModule$v2,
    MailBoxService,
} from '@galileo/web_commonlayoutmanager/adapter';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonMailboxService, InjectableComponentNames, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_documentation/_common';
import { MarkdownModule } from 'ngx-markdown';

import { ApiDocumentationComponent } from './api-documentation.component';


@NgModule({
    declarations: [
        ApiDocumentationComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonInputModule$v2,
        CommonModule,
        FormsModule,
        HttpClientModule,
        HxGNTranslateModule,
        MarkdownModule.forRoot({ loader: HttpClient, sanitize: SecurityContext.NONE }),
        MatProgressSpinnerModule
    ],
    exports: [
        ApiDocumentationComponent
    ]
})
export class ApiDocumentationModule extends LayoutManagerFeatureModule$v2 {

    constructor(
        protected layoutCompiler: LayoutCompilerAdapterService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected injector: Injector,
        protected mailbox: CommonMailboxService
    ) {
        super(layoutCompiler, componentFactoryResolver,
            injector, mailbox as MailBoxService,
            `@hxgn/documentation/admin`, LAYOUT_MANAGER_SETTINGS
        );

        this.layoutCompiler.coreIsLoadedAsync(`@hxgn/documentation/admin`);
    }

    /**
     * Given a string component name should return the component type.
     */
    getComponentType(componentName: string): any {
        switch (componentName) {
            case InjectableComponentNames.apiDocumentation:
                return ApiDocumentationComponent;
            default:
                console.error(`HxGN Connect:: documentation admin :: Cannot find component for ${componentName}`);
                return null;
        }
    }
}
