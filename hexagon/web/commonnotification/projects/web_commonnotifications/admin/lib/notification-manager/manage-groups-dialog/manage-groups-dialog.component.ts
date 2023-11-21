import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Utils } from '@galileo/web_common-libraries';
import { NotificationSettings$v1 } from '@galileo/web_commonnotifications/_common';

import { ManageGroupsDialogTranslationTokens } from './manage-groups-dialog.translation';

@Component({
    templateUrl: 'manage-groups-dialog.component.html',
    styleUrls: ['manage-groups-dialog.component.scss', '../shared/common-dialog-styles.scss']
})
export class ManageGroupsDialogComponent implements OnInit {

    /** Tracks when changes occur. */
    haveChangesOccurred = false;

    /** List of settings presets */
    settingsPresets: NotificationSettings$v1[] = [];

    /** Group that is currently selected */
    selectedGroupId: string;

    /** Expose translation tokens to html. */
    tokens: typeof ManageGroupsDialogTranslationTokens = ManageGroupsDialogTranslationTokens;

    /** List of updated settings presets */
    updatedPresets: NotificationSettings$v1[] = [];

    /** Id for Other Users. */
    private readonly otherUsersGroupId = '00000000-0000-0000-0000-000000000000';

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<ManageGroupsDialogComponent>
    ) { }

    /**
     * On init life cycle hook
     */
    ngOnInit(): void {
        this.settingsPresets = Utils.deepCopy(this.data.settingsPresets);
    }

    /**
     * Closes dialog
     */
    close(): void {
        this.dialogRef.close();
    }

    /**
     * Determines if a given preset is the default preset for the selected group
     * @param preset Preset to check
     */
    isDefault(preset: NotificationSettings$v1): boolean {
        if (this.selectedGroupId === this.otherUsersGroupId &&
            !preset.defaultGroups.includes(this.selectedGroupId)) {
                return preset.isDefault;
        } else {
            return preset.defaultGroups.includes(this.selectedGroupId);
        }
    }

    /**
     * Saves changes on button click
     */
    saveChanges(): void {
        this.dialogRef.close({
            settingsPresets: this.updatedPresets
        });
    }

    /**
     * Sets default group for a given preset
     * @param preset Preset to set
     */
    setDefault(preset: NotificationSettings$v1): void {
        this.settingsPresets.forEach(existingPreset => {
            if (existingPreset.defaultGroups.includes(this.selectedGroupId) && existingPreset.preset !== preset.preset) {
                existingPreset.defaultGroups = existingPreset.defaultGroups.filter(x => x !== this.selectedGroupId);
                this.setUpdatedPresets(existingPreset);
            }

            if (this.selectedGroupId === this.otherUsersGroupId &&
                existingPreset.preset !== preset.preset && existingPreset.isDefault) {
                existingPreset.isDefault = false;
                this.setUpdatedPresets(existingPreset);
            }
        });

        preset.defaultGroups.push(this.selectedGroupId);

        if (this.selectedGroupId === this.otherUsersGroupId) {
            preset.isDefault = true;
        }

        this.setUpdatedPresets(preset);
        this.haveChangesOccurred = true;
    }

    /**
     * Maintains list of updated presets to prevent updated every preset every time
     * @param preset Preset to update or add
     */
    private setUpdatedPresets(preset: NotificationSettings$v1): void {
        if (this.updatedPresets.some(x => x.preset === preset.preset)) {
            this.updatedPresets.map(x => {
                if (x.preset === preset.preset) {
                    x = preset;
                }

                return x;
            });
        } else {
            this.updatedPresets.push(preset);
        }
    }
}
