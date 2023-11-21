import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { moduleRefId as capabilityId, OnboardingStep$v1, Tenant$v1, TranslationGroup } from '@galileo/web_commontenant/_common';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { from, Observable, Subject, zip } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import {
    DataService$v2,
    TenantStoreService
} from '@galileo/web_commontenant/app/_core';
import { OnboardingCommunicationService } from './onboarding-communication.service';
import { OnboardingStore } from './onboarding-store.service';
import { OnboardingTranslationTokens } from './onboarding.translation';

@Component({
    selector: 'hxgn-commontenant-onboarding',
    templateUrl: 'onboarding.component.html',
    styleUrls: ['onboarding.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingComponent implements OnInit, OnDestroy {

    /** Header string for currently selected onboarding step. */
    headerString = '';

    /** Expose OnboardingTranslationTokens to HTML */
    tokens: typeof OnboardingTranslationTokens = OnboardingTranslationTokens;

    /** The identifer to the portal outlet */
    private readonly portalOutlet = '#portal-pane';

    /** Reference to the currently loaded step component */
    private portal: ComponentRef<any>;

    /** Event when the component is destroyed */
    private destroy$ = new Subject();

    /** Id of the current user's tenant */
    private tenantId: string;

    /** List of step tokens to translate */
    private stepTokens: string[] = [];

    constructor(
        private userSrv: CommonidentityAdapterService$v1,
        private dataSrv: DataService$v2,
        private layoutCompiler: LayoutCompilerAdapterService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private tenantStore: TenantStoreService,
        public onboardingStore: OnboardingStore,
        public onBoardingCommSrv: OnboardingCommunicationService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalization();
        this.initCommEvents();
        this.initStore();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
            this.localizationSrv.localizeStringsAsync(this.stepTokens).then(() => {
                this.setHeaderString(true);
            });
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
     * Returns the currently logged in tenant
     */
    getCurrentTenant() {
        return this.tenantStore.snapshot(this.tenantId);
    }

    /**
     * Injects the step's portal
     * @param step The step to set the portal for
     */
    async setStepPortal(step: OnboardingStep$v1) {
        this.onboardingStore.setActiveStep(step);
        this.setHeaderString(false);

        if (this.portal) {
            this.onBoardingCommSrv.setSaveEnabled(false);
            this.portal.destroy();

            // Need to wait for the next angular tick to
            // insure component got cleaned up
            setTimeout(async () => {
                if (step.capabilityId !== capabilityId) {
                    await this.layoutCompiler.loadCapabilityCoreAsync(step.capabilityId);
                }

                this.portal = await this.layoutCompiler.delegateInjectComponentPortalAsync(
                    step.componentType,
                    step.capabilityId,
                    this.portalOutlet,
                    this.onBoardingCommSrv
                );
            });
        } else {
            if (step.capabilityId !== capabilityId) {
                await this.layoutCompiler.loadCapabilityCoreAsync(step.capabilityId);
            }
            this.portal = await this.layoutCompiler.delegateInjectComponentPortalAsync(
                step.componentType,
                step.capabilityId,
                this.portalOutlet,
                this.onBoardingCommSrv
            );
        }
    }

    /**
     * Resets the onboarding step process
     */
    async reset() {
        this.onboardingStore.setIsLoading(true);

        const updatedTenant = new Tenant$v1(this.tenantStore.snapshot(this.tenantId));
        updatedTenant.onboardingConfiguredSteps = [];

        this.dataSrv.tenant.update$(updatedTenant).subscribe(tenant => {
            updatedTenant.etag = tenant.etag;
            this.tenantStore.upsert(updatedTenant);
            this.onboardingStore.setIsLoading(false);
            this.goToNextStep();
        });
    }

    /**
     * Go back to last completed step
     */
    back() {
        this.onboardingStore.findLastStep$().subscribe((step) => {
            this.setStepPortal(step);
        });
    }

    private initCommEvents() {
        this.onBoardingCommSrv.save$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.onboardingStore.setIsLoading(true);
        });

        // React when the step is done saving their data
        this.onBoardingCommSrv.saveIsComplete$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async () => {
            const updatedTenant = new Tenant$v1(this.tenantStore.snapshot(this.tenantId));
            const componentType = (await this.onboardingStore.activeStep$.pipe(first()).toPromise()).componentType;

            if (!updatedTenant.onboardingConfiguredSteps.find(id => id === componentType)) {
                updatedTenant.onboardingConfiguredSteps.push(componentType);

                const tenant = await this.dataSrv.tenant.update$(updatedTenant).pipe(first()).toPromise();
                updatedTenant.etag = tenant.etag;
                this.tenantStore.upsert(updatedTenant);
            }

            this.goToNextStep();

            this.onboardingStore.setIsLoading(false);
        });
    }

    /**
     * Complete the onboarding process
     */
    private async completeOnboarding() {
        // Send the user to the main product
        // Wait for next tick
        setTimeout(() => {
            this.router.navigateByUrl('/');
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });
    }

    /**
     * Make the next uncompleted step active
     */
    private async goToNextStep() {
        const steps = await this.onboardingStore.steps$.pipe(first()).toPromise();
        const tenant = this.tenantStore.snapshot(this.tenantId);

        const completedStepsIds = tenant.onboardingConfiguredSteps;

        let nextStep: OnboardingStep$v1 = null;
        steps.some(step => {
            if (!completedStepsIds.find(id => id === step.componentType)) {
                nextStep = step;
                return true;
            }
        });

        if (nextStep) {
            this.onboardingStore.setActiveStep(nextStep);
            this.setStepPortal(nextStep);
        } else {
            this.completeOnboarding();
        }
    }

    /**
     * Loads the onboarding store will all staring states
     */
    private async initStore() {
        zip(
            this.loadTenant$(),
            this.loadSteps$()
        ).pipe(
            first()
        ).subscribe(([tenant, steps]) => {

            this.tenantId = tenant.id;

            const appSteps = steps.filter(step => {
                if (!step.applicationIds) {
                    return false;
                }

                return step.applicationIds.find(appId => {
                    return !!tenant.applicationIds.find(id => id === appId);
                });
            });

            this.onboardingStore.setSteps(appSteps);

            this.onboardingStore.setIsLoading(false);
            this.goToNextStep();
        });
    }

    /**
     * Loads the current user's tenant
     */
    private loadTenant$(): Observable<Tenant$v1> {
        return new Observable(obs => {
            from(this.userSrv.getUserInfoAsync()).pipe(
                first()
            ).subscribe(async user => {
                this.tenantStore.clear();
                this.dataSrv.tenant.get$(user.activeTenant).subscribe(tenant => {
                    this.tenantStore.upsert(tenant);
                    obs.next(tenant);
                    obs.complete();
                });
            });
        });
    }

    /**
     * Loads the steps to display for onboarding
     */
    private loadSteps$(): Observable<OnboardingStep$v1[]> {
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
                this.stepTokens = [];

                for (const capability of compList) {
                    capability.compatible.filter(comp => {
                        return comp.capabilityId === capabilityId &&
                            comp.options['onBoarding'];
                    }).forEach(items => {
                        items.options['onBoarding'].steps.map(s => {
                            s.capabilityId = capability.id;
                            return s;
                        }).forEach(step => {
                            this.stepTokens.push(step.nameToken);
                            stepList.push(step);
                        });
                    });
                }

                this.localizationSrv.localizeStringsAsync(this.stepTokens).then(() => {
                    this.setHeaderString(true);
                });

                // Only return steps for the app the user is part of
                return stepList;
            })
        );
    }

    /** Sets header string on page load and whenever the tab is changed. */
    private async setHeaderString(isFirstLoad: boolean) {
        if (this.headerString.length > 0 || isFirstLoad) {
            const nameToken = (await this.onboardingStore.activeStep$.pipe(first()).toPromise()).nameToken;
            this.localizationSrv.getTranslationAsync(nameToken).then(translation => {
                this.headerString = translation;
                if (isFirstLoad) {
                    this.cdr.detectChanges();
                }
            });
        }
    }

    private initLocalization() {
        this.localizationSrv.localizeGroup([
            TranslationGroup.common,
            TranslationGroup.core,
            TranslationGroup.main
        ]);
    }
}
