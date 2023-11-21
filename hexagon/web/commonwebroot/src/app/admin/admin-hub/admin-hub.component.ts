import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import {
    capabilityId as IdentityCapabilityId,
    Claims as IdentityClaims,
    CommonidentityAdapterService$v1,
    UserInfo$v1
} from '@galileo/web_commonidentity/adapter';
import { capabilityId as LicensingCapabilityId, Claims as LicensingClaims } from '@galileo/web_commonlicensing/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    capabilityId as CommonTenantCapabilityId,
    Claims as CommonTenantClaims,
    CommontenantAdapterService$v1,
} from '@galileo/web_commontenant/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavigationService } from '../../main-menu/navigation.service';

import { AdminMenuData, AdminService } from '../admin.service';
import { TranslationTokens } from './admin-hub.translation';

enum DashboardClicks {
    accessManager = 'accessManager',
    actionItems = 'actionItems',
    help = 'help'
}

enum ActionItemPriority {
    high = 'high',
    medium = 'medium',
    low = 'low',
}

export interface ActionItem {
    /** Icon url */
    iconURL: string;
    /** Name */
    name: string;
    /** Link */
    link: string;
    /** Link text */
    linkText: string;
    /** Expiration date */
    expiration: Date;
    /** Priority */
    priority: string;
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-root-admin-hub',
    templateUrl: 'admin-hub.component.html',
    styleUrls: ['admin-hub.component.scss']
})
export class AdminHubComponent implements OnInit, OnDestroy {

    /** View child tab group */
    @ViewChild('tabGroup') tabGroup: MatTabGroup;

    /** List of action items for table. */
    actionItems: ActionItem[] = [];

    /** Number of active users. */
    activeUsersCount = 0;

    /** Number of collaborating organizations. */
    collaboratingOrganizationsCount = 0;

    /** Number of high priority action items. */
    highCount = 0;

    /** Determines if the page is currently loading. */
    loading = true;

    /** Number of low priority action items. */
    lowCount = 0;

    /** Number of medium priority action items. */
    mediumCount = 0;

    /** The selected tab index */
    selectedTabIndex = 0;

    /** Expose translation tokens to html template */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Current user. */
    user: UserInfo$v1;

    /** Expose common identity claims to HTML */
    identityClaims: typeof IdentityClaims = IdentityClaims;

    /** Capability id for common identity */
    readonly identityCapabilityId = IdentityCapabilityId;

    /** Expose common tenant claims to HTML */
    commonTenantsClaims: typeof CommonTenantClaims = CommonTenantClaims;

    /** Capability id for common tenant */
    readonly commonTenantCapabilityId = CommonTenantCapabilityId;

    /** Expose licensing claims to HTML. */
    licensingClaims: typeof LicensingClaims = LicensingClaims;

    /** List of quick link menu items */
    menuItems: AdminMenuData[] = [];

    /** Flag that is true if panes are shown */
    showPanes = false;

    /** Capability id for licensing. */
    readonly licensingCapabilityId = LicensingCapabilityId;

    /** Destroy subject */
    private destroy$: Subject<void> = new Subject<void>();

    constructor(private adminService: AdminService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private identitySrv: CommonidentityAdapterService$v1,
        private tenantSrv: CommontenantAdapterService$v1,
        private navSrv: NavigationService,
        private titleSrv: Title,
        private windowCommSrv: CommonWindowCommunicationService) {
        this.adminService.menuTitleToken = this.tokens.adminHome;
    }


