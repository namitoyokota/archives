import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { BaseErrorResponse } from '@galileo/web_common-http';
import {
    CommonConfirmDialogComponent,
    CommonUnsavedChangesDialogComponent,
    CommonUnsavedChangesDialogOptions,
    DirtyComponent$v1,
    PopoverPosition,
    Utils,
} from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    AppNotificationSettings$v1,
    capabilityId,
    CapabilitySettings$v1,
    FeatureFlags,
    NotificationCriteria$v1,
    NotificationSettings$v1,
    TranslationGroup,
} from '@galileo/web_commonnotifications/_common';
import { DataService, SettingsStoreService } from '@galileo/web_commonnotifications/_core';
import { CapabilityManifest$v1, CommontenantAdapterService$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CreatePresetDialogComponent } from './create-preset-dialog/create-preset-dialog.component';
import { EditPresetDialogComponent } from './edit-preset-dialog/edit-preset-dialog.component';
import { ManageGroupsDialogComponent } from './manage-groups-dialog/manage-groups-dialog.component';
import { NotificationManagerTranslationTokens } from './notification-manager.translation';

enum HeaderRowStates {
    disabled = 'disabled',
    enabled = 'enabled',
    indeterminate = 'indeterminate'
}

interface Capability {
    enabled: boolean;
    iconPath: string;
    id: string;
    nameToken: string;
}

interface DropdownItem {
    token: string;
    value: any;
}

interface TableData {
    isEnabled: boolean;
    isHeaderRow: boolean;
    nameToken: string;
    subtype: string;
    type: string;
    uiSettings: AppNotificationSettings$v1;
}

@Component({
    selector: 'hxgn-commonnotifications-manager',
    templateUrl: 'notification-manager.component.html',
    styleUrls: ['notification-manager.component.scss']
})
export class NotificationManagerComponent implements OnInit, OnDestroy, DirtyComponent$v1 {

    /** List of audio files for dropdown. */
    audioFiles: DropdownItem[] = [
        {
            token: NotificationManagerTranslationTokens.defaultNotification,
            value: 'default_notification.wav'
        }
    ];

    /** List of capabilities */
    capabilities: Capability[] = [];

    /** Tracks when capabilities are loading. */
    capabilitiesLoading = true;

    /** Tracks when changes have been made to the capabilities list. */
    capabilitiesUpdated = false;

    /** Tracks when changes have been made to the criteria in the table. */
    criteriaUpdated = false;

    /** Columns to be displayed in the table. */
    displayedColumns = ['showNotifications', 'displayOrder', 'duration', 'animation', 'audio', 'audioFile'];

    /** List of durations for dropdown. */
    durations: DropdownItem[] = [
        {
            token: NotificationManagerTranslationTokens.persist,
            value: -1
        },
        {
            token: NotificationManagerTranslationTokens.seconds,
            value: 5
        },
        {
            token: NotificationManagerTranslationTokens.seconds,
            value: 15
        },
        {
            token: NotificationManagerTranslationTokens.minute,
            value: 60
        },
        {
            token: NotificationManagerTranslationTokens.minutes,
            value: 120
        }
    ];

    /** Expose feature flags to html. */
    featureFlags: typeof FeatureFlags = FeatureFlags;

    /** Expose header row states to html. */
    headerRowStates: typeof HeaderRowStates = HeaderRowStates;

    /** Bus for is dirty. */
    isDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** IsDirty implementation from DirtyComponent. */
    isDirty$ = this.isDirty.asObservable();

    /** Selected preset max to display. */
    maxToDisplay: number = null;

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** Selected capability. */
    selectedCapability: Capability = null;

    /** Selected settings preset. */
    selectedSettingsPreset: NotificationSettings$v1 = null;

    /** Tracks when settings are loading. */
    settingsLoading = true;

    /** List of settings presets. */
    settingsPresets: NotificationSettings$v1[] = [];

