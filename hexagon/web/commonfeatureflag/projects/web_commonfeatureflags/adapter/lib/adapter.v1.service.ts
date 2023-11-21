import { Injectable } from '@angular/core';
import { AddFeedbackMessage$v1, capabilityId, CommonMailboxService } from '@galileo/web_commonfeatureflags/_common';
import { LayoutCompilerAdapterService, MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { filter, first } from 'rxjs/operators';

import { FeatureFlagRuntimeService } from './feature-flag-runtime.service';

@Injectable()
/**
 * The adapter service is the public API that other capabilities can consume.
 */
export class CommonfeatureflagsAdapterService$v1 {

    constructor(
        private runtime: FeatureFlagRuntimeService,
        private layoutCompiler: LayoutCompilerAdapterService,
        private mailbox: CommonMailboxService
    ) {
        this.loadCore();
    }

    /**
     * Returns true if the feature flag is active
     * @param flags Flag to check if they are active
     */
    isActive(flags: string | string[]) {
        return this.runtime.isActive(flags);
    }

    /**
     * Allows a method to wait for the core to be loaded
     */
    loadCore(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.layoutCompiler.loadCapabilityCoreAsync(capabilityId);
            this.mailbox.mailbox$v1.coreIsLoaded$.pipe(
                filter(isLoaded => isLoaded),
                first()
            ).subscribe(() => {
                resolve();
            });
        });
    }

    /**
     * Saves feedback
     * @param feedbackMessage Message to save
     */
    async saveFeedbackMessageAsync(feedbackMessage: AddFeedbackMessage$v1): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const mailbox = new MailBox<AddFeedbackMessage$v1, void>(feedbackMessage);

            mailbox.response.subscribe(() => {
                resolve();
                mailbox.close();
            }, () => {
                reject();
                mailbox.close();
            });

            await this.loadCore();
            this.mailbox.mailbox$v1.saveFeedbackMessage$.next(mailbox);
        });
    }
}
