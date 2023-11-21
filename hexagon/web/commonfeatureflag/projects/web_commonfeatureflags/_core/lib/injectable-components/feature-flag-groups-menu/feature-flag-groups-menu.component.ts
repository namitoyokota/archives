import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonUnsavedChangesDialogComponent, CommonUnsavedChangesDialogOptions } from '@galileo/web_common-libraries';
import {
    DefaultGroupIds,
    DisplayedGroup$v1,
    EditedGroup$v1,
    FeatureFlag$v2,
    FeatureFlagEditorSettings$v2,
    FlagState$v1,
    GlobalStates$v1,
    GroupState$v1,
    LAYOUT_MANAGER_SETTINGS,
    Scope$v1,
    SelectableCategories,
} from '@galileo/web_commonfeatureflags/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FlagStateRequest$v2 } from '../../abstractions/flag-state-request.v2';
import { DataService$v2 } from '../../data.service.v2';
import { AllUsersDialogComponent } from '../../share/all-users-dialog/all-users-dialog.component';
import { SelectGroupsDialogComponent } from '../../share/select-groups-dialog/select-groups-dialog.component';
import { FeatureFlagEditorTranslationTokens } from './feature-flag-groups-menu.translation';

@Component({
    templateUrl: 'feature-flag-groups-menu.component.html',
    styleUrls: ['feature-flag-groups-menu.component.scss'],
})
export class FeatureFlagGroupsMenuComponent implements OnInit, OnDestroy {

    /** List of all feature flags in the system */
    featureFlags: FeatureFlag$v2[];

    /** List of all feature flag states at global, tenant, and group level */
    globalStates: GlobalStates$v1;

    /** List of feature flag states by group */
    currentStates: DisplayedGroup$v1[];

    /** Flag states being displayed currently */
    selectedGroupStates: FlagState$v1[] = [];

    /** Edited flag ids for group displayed */
    selectedEditedFlags: string[] = [];

    /** All groups edited by the user */
    editedGroups: EditedGroup$v1[] = [];

    /** Currently listed group ids */
    groupIds: string[];

    /** Category that is currently selected */
    selectedCategory: SelectableCategories;

    /** Group that is currently selected */
    selectedGroupId: string;

    /** Expose FeatureFlagEditorTranslationTokens to HTML */
    tokens: typeof FeatureFlagEditorTranslationTokens = FeatureFlagEditorTranslationTokens;

    /** List of disabled feature flags. */
    disabledFeatureFlags: FeatureFlag$v2[] = [];

    /** Flag to indicate when in process of saving */
    saving = false;

