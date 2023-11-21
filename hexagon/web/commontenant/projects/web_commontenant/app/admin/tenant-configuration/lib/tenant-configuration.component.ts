import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { DirtyComponent$v1, Utils } from '@galileo/web_common-libraries';
import { FeedbackDialogComponent } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    CapabilityManifest$v1,
    ChangelogPropertyName$v1,
    Industries$v1,
    OnboardingStep$v1,
    OnboardingTab$v1,
    Tenant$v1,
    TranslationGroup,
} from '@galileo/web_commontenant/_common';
import {
    CoreService,
    DataService$v2,
    ManageActivityEmailsDialogComponent,
    TenantConfigComponent,
    TenantStoreService
} from '@galileo/web_commontenant/app/_core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';
import { OrganizationChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';
import { FilterTranslationTokens, TenantConfigurationTranslatedTokens, TenantConfigurationTranslationTokens } from './tenant-configuration.translation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'hxgn-commontenant-tenant-configuration',
    templateUrl: 'tenant-configuration.component.html',
    styleUrls: ['tenant-configuration.component.scss']
})
export class TenantConfigurationComponent implements OnInit, OnDestroy, DirtyComponent$v1 {

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

    /** Bus for is dirty. */
    isDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** IsDirty implementation from DirtyComponent. */
    isDirty$ = this.isDirty.asObservable();

    /** Flag that is true when the button pane should be disabled */
    isDisabled = true;

    /** Flag that is true when data is loading */
    isLoading = true;

    /** Flag that is true when init has been completed */
    initComplete = false;

    /** Flag that is true when the changelog modal is ready */
    disableChangelog = true;

    /** Expose tab to html */
    tab: typeof OnboardingTab$v1 = OnboardingTab$v1;

    /** Currently selected tab */
    selectedTab: OnboardingTab$v1;

    /** Tenant object that can be updated */
    tenant$: BehaviorSubject<Tenant$v1> = new BehaviorSubject<Tenant$v1>(null);

    /** Expose OnboardingTranslationTokens to HTML */
    tokens: typeof TenantConfigurationTranslationTokens = TenantConfigurationTranslationTokens;

    /** Flag that is true when there is unsaved changes */
    unsavedChanges = false;

    /** Flag that is true when there is unsaved changes for features */
    private featuresChanged: boolean = false;

    /** Translated tokens */
    tTokens: TenantConfigurationTranslatedTokens = {
        iconUploadError: '',
        tenantSaveError: ''
    }

    /** Away mode ff */
    readonly ffAwayMode = 'FF_CommonIdentity_3';

    private destroy$: Subject<void> = new Subject<void>();

    /** Tracks initial tenant value for comparisons. */
    private initialTenant: Tenant$v1 = null;

    /** New icon to save */
    private newIconFile: File;

    /** users for the changelog display data */
    currentUsers: UserInfo$v1[];

    /** industry id and token name map (for Changelog data) */
    private industryNameTokens: Map<string, string> = new Map<string, string>();

    /** onboarding steps and token name map (for Changelog data) */
    private onboardingNameTokens: Map<string, string> = new Map<string, string>();

    /** sharable capabilityids and names map (for Changelog data) */
    private capabilitiesNameTokens: Map<string, string> = new Map<string, string>();

    /** filter token/values to be localized (for Changelog data) */
    private typesFilter = new Map<string, string>();

