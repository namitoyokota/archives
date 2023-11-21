import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadComponent } from '@galileo/web_common-libraries';
import {
    CommonfeatureflagsAdapterService$v1,
    FeatureFlag$v2,
    FeatureFlagGroupsMenuComponent,
} from '@galileo/web_commonfeatureflags/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Industries$v1, MapData$v1, OnboardingTab$v1, Tenant$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TenantMapComponent } from '../tenant-map/tenant-map.component';
import { TenantConfigTranslatedTokens, TenantConfigTranslationTokens } from './tenant-config.translation';

@Component({
    selector: 'hxgn-commontenant-tenant-config',
    templateUrl: 'tenant-config.component.html',
    styleUrls: ['tenant-config.component.scss']
})
export class TenantConfigComponent implements OnInit, OnDestroy {

    /** Reference to the group feature flags editor component */
    @ViewChild('flagsEditor') flagsEditorRef: FeatureFlagGroupsMenuComponent;

    /** Reference to the icon upload component */
    @ViewChild(FileUploadComponent) iconUploadRef: FileUploadComponent;

    /** Reference to tenant map component */
    @ViewChild(TenantMapComponent) tenantMapRef: TenantMapComponent;

    /** List of industry groups */
    @Input() industryGroups: Map<string, Industries$v1[]>;

    /** Tabs to display */
    @Input() displayTabs: OnboardingTab$v1[];

    /** The tenant to display data for */
    @Input('tenant')
    set setTenant(tenant: Tenant$v1) {
        this.tenant = tenant;
        if (this.iconUploadRef) {
            this.iconUploadRef.form.get('file').setValue(this.tenant.newIconFile);
        }
    }

    /** flag to disable changelog button */
    @Input() disableChangelog: boolean;

    /** Emit when the flag states are changed */
    @Output() flagChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Emits when the icon for a tenant changes */
    @Output() iconChange: EventEmitter<File> = new EventEmitter<File>();

    /** Emits a tenant object */
    @Output() tenantUpdated: EventEmitter<Tenant$v1> = new EventEmitter<Tenant$v1>();

    /** Emits currently selected tab */
    @Output() tabChange: EventEmitter<OnboardingTab$v1> = new EventEmitter<OnboardingTab$v1>();

    /** Emits flag to save changes */
    @Output() saveChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Emits flag to save changes */
    @Output() openChangelogDialog: EventEmitter<void> = new EventEmitter<void>();

    /** List of disabled feature flags. */
    disabledFlags: FeatureFlag$v2[] = [];

    /** Tracks changelog flag status. */
    changelogFlag = false;

    /** Feature flag for changelog dialog */
    readonly changelogFF = 'FF_CommonIdentity_4';

    /** Determines if the feature flag states were changed */
    flagsTouched = false;

    /** Language tokens for culture dropdown. */
    languageTokens: Map<string, string>;

    /** Determines if the map has been touched to prevent resizing issues. */
    mapTouched = false;

    /** Used to track which tab can be selected */
    tab: typeof OnboardingTab$v1 = OnboardingTab$v1;

    /** The selected tab */
    selectedTab = OnboardingTab$v1.organizationInfo;

    /** The tenant to display data for */
    tenant: Tenant$v1 = new Tenant$v1();

    /** Expose TenantConfigTranslationTokens to the HTML */
    tokens: typeof TenantConfigTranslationTokens = TenantConfigTranslationTokens;

    /** Translated tokens */
    tTokens: TenantConfigTranslatedTokens = {} as TenantConfigTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private dialog: MatDialog,
        private ffAdapter: CommonfeatureflagsAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.initLocalizationAsync();

        this.changelogFlag = this.ffAdapter.isActive(this.changelogFF);

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
     * On tab change
     */
    tabSelected() {
        this.tabChange.emit(this.selectedTab);
    }

    /**
     * Clears list of disabled flags
     */
    clearDisabledFlags(): void {
        this.flagsEditorRef.clearDisabledFlags();
    }

    /**
     * Called when flag data changed
     */
    flagDataChanged() {
        this.flagsTouched = true;
        this.flagChange.emit(true);
    }

    /**
     * Resets the icon upload component
     */
    resetIcon() {
        this.iconUploadRef.clear(null);
    }

    /**
     * Resets the map the the passed in tenant's data
     * @param tenant The tenant to use to reset the map
     */
    resetMap(tenant: Tenant$v1) {
        this.tenantMapRef.setView(tenant.mapData);
    }

    /**
     * Called to save or cancel feature flag changes
     * @param cancel Send true to send cancel flag
     */
    saveFlags(cancel: boolean) {
        if (this.flagsTouched) {
            this.flagsTouched = false;
            if (cancel) {
                this.flagsEditorRef.cancel();
            } else {
                this.flagsEditorRef.save();
            }
        }
    }

    /**
     * Sets a newly selected icon file
     */
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
        this.tenantUpdated.emit(this.tenant);
    }

    /** */
    openDialog(): void {
        this.openChangelogDialog.emit();
    }

    /**
     * Set up routine for localization
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.values(TenantConfigTranslationTokens);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);

        const keys = Object.keys(TenantConfigTranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[TenantConfigTranslationTokens[prop]];
        }

        this.localizationSrv.getLangTokensAsync().then(langTokens => {
            this.languageTokens = langTokens;
        });
    }
}
