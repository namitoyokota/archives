import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Industries$v1, SharingCriteria$v1, Tenant$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExternalListTranslatedTokens, ExternalListTranslationTokens } from './external-list.translation';

@Component({
    selector: 'hxgn-commontenant-external-list',
    templateUrl: 'external-list.component.html',
    styleUrls: ['external-list.component.scss']
})
export class ExternalListComponent implements OnInit, OnDestroy {

    /** List of industries */
    @Input('industries')
    set setIndustries(industries: Industries$v1[]) {
        this.initIndustryList(industries);
    }

    /** List of tenants that have opted into data sharing */
    @Input() tenants: Tenant$v1[] = [];

    /** List of external sharing criteria */
    @Input('sharingCriteria') 
    set setSharingCriteria(sc: SharingCriteria$v1<any, any>[]) {
        this.sharingCriteria = sc;

        if (this.selectedIndustry) {
            this.setIndustry(this.selectedIndustry);
        }
    }
    
    sharingCriteria: SharingCriteria$v1<any, any>[] = [];

    /** Event the criteria that has been selected */
    @Output() selectedCriteria = new EventEmitter<SharingCriteria$v1<any, any>[]>();

    /** Filtered industry values after search. */
    filteredIndustries: Industries$v1[] = [];

    /** Index used to prevent initial industry count from incrementing forever. */
    index = 1;

    /** Initial total number of industries. */
    industryCount = 0;

    /** List of initial industries. */
    initialIndustries: Industries$v1[] = [];

    /** List of sectors. Denoted by sectorToken and associated Industry values. */
    sectors: Map<string, Industries$v1[]> = new Map<string, Industries$v1[]>();

    /** String used for search input. */
    searchString = '';

    /** Currently selected industry. */
    selectedIndustry: Industries$v1 = null;

    /** Expose translation tokens to html template */
    tokens: typeof ExternalListTranslationTokens = ExternalListTranslationTokens;

    /** Translated tokens */
    tTokens: ExternalListTranslatedTokens = {} as ExternalListTranslatedTokens;

    /** List of organization IDs used in the table for the organization count. */
    organizations: string[] = [];

    /** Translated industries map values. */
    industries: Map<string, string> = new Map<string, string>();

    /** Flag that is true when all the industries has been translated */
    industriesReady = false;

    private destroy$ = new Subject();

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private cdr: ChangeDetectorRef
    ) { }

    /**
     * Initialization logic
     */
    ngOnInit() {
        this.initLocalizationAsync();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            this.initLocalizationAsync();
            await this.initIndustryList(this.initialIndustries);
        });
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Builds sectors values for display purposes.
     */
    buildSectors() {
        this.sectors = new Map<string, Industries$v1[]>();

        if (this.filteredIndustries.length > 0) {
            this.filteredIndustries.forEach(industry => {
                if (this.sectors.has(industry.sectorToken)) {
                    this.sectors.get(industry.sectorToken).push(industry);
                } else {
                    this.sectors.set(industry.sectorToken, [industry]);
                }
            });
        }
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

    /**
     * Sets the selected industry
     * @param industry The industry to be selected
     */
    setIndustry(industry: Industries$v1) {
        if (this.getOrganizationCount(industry) > 0) {
            this.selectedIndustry = industry;

            this.cdr.markForCheck();
            this.cdr.detectChanges();

            // Event the selected criteria
            // Get the tenants by industry
            // Filter tenants based on industry
            const tenants = this.tenants?.filter(t => {
                return t.industryIds.includes(industry.id);
            });

            if (tenants?.length) {
                const list = this.sharingCriteria.filter(sc => {
                    return !!tenants.find(t => t.id === sc.shareeTenantId);
                });

                this.selectedCriteria.emit(list);
            }
        }
    }

    /**
     * Returns the number of tenants that is configured by industry.
     * @param industry The industry to get a count for
     */
    getOrganizationCount(industry: Industries$v1 | Industries$v1[]): number {

        let industryList: string[] = [];
        if (!Array.isArray(industry)) {
            industryList = industryList.concat([industry.id]);
        } else {
            industryList = [].concat(industry.map(i => i.id));
        }

        // Filter tenants based on industry
        const tenants = this.tenants?.filter(t => {
            return t.industryIds.some(id => industryList.includes(id));
        });

        // Return a count of how many criteria documents have a sharee tenant id that match
        // the tenants list
        return tenants?.filter(t => {
            return !!this.sharingCriteria.find(sc => sc.shareeTenantId === t.id);
        })?.length;
    }

    /** Gets organization names for searching purposes. */
    getOrganizationNames(industry: Industries$v1): string[] {
        const names = [];

        return names;
    }

    /** Clears search text and resets filtered items. */
    clearText() {
        this.searchString = '';
        this.filteredIndustries = this.initialIndustries;
        this.buildSectors();
    }

    /** Search industries based on input. */
    searchIndustries() {
        const filteredIndustries: Industries$v1[] = [];
        const searchString: string = this.searchString.toLowerCase();

        this.initialIndustries.forEach((industry: Industries$v1) => {
            const industryName: string = this.industries.get(industry.id);
            if (industryName.toLowerCase().includes(searchString)) {
                filteredIndustries.push(industry);
            } else {
                const organizationNames: string[] = this.getOrganizationNames(industry);
                organizationNames.every((name: string) => {
                    if (name.toLowerCase().includes(searchString)) {
                        filteredIndustries.push(industry);
                        return false;
                    }

                    return true;
                });
            }
        });

        if (searchString.length) {
            this.filteredIndustries = filteredIndustries;
        } else {
            this.filteredIndustries = this.initialIndustries;
        }

        this.buildSectors();
    }

    /**
     * Sets the default industry selection
     */
    setDefaultSelection(industry: Industries$v1): void {
        const tenantList = this.tenants.filter(t => {
            return !!this.sharingCriteria.find(sc => sc.shareeTenantId === t.id);
        });

        // Check that selected industry still has items
        const exists = !!tenantList.find(t => {
            return t.industryIds.includes(this.selectedIndustry?.id);
        });

        if (!this.selectedIndustry || (this.selectedIndustry && !exists)) {
            this.setIndustry(industry);
        }
    }

    /**
     * Sets up the industry list
     * @param industries List of industries in the system
     */
    private async initIndustryList(industries: Industries$v1[]): Promise<void> {
        this.initialIndustries = industries;
        this.filteredIndustries = this.initialIndustries;

        const additionalTokens: string[] = [];

        this.initialIndustries.forEach(industry => {
            if (!additionalTokens.includes(industry.sectorToken)) {
                additionalTokens.push(industry.sectorToken);
            }

            if (!additionalTokens.includes(industry.nameToken)) {
                additionalTokens.push(industry.nameToken);
            }
        });

        await this.localizationSrv.localizeStringsAsync(additionalTokens);
        this.buildSectors();

        const industryPromises = [];
        this.initialIndustries.forEach((industry: Industries$v1) => {
            industryPromises.push(this.localizationSrv.getTranslationAsync(industry.nameToken));
        });

        const industryNames: string[] = await Promise.all(industryPromises);
        industryNames.forEach((name: string, index: number) => {
            this.industries.set(this.initialIndustries[index].id, name);
        });

        this.industriesReady = true;
    }

    /**
     * Set up routine for localization
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(ExternalListTranslationTokens).map(k => ExternalListTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.searchIndustry = translatedTokens[ExternalListTranslationTokens.searchIndustry];
    }
}
