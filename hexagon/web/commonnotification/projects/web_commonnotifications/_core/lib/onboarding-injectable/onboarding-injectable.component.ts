import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { LAYOUT_MANAGER_SETTINGS, NotificationSettings$v1 } from '@galileo/web_commonnotifications/_common';
import { CommontenantAdapterService$v1, OnboardingAdapterService$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataService } from '../data.service';
import { OnboardingTranslationTokens } from './onboarding-injectable.translation';

@Component({
    templateUrl: 'onboarding-injectable.component.html',
    styleUrls: ['onboarding-injectable.component.scss']
})
export class OnboardingInjectableComponent implements OnInit, OnDestroy {

    /** Tracks initial page load. */
    isLoading = true;

    /** List of presets for dropdown. */
    presets: NotificationSettings$v1[] = [];

    /** Tracks selected preset. */
    selectedPreset: NotificationSettings$v1 = null;

    /** Current user's tenant. */
    tenant: Tenant$v1 = null;

    /** Expose translation tokens to html. */
    tokens: typeof OnboardingTranslationTokens = OnboardingTranslationTokens;

    /** Event when the component is destroyed */
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public onboardingAdapterSrv: OnboardingAdapterService$v1,
        private dataSrv: DataService,
        private identitySrv: CommonidentityAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private tenantSrv: CommontenantAdapterService$v1
    ) { }

    /**
     * On init life cycle hook
     */
    async ngOnInit(): Promise<void> {
        this.initEventListener();

        const presets = await this.dataSrv.setting.getSystemDefined$().toPromise();
        this.presets = presets.filter(x => x.preset !== '00000000-0000-0000-0000-000000000002');

        const currentPreset = await this.dataSrv.setting.getDefault$().toPromise();
        if (currentPreset) {
            this.onboardingAdapterSrv.setSaveEnabled(true);
        }

        this.isLoading = false;

        const userInfo: UserInfo$v1 = await this.identitySrv.getUserInfoAsync();
        this.tenant = await this.tenantSrv.getTenantAsync(userInfo.activeTenant);
    }

    /**
     * On destroy life cycle event
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Sets selected preset
     * @param $event Mat selection event
     */
    setSelectedPreset($event: MatSelectChange): void {
        this.selectedPreset = this.presets.find(x => x.preset === $event.value);
        this.onboardingAdapterSrv.setSaveEnabled(true);
    }

    /**
     * Listen to on save events
     */
    private initEventListener(): void {
        this.onboardingAdapterSrv.save$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.saveAsync();
        });
    }

    /**
     * Save the ruleset
     */
    private async saveAsync(): Promise<void> {
        const newPreset = new NotificationSettings$v1(this.selectedPreset);

        const presetName = await this.localizationSrv.getTranslationAsync(this.selectedPreset.presetName);
        const description = await this.localizationSrv.getTranslationAsync(this.selectedPreset.description);

        newPreset.etag = null;
        newPreset.preset = null;
        newPreset.presetName = presetName;
        newPreset.description = description;
        newPreset.tenantId = this.tenant.id;
        newPreset.isDefault = true;

        await this.dataSrv.setting.create$(newPreset).toPromise();
        this.onboardingAdapterSrv.saveComplete();
    }
}
