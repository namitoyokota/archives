import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonWindowCommunicationService, WindowMessage } from '@galileo/web_common-http';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import {
    CapabilityManifest$v1,
    CommontenantMailboxService,
    CriteriaType$v1,
    Industries$v1,
    moduleRefId as capabilityId,
    OnboardingStep$v1,
    SharingCriteria$v1,
    Tenant$v1,
} from '@galileo/web_commontenant/_common';
import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { ApplicationStoreService } from './application-store.service';
import { DataService$v2 } from './data.service.v2';
import { NotificationService } from './notification.service';
import { RefreshDialogComponent } from './shared/refresh-dialog/refresh-dialog.component';
import { TenantStoreService } from './tenant-store.service';

@Injectable({ providedIn: 'root' })
export class CoreService {

    /** Core service sharer tenant info. */
    sharerTenantInfo: SharingCriteria$v1<any, any>[];

    /** List of sharee tenant ids. */
    shareeTenantIds: string[] = [];

    /** Core service data access map. */
    dataAccessMap: Map<string, string[]>;

    /** Licensed operations. */
    licensedOperations: Map<string, string[]>;

    /** Bus for industries */
    private industries = new BehaviorSubject<Industries$v1[]>(null);

    /** Cache of industries */
    industries$ = this.industries.asObservable().pipe(
        filter(industry => !!industry)
    );

    /**List of all capabilities. Is null when the server has not been checked for list.*/
    private capabilityList: CapabilityManifest$v1[] = null;

    /** List of request that have been made to get a tenant */
    private tenantRequestCache = new Map<string, Observable<Tenant$v1>>();

    private readonly refreshMsgId = '@hxgn/commontenant/refresh';
    private readonly cancelRefreshDialogId = '@hxgn/commontenant/refresh/cancel';
    private readonly showRefreshDialogId = '@hxgn/commontenant/showrefresh';

    private refreshDialogRef: MatDialogRef<RefreshDialogComponent>;

    /** A flag that is true when the refreshDialog should be shown */
    private refreshDialogShow = false;

    constructor(
        private mailbox: CommontenantMailboxService,
        private dataSrv: DataService$v2,
        private tenantStore: TenantStoreService,
        private layoutAdapter: LayoutCompilerAdapterService,
        private appStore: ApplicationStoreService,
        private notificationSrv: NotificationService,
        private dialog: MatDialog,
        private windowSrv: CommonWindowCommunicationService
    ) {
        this.initListenerForNotifications();
        this.initPostOffice();
        this.initData();
        this.listenToRefreshDialogMsgs();
        this.layoutAdapter.coreIsLoadedAsync(capabilityId);
    }

    /**
     * Returns list of capabilities that can be filtered by capability id or if capability is sharable.
     * @param id The capability id to use to filter on. This id must be in the compatible list to be returned.
     * @param onlySharable If true only capabilities that can be shared will be returned.
     * @param includeInternal If true internal data sharing capabilities will be returned
     * @param includeExternal If true external data sharing capabilities will be returned
     */
    getCapabilityList(id: string = null, onlySharable = false, includeInternal = false, includeExternal = false): CapabilityManifest$v1[] {

        let capabilityList: CapabilityManifest$v1[] = [].concat(this.capabilityList);
        // Filter list based on capability
        if (id && capabilityList.length) {
            capabilityList = capabilityList.filter((item) => {
                if (!item.compatible) {
                    return false;
                }

                return item.compatible.findIndex(c => c.capabilityId === id) > -1;
            });
        }

        if (onlySharable) {
            capabilityList = capabilityList.filter((item) => {
                if (!item) {
                    return false;
                }

                if (includeInternal) {
                    return !item.excludeFromInternalDataSharing;
                }

                if (includeExternal) {
                    return !item.excludeFromExternalDataSharing;
                }

                return !item.excludeFromInternalDataSharing || !item.excludeFromExternalDataSharing;
            });
        }

        return [].concat(capabilityList).map(c => new CapabilityManifest$v1(c));
    }

