import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

import {
    Application$v1,
    CapabilityManifest$v1,
    Industries$v1,
    SharingCriteria$v1,
    Tenant$v1
} from '@galileo/platform_commontenant';

import { URLAccessTokenObj } from '../abstractions/url-access-token-obj';

/**
 * Version 1 of methods used by the adapter and core to communicate.
 */
export class Mailbox$v1 {

    /**
     * Event that is fired when the selected data filter level changes on the admin page
     */
    adminDataFilterLevelChanged$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    /**
     * Event that a call to get capability list has been made.
     */
    getCapabilityList$: ReplaySubject<MailBox<string, CapabilityManifest$v1[]>> =
        new ReplaySubject<MailBox<string, CapabilityManifest$v1[]>>(100);

    /**
     * Event that a call to request capability operations has been made.
     */
    requestCapabilityOpertations$: BehaviorSubject<MailBox<string, string[]>> =
        new BehaviorSubject<MailBox<string, string[]>>(null);

    /**
     * Event that a call to get a tenant has been made.
     */
    getTenant$: BehaviorSubject<MailBox<string, Tenant$v1>> =
        new BehaviorSubject<MailBox<string, Tenant$v1>>(null);

    /**
     * Event that a call to get all tenants has been made.
     */
    getTenants$: Subject<MailBox<void, Tenant$v1[]>> =
        new Subject<MailBox<void, Tenant$v1[]>>();

    /**
     * Event that a call to get a tenant from an access token has been made.
     */
    getTenantFromAccessToken$: Subject<MailBox<URLAccessTokenObj, Tenant$v1>> =
        new Subject<MailBox<URLAccessTokenObj, Tenant$v1>>();

    /** Event that a call to get user's tenant list has been made */
    getUserTenants$: Subject<MailBox<void, Tenant$v1[]>> = new Subject<MailBox<void, Tenant$v1[]>>();

    /**
     * Event that a call to get data access map has been made.
     */
    getDataAccessMap$: BehaviorSubject<MailBox<string, string[]>> =
        new BehaviorSubject<MailBox<string, string[]>>(null);

    /**
     * Event that a call to get data access map has been made.
     */
    getLicensedOperations$: BehaviorSubject<MailBox<null, Map<string, string[]>>> =
        new BehaviorSubject<MailBox<null, Map<string, string[]>>>(null);

    /** Event that a call to get industries has been made. */
    getIndustries$: BehaviorSubject<MailBox<null, Industries$v1[]>> =
        new BehaviorSubject<MailBox<null, Industries$v1[]>>(null);

    /** Event that a call to get sharer tenant info has been made. */
    getSharerTenantInfo$: BehaviorSubject<MailBox<null, SharingCriteria$v1<any, any>[]>> =
        new BehaviorSubject<MailBox<null, SharingCriteria$v1<any, any>[]>>(null);

    /** Event that a call to get sharee tenant ids has been made. */
    getShareeTenantIds$: BehaviorSubject<MailBox<null, string[]>> =
        new BehaviorSubject<MailBox<null, string[]>>(null);

    /** Event that a call to check if onboarding is completed has been made */
    isOnboardingCompleted$ = new Subject<MailBox<Tenant$v1, boolean>>();

    /** Event that a call to get list of applications has been made */
    getApplications$ = new Subject<MailBox<null, Application$v1[]>>();

    /** Event that a call to update a tenant has been made */
    updateTenant$ = new Subject<MailBox<Tenant$v1, Tenant$v1>>();

    /** Event that a call to update EnableJargon for a tenant has been made */
    updateTenantJargon$ = new Subject<MailBox<Tenant$v1, Tenant$v1>>();

    /** Flag that is true when the core is loaded */
    coreIsLoaded$ = new BehaviorSubject<boolean>(false);
}