    constructor(
        private coreSrv: CoreService,
        private dataSrv: DataService$v2,
        private dialog: MatDialog,
        private identitySrv: CommonidentityAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private cdr: ChangeDetectorRef,
        private tenantStore: TenantStoreService,
        private title: Title,
        private errorBar: MatSnackBar,
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit(): Promise<void> {
        this.initLocalization();
        this.setTitleAsync();

        await this.setTenantAsync();

        this.tenant$.pipe(
            filter(value => !!value),
            takeUntil(this.destroy$)
        ).subscribe(((tenant: Tenant$v1) => {
            this.triggerUnsavedChanges(tenant);
        }));

        this.currentUsers = await this.identitySrv.getAbbreviatedUsersAsync();

        // get the data and map values (for Changelog dialog)
        this.setChangelogTokens();

        // map the industry ids and names for (for Changelog data)
        await this.setIndustryTokensAsync();

        // map the onboarding steps and names (for Changelog data)
        await this.setOnboardingTokensAsync();

        // map the capability ids and names (for Changelog data)
        await this.setCapTokensAsync();

        this.isLoading = false;
        this.initComplete = true;

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            this.initLocalization();
            this.setTitleAsync();
            this.setChangelogTokens();
            await this.setIndustryTokensAsync();
            await this.setOnboardingTokensAsync();
            await this.setCapTokensAsync();
        });
    }

    /**
     * On destroy life cycle event
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private async setTenantAsync() {
        const userInfo = await this.identitySrv.getUserInfoAsync();
        let initialTenant = this.tenantStore.snapshot(userInfo.activeTenant);
        if (!initialTenant) {
            initialTenant = await this.dataSrv.tenant.get$(userInfo.activeTenant).toPromise();
            this.tenantStore.upsert(initialTenant);
        }

        this.tenant$.next(new Tenant$v1(initialTenant));
        this.updateInitialTenant(new Tenant$v1(initialTenant));
    }

    private async setIndustryTokensAsync() {
        this.industryNameTokens = await this.coreSrv.industries$
            .pipe(first()).toPromise().then(async (value: Industries$v1[]) => {
                const industryMap: Map<string, string> = new Map<string, string>();

                value.forEach(async (industry: Industries$v1) => {
                    const localized = await this.localizationSrv.getTranslationAsync(industry.nameToken);
                    industryMap.set(industry.id, localized);
                });

                return industryMap;
            });
    }

    private async setOnboardingTokensAsync() {
        this.onboardingNameTokens = await this.coreSrv.getOnboardingSteps$()
            .pipe(first()).toPromise().then(async (steps: OnboardingStep$v1[]) => {
                await this.localizationSrv.localizeStringsAsync(steps.map(step => step.nameToken));
                const stepsMap: Map<string, string> = new Map<string, string>();

                steps.forEach(async (step: OnboardingStep$v1) => {
                    const localized = await this.localizationSrv.getTranslationAsync(step.nameToken);
                    stepsMap.set(step.componentType, localized);
                });

                return stepsMap;
            });
    }

    private async setCapTokensAsync() {
        this.capabilitiesNameTokens = await this.dataSrv.dataSharing.getCapabilityManifests$(true)
            .pipe(first()).toPromise().then(async (capabilities: CapabilityManifest$v1[]) => {
                const capabilityMap: Map<string, string> = new Map<string, string>();
                const shareable = capabilities.filter(c => !c.excludeFromExternalDataSharing || !c.excludeFromInternalDataSharing);

                shareable.forEach(async (capability: CapabilityManifest$v1) => {
                    const localized = await this.localizationSrv.getTranslationAsync(capability.nameToken);
                    capabilityMap.set(capability.id, localized);
                });

                this.disableChangelog = false;

                return capabilityMap;
            });
    }

    /**
     * Saves currently dirty data
     * @param flag True to save, false to discard
     */
    saveChanges(flag: boolean) {
        if (flag) {
            this.saveAsync();
        } else {
            this.discardChanges();
        }
    }

    /**
     * Resets tenant back to its initial values.
     */
    discardChanges(): void {
        const initialTenant = Utils.deepCopy(this.initialTenant);
        this.tenant$.next(initialTenant);
        this.tenantConfigRef.resetMap(initialTenant);
        this.tenantConfigRef.resetIcon();
        this.tenantConfigRef.mapTouched = false;
        this.tenantConfigRef.saveFlags(true);
        this.tenantConfigRef.clearDisabledFlags();
        this.featuresChanged = false;
        this.triggerUnsavedChanges(this.tenant$.getValue());
    }

    /**
     * Tracks which tab is currently selected
     * @param tab Index of selected tab
     */
    tabChange(tab: OnboardingTab$v1) {
        this.selectedTab = tab;
    }

    /**
     * Sets the can save state unless already on
     * @param canSave True is the flags are changed
     */
    flagsChange(canSave: boolean) {
        if (canSave) {
            this.featuresChanged = true;

            const tenant = this.tenant$.getValue();
            this.triggerUnsavedChanges(tenant);
        }
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
                isAdmin: false
            }
        });
    }

    /**
     * Opens Changelog dialog
     */
    openChangelogDialog(): void {
        this.dialog.open(OrganizationChangelogDialogComponent, {
            height: '900px',
            width: '820px',
            autoFocus: false,
            disableClose: true,
            data: {
                tenant: this.tenant$.getValue(),
                users: this.currentUsers,
                industryNameTokens: this.industryNameTokens,
                typesFilter: this.typesFilter,
                onboardingNameTokens: this.onboardingNameTokens,
                capabilitiesNameTokens: this.capabilitiesNameTokens
            }
        });
    }

    /**
     * Saves update to tenant
     */
    async saveChangesAsync(): Promise<void> {
        if (this.tenantConfigRef.disabledFlags.length) {
            this.dialog.open(FeedbackDialogComponent, {
                autoFocus: false,
                disableClose: true,
                panelClass: 'feedback-dialog',
                data: this.tenantConfigRef.disabledFlags
            }).afterClosed().subscribe(disabled => {
                if (disabled) {
                    this.saveAsync();
                    this.tenantConfigRef.clearDisabledFlags();
                }
            });
        } else {
            this.saveAsync();
        }
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
     * Process tenant change event
     * @param tenant The updated tenant
     */
    updateTenant(tenant: Tenant$v1): void {
        this.tenant$.next(new Tenant$v1(tenant));
    }

    /**
     * Validates changes to selected tenant
     * @param tenant Selected tenant
     */
    private areChangesValid(tenant: Tenant$v1): boolean {
        return (
            !!tenant.country &&
            !!tenant.state &&
            !!tenant.city &&
            !!tenant.name &&
            !!tenant.industryIds.length &&
            tenant.abbreviation?.trim().length >= 2 &&
            tenant.abbreviation?.trim().length <= 4
        );
    }

    /**
     * Compares string arrays to determine if they are equal or not.
     */
    private compareStringList(listA: string[], listB: string[]): boolean {
        if (!listA) {
            listA = [];
        }

        if (!listB) {
            listB = [];
        }

        if (listA.length !== listB.length) {
            return false;
        }

        for (let i = listA.length; i--;) {
            if (listA[i] !== listB[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determines if any values for the selected tenant have changed before saving.
     * @param tenant The updated tenant
     */
    private triggerUnsavedChanges(tenant: Tenant$v1): void {
        this.unsavedChanges = false;

        if (tenant) {
            const hasNameChanged = this.initialTenant.name !== tenant.name;
            const hasAbbrChanged = this.initialTenant.abbreviation !== tenant.abbreviation;
            const hasCultureChanged = this.initialTenant.culture !== tenant.culture;
            const hasCityChanged = this.initialTenant.city !== tenant.city;
            const hasStateChanged = this.initialTenant.state !== tenant.state;
            const hasCountryChanged = this.initialTenant.country !== tenant.country;
            const hasIconChanged = this.newIconFile;

            if (hasNameChanged || hasAbbrChanged || hasCityChanged ||
                hasStateChanged || hasCountryChanged || hasCultureChanged || hasIconChanged) {
                this.unsavedChanges = true;
            }

            const hasLatitudeChanged = this.initialTenant.mapData.centerLatitude !== tenant.mapData.centerLatitude;
            const hasLongitudeChanged = this.initialTenant.mapData.centerLongitude !== tenant.mapData.centerLongitude;
            const hasAltitudeChanged = this.initialTenant.mapData.centerAltitude !== tenant.mapData.centerAltitude;
            const hasZoomLevelChanged = this.initialTenant.mapData.zoomLevel !== tenant.mapData.zoomLevel;

            if (hasLatitudeChanged || hasLongitudeChanged || hasAltitudeChanged || hasZoomLevelChanged) {
                this.unsavedChanges = true;
            }

            const haveIndustriesChanged = !this.compareStringList(this.initialTenant.industryIds, tenant.industryIds);
            if (haveIndustriesChanged) {
                this.unsavedChanges = haveIndustriesChanged || !!this.newIconFile || !!tenant.licenseData;
            }

            if (this.featuresChanged) {
                this.unsavedChanges = true;
            }
        }

        if (this.isDirty.getValue() !== this.unsavedChanges) {
            this.isDirty.next(this.unsavedChanges);
        }

        this.isDisabled = !((this.unsavedChanges) && this.areChangesValid(tenant));
        this.cdr.detectChanges();
    }

    /**
     * Saves changes
     */
    private async saveAsync(): Promise<void> {
        this.isLoading = true;
        let showIconError = false;

        if (this.newIconFile) {
            let updatedTenantIcon: Tenant$v1;
            await this.dataSrv.tenant.uploadIcon$(this.newIconFile).toPromise().then(t => {
                updatedTenantIcon = new Tenant$v1(t);
            }).catch( () => {
                updatedTenantIcon = null;
                showIconError = true;
            });

            if (updatedTenantIcon) {
                updatedTenantIcon.tenantIconUrl = updatedTenantIcon.tenantIconUrl + `?v=${new Date().getTime()}`;
                updatedTenantIcon.etag = updatedTenantIcon.etag;
                this.tenantConfigRef.resetIcon();
            }
        }

        await this.dataSrv.tenant.update$(this.tenant$.getValue()).toPromise().then((t => {
            this.tenantStore.upsert(t);
            this.updateInitialTenant(t);
            this.tenant$.next(t);
            this.tenantConfigRef.mapTouched = false;
            this.tenantConfigRef.saveFlags(false);
            this.featuresChanged = false;

            this.triggerUnsavedChanges(t);
            this.isLoading = false;

            if (showIconError) {
                // Show Error
                this.errorBar.open(this.tTokens.iconUploadError, null, {
                    duration: 7000
                });
            }
        })).catch(() => {
            // Show Error
            this.errorBar.open(this.tTokens.iconUploadError, null, {
                duration: 7000
            });
        });

 

        
    }

    private async setTitleAsync(): Promise<void> {
        this.title.setTitle('HxGN Connect');
        const title = await this.localizationSrv.getTranslationAsync(TenantConfigurationTranslationTokens.organizationSetup);
        this.title.setTitle('HxGN Connect - ' + title);
    }

    /**
     * Updates initial tenant value
     * @param tenant Tenant value to set as initial
     */
    private updateInitialTenant(tenant: Tenant$v1): void {
        this.initialTenant = Utils.deepCopy(tenant);
    }

    /**
     * Sets the needed type filter and display name tokens for Changelog dialog
     */
    private async setChangelogTokens() {
        // type filter data
        const dialogTokens: string[] = Object.keys(FilterTranslationTokens).map(k => FilterTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(dialogTokens);
        this.typesFilter.set(ChangelogPropertyName$v1.abbreviation, ChangelogPropertyName$v1.abbreviation);
        this.typesFilter.set(ChangelogPropertyName$v1.city, ChangelogPropertyName$v1.city);
        this.typesFilter.set(ChangelogPropertyName$v1.country, ChangelogPropertyName$v1.country);
        this.typesFilter.set(ChangelogPropertyName$v1.culture, ChangelogPropertyName$v1.culture);
        this.typesFilter.set(translatedTokens[FilterTranslationTokens.dataSharingNetworkFilter], ChangelogPropertyName$v1.dataSharingNetworks);
        this.typesFilter.set(translatedTokens[FilterTranslationTokens.mapDataFilter], ChangelogPropertyName$v1.mapData);
        this.typesFilter.set(ChangelogPropertyName$v1.name, ChangelogPropertyName$v1.name);
        this.typesFilter.set(ChangelogPropertyName$v1.state, ChangelogPropertyName$v1.state);
        this.typesFilter.set(translatedTokens[FilterTranslationTokens.tenantIconUrlFilter], ChangelogPropertyName$v1.tenantIconUrl);
    }

    private initLocalization() {
        this.localizationSrv.localizeGroup([
            TranslationGroup.common,
            TranslationGroup.commonAdmin,
            TranslationGroup.core
        ]);
        const tokens: string[] = Object.keys(TenantConfigurationTranslationTokens).map(k => TenantConfigurationTranslationTokens[k]);
        this.localizationSrv.getTranslationAsync(tokens).then(tokens => {
            this.tTokens.iconUploadError = tokens[TenantConfigurationTranslationTokens.iconUploadError];
            this.tTokens.tenantSaveError = tokens[TenantConfigurationTranslationTokens.tenantSaveError];
        });
        
    }
}
