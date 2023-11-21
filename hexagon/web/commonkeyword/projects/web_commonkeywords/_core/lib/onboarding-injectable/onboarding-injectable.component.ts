import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import {
  capabilityId,
  CompatibleOptions,
  KeywordRuleset$v1,
  LAYOUT_MANAGER_SETTINGS,
  ResourceType$v1,
  RulesetRequest$v1,
} from '@galileo/web_commonkeywords/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
  CapabilityManifest$v1,
  CommontenantAdapterService$v1,
  Industries$v1,
  OnboardingAdapterService$v1,
  Tenant$v1,
} from '@galileo/web_commontenant/adapter';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataService } from '../data.service';
import { OnboardingTranslationTokens } from './onboarding-injectable.translation';

@Component({
    templateUrl: 'onboarding-injectable.component.html',
    styleUrls: ['onboarding-injectable.component.scss']
})
export class OnboardingInjectableComponent implements OnInit, OnDestroy {

    /** Tracks which capabilities have been completed. */
    capabilityCompletion: Map<string, boolean> = new Map<string, boolean>();

    /** List of capabilities to set ruleset for */
    capabilityList$ = new BehaviorSubject<CapabilityManifest$v1[]>([]);

    /** List of all industries */
    industryList: Industries$v1[] = [];

    /** Tracks selected capability id. */
    selectedCapability: BehaviorSubject<CapabilityManifest$v1> = new BehaviorSubject<CapabilityManifest$v1>(null);

    /** Observable for selected capability. */
    selectedCapability$: Observable<CapabilityManifest$v1> = this.selectedCapability.asObservable();

    /** Dictionary for ruleset requests to capability */
    selectedRuleSets = new Map<string, RulesetRequest$v1[]>();

    /** The current tenant */
    tenant: Tenant$v1;

    /** Expose  OnboardingTranslationTokens to HTML*/
    tokens: typeof OnboardingTranslationTokens = OnboardingTranslationTokens;

