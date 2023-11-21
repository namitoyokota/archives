import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { CommonConfirmDialogComponent, ConfirmDialogData, DirtyComponent$v1, Utils } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlicensingAdapterService$v1 } from '@galileo/web_commonlicensing/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Industries$v1, Tenant$v1, TranslationGroup } from '@galileo/web_commontenant/_common';
import { CoreService, DataService$v2, TenantStoreService } from '@galileo/web_commontenant/app/_core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';

import { AddTenantDialogComponent } from './add-tenant-dialog/add-tenant-dialog.component';
import { EditTenantComponent } from './edit-tenant/edit-tenant.component';
import { GlobalFeaturesDialogComponent } from './global-features-dialog/global-features-dialog.component';
import { TenantManagementTranslatedTokens, TenantManagementTranslationTokens } from './tenant-management.translation';

@Component({
    selector: 'hxgn-commontenant-tenant-management',
    templateUrl: './tenant-management.component.html',
    styleUrls: ['./tenant-management.component.scss']
})
export class TenantManagementComponent implements OnInit, OnDestroy, DirtyComponent$v1 {

    /** Reference to tenant editor component */
    @ViewChild(EditTenantComponent) tenantEditorRef: EditTenantComponent;

    /** View child for search input. */
    @ViewChild('search') searchInput: ElementRef;

    /** Store of organizations */
    organizations$: Observable<Tenant$v1[]> = this.tenantStore.entity$;