    /**
     * Return the capability that matches the provided capability id.
     * @param id The capability to get
     */
    getCapability(id: string): CapabilityManifest$v1 {
        if (!this.capabilityList || !this.capabilityList.length) {
            return null;
        }

        return this.capabilityList.find(item => item.id === id);
    }

    /**
     * Returns a number between 0 and 1 of how complete the onboarding process is
     */
    onboardingStatus(completedStepIds: string[], applicationIds: string[]): number {
        if (!this.capabilityList) {
            return 0;
        }

        // Only return capabilities that support onboarding
        const compList = this.capabilityList.filter(capability => {
            if (!capability.compatible) {
                return false;
            }

            return capability.compatible.find(comp => {
                return comp.capabilityId === capabilityId &&
                    comp.options['onBoarding'];
            });
        });

        const stepList = [];
        for (const capability of compList) {
            capability.compatible.filter(comp => {
                return comp.capabilityId === capabilityId &&
                    comp.options['onBoarding'];
            }).forEach(items => {
                items.options['onBoarding'].steps.map(s => {
                    s.capabilityId = capability.id;
                    return s;
                }).forEach(step => {

                    // If step matches one of the provided application ids
                    const applicationStep = applicationIds.find(id => {
                        return !!step.applicationIds.find(sId => sId === id);
                    });
                    if (applicationStep) {
                        stepList.push(step);
                    }
                });
            });
        }

        let matchCount = 0;

        for (const step of stepList) {
            if (completedStepIds.find(id => id === step.componentType)) {
                matchCount += 1;
            }
        }
        if (matchCount === stepList.length) {
            return 1;
        }

        return stepList?.length ? (matchCount / stepList.length) : 0;
    }

    /** Returns true if onboarding is completed */
    isOnboardingCompleted(completedStepIds: string[], applicationIds: string[]): boolean {
        if (!this.capabilityList) {
            return false;
        }

        // Only return capabilities that support onboarding
        const compList = this.capabilityList.filter(capability => {
            if (!capability.compatible) {
                return false;
            }

            return capability.compatible.find(comp => {
                return comp.capabilityId === capabilityId &&
                    comp.options['onBoarding'];
            });
        });

        const stepList = [];
        for (const capability of compList) {
            capability.compatible.filter(comp => {
                return comp.capabilityId === capabilityId &&
                    comp.options['onBoarding'];
            }).forEach(items => {
                items.options['onBoarding'].steps.map(s => {
                    s.capabilityId = capability.id;
                    return s;
                }).forEach(step => {

                    // If step matches one of the provided application ids
                    const applicationStep = applicationIds.find(id => {
                        return !!step.applicationIds.find(sId => sId === id);
                    });
                    if (applicationStep) {
                        stepList.push(step);
                    }
                });
            });
        }

        // Make sure step list and completedStepIds match
        if (stepList.length > completedStepIds.length) {
            return false;
        }

        let matchCount = 0;

        for (const step of stepList) {
            if (completedStepIds.find(id => id === step.componentType)) {
                matchCount += 1;
            }
        }

        return matchCount === stepList.length;
    }

    /**
     * Returns a list of onboarding steps
     */
    getOnboardingSteps$(): Observable<OnboardingStep$v1[]> {
        return this.dataSrv.dataSharing.getCapabilityManifests$(true).pipe(
            map(list => {
                // Only return capabilities that support onboarding
                const compList = list.filter(capability => {
                    if (!capability.compatible) {
                        return false;
                    }

                    return capability.compatible.find(comp => {
                        return comp.capabilityId === capabilityId &&
                            comp.options['onBoarding'];
                    });
                });

                const stepList = [];
                const tokens = [];

                for (const capability of compList) {
                    capability.compatible.filter(comp => {
                        return comp.capabilityId === capabilityId &&
                            comp.options['onBoarding'];
                    }).forEach(items => {
                        items.options['onBoarding'].steps.map(s => {
                            s.capabilityId = capability.id;
                            return s;
                        }).forEach(step => {
                            tokens.push(step.nameToken);
                            stepList.push(step);
                        });
                    });
                }

                // Only return steps for the app the user is part of
                return stepList.sort((a, b) => a.orderPreference - b.orderPreference);
            })
        );
    }

