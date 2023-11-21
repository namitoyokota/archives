import { Injectable } from '@angular/core';
import * as Common from '@galileo/web_commontenant/_common';
import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import { Application$v1, URLAccessTokenObj } from '@galileo/web_commontenant/_common';

/**
 * All notifications exposed through the adapter
 */
export interface Notifications {
    /**
     * Notification that the selected filter level on the data sharing admin UI
     * has been changed.
     */
    onAdminDataFilterLevelChange$: BehaviorSubject<string>;

    /**
     * Notification that someone has requested the data sharing capability operations.
     */
    onRequestCapabilityOperations$: BehaviorSubject<MailBox<string, string[]>>;
}

@Injectable({ providedIn: 'root' })
export class CommontenantAdapterService$v1 {

    /**
     * All notifications exposed through the adapter
     */
    notifications: Notifications = {
        onAdminDataFilterLevelChange$: this.commontenantMailbox.mailbox$v1.adminDataFilterLevelChanged$,
        onRequestCapabilityOperations$: this.commontenantMailbox.mailbox$v1.requestCapabilityOpertations$
    };

    constructor(private commontenantMailbox: Common.CommontenantMailboxService) { }

    /**
     * Gets a list of capabilities. This can be the full list or filtered by a capability id.
     * @param capabilityId The id of the capability that must be supported.
     * (i.e. can be used to get a list of all capabilities that supports map interaction by passing ‘@hxgn/commonmap’)
     */
    getCapabilityListAsync(capabilityId: string = null): Promise<Common.CapabilityManifest$v1[]> {
        return new Promise<Common.CapabilityManifest$v1[]>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<string, Common.CapabilityManifest$v1[]>(capabilityId);

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((capabilityList: Common.CapabilityManifest$v1[]) => {
                resolve(capabilityList);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getCapabilityList$.next(mailBox);
        });
    }

    /**
     * Returns a list of tenant ids that is sharing for a given capability
     * @param capabilityId The capability to get data access tenant mapping for
     */
    getDataAccessMapAsync(capabilityId: string): Promise<string[]> {
        return new Promise<string[]>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<string, string[]>(capabilityId);

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((tenantIds: string[]) => {
                resolve(tenantIds);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getDataAccessMap$.next(mailBox);
        });
    }

    /**
     * Gets a tenant object from id
     * @param tenantId The id of the tenant
     */
    getTenantAsync(tenantId: string): Promise<Common.Tenant$v1> {
        return new Promise<Common.Tenant$v1>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<string, Common.Tenant$v1>(tenantId);

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((tenant: Common.Tenant$v1) => {
                resolve(tenant);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getTenant$.next(mailBox);
        });
    }

    /**
     * Returns the current user's tenants
     */
    getUserTenantsAsync(): Promise<Common.Tenant$v1[]> {
        return new Promise<Common.Tenant$v1[]>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<void, Common.Tenant$v1[]>();

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((tenants: Common.Tenant$v1[]) => {
                resolve(tenants);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getUserTenants$.next(mailBox);
        });
    }

    /**
     * Gets a tenant object from id
     */
    getTenantsAsync(): Promise<Common.Tenant$v1[]> {
        return new Promise<Common.Tenant$v1[]>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<void, Common.Tenant$v1[]>();

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((tenant: Common.Tenant$v1[]) => {
                resolve(tenant);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getTenants$.next(mailBox);
        });
    }

    /**
   * Gets a tenant object from an access token
   * @param accessToken the access token
   */
    getTenantFromAccessTokenAsync(baseUrl: string, accessToken: string): Promise<Common.Tenant$v1> {
        return new Promise<Common.Tenant$v1>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<URLAccessTokenObj, Common.Tenant$v1>({ baseUrl: baseUrl, accessToken: accessToken });

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((tenant: Common.Tenant$v1) => {
                resolve(tenant);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getTenantFromAccessToken$.next(mailBox);
        });
    }

    /** Gets a list of licensed operations. */
    getLicensedOperationsAsync(): Promise<Map<string, string[]>> {
        return new Promise<Map<string, string[]>>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<null, Map<string, string[]>>();

            // Listen for response in the mailbox
            mailBox.response.pipe(first()).subscribe((licensedOperations) => {
                resolve(licensedOperations);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getLicensedOperations$.next(mailBox);
        });
    }