    /** Event when the component is destroyed */
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) private settings: FeatureFlagEditorSettings$v2,
        private dataService: DataService$v2,
        private dialog: MatDialog,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit() {
        this.featureFlags = await this.dataService.featureFlag.getAll().toPromise();
        this.initLocalization();
        this.globalStates = await this.dataService.featureFlag.getGroupStates().toPromise();
        this.setStates();

        this.settings.save$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.saveAsync();
        });

        this.settings.cancel$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.cancel();
        });

        this.settings.disabledFlags$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((flags: FeatureFlag$v2[]) => {
            this.disabledFeatureFlags = flags;
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initLocalization();
            }
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
     * Event when flags change
     * @param flagIds Active flag ids list
     */
    flagsChange(flagIds: string[]): void {
        this.selectedGroupStates.forEach(state => {
            state.enabled = flagIds.some(id => id === state.flagId);
        });
    }

    /**
     *  Event when override remove change
     * @param flagIds Removed flag ids list
     */
    overridesChange(flagIds: string[]): void {
        this.selectedGroupStates.forEach(state => {
            state.removeCurrentLevelOverride = flagIds.some(id => id === state.flagId);
        });
    }

    /**
     * Event when any flag changes
     * @param flagIds List of all changed flag ids
     */
    allChange(flagIds: string[]): void {
        const groupId = this.getGroupId();

        const editedGroupFlags = this.editedGroups.find(group => group.groupId === groupId);
        if (editedGroupFlags) {
            editedGroupFlags.flagIds = flagIds;
        } else {
            this.editedGroups = [...this.editedGroups, new EditedGroup$v1({ groupId, flagIds })];
        }

        this.settings.isDirty(true);
    }

    /**
     * Event when selected category changes
     */
    categoryChange(): void {
        const allUsersMode = this.selectedCategory === SelectableCategories.AllUsers;
        if (allUsersMode) {
            this.dialog.open(AllUsersDialogComponent, {
                disableClose: true,
                width: '500px'
            }).afterClosed().subscribe((val) => {
                if (val) {
                    this.updateFlags();
                    this.settings.isDirty(true);
                } else {
                    this.selectedCategory = SelectableCategories.ByGroups;
                }
            });
        } else {
            this.updateFlags();
        }
    }

    /**
     * Event when selected group changes
     */
    groupChange(groupId: string): void {
        const changeExists = this.editedGroups.length > 0;
        if (changeExists) {
            this.dialog.open(CommonUnsavedChangesDialogComponent, {
                disableClose: true
            }).afterClosed().subscribe(async action => {
                switch (action.selection) {
                    case CommonUnsavedChangesDialogOptions.discardChanges:
                        this.globalStates = await this.dataService.featureFlag.getGroupStates().toPromise();
                        this.setStates();
                        this.selectedGroupId = groupId;
                        break;
                    case CommonUnsavedChangesDialogOptions.saveChanges:
                        this.saveAsync();
                        this.selectedGroupId = groupId;
                        break;
                }
            });
        } else {
            this.selectedGroupId = groupId;
            this.updateFlags();
        }
    }

    /**
     * Change currently active and optional flags
     */
    updateFlags(): void {
        const id = this.getGroupId();

        const currentGroupExists = this.currentStates && this.currentStates.some(group => group.groupId === id);
        if (currentGroupExists) {
            this.selectedGroupStates = this.currentStates.find(group => group.groupId === id).flagStates;

            const groupAlreadyEdited = this.editedGroups.some(group => group.groupId === id);
            if (groupAlreadyEdited) {
                this.selectedEditedFlags = this.editedGroups.find(group => group.groupId === id).flagIds;
            }
        }
    }

    /**
     * Dialog to add groups from list
     */
    addGroups(): void {
        this.dialog.open(SelectGroupsDialogComponent, {
            height: '600px',
            width: '930px',
            disableClose: true,
            data: {
                existingGroups: this.groupIds.filter(id => id !== DefaultGroupIds.AllUsers)
            }
        }).afterClosed().subscribe(groups => {
            if (groups) {
                groups.push(DefaultGroupIds.AllUsers);

                groups.forEach(groupId => {
                    const groupExists = this.groupIds.some(id => id === groupId);
                    if (!groupExists) {
                        this.addGroup(groupId);
                    }
                });

                this.groupIds.forEach(groupId => {
                    const groupExists = groups.some(id => id === groupId);
                    if (!groupExists) {
                        this.removeGroup(groupId);
                    }
                });
            }
        });
    }

    /**
     * Handles flag disabled for disabled flags list
     * @param flag Flag that was disabled
     */
    handleFlagDisabled(flag: FeatureFlag$v2): void {
        if (!this.disabledFeatureFlags.some(x => x.flagId === flag.flagId)) {
            this.disabledFeatureFlags.push(flag);
            this.settings.setDisabledFlags(this.disabledFeatureFlags);
        }
    }

    /**
     * Handles flag enabled for disabled flags list
     * @param flag Flag that was enabled
     */
    handleFlagEnabled(flag: FeatureFlag$v2): void {
        if (this.disabledFeatureFlags.some(x => x.flagId === flag.flagId)) {
            this.disabledFeatureFlags = this.disabledFeatureFlags.filter(x => x.flagId !== flag.flagId);
            this.settings.setDisabledFlags(this.disabledFeatureFlags);
        }
    }

    /**
     * Add group to edit feature flag states
     * @param groupId Group id to add
     */
    private addGroup(groupId: string): void {
        let flagStates = [];
        this.featureFlags.forEach(ff => {
            const currentState = this.currentStates.find(x => x.groupId === '*');
            const flagData: FlagState$v1 = currentState.flagStates.find(flag => flag.flagId === ff.flagId);
            flagStates = [...flagStates, flagData];
        });

        this.currentStates.push(new DisplayedGroup$v1({
            groupId,
            flagStates
        }));
        this.groupIds = [...this.groupIds, groupId];

        this.groupChange(groupId);
    }

    /**
     * Remove group's feature flag states
     * @param groupId Group id to remove
     */
    private removeGroup(groupId: string): void {
        const editedGroup = this.editedGroups.find(group =>
            group.groupId === groupId
        );

        const editedFlags = this.currentStates.find(group =>
            group.groupId === groupId
        ).flagStates.filter(flagState =>
            flagState.tenantOptional
        ).map(flagState => {
            flagState.removeCurrentLevelOverride = true;
            return flagState.flagId;
        });

        if (editedGroup) {
            editedGroup.flagIds = editedFlags;
        } else {
            this.editedGroups.push(new EditedGroup$v1({
                groupId,
                flagIds: editedFlags
            }));
        }

        this.settings.isDirty(true);
        this.groupIds = this.groupIds.filter(id => id !== groupId);
    }

    /**
     * Saves any group flags that have been changed
     */
    public async saveAsync(): Promise<void> {
        this.saving = true;

        const allUserMode = this.selectedCategory === SelectableCategories.AllUsers;
        if (allUserMode) {
            this.editedGroups = this.editedGroups.filter(group => group.groupId === DefaultGroupIds.AllUsers);

            const groupsExist = this.globalStates.groups.length > 1;
            if (groupsExist) {
                await this.dataService.featureFlag.deleteGroups().toPromise();
                this.globalStates.groups = [];
                this.setStates();
            }
        }

        const update: { groupId: string, flagStates: FlagStateRequest$v2[] }[] = this.editedGroups.map(group => {
            return {
                groupId: group.groupId,
                flagStates: group.flagIds.map(flag => {
                    const flagState = this.currentStates.find(groups => groups.groupId === group.groupId).flagStates.find(state => state.flagId === flag);
                    return new FlagStateRequest$v2({
                        featureFlag: this.featureFlags.find(ff => ff.flagId === flag),
                        enabled: flagState.enabled,
                        tenantOptional: flagState.tenantOptional,
                        forcePushLevelsBelow: false,
                        removeCurrentLevelOverride: flagState.removeCurrentLevelOverride
                    });
                })
            };
        });

        const changeExists = this.editedGroups.length > 0;
        if (changeExists) {
            await this.dataService.featureFlag.updateGroups(update).toPromise();
            this.globalStates = await this.dataService.featureFlag.getGroupStates().toPromise();
            this.setStates();
        }

        this.saving = false;
    }

    /**
     * Cancels any changes
     */
    public async cancel(): Promise<void> {
        this.setStates();
        this.settings.isDirty(false);
        console.log('cancel');
    }

    /**
     * Get the current id according to the selected category and group
     */
    private getGroupId(): string {
        let id: string;

        const allUsersMode = (this.selectedGroupId === DefaultGroupIds.OtherUsers || this.selectedCategory === SelectableCategories.AllUsers);
        if (allUsersMode) {
            id = DefaultGroupIds.AllUsers;
        } else {
            id = this.selectedGroupId;
        }
        return id;
    }

    /**
     * Update the selected category
     * @param groupId Group id to change to
     */
    private setCategory(): void {
        const groupModeOn = this.groupIds.length > 1;
        if (groupModeOn) {
            this.selectedCategory = SelectableCategories.ByGroups;
        } else {
            this.selectedCategory = SelectableCategories.AllUsers;
        }
    }

    /**
     * Sets all feature flag states to display
     */
    private setStates(): void {
        this.currentStates = [];
        this.editedGroups = [];
        this.selectedEditedFlags = [];
        this.groupIds = [];

        const allUsersExists = this.globalStates.groups.some(group => group.groupId === DefaultGroupIds.AllUsers);
        if (!allUsersExists) {
            this.globalStates.groups.push(new GroupState$v1({ groupId: DefaultGroupIds.AllUsers, flagStates: JSON.parse(JSON.stringify(this.globalStates.tenant)) }));
        }

        this.globalStates.groups.forEach(group => {
            let flagStates = [];
            this.featureFlags.forEach(ff => {
                let flagData: FlagState$v1 = group.flagStates.find(flag => flag.flagId === ff.flagId);

                if (flagData) {
                    flagData.forcePushLevelsBelow = true;
                    flagData.tenantOptional = true;
                } else {
                    flagData = this.globalStates.tenant.find(flag => flag.flagId === ff.flagId);

                    if (flagData) {
                    } else {
                        flagData = this.globalStates.global.find(flag => flag.flagId === ff.flagId);

                        if (!flagData) {
                            flagData = new FlagState$v1({
                                flagId: ff.flagId,
                                enabled: false,
                                tenantOptional: false,
                                forcePushLevelsBelow: false,
                                removeCurrentLevelOverride: false,
                                lastModifiedDate: ff.lastModifiedTime
                            });
                        }
                    }
                }

                flagData.scope = ff.scope;
                flagData.editable = ff.scope === Scope$v1.any;
                flagStates = [...flagStates, { ...flagData }];
            });

            this.currentStates = [...this.currentStates, new DisplayedGroup$v1({ groupId: group.groupId, flagStates })];
            this.groupIds = [...this.groupIds, group.groupId];
        });

        this.setCategory();
        this.updateFlags();
    }

    private initLocalization() {
        const mapTokens = [];
        this.featureFlags.forEach(flag => {
            mapTokens.push(flag.descriptionToken);
            mapTokens.push(flag.friendlyName);
        });
        this.localizationSrv.localizeStringsAsync(mapTokens);
    }
}
