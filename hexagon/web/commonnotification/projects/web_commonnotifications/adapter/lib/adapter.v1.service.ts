import { Injectable } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import * as Common from '@galileo/web_commonnotifications/_common';
import { filter, first } from 'rxjs/operators';

@Injectable()
/**
 * The adapter service is the public API that other capabilities can consume.
 */
export class CommonnotificationsAdapterService$v1 {

    constructor(private mailboxSrv: Common.CommonMailboxService,
                private layoutCompiler: LayoutCompilerAdapterService) {
        // Make sure the core module is loaded
        this.layoutCompiler.loadCapabilityCoreAsync(Common.capabilityId);
    }

    /**
     * Waits on the core to be loaded
     */
    loadCore(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.mailboxSrv.mailbox$v1.coreIsLoaded$.pipe(
                filter(isLoaded => isLoaded),
                first()
            ).subscribe(() => {
                resolve();
            });
        });
    }
}
