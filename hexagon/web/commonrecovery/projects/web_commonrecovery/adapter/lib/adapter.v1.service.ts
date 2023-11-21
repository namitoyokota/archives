import { Injectable } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import * as Common from '@galileo/web_commonrecovery/_common';

import { CommonrecoveryAdapterModule } from './adapter.module';

@Injectable({
  providedIn: CommonrecoveryAdapterModule
})
/**
 * The adapter service is the public API that other capabilities can consume.
 */
export class CommonrecoveryAdapterService$v1 {

    constructor(
      private CommonrecoveryMailbox: Common.CommonMailboxService,
      private layoutCompiler: LayoutCompilerAdapterService
    ) {
        // Make sure the core module is loaded
        this.layoutCompiler.loadCapabilityCoreAsync(Common.capabilityId);
    }
}
