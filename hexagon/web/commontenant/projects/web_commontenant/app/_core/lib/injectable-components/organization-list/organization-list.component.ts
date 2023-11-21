import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { LAYOUT_MANAGER_SETTINGS, OrganizationListSettings$v1, Tenant$v1 } from '@galileo/web_commontenant/_common';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DataService$v2 } from '../../data.service.v2';
import { TenantStoreService } from '../../tenant-store.service';
import { TranslatedTokens, TranslationTokens } from './organization-list.translation';

@Component({
    template: `
        <hxgn-commontenant-organization-list
            [organizations]="organizations$ | async" 
            [searchString$]="settings.searchString$"
            [selectedOrganization]="settings.selectedOrganization$ | async"
            [showDelete]="settings.showDelete$ | async"
            [showOnboarding]="settings.showOnboarding$ | async"
            [showOverview]="settings.showOverview$ | async"
            [showSystem]="settings.showSystem$ | async"
            (selection)="setSelection($event)" >
        </hxgn-commontenant-organization-list>
    `,
    styles: [`
        :host {
            width: 100%;
            height: 100%;
        }
    `]
})
export class OrganizationListInjectableComponent implements OnInit, OnDestroy {

    /** Stores token to avoid timing issue */
    deletedOrganization$: BehaviorSubject<string> = new BehaviorSubject<string>('');

    /** List of organizations to display in list */
    organizations$: Observable<Tenant$v1[]> = combineLatest([
        this.tenantStore.entity$,
        this.settings.organizationList$,
        this.deletedOrganization$.asObservable(),
        this.settings.showDeleted$
    ]).pipe(
        map(([organizations, ids, deletedOrganization, showDeleted]) => {
            let tenants = organizations;

            if (ids.length) {
                ids.forEach(id => {
                    const foundTenant = tenants.some(t => t.id === id);
                    if (!foundTenant && showDeleted) {
                        const deletedTenant = new Tenant$v1();
                        deletedTenant.id = id;
                        deletedTenant.name = deletedOrganization;
                        tenants = [...tenants, deletedTenant];
                    }
                })
            }

            return tenants;
        })
    );

    /** Expose translation tokens to html template */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS)
        public settings: OrganizationListSettings$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private tenantStore: TenantStoreService,
        private dataSrv: DataService$v2
    ) { }

    /** On init lifecycle hook */
    async ngOnInit() {
        this.initLocalizationAsync();

        this.tenantStore.clear();

        // First try to get full list
        this.dataSrv.tenant.getDetailedList$().subscribe(
            (tenants) => {
                this.tenantStore.upsert(tenants);
            },
            () => {
                // Can't get full list get abbreviated list
                this.dataSrv.tenant.getList$().subscribe(tenants => {
                    this.tenantStore.upsert(tenants);
                });
            }
        );

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Set selected organization
     * @param organization Selected organization
     */
    setSelection(organization: Tenant$v1) {
        this.settings.changeSelection(organization);
    }

    /**
     * Set up routine for localization
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.deletedOrganization$.next(translatedTokens[TranslationTokens.deletedOrganization]);
    }
}