    /**
     * Listen to all messages in the mailbox service
     */
    private initPostOffice(): void {
        this.initListenerForGetCapabilityList();
        this.initListenerForGetTenant();
        this.initListenerForGetTenants();
        this.initListenerForGetDataAccessMap();
        this.initListenerForGetLicensedOperations();
        this.initListenerForGetIndustries();
        this.initListenerForGetSharerTenantInfo();
        this.initListenerForGetShareeTenantIds();
        this.initListenerForIsOnboardingCompleted();
        this.initListenerForGetApplications();
        this.initListenerForGetTenantFromAccessToken();
        this.initListenerForUpdateTenant();
        this.initListenerForUpdateEnableJargon();
        this.initListenerForGetUserTenants();
    }

    /**
     * Listen for app api call
    */
    private initListenerForGetApplications(): void {
        this.mailbox.mailbox$v1.getApplications$.subscribe(mailbox => {
            this.appStore.entity$.pipe(first()).subscribe(apps => {
                mailbox.response.next(apps);
            });
        });
    }

    /**
     * Listen for is onboarding completed event
     */
    private initListenerForIsOnboardingCompleted(): void {
        this.mailbox.mailbox$v1.isOnboardingCompleted$.subscribe((mailbox) => {
            const tenant: Tenant$v1 = mailbox.payload;

            mailbox.response.next(this.isOnboardingCompleted(tenant.onboardingConfiguredSteps, tenant.applicationIds));
        });
    }

    /**
     * Listen for get capability list event
     */
    private initListenerForGetCapabilityList(): void {
        this.mailbox.mailbox$v1.getCapabilityList$.subscribe(async (mailbox) => {
            const id = mailbox.payload;

            // Get data if not cached
            if (this.capabilityList === null) {
                this.capabilityList = await this.dataSrv.dataSharing.getCapabilityManifests$(true).toPromise();
            }

            mailbox.response.next(this.getCapabilityList(id));
        });
    }

    /**
     * Listen for get data access map event
     */
    private initListenerForGetDataAccessMap(): void {
        this.mailbox.mailbox$v1.getDataAccessMap$.subscribe(async (mailbox) => {
            if (!mailbox) {
                return;
            }

            const cId = mailbox.payload;

            // Get data if not cached
            if (!this.dataAccessMap) {
                this.dataAccessMap = await this.dataSrv.sharingCriteria.getMap$().toPromise();
            }

            if (this.dataAccessMap.has(cId)) {
                mailbox.response.next([].concat(this.dataAccessMap.get(cId)));

            } else {
                mailbox.response.next([]);
            }

        });
    }

    /**
     * Listen for get license operations event
     */
    private initListenerForGetLicensedOperations(): void {
        this.mailbox.mailbox$v1.getLicensedOperations$.subscribe(async (mailbox) => {
            if (!mailbox) {
                return;
            }

            // Get data if not cached
            if (!this.licensedOperations) {
                this.licensedOperations = await this.dataSrv.dataSharing.getLicensedOperations$().toPromise();
            }

            mailbox.response.next(this.licensedOperations);
        });
    }

    /**
     * Listen for get tenant event
     */
    private initListenerForGetTenant(): void {
        this.mailbox.mailbox$v1.getTenant$.pipe(filter(item => !!item))
            .subscribe(async (maillbox) => {
                const tenantId = maillbox.payload;

                // First look in the store
                const tenant = this.tenantStore.snapshot(tenantId);
                if (tenant) {
                    maillbox.response.next(tenant);
                } else {
                    const found = this.tenantRequestCache.get(tenantId);
                    let response$: Observable<Tenant$v1>;
                    if (found) {
                        response$ = found;
                    } else {
                        response$ = this.dataSrv.tenant.get$(tenantId);
                        this.tenantRequestCache.set(tenantId, response$);
                    }

                    const results = await response$.toPromise();

                    if (!found) {
                        this.tenantStore.upsert(results);
                        this.tenantRequestCache.delete(tenantId);
                    }

                    maillbox.response.next(results);
                }
            });
    }

