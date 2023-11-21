import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  CommonidentityAdapterService$v1,
  MonitorResponse$v1,
  PatDefinition$v1,
  User$v1,
} from '@galileo/web_commonidentity/adapter';
import { CommonlicensingAdapterService$v1 } from '@galileo/web_commonlicensing/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CapabilityManifest$v1, Tenant$v1, TranslationGroup } from '@galileo/web_commontenant/_common';
import { DataService$v2 } from '@galileo/web_commontenant/app/_core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActivityMonitoringTranslatedTokens, ActivityMonitoringTranslationTokens } from './activity-monitoring.translation';
import {
  SystemActivityEmailsDialogComponent,
} from './system-activity-emails-dialog/system-activity-emails-dialog.component';

interface Overview {

    /** Name of tenant. */
    tenantName: string;

    /** Number of active users. */
    activeUsers: number;

    /** Number of total users. */
    totalUsers: number;

    /** Timestamp for last login time. */
    lastAccessed: Date;
}

@Component({
    selector: 'hxgn-commontenant-activity-monitoring',
    templateUrl: 'activity-monitoring.component.html',
    styleUrls: ['activity-monitoring.component.scss']
})
export class ActivityMonitoringComponent implements OnInit, OnDestroy {

    /** View child for search input. */
    @ViewChild('search') searchInput: ElementRef;

