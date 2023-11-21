import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import {
    Industries$v1,
    LAYOUT_MANAGER_SETTINGS,
    OnboardingAdapterService$v1,
    OnboardingTab$v1,
    Tenant$v1,
} from '@galileo/web_commontenant/_common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { CoreService } from '../../core.service';
import { DataService$v2 } from '../../data.service.v2';
import { TenantConfigComponent } from '../../shared/tenant-config/tenant-config.component';
import { TenantStoreService } from '../../tenant-store.service';
import { OnboardingInjectableTranslationTokens } from './onboarding-injectable.translation';

@Component({
    templateUrl: 'onboarding-injectable.component.v1.html',
    styleUrls: ['onboarding-injectable.component.v1.scss']
})
export class OnboardingInjectableComponent implements OnInit, OnDestroy {

    /** Reference to tenant config component. */
    @ViewChild(TenantConfigComponent) tenantConfigRef: TenantConfigComponent;

    /** Map of industry groups. */
    industryGroups$: Observable<Map<string, Industries$v1[]>> = this.coreSrv.industries$.pipe(
        first(),
        map((industries: Industries$v1[]) => {
            const industriesMap: Map<string, Industries$v1[]> = new Map<string, Industries$v1[]>();
            industries.forEach((industry: Industries$v1) => {
                if (industriesMap.has(industry.sectorToken)) {
                    industriesMap.get(industry.sectorToken).push(industry);
                } else {
                    industriesMap.set(industry.sectorToken, [industry]);
                }
            });

            return industriesMap;
        })
    );

    /** Tenant object that can be updated */
    tenant$: BehaviorSubject<Tenant$v1> = new BehaviorSubject<Tenant$v1>(null);

    /** Expose tab to html */
    tab: typeof OnboardingTab$v1 = OnboardingTab$v1;

    /** Expose OnboardingInjectableTranslationTokens to HTML */
    tokens: typeof OnboardingInjectableTranslationTokens = OnboardingInjectableTranslationTokens;

    /** Event when the component is destroyed */
    private destroy$ = new Subject();

    /** New icon to save */
    private newIconFile: File;

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public onboardingAdapterSrv: OnboardingAdapterService$v1,
        private identitySrv: CommonidentityAdapterService$v1,
        private coreSrv: CoreService,
        private tenantStore: TenantStoreService,
        private dataSrv: DataService$v2
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit(): Promise<void> {
        this.initListeners();

        const userInfo = await this.identitySrv.getUserInfoAsync();
        let initialTenant = this.tenantStore.snapshot(userInfo.activeTenant);
        if (!initialTenant) {
            initialTenant = await this.dataSrv.tenant.get$(userInfo.activeTenant).toPromise();
            this.tenantStore.upsert(initialTenant);
        }

        this.tenant$.next(new Tenant$v1(initialTenant));
        this.setCanSave(this.isTenantValid(initialTenant));
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Sets the new icon file
     * @param file Icon file
     */
    setNewIcon(file: File): void {
        this.newIconFile = file;
        this.tenant$.next(new Tenant$v1(this.tenant$.getValue()));
    }

    /**
     * Respond to changes made to tenant
     * @param tenant The updated tenant
     */
    updateTenant(tenant: Tenant$v1): void {
        this.tenant$.next(new Tenant$v1(tenant));
        this.setCanSave(this.isTenantValid(tenant));
    }

    /**
     * Responds to the is valid event of the tenant config component
     * @param canSave Flag that is true if the tenant can be saved
     */
    setCanSave(canSave: boolean) {
        this.onboardingAdapterSrv.setSaveEnabled(canSave);
    }

    private isTenantValid(tenant: Tenant$v1): boolean {
        return (
            !!tenant.name?.trim() &&
            !!tenant.industryIds?.length &&
            !!tenant.city?.trim() &&
            !!tenant.state?.trim() &&
            !!tenant.country?.trim() &&
            tenant.abbreviation?.trim().length >= 2 &&
            tenant.abbreviation?.trim().length <= 4
        );
    }

    /**
     * Initializes listener for onboarding adapter
     */
    private initListeners(): void {
        this.onboardingAdapterSrv.save$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.saveChangesAsync();
        });
    }

    /**
     * Saves update to tenant
     */
    private async saveChangesAsync(): Promise<void> {
        if (this.newIconFile) {
            const updatedTenantIcon: Tenant$v1 = new Tenant$v1(await this.dataSrv.tenant.uploadIcon$(this.newIconFile).toPromise());
            updatedTenantIcon.tenantIconUrl = updatedTenantIcon.tenantIconUrl + `?v=${new Date().getTime()}`;
            updatedTenantIcon.etag = updatedTenantIcon.etag;
            this.tenantConfigRef.resetIcon();
        }

        const updatedTenant: Tenant$v1 = await this.dataSrv.tenant.update$(this.tenant$.getValue()).toPromise();
        this.tenantStore.upsert(updatedTenant);
        this.tenantConfigRef.saveFlags(false);
        this.onboardingAdapterSrv.saveComplete();
    }
}