    /** Event when the component is destroyed */
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public onboardingAdapterSrv: OnboardingAdapterService$v1,
        private tenantSrv: CommontenantAdapterService$v1,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private identitySrv: CommonidentityAdapterService$v1,
        private dataSrv: DataService,
        private ffAdapter: CommonfeatureflagsAdapterService$v1
    ) { }

    /**
     * On init life cycle event
     */
    async ngOnInit() {
        this.initEventListener();
        await this.loadIndustriesAsync();
        await this.loadTenantAsync();
        await this.loadCapabilitiesAsync();

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            await this.loadIndustriesAsync();
            await this.loadTenantAsync();
            await this.loadCapabilitiesAsync();
        });
    }

    /**
     * On destroy life cycle event
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Returns an industry by id
     * @param id Industry id
     */
    getIndustry(id: string): Industries$v1 {
        return this.industryList.find(industry => industry.id === id);
    }

    /**
     * Method used to track a capability in a ngFor loop
     * @param index The index of the item
     * @param item The item
     */
    trackByCapabilityId(index, item: CapabilityManifest$v1): string {
        return item.id;
    }

    /**
     * Save the ruleset
     */
    async saveAsync(): Promise<void> {
        const waitFor = [];
        for (const key of Array.from(this.selectedRuleSets.keys())) {
            waitFor.push(this.dataSrv.ruleset.setSystemDefined$(key, this.selectedRuleSets.get(key)).toPromise());
        }

        await Promise.all(waitFor);
        this.onboardingAdapterSrv.saveComplete();
    }

    /**
     * Checks if the save button should be enabled
     */
    checkSaveEnabled(): void {
        let isComplete = true;
        this.capabilityList$.getValue().forEach((capability: CapabilityManifest$v1) => {
            const capabilityCompletedRulesets: RulesetRequest$v1[] = this.selectedRuleSets.get(capability.id);
            if (!capabilityCompletedRulesets || capabilityCompletedRulesets.length !== this.tenant.industryIds.length) {
                isComplete = false;
            }
        });

        this.onboardingAdapterSrv.setSaveEnabled(isComplete);
    }

    /**
     * Gets capability background image
     */
    getCapabilityBackgroundImage(capability: CapabilityManifest$v1): string {
        const keywordOperation = capability.compatible.find(x => x.capabilityId === capabilityId);
        return (keywordOperation.options as any).onboarding.iconPath;
    }

    /**
     * Sets selected capability.
     * @param capability Capability to select
     */
    setSelectedCapability(capability: CapabilityManifest$v1): void {
        this.selectedCapability.next(capability);
    }

    /**
     * Tracks capability completion based on how many rulesets have been set per capability
     */
    updateSelectedRulesets($event: Map<string, RulesetRequest$v1[]>): void {
        const selectedCapabilityRulesets: RulesetRequest$v1[] = this.selectedRuleSets.get(this.selectedCapability.getValue().id);
        if (selectedCapabilityRulesets.length === this.tenant.industryIds.length) {
            this.capabilityCompletion.set(this.selectedCapability.getValue().id, true);
        }

        this.checkSaveEnabled();
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

    private async loadIndustriesAsync() {
        this.industryList = await this.tenantSrv.getIndustriesAsync().then(async list => {
            await this.localizationAdapter.localizeStringsAsync(list.map(c => c.nameToken));
            return list;
        });
    }

    private async loadTenantAsync() {
        this.tenant = await this.tenantSrv.getTenantAsync((await this.identitySrv.getUserInfoAsync()).activeTenant).then(async tenant => {
            // Create map between industryId and name
            const names = new Map<string, string>();
            for (const industryId of tenant.industryIds) {
                const name: string = await this.localizationAdapter.getTranslationAsync(this.getIndustry(industryId).nameToken);
                names.set(industryId, name);
            }

            tenant.industryIds = [].concat(tenant.industryIds.sort((a, b) => {
                if (names.get(a) > names.get(b)) {
                    return 1;
                } else {
                    return -1;
                }
            }));

            return tenant;
        });
    }

    private async loadCapabilitiesAsync() {
        let rulsetPromises = [];

        this.capabilityList$.next(await this.tenantSrv.getCapabilityListAsync(capabilityId).then(async list => {
            // Filter out FF
            list = list.filter(manifest => {
                const settings: CompatibleOptions = manifest.compatible.find(c => c.capabilityId === capabilityId)?.options as CompatibleOptions;
                if (settings?.featureFlag && !this.ffAdapter.isActive(settings.featureFlag)) {
                    return false;
                }

                return true;
            });

            if (list) {
                // Sort capability list
                const capabilityTokens = new Map<string, string>();
                const capabilityNameTokens: string[] = list.map(x => x.nameToken);

                this.localizationAdapter.localizeStringsAsync(capabilityNameTokens).then(async () => {
                    const translatedTokens = await this.localizationAdapter.getTranslationAsync(capabilityNameTokens);

                    capabilityNameTokens.forEach((token: string) => {
                        capabilityTokens.set(token, translatedTokens[token]);
                    });

                    list.sort((a, b) => translatedTokens[a.nameToken] > translatedTokens[b.nameToken] ? 1 : -1);

                    this.selectedCapability.next(list[0]);
                });

                list.forEach(async (item: CapabilityManifest$v1) => {
                    this.capabilityCompletion.set(item.id, false);

                    // Set initial ruleset values for each capability
                    const capabilityRulesets: RulesetRequest$v1[] = [];
                    const activeRulesetPromise = this.dataSrv.ruleset.getBulk$(item.id).toPromise();
                    rulsetPromises.push(activeRulesetPromise);
                    (await activeRulesetPromise).forEach((ruleset: KeywordRuleset$v1) => {
                        const rulesetRequest = new RulesetRequest$v1({
                            industryId: ruleset.industryId,
                            resourceType: ResourceType$v1.Icon,
                            rulesetName: ruleset.name
                        });

                        capabilityRulesets.push(rulesetRequest);
                    });

                    // If all rulesets are defined for the capability, mark it as complete
                    this.selectedRuleSets.set(item.id, capabilityRulesets);
                    const selectedCapabilityRulesets: RulesetRequest$v1[] = this.selectedRuleSets.get(item.id);
                    if (selectedCapabilityRulesets.length === this.tenant.industryIds.length) {
                        this.capabilityCompletion.set(item.id, true);
                    }
                });
            }

            return list;
        }));

        await Promise.all(rulsetPromises);
        this.checkSaveEnabled();
    }
}