    /**
     * Listen for get user tenants
     */
    private initListenerForGetUserTenants(): void {
        this.mailbox.mailbox$v1.getUserTenants$.pipe(filter(item => !!item))
            .subscribe(async (maillbox) => {
                const tenants = await this.dataSrv.tenant.getUserTenants$().toPromise();
                maillbox.response.next(tenants);
            });
    }

    /**
     * Listen for get tenant event
     */
    private initListenerForGetTenants(): void {
        const isReady$ = new BehaviorSubject<boolean>(false);
        this.mailbox.mailbox$v1.getTenants$.pipe(
            first()
        ).subscribe(async () => {
            // Make sure the first time this get called the store is loaded
            await this.dataSrv.tenant.getList$().toPromise().then((async list => {
                list.forEach(t => {
                    this.tenantStore.upsert(t);
                });
            }));

            isReady$.next(true);
        });

        // Listener that will be use most the time
        this.mailbox.mailbox$v1.getTenants$.subscribe(async (maillbox) => {
            combineLatest([
                this.tenantStore.entity$,
                isReady$
            ]).pipe(
                filter(([tenants, isReady]) => isReady),
                first(),
                map(([tenants, isReady]) => {
                    return tenants.map(t => new Tenant$v1(t));
                })
            ).subscribe(t => {
                maillbox.response.next(t);
            });
        });
    }

    /**
    * Listen for get tenant from access token event
    */
    private initListenerForGetTenantFromAccessToken(): void {
        this.mailbox.mailbox$v1.getTenantFromAccessToken$.pipe(filter(item => !!item))
            .subscribe(async (mailbox) => {
                this.dataSrv.tenant.getFromAccessToken$(mailbox.payload.baseUrl, mailbox.payload.accessToken).subscribe(result => {
                    mailbox.response.next(result);
                });
            });
    }

    /**
     * Listen for get industries event
     */
    private initListenerForGetIndustries(): void {
        this.mailbox.mailbox$v1.getIndustries$.subscribe(async (mailbox) => {
            if (!mailbox) {
                return;
            }

            this.industries$.pipe(
                first()
            ).subscribe(list => {
                mailbox.response.next(list);
            });
        });
    }

    /** Listener for get sharer tenant info event. */
    private initListenerForGetSharerTenantInfo(): void {
        this.mailbox.mailbox$v1.getSharerTenantInfo$.subscribe(async (mailbox) => {
            if (!mailbox) {
                return;
            }

            // Get data if not cached
            if (!this.sharerTenantInfo) {
                this.sharerTenantInfo = await this.dataSrv.sharingCriteria.get$().toPromise();
            }

            mailbox.response.next(this.sharerTenantInfo);
        });
    }

    /** Listener for get sharee tenant ids event. */
    private initListenerForGetShareeTenantIds(): void {
        this.mailbox.mailbox$v1.getShareeTenantIds$.subscribe(async (mailbox) => {
            if (!mailbox) {
                return;
            }

            // Get data if not cached
            if (!this.shareeTenantIds) {
                this.shareeTenantIds = await this.dataSrv.sharingCriteria.getShareeIds$().toPromise();
            }

            mailbox.response.next(this.shareeTenantIds);
        });
    }

    /** Listener for update tenant event */
    private initListenerForUpdateTenant(): void {
        this.mailbox.mailbox$v1.updateTenant$.pipe(filter(item => !!item))
            .subscribe(async (mailbox) => {
                this.dataSrv.tenant.updateAll$(mailbox.payload).subscribe(result => {
                    mailbox.response.next(result);
                });
            });
    }

    /** Listener for update EnableJargon tenant event */
    private initListenerForUpdateEnableJargon(): void {
        this.mailbox.mailbox$v1.updateTenantJargon$.pipe(filter(item => !!item))
            .subscribe(async (mailbox) => {
                this.dataSrv.jargon.update$(mailbox.payload).subscribe(result => {
                    mailbox.response.next(result);
                });
            });
    }