    /** Gets a list of industries. */
    getIndustriesAsync(): Promise<Common.Industries$v1[]> {
        return new Promise<Common.Industries$v1[]>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<null, Common.Industries$v1[]>();

            mailBox.response.pipe(first()).subscribe((industries: Common.Industries$v1[]) => {
                resolve(industries);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getIndustries$.next(mailBox);
        });
    }

    /** Gets sharer tenant info. */
    getSharerTenantInfoAsync(): Promise<Common.SharingCriteria$v1<any, any>[]> {
        return new Promise<Common.SharingCriteria$v1<any, any>[]>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<null, Common.SharingCriteria$v1<any, any>[]>();

            mailBox.response.pipe(first()).subscribe((sharerTenantInfo: Common.SharingCriteria$v1<any, any>[]) => {
                resolve(sharerTenantInfo);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getSharerTenantInfo$.next(mailBox);
        });
    }

    /**
     * Gets sharee tenant ids.
     */
    getShareeTenantIdsAsync(): Promise<string[]> {
        return new Promise<string[]>(async (resolve, reject) => {
            await this.waitOnCoreAsync();

            const mailBox = new MailBox<null, string[]>();

            mailBox.response.pipe(first()).subscribe((tenantIds: string[]) => {
                resolve(tenantIds);
            }, () => {
                reject();
            });

            this.commontenantMailbox.mailbox$v1.getShareeTenantIds$.next(mailBox);
        });
    }

    /**
     * Returns true if onboarding is completed
     * @param tenant The tenant to check if onboarding is completed for.
     */
    getIsOnboardingCompletedAsync(tenant: Common.Tenant$v1): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            await this.waitOnCoreAsync();

            const mailbox = new MailBox<Common.Tenant$v1, boolean>(tenant);
            mailbox.response.pipe(first()).subscribe(isCompleted => {
                resolve(isCompleted);
            });

            this.commontenantMailbox.mailbox$v1.isOnboardingCompleted$.next(mailbox);
        });
    }

    /**
     * Returns a list of applications
     */
    getApplicationsAsync(): Promise<Application$v1[]> {
        return new Promise<Application$v1[]>(async resolve => {
            await this.waitOnCoreAsync();

            const mailbox = new MailBox<null, Application$v1[]>();
            mailbox.response.pipe(first()).subscribe(apps => {
                resolve(apps);
            });

            this.commontenantMailbox.mailbox$v1.getApplications$.next(mailbox);
        });
    }

    /**
     * Updates a tenant
     * @param tenant Tenant to update
     */
    updateTenantAsync(tenant: Common.Tenant$v1): Promise<Common.Tenant$v1> {
        return new Promise<Common.Tenant$v1>(async resolve => {
            await this.waitOnCoreAsync();

            const mailbox = new MailBox<Common.Tenant$v1, Common.Tenant$v1>(tenant);
            mailbox.response.pipe(first()).subscribe(updatedTenant => {
                resolve(updatedTenant);
            });

            this.commontenantMailbox.mailbox$v1.updateTenant$.next(mailbox);
        });
    }

    /**
     * Updates EnableJargon for a tenant
     * @param tenant Tenant to update
     */
    updateTenantJargonAsync(tenant: Common.Tenant$v1): Promise<Common.Tenant$v1> {
        return new Promise<Common.Tenant$v1>(async resolve => {
            await this.waitOnCoreAsync();

            const mailbox = new MailBox<Common.Tenant$v1, Common.Tenant$v1>(tenant);
            mailbox.response.pipe(first()).subscribe(updatedTenant => {
                resolve(updatedTenant);
            });

            this.commontenantMailbox.mailbox$v1.updateTenantJargon$.next(mailbox);
        });
    }

    /**
     * Allows a method to wait for the core to be loaded
     */
    waitOnCoreAsync(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.commontenantMailbox.mailbox$v1.coreIsLoaded$.pipe(
                filter(isLoaded => isLoaded),
                first()
            ).subscribe(() => {
                resolve();
            });
        });
    }
}
