import { Injectable } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import * as Common from '@galileo/web_documentation/_common';

import { DocumentationAdapterModule } from './adapter.module';

@Injectable({
  providedIn: DocumentationAdapterModule
})
/**
 * The adapter service is the public API that other capabilities can consume.
 */
export class DocumentationAdapterService$v1 {

    constructor(private DocumentationMailbox: Common.CommonMailboxService,
                private layoutCompiler: LayoutCompilerAdapterService) {
        // Make sure the core module is loaded
        this.layoutCompiler.loadCapabilityCoreAsync(Common.capabilityId);
    }
}
