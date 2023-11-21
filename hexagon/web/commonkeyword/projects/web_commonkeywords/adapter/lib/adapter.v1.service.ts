import { Injectable } from '@angular/core';
import * as Common from '@galileo/web_commonkeywords/_common';
import { CommonkeywordsAdapterModule } from './adapter.module';
import { LayoutCompilerAdapterService, MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { CompositeIconFromKeywordsRequest, CompositeIcon$v1, PrimitiveIcon$v2, CompositeIconRequest$v1 } from '@galileo/web_commonkeywords/_common';
import { first, filter } from 'rxjs/operators';

@Injectable({
  providedIn: CommonkeywordsAdapterModule
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class CommonkeywordsAdapterService$v1 {

    constructor(private commonkeywordsMailbox: Common.CommonkeywordsMailboxService,
        private layoutCompiler: LayoutCompilerAdapterService
    ) {
        setTimeout(async () => {
            // Make sure the core module is loaded
            await this.layoutCompiler.loadCapabilityCoreAsync(Common.capabilityId);
        });
    }

    /**
     * Returns composite icon based on keywords
     * @param capabilityId The ID of the capability to which the resource belongs
     * @param industry The industry with which the resource is associated
     * @param keywords A collection of keywords
     * @deprecated
     */
    getCompositeIconFromKeywordsAsync(capabilityId: string, industry: string, keywords: string[]): Promise<CompositeIcon$v1> {
        return new Promise<CompositeIcon$v1>(async (resolve, reject) => {
            const mailBox = new MailBox<CompositeIconFromKeywordsRequest, CompositeIcon$v1>({
                capabilityId: capabilityId,
                industry: industry,
                keywords: keywords
            });

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((icon: CompositeIcon$v1) => {
                resolve(icon ? new CompositeIcon$v1(icon) : null);
            }, () => {
                reject();
            });

            await this.waitOnCore();
            this.commonkeywordsMailbox.mailbox$v1.getCompositeIconFromKeywords$.next(mailBox);
        });
    }

    /**
     * Returns primitive icon based on given primitive icon id
     * @param id Primitive id
     */
    getPrimitiveIconAsync(id: string): Promise<PrimitiveIcon$v2> {
        return new Promise<PrimitiveIcon$v2>(async (resolve, reject) => {
            const mailBox = new MailBox<string, PrimitiveIcon$v2>(id);

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((icon: PrimitiveIcon$v2) => {
                resolve(icon ? new PrimitiveIcon$v2(icon) : null);
            }, () => {
                reject();
            });

            await this.waitOnCore();
            this.commonkeywordsMailbox.mailbox$v1.getPrimitiveIcon$.next(mailBox);
        });
    }

    /**
     * Loads a list of composite icons
     * @param request List of composite icon request
     */
    loadCompositeIconsAsync(request: CompositeIconRequest$v1[]): Promise<void> {
      return new Promise<void>(async (resolve) => {
          // Create request
          await this.waitOnCore();
          this.commonkeywordsMailbox.mailbox$v1.loadCompositeIcons$.next(request);
          resolve();
      });
    }

    /**
     * Allows a method to wait for the core to be loaded
     */
    waitOnCore(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.commonkeywordsMailbox.mailbox$v1.coreIsLoaded$.pipe(
                filter(isLoaded => isLoaded),
                first()
            ).subscribe(() => {
                resolve();
            });
        });
    }
}