    /** Map of industry groups. */
    industryGroups$: Observable<Map<string, Industries$v1[]>> = this.coreSrv.industries$.pipe(
        first(),
        map((industries: Industries$v1[]) => {
            const industriesMap: Map<string, Industries$v1[]> = new Map<string, Industries$v1[]>();

            this.localizationSrv.getTranslationAsync(industries.map(x => x.nameToken)).then(result => {
                industries.forEach((industry: Industries$v1) => {
                    this.industriesDisplay.set(industry.id, result[industry.nameToken]);
                });
            });

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

    /** Language tokens for culture dropdown. */
    languageTokens: Map<string, string>;

    /** Map of onboarding completion status by tenant id. */
    onboardingMap: Map<string, boolean> = new Map<string, boolean>();

    /** Bus for search string */
    private searchString: BehaviorSubject<string> = new BehaviorSubject<string>('');

    /** Search string observable */
    readonly searchString$: Observable<string> = this.searchString.asObservable();

    /** Currently selected tenant */
    selectedTenant$: BehaviorSubject<Tenant$v1> = new BehaviorSubject<Tenant$v1>(null);

    /** Expose translation tokens to html template */
    tokens: typeof TenantManagementTranslationTokens = TenantManagementTranslationTokens;

    /** Translated tokens */
    tTokens: TenantManagementTranslatedTokens = {
        searchOrganizations: '',
        thereAreUnsavedChanges: '',
        unsavedChangesMsg: '',
        iconUploadError: '',
        tenantSaveError: ''
    } as TenantManagementTranslatedTokens;

    /** Flag that is true when there is unsaved changes */
    unsavedChanges = false;

    private destroy$: Subject<void> = new Subject<void>();

    /** Translated industries map values. */
    private industriesDisplay: Map<string, string> = new Map<string, string>();

    /** Tracks initial tenant value for comparisons. */
    private initialTenant: Tenant$v1 = null;

    /** New icon to save */
    private newIconFile: File;

    constructor(
        private coreSrv: CoreService,
        private dataSrv: DataService$v2,
        private dialog: MatDialog,
        private identitySrv: CommonidentityAdapterService$v1,
        private licensingSrv: CommonlicensingAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private tenantStore: TenantStoreService,
        private titleSrv: Title,
        private errorBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) { }

    /**
     * On init life cycle event
     */
    ngOnInit(): void {
        this.initLocalizationAsync();
        this.setTitleAsync();
        this.loadTenants();
        this.mapLangTokens();

        this.selectedTenant$.pipe(filter(value => !!value), takeUntil(this.destroy$)).subscribe(((tenant: Tenant$v1) => {
            if (this.initialTenant?.id !== tenant.id) {
                this.updateInitialTenant(tenant);
            }

            this.unsavedChanges = this.hasUnsavedChanges(tenant);

            if (this.isDirty.getValue() !== this.unsavedChanges) {
                this.isDirty.next(this.unsavedChanges);
            }

            this.isDisabled = !((this.unsavedChanges) && this.areChangesValid(tenant));
            this.cdr.detectChanges();
        }));

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
            this.setTitleAsync();
            this.mapLangTokens();
        });
    }

    /**
     * On destroy life cycle event
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private mapLangTokens() {
        this.localizationSrv.getLangTokensAsync().then((langTokens: Map<string, string>) => {
            this.languageTokens = langTokens;
        });
    }

    /**
     * Opens add tenant dialog.
     */
    async addTenantAsync(): Promise<void> {
        this.dialog.open(AddTenantDialogComponent, {
            disableClose: true,
            autoFocus: false,
            width: '850px',
            height: '590px',
            data: {
                sectors: (await this.industryGroups$.toPromise()),
                industriesDisplay: this.industriesDisplay,
                languageTokens: this.languageTokens
            }
        }).afterClosed().subscribe(async (newTenant: Tenant$v1) => {
            if (newTenant) {
                this.isLoading = true;
                const file: File = newTenant.newIconFile;

                newTenant.licenseData.tenantId = newTenant.id;
                await this.licensingSrv.createLicenseServerAsync(newTenant.licenseData);

                this.dataSrv.tenant.create$(newTenant).subscribe(async (updatedTenant) => {
                    await this.identitySrv.inviteTenantAsync(updatedTenant.id);

                    if (file) {
                        updatedTenant = await this.dataSrv.tenant.uploadIcon$(file, updatedTenant.id).toPromise();
                    }

                    updatedTenant = new Tenant$v1(updatedTenant);
                    this.tenantStore.upsert(updatedTenant);

                    this.onboardingMap.set(updatedTenant.id, false);

                    this.selectedTenant$.next(updatedTenant);
                    this.isLoading = false;
                });
            }
        });
    }

    /**
     * Clears search box text.
     */
    clearText() {
        this.searchString.next('');
        this.searchInput.nativeElement.value = '';
    }

    /** Compares string arrays to determine if they are equal or not. */
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
     * Resets tenant back to its initial values.
     */
    discardChanges(): void {
        this.selectedTenant$.next(this.initialTenant);
        this.tenantEditorRef.resetMap(this.initialTenant);
        this.tenantEditorRef.resetIcon();
        this.tenantEditorRef.resetNetwork();
        this.tenantEditorRef.mapTouched = false;
    }

    /**
     * Handles licensing file updates
     * Sets is loading to true until complete, then calls save tenant for application updates
     * @param isLoading Whether or not the save is still loading
     */
    handleLicenseUpdate(isLoading: boolean): void {
        if (isLoading) {
            this.isLoading = isLoading;
        } else {
            this.saveChangesAsync();
        }
    }

    /**
     * Opens the global features dialog
     */
    openGlobalFeaturesDialog(): void {
        this.dialog.open(GlobalFeaturesDialogComponent, {
            disableClose: true,
            autoFocus: false,
            width: '850px',
            height: '560px'
        });
    }

    /**
     * Saves update to tenant
     */
    async saveChangesAsync(): Promise<void> {
        this.isLoading = true;
        let showIconError = false;
        if (this.newIconFile) {

            let updatedTenantIcon: Tenant$v1;
            await this.dataSrv.tenant.uploadIcon$(this.newIconFile, this.selectedTenant$.getValue().id).toPromise().then(t => {
                updatedTenantIcon = new Tenant$v1(t);
            }).catch(err => {
                updatedTenantIcon = null;
                showIconError = true;
            });

            // Icon could not be uploaded so don't do anything
            if (updatedTenantIcon) {
                const selectedTenant: Tenant$v1 = new Tenant$v1(this.selectedTenant$.getValue());
                selectedTenant.tenantIconUrl = updatedTenantIcon.tenantIconUrl + `?v=${new Date().getTime()}`;
                selectedTenant.etag = updatedTenantIcon.etag;

                this.selectedTenant$.next(selectedTenant);
                this.tenantEditorRef.resetIcon();
            }

        }

        await this.dataSrv.tenant.updateAll$(this.selectedTenant$.getValue()).toPromise().catch(error => {
            this.isLoading = false;
            this.errorBar.open(this.tTokens.tenantSaveError, null, {
                duration: 7000
            });
        }).then((tenant: Tenant$v1) => {
            const updatedTenant: Tenant$v1 = tenant;

            this.tenantStore.upsert(updatedTenant);
            this.updateInitialTenant(updatedTenant);
            this.selectedTenant$.next(updatedTenant);
            this.tenantEditorRef.mapTouched = false;
            this.isLoading = false;

            if (showIconError) {
                // Show Error
                this.errorBar.open(this.tTokens.iconUploadError, null, {
                    duration: 7000
                });
            }
        });

    }

    /**
     * Sets search string
     * @param $event Input event
     */
    setSearchString($event: any) {
        this.searchString.next($event.target.value);
    }

    /**
     * Sets the new icon file
     * @param file Icon file
     */
    setNewIcon(file: File): void {
        this.newIconFile = file;
        this.selectedTenant$.next(new Tenant$v1(this.selectedTenant$.getValue()));
    }

    /**
     * Sets selected tenant.
     * @param tenant The tenant to select
     */
    setSelectedTenant(tenant: Tenant$v1): void {
        if (!this.unsavedChanges) {
            this.tenantEditorRef.resetIcon();
            this.updateTenant(tenant);
        } else {
            this.dialog.open(CommonConfirmDialogComponent, {
                disableClose: true,
                autoFocus: false,
                data: {
                    titleToken: this.tokens.thereAreUnsavedChanges,
                    msgToken: this.tokens.unsavedChangesMsg
                } as ConfirmDialogData
            }).afterClosed().subscribe(confirmed => {
                if (confirmed) {
                    this.tenantEditorRef.resetIcon();
                    this.tenantEditorRef.resetNetwork();
                    this.updateTenant(tenant);
                }
            });
        }
    }

    /**
     * Update the selected tenant
     */
    updateTenant(tenant: Tenant$v1): void {
        this.selectedTenant$.next(new Tenant$v1(tenant));
    }

    /**
     * Validates changes to selected tenant
     * @param tenant Selected tenant
     */
    private areChangesValid(tenant: Tenant$v1): boolean {
        return (
            !!tenant.contactAddress?.trim() &&
            !!tenant.country?.trim() &&
            !!tenant.state?.trim() &&
            !!tenant.city?.trim() &&
            !!tenant.name?.trim() &&
            !!tenant.industryIds.length &&
            !!tenant.applicationIds.length &&
            tenant.abbreviation?.trim()?.length >= 2 &&
            tenant.abbreviation?.trim()?.length <= 4
        );
    }

    /**
     * Determines if any values for the selected tenant have changed before saving.
     * @param tenant The updated tenant
     */
    private hasUnsavedChanges(tenant: Tenant$v1): boolean {
        if (tenant) {
            const hasNameChanged = this.initialTenant.name !== tenant?.name;
            const hasAbbrChanged = this.initialTenant.abbreviation !== tenant.abbreviation;
            const hasCultureChanged = this.initialTenant.culture !== tenant.culture;
            const hasCityChanged = this.initialTenant.city !== tenant.city;
            const hasStateChanged = this.initialTenant.state !== tenant.state;
            const hasCountryChanged = this.initialTenant.country !== tenant.country;
            const hasContactEmailChanged = this.initialTenant.contactAddress !== tenant.contactAddress;

            if (hasNameChanged || hasCityChanged || hasStateChanged || hasCountryChanged ||
                hasCultureChanged || hasContactEmailChanged || hasAbbrChanged) {
                return true;
            }

            const hasNetworksChanged = !this.compareStringList(this.initialTenant.dataSharingNetworks, tenant.dataSharingNetworks);
            if (hasNetworksChanged) {
                return true;
            }

            const hasEnabledChanged = this.initialTenant.enabled !== tenant.enabled;
            const hasJargonChanged = this.initialTenant.enableJargon !== tenant.enableJargon;

            if (hasEnabledChanged || hasJargonChanged) {
                return true;
            }

            const hasLatitudeChanged = this.initialTenant.mapData.centerLatitude !== tenant.mapData.centerLatitude;
            const hasLongitudeChanged = this.initialTenant.mapData.centerLongitude !== tenant.mapData.centerLongitude;
            const hasAltitudeChanged = this.initialTenant.mapData.centerAltitude !== tenant.mapData.centerAltitude;
            const hasZoomLevelChanged = this.initialTenant.mapData.zoomLevel !== tenant.mapData.zoomLevel;

            if (hasLatitudeChanged || hasLongitudeChanged || hasAltitudeChanged || hasZoomLevelChanged) {
                return true;
            }

            const haveIndustriesChanged = !this.compareStringList(this.initialTenant.industryIds, tenant.industryIds);

            if (haveIndustriesChanged) {
                return true;
            }

            const haveAppsChanged = !this.compareStringList(this.initialTenant.applicationIds, tenant.applicationIds);
            return haveAppsChanged || !!this.newIconFile || !!tenant.licenseData;
        }

        return false;
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        this.localizationSrv.localizeGroup([
            TranslationGroup.common,
            TranslationGroup.commonAdmin,
            TranslationGroup.core,
            TranslationGroup.organizationManager
        ]);

        const tokens: string[] = Object.keys(TenantManagementTranslationTokens).map(k => TenantManagementTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        const keys = Object.keys(TenantManagementTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[TenantManagementTranslationTokens[prop]];
        }
    }

    /**
     * Get list of tenants from the data service
     */
    private loadTenants(): void {
        this.tenantStore.clear();
        this.dataSrv.tenant.getDetailedList$().toPromise().then(async tenants => {
            const organizations = this.sortOrganizations(tenants);
            this.tenantStore.upsert(organizations);

            const selectedTenant = new Tenant$v1(organizations[0]);
            this.selectedTenant$.next(selectedTenant);

            setTimeout(() => {
                tenants.forEach((tenant: Tenant$v1) => {
                    const onboardingComplete = this.coreSrv.isOnboardingCompleted(tenant.onboardingConfiguredSteps, tenant.applicationIds);
                    this.onboardingMap.set(tenant.id, onboardingComplete);
                });
            });

            this.isLoading = false;
        });
    }

    /**
     * Updates initial tenant value
     * @param tenant Tenant value to set as initial
     */
    private updateInitialTenant(tenant: Tenant$v1): void {
        this.initialTenant = Utils.deepCopy(tenant);
    }

    /**
     * Sets the page's title
     */
    private async setTitleAsync(): Promise<void> {
        this.titleSrv.setTitle('HxGN Connect');
        const title = await this.localizationSrv.getTranslationAsync(TenantManagementTranslationTokens.organizationManager);
        this.titleSrv.setTitle(`HxGN Connect - ${title}`);
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
