import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadComponent } from '@galileo/web_common-libraries';
import { CommonlicensingAdapterService$v1 } from '@galileo/web_commonlicensing/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Industries$v1, MapData$v1, OnboardingStep$v1, Tenant$v1 } from '@galileo/web_commontenant/_common';
import {
    CoreService,
    ManageActivityEmailsDialogComponent,
    NetworkListComponent,
    TenantMapComponent
} from '@galileo/web_commontenant/app/_core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { ExperimentalFeaturesDialogComponent } from '../experimental-features-dialog/experimental-features-dialog.component';
import { UploadLicencingDialogComponent } from '../upload-licensing-dialog/upload-licensing-dialog.component';
import { EditTenantTranslatedTokens, EditTenantTranslationTokens } from './edit-tenant.translation';

@Component({
    selector: 'hxgn-commontenant-edit-tenant',
    templateUrl: 'edit-tenant.component.html',
    styleUrls: ['edit-tenant.component.scss']
})
export class EditTenantComponent implements OnInit, OnDestroy {

    /** Reference to the icon upload component */
    @ViewChild(FileUploadComponent) iconUploadRef: FileUploadComponent;

    /** Reference to tenant map component */
    @ViewChild(TenantMapComponent) tenantMapRef: TenantMapComponent;

    /** Reference to datasharing network list */
    @ViewChild(NetworkListComponent, { static: false }) networkListRef: NetworkListComponent;

    /** List of industries grouped by sector */
    @Input() industryGroups: Map<string, Industries$v1[]>;

    /** List of supported cultures. */
    @Input() languageTokens: Map<string, string> = new Map<string, string>();

    private selectedTenant$ = new BehaviorSubject<Tenant$v1>(null);

    private onboardingStepList$ = new BehaviorSubject<OnboardingStep$v1[]>(null);

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Tenant to edit */
    @Input('tenant')
    set setTenant(val: Tenant$v1) {
        this.tenant = val;
        this.selectedTenant$.next(val);

        this.onboardingStatus = this.coreSrv.onboardingStatus(this.tenant.onboardingConfiguredSteps, this.tenant.applicationIds);
    }

    /** Tracks if there are any unsaved changes. */
    @Input() unsavedChanges: boolean;

    /** Emits when the icon for a tenant changes */
    @Output() iconChange: EventEmitter<File> = new EventEmitter<File>();

    /** Tracks when the licensing file has been updated. Boolean used to indicate loading state. */
    @Output() licensingUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitter for when refresh button is clicked. */
    @Output() refresh: EventEmitter<void> = new EventEmitter<void>();

    /** Emits a tenant object */
    @Output() tenantUpdated: EventEmitter<Tenant$v1> = new EventEmitter<Tenant$v1>();

    /** Determines if the map has been touched to prevent resizing issues. */
    mapTouched = false;

    /** Tracks onboarding status of selected tenant. */
    onboardingStatus = 0;

    /** Tenant that is currently being edited */
    tenant: Tenant$v1;

    /** Expose translation tokens to html template */
    tokens: typeof EditTenantTranslationTokens = EditTenantTranslationTokens;

    /** Translated tokens */
    tTokens: EditTenantTranslatedTokens = {} as EditTenantTranslatedTokens;

    /** Away mode ff */
    readonly ffAwayMode = 'FF_CommonIdentity_3';

    /** List of onboarding steps for the tenant being edited */
    onboardingSteps$: Observable<OnboardingStep$v1[]> = combineLatest([
        this.selectedTenant$.asObservable(),
        this.onboardingStepList$.asObservable()
    ]).pipe(
        map(([tenant, steps]) => {
            if (!steps?.length) {
                return [];
            }

            return steps.filter((step: OnboardingStep$v1) => {
                if (!step.applicationIds) {
                    return false;
                }

                return step.applicationIds.find(appId => {
                    return !!tenant?.applicationIds.find(id => id === appId);
                });
            });
        })
    );