    /** Bus for table data. */
    tableData: BehaviorSubject<TableData[]> = new BehaviorSubject<TableData[]>([]);

    /** Observable for table data. */
    tableData$: Observable<TableData[]> = this.tableData.asObservable();

    /** Expose translation tokens to html. */
    tokens: typeof NotificationManagerTranslationTokens = NotificationManagerTranslationTokens;

    /** Tracks selected notifications visibility. Defaults to visible by all users. */
    visibleByAllUsers = true;

    /** Stores capability manifests. */
    private capabilityManifests: CapabilityManifest$v1[] = [];

    /** Destroys descriptions on component destroy. */
    private destroy$: Subject<void> = new Subject<void>();

    /** Stores existing criteria. Key is denoted by capability and preset. */
    private existingCriteria: Map<string, NotificationCriteria$v1[]> = new Map<string, NotificationCriteria$v1[]>();

    /** Stores table data in map with key denoted by capability and preset. */
    private tableDataStore: Map<string, TableData[]> = new Map<string, TableData[]>();

    /** Current user's tenant info. */
    private tenant: Tenant$v1;

    constructor(
        private dataSrv: DataService,
        private dialog: MatDialog,
        private errorNotification: MatSnackBar,
        private identitySrv: CommonidentityAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private settingsStore: SettingsStoreService,
        private tenantSrv: CommontenantAdapterService$v1,
        private titleSrv: Title,
        private ffAdapter: CommonfeatureflagsAdapterService$v1
    ) { }