    /** Asynchronously run on component initialization. */
    async ngOnInit() {
        this.adminService.menuItems$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(items => {
            this.menuItems = items.filter(item => {
                return !!item.quickLinkIconUrl;
            });
        });

        this.setTitle();

        this.user = await this.identitySrv.getUserInfoAsync();

        this.showPanes = (this.user?.hasClaim(this.identityCapabilityId, this.identityClaims.accessManagerAccess) &&
            this.user?.hasClaim(this.identityCapabilityId, this.identityClaims.userManagerAccess)) || 
            this.user?.hasClaim(this.licensingCapabilityId, this.licensingClaims.licensingDashboardAccess);


        this.identitySrv.getUsersAsync().then(users => {
            this.activeUsersCount = users.length;
        });

        this.tenantSrv.getShareeTenantIdsAsync().then(ids => {
            this.collaboratingOrganizationsCount = ids.length;
        });


        if (this.user?.hasClaim(this.identityCapabilityId, this.identityClaims.accessManagerAccess) &&
            this.user?.hasClaim(this.identityCapabilityId, this.identityClaims.userManagerAccess)) {
            this.buildTable();
        }
        

        setTimeout(() => {
            this.tabGroup.selectedIndex = 0;
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.setTitle();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Builds table data. */
    async buildTable() {
        const actionItems: ActionItem[] = [];

        // Get personal access tokens action items.
        await this.identitySrv.getPersonalAccessTokensAsync().then(tokens => {
            tokens.forEach(token => {
                const diffDays = this.getDiffDays(new Date(token.expiration));
                if (diffDays <= 7) {
                    const actionItem: ActionItem = {
                        iconURL: 'assets/access-management-icon.svg',
                        name: 'expiringPat',
                        linkText: token.name,
                        link: 'admin/accessManager',
                        expiration: new Date(token.expiration),
                        priority: this.setPriority(diffDays)
                    };
                    actionItems.push(actionItem);
                }
            });
        });

        // Get pending invitations access items.
        await this.identitySrv.getInvitationsAsync().then(invitations => {
            invitations.forEach(invitation => {
                const diffDays = this.getDiffDays(invitation.expiration);
                const actionItem: ActionItem = {
                    iconURL: 'assets/user-icon.svg',
                    name: 'newUserNoResponse',
                    linkText: invitation.email,
                    link: 'admin/userManager',
                    expiration: new Date(invitation.expiration),
                    priority: this.setPriority(diffDays)
                };
                actionItems.push(actionItem);
            });
        });

        // Sort action items by expiration
        actionItems.sort((a, b) => {
            return a.expiration.getTime() - b.expiration.getTime();
        });

        // Set table properties
        this.actionItems = actionItems;
        this.loading = false;
    }

    /** Gets days between today and an expiration date. */
    getDiffDays(expiration: Date): number {
        const today = new Date();
        const expirationDate = new Date(expiration);
        const oneDay = 24 * 60 * 60 * 1000;
        return (expirationDate.getTime() - today.getTime()) / oneDay;
    }

    /** Navigates to specified route on button click. */
    goTo(route: string) {
        this.navSrv.currentRouteId = route;
        this.navSrv.navigate(route);
    }

    /** Navigates to route on action item click. */
    goToAction(action: ActionItem) {
        if (action.name === 'newUserNoResponse') {
            this.goTo('/admin/userManager');
        } else if (action.name === 'expiringPat') {
            this.goTo('/admin/accessManager');
        }
    }

    /**
     * Handles when something is clicked in the licensing dashboard
     * @param item Item clicked
     */
    handleDashboardClick(item: string) {
        if (item === DashboardClicks.accessManager) {
            this.goTo('/admin/accessManager');
        } else if (item === DashboardClicks.actionItems) {
            this.selectedTabIndex = 1;
        } else {
            this.openHelp();
        }
    }

    /** Opens help window. */
    openHelp() {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'ADMIN_HELP',
                handleId: null,
                data: null
            });
        } else {
            const hostname = window.location.hostname;
            let screenUrl = '/help/admin';
            const handle = 'admin-help';

            if (hostname !== 'localhost') {
                screenUrl = '/webroot/help/admin';
            }

            if (this.windowCommSrv.hasHandle(handle)) {
                this.windowCommSrv.setFocus(handle);
            } else {
                this.windowCommSrv.createHandle(handle,
                    window.open(`${screenUrl}`));
            }
        }
    }

    /** Sets priority for action item. */
    setPriority(daysRemaining: number): string {
        if (daysRemaining >= 4) {
            this.lowCount += 1;
            return ActionItemPriority.low;
        } else if (daysRemaining >= 1) {
            this.mediumCount += 1;
            return ActionItemPriority.medium;
        } else {
            this.highCount += 1;
            return ActionItemPriority.high;
        }
    }

    /** Sets the page's title */
    private async setTitle() {
        this.titleSrv.setTitle('HxGN Connect');
        const title = await this.localizationSrv.getTranslationAsync(this.tokens.adminHome);
        this.titleSrv.setTitle(`HxGN Connect - ${title}`);
    }
}