    /** View child for table sort. */
    @ViewChild(MatSort, { static: false }) set content(sort: MatSort) {
        this.dataSource.sort = sort;

        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'tenantName':
                    return item.tenantName.toLowerCase();
                default:
                    return item[property];
            }
        };
    }

    /** Stores number of active users by tenant id. */
    activeUsers: Map<string, User$v1[]> = new Map<string, User$v1[]>();

    /** List of capabilities. */
    capabilities: CapabilityManifest$v1[] = [];

    /** Data source for table. */
    dataSource: MatTableDataSource<Overview> = new MatTableDataSource<Overview>([]);

    /** List of definitions. */
    definitions: PatDefinition$v1[] = [];

    /** Columns to be displayed in the table. */
    displayedColumns: string[] = ['tenantName', 'activeUsers', 'totalUsers', 'lastAccessed'];

    /** Tracks loading of individual organization on selection. */
    organizationLoading = false;

    /** Tracks loading of organizations list. */
    organizationsLoading = true;

    /** Store of organizations. */
    organizations: Tenant$v1[] = [];

    /** Tracks selected organization. */
    selectedOrganization: Tenant$v1 = null;

    /** Licenses in use for selected organization. */
    selectedOrganizationLicensesInUse: Map<string, number> = new Map<string, number>();

    /** Total licenses for selected organization. */
    selectedOrganizationTotalLicenses: Map<string, number> = new Map<string, number>();

    /** Monitoring info for selected organization. */
    selectedOrganizationMonitoring: MonitorResponse$v1[] = [];

    /** Expose translation tokens to html. */
    tokens: typeof ActivityMonitoringTranslationTokens = ActivityMonitoringTranslationTokens;

    /** Stores number of total users by tenant id. */
    totalUsers: Map<string, User$v1[]> = new Map<string, User$v1[]>();

    /** Tenant id used to indicate overview is selected */
    readonly overviewTenantId = 'Overview';

    /** Translated tokens. */
    tTokens: ActivityMonitoringTranslatedTokens = {} as ActivityMonitoringTranslatedTokens;

    /** Bus for search string. */
    private searchString: BehaviorSubject<string> = new BehaviorSubject<string>('');

    /** Search string observable. */
    readonly searchString$: Observable<string> = this.searchString.asObservable();

    /** List of tokens to translate */
    private localizeTokens: string[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dataSrv: DataService$v2,
        private dialog: MatDialog,
        private identitySrv: CommonidentityAdapterService$v1,
        private licensingSrv: CommonlicensingAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private route: ActivatedRoute,
        private titleSrv: Title
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit(): Promise<void> {
        this.initLocalizationAsync();

        const overviewTenant = new Tenant$v1();
        overviewTenant.id = this.overviewTenantId;
        this.selectedOrganization = overviewTenant;

        const organizations = await this.dataSrv.tenant.getDetailedList$().toPromise();
        this.organizations = this.sortOrganizations(organizations);

        this.activeUsers = await this.identitySrv.getActiveUsersAsync();
        this.totalUsers = await this.identitySrv.getTotalUsersAsync();
        const lastLogin = await this.identitySrv.getTenantLastLoginAsync(organizations.map(x => x.id));

        this.dataSource.data = organizations.map(organization => {
            return ({
                tenantName: organization.name,
                activeUsers: this.getActiveUsers(organization.id),
                totalUsers: this.getTotalUsers(organization.id),
                lastAccessed: lastLogin.get(organization.id) ? new Date(lastLogin.get(organization.id)) : null
            } as Overview);
        });

        this.organizationsLoading = false;

        if (this.route.snapshot.paramMap.has('id')) {
            const linkId = this.route.snapshot.paramMap.get('id');
            const organization = this.organizations.find(x => x.id === linkId);
            if (!!organization) {
                this.setSelectedOrganizationAsync(organization);
            }
        }

        this.capabilities = await this.dataSrv.dataSharing.getCapabilityManifests$().toPromise();
        this.localizeTokens = [];
        this.localizeTokens = this.localizeTokens.concat(this.capabilities.map(capability => capability.nameToken));

        const definitions = await this.identitySrv.getPATDefinitionsAsync();
        this.definitions = definitions.filter(x => x.licenseImplementation === 'Checkout');
        this.localizeTokens = this.localizeTokens.concat(this.definitions.map(x => x.nameToken));

        this.localizationSrv.localizeStringsAsync(this.localizeTokens);

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
            this.localizationSrv.localizeStringsAsync(this.localizeTokens);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Clears search box text.
     */
    clearText() {
        this.searchString.next('');
        this.searchInput.nativeElement.value = '';
    }

    /**
     * Gets number of active users by organization id
     * @param organizationId Organization id
     */
    getActiveUsers(organizationId: string): number {
        return this.activeUsers.has(organizationId) ? this.activeUsers.get(organizationId).length : 0;
    }

    /**
     * Gets number of total users by organization id
     * @param organizationId Organization id
     */
    getTotalUsers(organizationId: string): number {
        return this.totalUsers.has(organizationId) ? this.totalUsers.get(organizationId).length : 0;
    }

    /**
     * Opens system activity notifications dialog
     */
    openSystemActivityNotificationsDialog(): void {
        this.dialog.open(SystemActivityEmailsDialogComponent, {
            height: '650px',
            width: '930px',
            autoFocus: false,
            disableClose: true
        });
    }

    /**
     * Sets selected organization
     * @param organization Organization to select
     */
    async setSelectedOrganizationAsync(organization: Tenant$v1): Promise<void> {
        this.organizationLoading = true;
        this.selectedOrganization = organization;

        if (this.selectedOrganization.id !== this.overviewTenantId) {
            this.selectedOrganizationMonitoring = await this.identitySrv.getSystemMonitoringAsync(this.selectedOrganization.id, null, true);
            this.selectedOrganizationLicensesInUse = await this.licensingSrv.getLicensesInUseByFeatureNameAndTenantAsync(
                this.definitions.map(x => x.licenseFeatureId), this.selectedOrganization.id
            );
            this.selectedOrganizationTotalLicenses = await this.licensingSrv.getTotalLicensesByFeatureNameAndTenantAsync(
                this.definitions.map(x => x.licenseFeatureId), this.selectedOrganization.id
            );
        } else {
            this.selectedOrganizationMonitoring = [];
        }

        this.organizationLoading = false;
    }

    /**
     * Sets search string
     * @param $event Input event
     */
    setSearchString($event: any) {
        this.searchString.next($event.target.value);
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        this.localizationSrv.localizeGroup([
            TranslationGroup.activityMonitor,
            TranslationGroup.common,
            TranslationGroup.commonAdmin,
            TranslationGroup.core
        ]);
        this.titleSrv.setTitle('HxGN Connect');

        const tokens: string[] = Object.keys(ActivityMonitoringTranslationTokens).map(k => ActivityMonitoringTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.searchOrganizations = translatedTokens[ActivityMonitoringTranslationTokens.searchOrganizations];
        this.tTokens.activityMonitor = translatedTokens[ActivityMonitoringTranslationTokens.activityMonitor];
        this.titleSrv.setTitle(`HxGN Connect - ${this.tTokens.activityMonitor}`);
    }

    /**
     * Sorts tenants by name.
     */
    private sortOrganizations(organizations: Tenant$v1[]): Tenant$v1[] {
        return organizations.sort((a, b) => {
            if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) {
                return 1;
            } else if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) {
                return -1;
            } else {
                return 0;
            }
        });
    }
}
