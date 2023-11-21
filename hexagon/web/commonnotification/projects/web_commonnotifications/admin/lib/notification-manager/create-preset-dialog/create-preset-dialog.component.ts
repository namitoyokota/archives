import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { NotificationSettings$v1 } from '@galileo/web_commonnotifications/_common';

import { CreatePresetDialogTranslationTokens } from './create-preset-dialog.translation';
import { CreationPreset } from './creation-preset';

@Component({
    templateUrl: 'create-preset-dialog.component.html',
    styleUrls: ['create-preset-dialog.component.scss', '../shared/common-dialog-styles.scss']
})
export class CreatePresetDialogComponent implements OnInit {

    /** Expands width of dialog for every page but the preset intro page. */
    @HostBinding('class.full-width') notFirstPage = false;

    /** Tracks current page of dialog. */
    currentPage = 0;

    /** Whether to hide the preset intro pane. */
    hidePresetIntro = false;

    isLoading = true;

    /** Selected preset option. */
    selectedPresetOption: number = null;

    /** Expose translation tokens to html. */
    tokens: typeof CreatePresetDialogTranslationTokens = CreatePresetDialogTranslationTokens;

    /** Current user's info. */
    userInfo: UserInfo$v1 = null;

    constructor(
        private dialogRef: MatDialogRef<CreatePresetDialogComponent>,
        private identitySrv: CommonidentityAdapterService$v1
    ) { }

    /**
     * On init life cycle hook
     */
    async ngOnInit(): Promise<void> {
        this.userInfo = await this.identitySrv.getUserInfoAsync();
        const userSettings = await this.identitySrv.getUserPersonalizationSettingsAsync(this.userInfo.id,
            'CreateNotificationPreset');

        if (userSettings) {
            this.hidePresetIntro = userSettings as boolean;

            if (this.hidePresetIntro) {
                this.currentPage = 1;
                this.notFirstPage = true;
            }
        }

        this.isLoading = false;
    }

    /**
     * Closes dialog
     */
    close(): void {
        this.dialogRef.close();
    }

    /**
     * Closes dialog on create button click
     */
    create(createdPreset: CreationPreset): void {
        const newPreset: NotificationSettings$v1 = new NotificationSettings$v1(createdPreset.template);
        newPreset.presetName = createdPreset.presetName;
        newPreset.description = createdPreset.description;
        newPreset.defaultGroups = [];

        this.dialogRef.close({
            newPreset
        });
    }

    /**
     * Sets selected preset and goes to next page on button click
     * @param selectedPreset Selected preset
     */
    handleSelectedPreset(selectedPreset: number): void {
        this.selectedPresetOption = selectedPreset;
        this.updateCurrentPage(true);
    }

    /**
     * Updates current page value
     * @param isNextPage Whether to go to the next page or previous page
     */
    updateCurrentPage(isNextPage: boolean): void {
        this.notFirstPage = true;
        if (isNextPage) {
            this.currentPage += 1;
        } else {
            this.currentPage -= 1;
        }
    }
}