    private async initData() {
        await this.dataSrv.dataSharing.getCapabilityManifests$(true).toPromise().then((data) => {
            this.capabilityList = data;
        });

        // Load data access mapping
        if (!this.dataAccessMap) {
            await this.dataSrv.sharingCriteria.getMap$().toPromise().then((data) => {
                this.dataAccessMap = data;
            });
        }

        if (!this.licensedOperations) {
            await this.dataSrv.dataSharing.getLicensedOperations$().toPromise().then((data) => {
                this.licensedOperations = data;
            });
        }

        await this.dataSrv.tenant.getIndustries$().toPromise().then((industries) => {
            this.industries.next(industries);
        });

        await this.dataSrv.sharingCriteria.get$().toPromise().then((data) => {
            // Filter out disabled data
            const manifests = this.getCapabilityList(capabilityId);

            data = data.filter(c => {
                const manifest = manifests.find(m => m.id === c.capabilityId);

                if (c.criteriaType === CriteriaType$v1.internalGroupGlobal ||
                    c.criteriaType === CriteriaType$v1.internalGroupOverride) {
                    return !manifest?.excludeFromInternalDataSharing;
                }

                if (c.criteriaType === CriteriaType$v1.externalTenantGlobal ||
                    c.criteriaType === CriteriaType$v1.externalTenantOverride) {
                    return !manifest?.excludeFromExternalDataSharing;
                }

                return false;
            });

            this.sharerTenantInfo = data;
        });

        this.shareeTenantIds = await this.dataSrv.sharingCriteria.getShareeIds$().toPromise();
        this.mailbox.mailbox$v1.coreIsLoaded$.next(true);
    }

    private initListenerForNotifications() {
        this.notificationSrv.updated$.subscribe(() => {
            this.refreshDialogShow = true;
        });
    }

    /**
     * Listen to window messages regarding refresh dialog
     */
    private listenToRefreshDialogMsgs(): void {
        if (!this.windowSrv.isChildWindow()) {
            interval(600000).subscribe(() => {
                if (this.refreshDialogShow) {
                    this.refreshDialogShow = false;

                    this.windowSrv.getHandleIds().forEach(id => {
                        this.windowSrv.messageWindow({
                            handleId: id,
                            contextId: this.showRefreshDialogId
                        } as WindowMessage<void>);
                    });

                    this.showRefreshDialog();
                }
            });

        } else {
            // Listen to show refresh dialog
            this.windowSrv.receiveMessage$.pipe(
                filter(msg => msg.contextId === this.showRefreshDialogId)
            ).subscribe(() => {
                this.showRefreshDialog();
            });
        }

        this.windowSrv.receiveMessage$.pipe(
            filter(msg => msg.contextId === this.refreshMsgId)
        ).subscribe(() => {
            // Refresh UI.
            location.reload();
        });

        this.windowSrv.receiveMessage$.pipe(
            filter(msg => msg.contextId === this.cancelRefreshDialogId)
        ).subscribe(() => {
            this.refreshDialogShow = false;
            if (this.refreshDialogRef) {
                this.refreshDialogRef.close();
            }
        });
    }

    /**
     * Shows the refresh dialog.
     */
    private showRefreshDialog() {
        if (!this.refreshDialogRef) {
            // Show refresh dialog
            this.refreshDialogRef = this.dialog.open(RefreshDialogComponent, {
                disableClose: true,
                autoFocus: false
            });

            this.refreshDialogRef.afterClosed().subscribe(reload => {
                if (reload) {
                    if (this.windowSrv.isChildWindow()) {
                        this.windowSrv.messageMaster({
                            contextId: this.refreshMsgId
                        } as WindowMessage<void>);
                    } else {
                        location.reload();
                    }
                } else {

                    if (this.windowSrv.isChildWindow()) {
                        this.windowSrv.messageMaster({
                            contextId: this.cancelRefreshDialogId
                        } as WindowMessage<void>);
                    } else {
                        this.windowSrv.getHandleIds().forEach(id => {
                            this.windowSrv.messageWindow({
                                handleId: id,
                                contextId: this.cancelRefreshDialogId
                            } as WindowMessage<void>);
                        });
                    }
                }

                this.refreshDialogRef = null;
            });
        }
    }
}
