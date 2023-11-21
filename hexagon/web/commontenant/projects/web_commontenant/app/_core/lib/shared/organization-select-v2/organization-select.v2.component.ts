import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Industries$v1, Tenant$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { CoreService } from '../../core.service';
import { DataService$v2 } from '../../data.service.v2';
import { TranslatedTokens, TranslationTokens } from './organization-select.v2.translation';

interface Organization {

    /** Info about tenant */
    tenant: Tenant$v1;

    /** Flag that is true if the organization is enabled */
    isEnabled: boolean;
}

@Component({
    selector: 'hxgn-commontenant-organization-select-v2',
    templateUrl: 'organization-select.v2.component.html',
    styleUrls: [
        'organization-select.v2.component.scss',
        '../../shared/filter-dialog.component.scss'
    ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class OrganizationSelectComponent$v2 implements OnInit, OnDestroy {

    /** The tenants that are currently selected */
    @Input() selectedTenants: string[] = [];

    /** Emits when selected tenants change */
    @Output() selectionChange = new EventEmitter<string[]>();

    /**  Collection of known translation tokens */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    /** Filtered industry values after search. */
    filteredIndustries: Industries$v1[] = [];

    /** List of initial industries. */
    initialIndustries: Industries$v1[] = [];

    /** List of selected organizations. */
    organizations: Organization[] = [];

    /** List of sectors. Denoted by sectorToken and associated Industry values. */
    sectors: Map<string, Industries$v1[]> = new Map<string, Industries$v1[]>();

    /** String used for search input. */
    searchString = '';

    /** Translated industries map values. */
    industries: Map<string, string> = new Map<string, string>();

    /** Flag that is true when all the industries has been translated */
    industriesReady = false;

    /** List of tenant info objects */
    shareeTenantInfoList: Tenant$v1[];

    /** Cache of current user info */
    currentUserInfo: UserInfo$v1;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private dataSrv: DataService$v2,
        private identitySrv: CommonidentityAdapterService$v1,
        private coreSrv: CoreService
    ) { }

    /** Life cycle hook for on init */
    ngOnInit() {
        this.initLocalizationAsync();

        this.coreSrv.industries$.pipe(
            first()
        ).subscribe(async list => {
            this.initialIndustries = list;
            this.filteredIndustries = this.initialIndustries;

            this.buildSectors();

            this.currentUserInfo = await this.identitySrv.getUserInfoAsync();
            this.shareeTenantInfoList = await this.dataSrv.dataSharing.getSharees$().toPromise();
            // Filter out your own tenant
            this.shareeTenantInfoList = this.shareeTenantInfoList?.filter(tenant => {
                return tenant.id !== this.currentUserInfo.activeTenant;
            });

            this.shareeTenantInfoList.forEach(sharee => {
                let isEnabled = false;
                if (this.selectedTenants?.length) {
                    for (let i = 0; i < this.selectedTenants.length; i++) {
                        isEnabled = sharee.id === this.selectedTenants[i];
                        if (isEnabled) {
                            break;
                        }
                    }
                }

                this.organizations.push({
                    tenant: sharee,
                    isEnabled: isEnabled
                });
            });

            await this.localizeIndustriesAsync();

            this.industriesReady = true;
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            this.initLocalizationAsync();
            this.buildSectors();
            await this.localizeIndustriesAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Builds sectors values for display purposes. */
    buildSectors() {
        this.sectors = new Map<string, Industries$v1[]>();

        const translationList: string[] = [];
        if (this.filteredIndustries.length > 0) {
            this.filteredIndustries.forEach(industry => {
                if (this.sectors.has(industry.sectorToken)) {
                    this.sectors.get(industry.sectorToken).push(industry);

                    translationList.push(industry.sectorToken);
                    translationList.push(industry.nameToken);
                } else {
                    this.sectors.set(industry.sectorToken, [industry]);
                    translationList.push(industry.nameToken);
                }
            });
        }

        const uniqueSet = new Set(translationList);
        this.localizationSrv.localizeStringsAsync([...uniqueSet]);
    }

    /**
     * Returns a sorted industry list
     * @param industryList Industry list to sort
     */
    getIndustryListSorted(industryList: Industries$v1[]) {
        return industryList.sort((a, b) => {
            if (this.industries.get(a.id) > this.industries.get(b.id)) {
                return 1;
            } else if (this.industries.get(a.id) < this.industries.get(b.id)) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    /** Clears search text and resets filtered items. */
    clearText() {
        this.searchString = '';
        this.filteredIndustries = this.initialIndustries;
        this.buildSectors();
    }

    /** Gets value for checkbox. */
    getActiveValue(organizationID: string): boolean {
        return this.organizations.find(org => org.tenant.id === organizationID)?.isEnabled;
    }

    /** Sets active value. */
    setActiveValue(organizationID: string, $event: any) {

        const index = this.organizations.findIndex(org => org.tenant.id === organizationID);
        this.organizations[index].isEnabled = $event.checked;
        if ($event.checked) {
            this.selectedTenants.push(this.organizations[index].tenant.id);
        } else {
            const removeIndex = this.selectedTenants.findIndex(id => id === organizationID);
            this.selectedTenants.splice(removeIndex, 1);
        }

        this.selectionChange.emit([...this.selectedTenants]);
    }

    /**
     * Returns a list of tenants that can be shared with
     */
    getAvailableTenantList(industry: Industries$v1, filterByIndustry: boolean = false): Tenant$v1[] {
        const tenantList = this.getTenantList(filterByIndustry ? industry.id : null);
        return tenantList.filter(tenant => {
            const industryMatched = this.industries.get(industry.id).toLocaleLowerCase().includes(this.searchString.toLocaleLowerCase());
            const tenantMatched = tenant.name.toLocaleLowerCase().includes(this.searchString.toLocaleLowerCase());
            return industryMatched || tenantMatched;
        });
    }

    /**
    * Returns a list of sharee tenants info objects
    * @param filterByIndustry  The industry used to filter list of tenants
    */
    getTenantList(filterByIndustry: string = null): Tenant$v1[] {
        if (!this.shareeTenantInfoList) {
            return [];
        }

        let list = [].concat(this.shareeTenantInfoList);

        if (filterByIndustry) {
            list = list.filter(item => this.filterByIndustry(item, filterByIndustry));
        }

        return list.filter(item => {
            const searchTerms = this.searchString.split(' ');
            
            let found = 0;
            for (const term of searchTerms) {
                if (this.compareWithSearchString([item.tenantName], term)) {
                    found++;
                }
            }

            return found === searchTerms.length && item.shareeTenantId !== this.currentUserInfo.activeTenant;
        });
    }

    /**
   * Checks if the tenant is part of the target industry
   * @param tenant The tenant to check if pass filter string
   * @param industryName The industry name that a tenant must have
   */
    private filterByIndustry(tenant: Tenant$v1, industryId: string): boolean {
        return tenant.industryIds.includes(industryId);
    }

    /** Returns a list of the selected organizations */
    getUrlListOfSelectedOrgs() {
        return this.organizations.filter(org => org.isEnabled).map(x => x.tenant?.tenantIconUrl);
    }

    /** Gets actively selected count. */
    getActiveCount(): number {
        return this.organizations.filter(org => org.isEnabled).length;
    }

    /** Compares the input strings. */
    compareWithSearchString(tokens: string[], searchString: string): boolean {
        let isContained = true;

        if (tokens.length === 0 && searchString.length > 0) {
            return false;
        }

        for (let i = 0; i < tokens.length; i++) {
            if (searchString) {
                isContained = (tokens[i]?.toLocaleLowerCase().search(searchString?.toLocaleLowerCase()) !== -1);
            }

            if (isContained) {
                break;
            }
        }

        return isContained;
    }

    /** Localize industry names */
    private async localizeIndustriesAsync() {
        for (const industry of this.initialIndustries) {
            if (!this.industries.get(industry.id)) {
                await this.localizationSrv.getTranslationAsync(industry.nameToken).then(result => {
                    this.industries.set(industry.id, result as string);
                });
            }
        }
    }

    /** Set up routine for localization */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.searchOrganizations = translatedTokens[TranslationTokens.searchOrganizations];
    }
}