    constructor(
        private coreSrv: CoreService,
        private dialog: MatDialog,
        private licensingSrv: CommonlicensingAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit(): void {
        this.initLocalizationAsync();

        this.coreSrv.getOnboardingSteps$().pipe(first()).subscribe((steps: OnboardingStep$v1[]) => {
            this.onboardingStepList$.next(steps);
            this.localizationSrv.localizeStringsAsync(steps.map(step => step.nameToken));
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
            this.localizationSrv.localizeStringsAsync(this.onboardingStepList$.getValue().map(step => step.nameToken));
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Returns true if the given onboarding step is completed
     * @param stepId Onboarding step id
     */
    isStepCompleted(stepId: string): boolean {
        return this.tenant.onboardingConfiguredSteps.some(id => id === stepId);
    }

    /**
     * Opens activity notifications dialog
     */
    openActivityNotificationsDialog(): void {
        this.dialog.open(ManageActivityEmailsDialogComponent, {
            height: '650px',
            width: '930px',
            autoFocus: false,
            disableClose: true,
            data: {
                isAdmin: true,
                tenantId: this.tenant.id
            }
        });
    }

    /**
     * Show the experimental dialog
     */
    openExperimentalFeaturesDialog(): void {
        this.dialog.open(ExperimentalFeaturesDialogComponent, {
            disableClose: true,
            autoFocus: false,
            width: '850px',
            height: '560px',
            data: this.tenant.id
        });
    }

    /**
     * Opens the upload licensing file dialog
     */
    openUploadLicencingDialog(): void {
        this.dialog.open(UploadLicencingDialogComponent, {
            disableClose: true,
            autoFocus: false,
            data: this.tenant.id,
            width: '500px',
            height: '300px'
        }).afterClosed().subscribe(async data => {
            if (data) {
                this.licensingUpdated.emit(true);
                await this.licensingSrv.updateLicenseServerAsync(data);
                this.licensingUpdated.emit(false);
            }
        });
    }

    /**
     * Resets the icon upload component
     */
    resetIcon() {
        this.iconUploadRef.clear(null);
    }

    /**
     * Reset network selection
     */
    resetNetwork() {
        this.networkListRef?.resetNetwork();
    }

    /**
     * Resets the map the the passed in tenant's data
     * @param tenant The tenant to use to reset the map
     */
    resetMap(tenant: Tenant$v1) {
        this.tenantMapRef.setView(tenant.mapData);
    }

    /**
     * Sets map touched once touched by user.
     */
    setMapTouched(): void {
        this.mapTouched = true;
    }

    /**
     * Sets the tenants networks
     */
    setNetworks(networks: string[]): void {
        this.tenant.dataSharingNetworks = networks;
        this.updateTenant();
    }

    /**
     * Sets a newly selected icon file
     * */
    setNewIcon(file: File) {
        this.iconChange.emit(file);
    }

    /**
     * Changes the culture
     * @param culture The culture that is being changed to
     */
    updateCulture(culture: string): void {
        this.tenant.culture = culture;
        this.updateTenant();
    }

    /**
     * Updates the map data for the selected tenant
     * @param mapData Map Data to use for the update
     */
    updateMapData(mapData: MapData$v1): void {
        if (this.mapTouched) {
            this.tenant.mapData.centerAltitude = mapData.centerAltitude;
            this.tenant.mapData.centerLongitude = mapData.centerLongitude;
            this.tenant.mapData.centerLatitude = mapData.centerLatitude;
            this.tenant.mapData.zoomLevel = mapData.zoomLevel;
            this.updateTenant();
        }
    }

    /**
     * Enables the enabled applications
     * @param applicationIds Application ids that are enabled
     */
    updateEnabledApps(applicationIds: string[]): void {
        this.tenant.applicationIds = [].concat(applicationIds);
        this.updateTenant();
    }

    /**
     * Updates selected industry ids.
     */
    updateSelectedIndustries(industryId: string): void {
        if (this.tenant.industryIds.includes(industryId)) {
            this.tenant.industryIds = this.tenant.industryIds.filter(x => x !== industryId);
        } else {
            this.tenant.industryIds.push(industryId);
        }

        this.updateTenant();
    }

    /**
     * Emit the current tenant value as an update
     */
    updateTenant(): void {
        this.tenant.name = this.tenant?.name?.trim();
        this.tenant.abbreviation = this.tenant?.abbreviation?.trim();
        this.tenant.city = this.tenant?.city?.trim();
        this.tenant.state = this.tenant?.state?.trim();
        this.tenant.country = this.tenant?.country?.trim();

        this.tenantUpdated.emit(this.tenant);
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(EditTenantTranslationTokens).map(k => EditTenantTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.chooseImage = translatedTokens[EditTenantTranslationTokens.chooseImage];
        this.tTokens.dragAndDropImage = translatedTokens[EditTenantTranslationTokens.dragAndDropImage];
    }
}