    /**
     * On init life cycle hook
     */
    async ngOnInit(): Promise<void> {
        this.setTitle();
        this.initLocalizationAsync();

        const userInfo: UserInfo$v1 = await this.identitySrv.getUserInfoAsync();
        this.tenant = await this.tenantSrv.getTenantAsync(userInfo.activeTenant);

        await this.loadCapabilitiesAsync();

        this.settingsStore.entity$.pipe(takeUntil(this.destroy$)).subscribe(settings => {
            if (settings.length) {
                this.settingsPresets = this.sortSettings(settings);
                const existingPreset = this.settingsStore.snapshot(this.selectedSettingsPreset?.preset);

                if (existingPreset) {
                    this.selectedSettingsPreset = new NotificationSettings$v1(existingPreset);
                } else {
                    this.selectedSettingsPreset = new NotificationSettings$v1(this.settingsPresets.find(x => x.isDefault));
                }

                this.visibleByAllUsers = !this.settingsPresets.some(x => x.defaultGroups.length);
                this.maxToDisplay = this.selectedSettingsPreset.maxToDisplay;
                this.setCriteriaAsync();
                this.updateCapabilitiesList();

                this.capabilitiesUpdated = false;
                this.settingsLoading = false;
            }
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            await this.initLocalizationAsync();
            await this.setTitle();
            await this.loadCapabilitiesAsync();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private async loadCapabilitiesAsync() {
        this.capabilityManifests = (await this.tenantSrv.getCapabilityListAsync(capabilityId))?.filter(manifest => {
            // Check for feature flags
            const settings = manifest.compatible.find(c => c.capabilityId === capabilityId)?.options as CapabilitySettings$v1;
            if (settings?.featureFlag && !this.ffAdapter.isActive(settings.featureFlag)) {
                return false;
            }

            return true;
        });

        // Sort capability list
        const capabilityTokens = new Map<string, string>();
        const capabilityNameTokens: string[] = this.capabilityManifests.map(x => x.nameToken);
        await this.localizationSrv.localizeStringsAsync(capabilityNameTokens).then(async () => {
            const translatedTokens = await this.localizationSrv.getTranslationAsync(capabilityNameTokens);

            capabilityNameTokens.forEach((token: string) => {
                capabilityTokens.set(token, translatedTokens[token]);
            });

            this.capabilityManifests.sort((a, b) => translatedTokens[a.nameToken] > translatedTokens[b.nameToken] ? 1 : -1);
        });

        this.capabilities = [];

        this.capabilityManifests.forEach((capabilityManifest: CapabilityManifest$v1) => {
            const options: CapabilitySettings$v1 = capabilityManifest.compatible
                .find(option => option.capabilityId === capabilityId).options as CapabilitySettings$v1;
            this.localizationSrv.localizeStringsAsync(options.filterOptions.map(x => x.nameToken));

            if (options.subtypes?.length) {
                this.localizationSrv.localizeStringsAsync(options.subtypes.map(x => x.nameToken));
            }

            const capability = {
                enabled: false,
                iconPath: this.getCapabilityBackgroundImage(capabilityManifest),
                id: capabilityManifest.id,
                nameToken: capabilityManifest.nameToken
            } as Capability;

            this.capabilities.push(capability);
        });

        if (!this.selectedCapability?.id) {
            this.selectedCapability = this.capabilities[0];
        }
    }

    /**
     * Deletes selected settings
     */
    deleteSettings(): void {
        this.dialog.open(CommonConfirmDialogComponent, {
            autoFocus: false,
            disableClose: true,
            data: {
                titleToken: this.tokens.confirmPresetDelete,
                msgToken: this.selectedSettingsPreset.defaultGroups.length ? this.tokens.confirmPresetDeleteDetails : null
            }
        }).afterClosed().subscribe(async confirmed => {
            if (confirmed) {
                this.settingsLoading = true;
                await this.dataSrv.setting.delete$(this.selectedSettingsPreset.preset).toPromise();
                this.settingsStore.remove(this.selectedSettingsPreset.preset);
            }
        });
    }

    /**
     * Discards all active changes.
     */
    async discardChangesAsync(): Promise<void> {
        if (this.capabilitiesUpdated) {
            const preset = this.selectedSettingsPreset.preset;
            this.selectedSettingsPreset = new NotificationSettings$v1(this.settingsStore.snapshot(preset));
            this.maxToDisplay = this.selectedSettingsPreset.maxToDisplay;
            this.updateCapabilitiesList();
            this.capabilitiesUpdated = false;
        }

        if (this.criteriaUpdated) {
            await this.setCriteriaAsync();
            this.criteriaUpdated = false;
        }
    }

    /**
     * Gets state of header row checkbox based on subtype enabled values
     * @param type the type of the parent header row that all subtypes will have
     */
    getHeaderRowState(type: string): string {
        let trueCount = 0;
        const subtypes: TableData[] = this.tableData.getValue().filter(x => x.type === type && !!x.subtype);
        subtypes.forEach((subtype: TableData) => {
            if (subtype.isEnabled) {
                trueCount += 1;
            }
        });

        if (trueCount === subtypes.length) {
            return HeaderRowStates.enabled;
        } else if (trueCount > 0) {
            return HeaderRowStates.indeterminate;
        } else {
            return HeaderRowStates.disabled;
        }
    }

    /**
     * Validates display order on input
     * @param $event Input event
     */
    handleDisplayOrderInput($event: any): void {
        this.criteriaUpdated = true;
        const max = this.tableData.getValue().filter(x => !x.isHeaderRow);
        if ($event.target.value < 1) {
            $event.target.value = 1;
        } else if ($event.target.value > max.length) {
            $event.target.value = max.length;
        }
    }

    /**
     * Validates max to display on input
     * @param $event Input event
     */
    handleMaxToDisplayInput($event: any): void {
        this.capabilitiesUpdated = true;
        if ($event.target.value < 1) {
            $event.target.value = 1;
        } else if ($event.target.value > 8) {
            $event.target.value = 8;
        }
    }

    /**
     * Tracks unsaved changes.
     */
    hasUnsavedChanges(): boolean {
        let unsavedChanges = false;
        if (this.capabilitiesUpdated) {
            unsavedChanges = true;
        } else if (this.criteriaUpdated) {
            unsavedChanges = true;
        }

        if (this.isDirty.getValue() !== unsavedChanges) {
            this.isDirty.next(unsavedChanges);
        }

        return unsavedChanges;
    }

    /**
     * Opens create preset dialog.
     */
    openCreatePresetDialog(): void {
        this.dialog.open(CreatePresetDialogComponent, {
            height: '645px',
            autoFocus: false,
            disableClose: true
        }).afterClosed().subscribe(async data => {
            if (data) {
                this.settingsLoading = true;

                const newPreset: NotificationSettings$v1 = data.newPreset;
                newPreset.etag = null;
                newPreset.preset = null;
                newPreset.tenantId = this.tenant.id;
                newPreset.isDefault = false;

                const createdPreset: NotificationSettings$v1 = await this.dataSrv.setting.create$(newPreset).toPromise();
                this.settingsStore.upsert(createdPreset);

                this.setSelectedSettings(createdPreset.preset);
            }
        });
    }

    /**
     * Opens edit preset dialog
     */
    openEditPresetDialog(): void {
        this.dialog.open(EditPresetDialogComponent, {
            height: '560px',
            width: '930px',
            autoFocus: false,
            disableClose: true,
            data: {
                preset: this.selectedSettingsPreset
            }
        }).afterClosed().subscribe(async data => {
            if (data) {
                this.settingsLoading = true;
                await this.dataSrv.setting.update$([data.preset]).toPromise()
                    .then((result: NotificationSettings$v1[]) => {
                        this.settingsStore.upsert(result[0]);
                    }).catch(error => {
                        this.showError(error);
                        this.settingsLoading = false;
                    });
            }
        });
    }

    /**
     * Opens manage groups dialog
     */
    openManageGroupsDialog(): void {
        this.dialog.open(ManageGroupsDialogComponent, {
            height: '560px',
            width: '930px',
            autoFocus: false,
            disableClose: true,
            data: {
                settingsPresets: this.settingsPresets
            }
        }).afterClosed().subscribe(async data => {
            if (data) {
                this.settingsLoading = true;
                this.dataSrv.setting.update$(data.settingsPresets).subscribe((result: NotificationSettings$v1[]) => {
                    this.settingsStore.upsert(result);
                    this.settingsLoading = false;
                });
            }
        });
    }

    /**
     * Plays sound
     * @param file File to play
     */
    playSound(file: string): void {
        if (file) {
            const audio = new Audio('assets/commonnotifications-core/audio/' + file);
            audio.play();
        }
    }

    /**
     * Saves all active changes.
     */
    async saveChangesAsync(): Promise<void> {
        this.settingsLoading = this.capabilitiesUpdated;
        this.capabilitiesLoading = this.criteriaUpdated;

        return new Promise<void>(async (resolve, reject) => {
            if (this.criteriaUpdated) {
                const key = this.selectedCapability.id + '-' + this.selectedSettingsPreset.preset;
                const existingCriteria: NotificationCriteria$v1[] = this.existingCriteria.get(key);
                const newCriteria: NotificationCriteria$v1[] = [];

                existingCriteria.forEach((criteria: NotificationCriteria$v1) => {
                    const updatedCriteria = new NotificationCriteria$v1(criteria);
                    let tableData: TableData = null;
                    if (updatedCriteria.notificationSubtype) {
                        tableData = this.tableData.getValue().find(x => x.subtype === updatedCriteria.notificationSubtype);
                    } else {
                        tableData = this.tableData.getValue().find(x => x.type === updatedCriteria.notificationType);
                    }

                    updatedCriteria.isEnabled = tableData.isEnabled;
                    updatedCriteria.grouping[0].uiSettings = new AppNotificationSettings$v1(tableData.uiSettings);
                    newCriteria.push(updatedCriteria);
                });

                await this.dataSrv.criteria.update$(newCriteria).toPromise()
                    .catch((error) => {
                        this.showError(error);
                        this.capabilitiesLoading = false;
                    });

                await this.setCriteriaAsync(true);
                this.criteriaUpdated = false;
            }

            if (this.capabilitiesUpdated) {
                const settings = new NotificationSettings$v1(this.selectedSettingsPreset);
                settings.maxToDisplay = this.maxToDisplay;
                await this.dataSrv.setting.update$([settings]).toPromise()
                    .then((result: NotificationSettings$v1[]) => {
                        this.settingsStore.upsert(result[0]);
                    }).catch(error => {
                        this.showError(error);
                        this.settingsLoading = false;
                    });
            }

            resolve();
        });
    }

    /**
     * Sets default settings
     */
    async setDefaultSettingsAsync(): Promise<void> {
        this.settingsLoading = true;

        const oldSettings = new NotificationSettings$v1(this.settingsPresets.find(x => x.isDefault));
        oldSettings.isDefault = false;

        const newSettings = new NotificationSettings$v1(this.selectedSettingsPreset);
        newSettings.isDefault = true;

        const updatedSettings = await this.dataSrv.setting.update$([oldSettings, newSettings]).toPromise();
        this.settingsStore.upsert(updatedSettings);
    }

    /**
     * Selects capability.
     * @param capability Capability to select
     */
    setSelectedCapability(capability: Capability): void {
        if (capability.id !== this.selectedCapability.id) {
            if (this.criteriaUpdated) {
                this.dialog.open(CommonUnsavedChangesDialogComponent, {
                    autoFocus: false,
                    disableClose: true
                }).afterClosed().subscribe(async data => {
                    if (data.selection !== CommonUnsavedChangesDialogOptions.cancel) {
                        if (data.selection === CommonUnsavedChangesDialogOptions.discardChanges) {
                            await this.discardChangesAsync();
                        } else {
                            await this.saveChangesAsync();
                        }

                        this.selectedCapability = capability;
                        this.setCriteriaAsync();
                    }
                });
            } else {
                this.selectedCapability = capability;
                this.setCriteriaAsync();
            }
        }
    }

    /**
     * Selects settings by preset name
     * @param preset Id of settings preset to select
     */
    setSelectedSettings(preset: string): void {
        if (this.selectedSettingsPreset.preset !== preset) {
            if (this.criteriaUpdated || this.capabilitiesUpdated) {
                this.dialog.open(CommonUnsavedChangesDialogComponent, {
                    autoFocus: false,
                    disableClose: true
                }).afterClosed().subscribe(async data => {
                    if (data.selection !== CommonUnsavedChangesDialogOptions.cancel) {
                        if (data.selection === CommonUnsavedChangesDialogOptions.discardChanges) {
                            await this.discardChangesAsync();
                        } else {
                            await this.saveChangesAsync();
                        }

                        this.selectedSettingsPreset = new NotificationSettings$v1(this.settingsStore.snapshot(preset));
                        this.maxToDisplay = this.selectedSettingsPreset.maxToDisplay;
                        this.updateCapabilitiesList();
                        this.capabilitiesUpdated = false;

                        this.selectedCapability = this.capabilities[0];
                        this.setCriteriaAsync();
                    }
                });
            } else {
                this.selectedSettingsPreset = new NotificationSettings$v1(this.settingsStore.snapshot(preset));
                this.maxToDisplay = this.selectedSettingsPreset.maxToDisplay;
                this.updateCapabilitiesList();
                this.capabilitiesUpdated = false;

                this.selectedCapability = this.capabilities[0];
                this.setCriteriaAsync();
            }
        }
    }

    /**
     * Toggles all subtypes on parent header row click
     * @param type the type of the parent header row that all subtypes will have
     * @param $event Mat checkbox event
     */
    toggleSubtypesEnabled(type: string, $event: MatCheckboxChange) {
        this.criteriaUpdated = true;
        const subtypes: TableData[] = this.tableData.getValue().filter(x => x.type === type && !!x.subtype);
        subtypes.forEach((subtype: TableData) => {
            subtype.isEnabled = $event.checked;
        });
    }

    /**
     * Toggles group visibility
     */
    toggleVisibility(toggleAllUsers: boolean): void {
        if (toggleAllUsers && this.settingsPresets.some(x => x.defaultGroups.length)) {
            this.dialog.open(CommonConfirmDialogComponent, {
                autoFocus: false,
                disableClose: true,
                data: {
                    titleToken: this.tokens.discardGroupSettings,
                    msgToken: this.tokens.discardGroupSettingsDetails
                }
            }).afterClosed().subscribe(confirmed => {
                if (confirmed) {
                    this.settingsPresets.forEach(preset => {
                        preset.defaultGroups = [];
                    });

                    this.dataSrv.setting.update$(this.settingsPresets).subscribe((result: NotificationSettings$v1[]) => {
                        this.settingsStore.upsert(result);
                        this.visibleByAllUsers = toggleAllUsers;
                    });
                }
            });
        } else {
            this.visibleByAllUsers = toggleAllUsers;
        }
    }

    /**
     * Method used to track a capability in a ngFor loop
     * @param index The index of the item
     * @param item The item
     */
    trackByCapabilityId(index, item: Capability): string {
        return item.id;
    }

    /**
     * Updates disabled capabilities list
     * @param id Id of capability to update
     */
    updateDisabledCapabilities(id: string): void {
        if (this.selectedSettingsPreset.disabledCapabilities.includes(id)) {
            this.selectedSettingsPreset.disabledCapabilities =
                this.selectedSettingsPreset.disabledCapabilities.filter(x => x !== id);
        } else {
            this.selectedSettingsPreset.disabledCapabilities.push(id);
        }

        this.updateCapabilitiesList();
        this.capabilitiesUpdated = true;
    }

    /**
     * Gets capability background image
     * @param capability Capability to get background image for
     */
    private getCapabilityBackgroundImage(capability: CapabilityManifest$v1): string {
        const options: CapabilitySettings$v1 = capability.compatible
            .find(option => option.capabilityId === capabilityId).options as CapabilitySettings$v1;
        return options.iconPath;
    }

    /**
     * Gets name token value for type or subtype
     * @param capabilityID ID of capability to get options for
     * @param id Id of type or subtype to get name token for
     */
    private getNameToken(capabilityID: string, id: string): string {
        const capability: CapabilityManifest$v1 = this.capabilityManifests.find(x => x.id === capabilityID);
        const options: CapabilitySettings$v1 = capability.compatible
            .find(option => option.capabilityId === capabilityId).options as CapabilitySettings$v1;

        let nameToken = options.filterOptions.find(x => x.id === id)?.nameToken;
        if (!nameToken) {
            nameToken = options.subtypes.find(x => x.id === id)?.nameToken;
        }

        return nameToken;
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        this.localizationSrv.localizeGroup([
            TranslationGroup.common,
            TranslationGroup.core,
            TranslationGroup.notificationManager
        ]);
    }

    /**
     * Sets all criteria data.
     * If it exists in the store, returns store value. Otherwise builds store by criteria and preset.
     * @param isUpdate Tracks if this set is occurring after an update to the criteria
     */
    private async setCriteriaAsync(isUpdate?: boolean): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const key = this.selectedCapability?.id + '-' + this.selectedSettingsPreset.preset;

            if (this.tableDataStore.has(key) && !isUpdate) {

                if (this.tableDataStore.has(key)) {
                    const data = this.tableDataStore.get(key);
                    if (data) {
                        this.tableData.next(Utils.deepCopy(data));
                    }
                } else {
                    this.tableData.next([]);
                }
            } else {
                this.capabilitiesLoading = true;

                const promises = [];
                if (!isUpdate) {
                    this.capabilities.forEach(capability => {
                        promises.push(this.dataSrv.criteria.get$(capability.id, this.selectedSettingsPreset.preset).toPromise());
                    });
                } else {
                    promises.push(this.dataSrv.criteria.get$(this.selectedCapability.id, this.selectedSettingsPreset.preset).toPromise());
                }

                const presetCriteria: NotificationCriteria$v1[][] = await Promise.all(promises);
                presetCriteria.forEach((criteria: NotificationCriteria$v1[]) => {
                    if (criteria?.length) {
                        const newKey = criteria[0].capabilityId + '-' + this.selectedSettingsPreset.preset;
                        this.existingCriteria.set(newKey, criteria);

                        // Sort criteria so items with subtypes appear at the bottom of the array
                        criteria = criteria.sort((a, b) => {
                            if (a.notificationSubtype === null && b.notificationSubtype !== null) {
                                return -1;
                            } else if (a.notificationSubtype !== null && b.notificationSubtype === null) {
                                return 1;
                            } else if (a.notificationType === b.notificationType) {
                                return a.notificationSubtype < b.notificationSubtype ? -1 : 1;
                            } else {
                                return a.notificationType < b.notificationType ? -1 : 1;
                            }
                        });

                        const tableData: TableData[] = [];
                        criteria.forEach((item: NotificationCriteria$v1) => {
                            const tableDataItem = {} as TableData;
                            tableDataItem.isEnabled = item.isEnabled;

                            if (item.notificationSubtype) {
                                if (!tableData.find(x => x.type === item.notificationType)) {
                                    const tableDataHeader = {
                                        isEnabled: false,
                                        isHeaderRow: true,
                                        nameToken: this.getNameToken(item.capabilityId, item.notificationType),
                                        subtype: null,
                                        type: item.notificationType,
                                        uiSettings: new AppNotificationSettings$v1()
                                    } as TableData;

                                    tableData.push(tableDataHeader);
                                }

                                tableDataItem.subtype = item.notificationSubtype;
                                tableDataItem.type = item.notificationType;
                                tableDataItem.nameToken = this.getNameToken(item.capabilityId, item.notificationSubtype);
                            } else {
                                tableDataItem.subtype = null;
                                tableDataItem.type = item.notificationType;
                                tableDataItem.nameToken = this.getNameToken(item.capabilityId, item.notificationType);
                            }

                            tableDataItem.isHeaderRow = false;
                            tableDataItem.uiSettings = new AppNotificationSettings$v1(item.grouping[0].uiSettings);
                            tableData.push(tableDataItem);
                        });

                        this.tableDataStore.set(newKey, tableData);
                    }
                });

                if (this.tableDataStore.has(key)) {
                    const data = this.tableDataStore.get(key);
                    this.tableData.next(data ? Utils.deepCopy(data) : []);
                } else {
                    this.tableData.next([]);
                }

                this.capabilitiesLoading = false;
            }

            resolve();
        });
    }

    /**
     * Sets the page's title
     */
    private async setTitle() {
        this.titleSrv.setTitle('HxGN Connect');

        const title = await this.localizationSrv.getTranslationAsync(NotificationManagerTranslationTokens.notificationManager);
        this.titleSrv.setTitle(`HxGN Connect - ${title}`);
    }

    /**
     * Shows error notification
     * @param err Error
     */
    private showError(err: BaseErrorResponse): void {
        const statusCode = (err.statusCode) ? err.statusCode.toString() : null;
        this.errorNotification.open(err.errors[0], statusCode, {
            duration: 8000
        });
    }

    /**
     * Sorts settings by preset name.
     */
    private sortSettings(settings: NotificationSettings$v1[]): NotificationSettings$v1[] {
        return settings.sort((a, b) => a.presetName.localeCompare(b.presetName));
    }

    /**
     * Updates capabilities list
     */
    private updateCapabilitiesList(): void {
        this.capabilities.forEach((capability: Capability, index: number) => {
            this.capabilities[index].enabled = !this.selectedSettingsPreset.disabledCapabilities.includes(capability.id);
        });
    }
}
