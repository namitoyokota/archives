import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UrlHelper$v1 } from '@galileo/web_common-http';
import {
    ActivityNotificationConfig$v1,
    CommonidentityAdapterService$v1,
    ContactThreshold$v1,
} from '@galileo/web_commonidentity/adapter';

import { ManageActivityEmailsDialogTranslationTokens } from './manage-activity-emails-dialog.translation';

@Component({
    templateUrl: 'manage-activity-emails-dialog.component.html',
    styleUrls: ['manage-activity-emails-dialog.component.scss']
})
export class ManageActivityEmailsDialogComponent implements OnInit {

    /** Tracks page (1-2). */
    activePage = 1;

    /** Activity notification config. */
    activityConfig: ActivityNotificationConfig$v1 = new ActivityNotificationConfig$v1();

    /** Tracks whether this is admin use or not. */
    isAdmin = true;

    /** Tracks dialog loading. */
    isLoading = true;

    /** Tracks emails per day. */
    maxEmailsPerDay = 0;

    /** Organization thresholds. */
    thresholds = [0, 0];

    /** Expose translation tokens to html. */
    tokens: typeof ManageActivityEmailsDialogTranslationTokens = ManageActivityEmailsDialogTranslationTokens;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<ManageActivityEmailsDialogComponent>,
        private identitySrv: CommonidentityAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit(): Promise<void> {
        let activityConfig: ActivityNotificationConfig$v1 = null;
        if (this.data.isAdmin) {
            activityConfig = await this.identitySrv.getActivityNotificationsAdminAsync(this.data.tenantId);
        } else {
            activityConfig = await this.identitySrv.getActivityNotificationsAsync();
            this.isAdmin = false;
        }

        if (activityConfig.salesContact === null) {
            activityConfig.salesContact = new ContactThreshold$v1();
        }

        if (activityConfig.tenantContact === null) {
            activityConfig.tenantContact = new ContactThreshold$v1();
        }

        this.activityConfig = activityConfig;
        this.maxEmailsPerDay = Math.ceil(24 / this.activityConfig.tenantContact.cooldownHours);
        this.activityConfig.tenantContact.threshold.forEach((threshold: number, index: number) => {
            this.thresholds[index] = threshold * 100;
        });

        this.isLoading = false;
    }

    /**
     * Closes dialog
     */
    close(): void {
        this.dialogRef.close();
    }

    /**
     * Formats threshold as a percentage
     * @param threshold Threshold value
     */
    formatThreshold(threshold: number): string {
        return threshold + '%';
    }

    /**
     * Increments active step.
     */
    nextPage(): void {
        this.activePage += 1;
    }

    /**
     * Decrements active step.
     */
    previousPage(): void {
        this.activePage -= 1;
    }

    /**
     * Closes dialog with updated activity notifications object
     */
    async saveChangesAsync(): Promise<void> {
        this.isLoading = true;
        this.activityConfig.tenantContact.cooldownHours = 24 / this.maxEmailsPerDay;
        this.thresholds.forEach((threshold: number, index: number) => {
            this.activityConfig.tenantContact.threshold[index] = threshold / 100;
        });

        if (this.data.isAdmin) {
            this.activityConfig = await this.identitySrv.setActivityNotificationsAdminAsync(this.data.tenantId, this.activityConfig);
        } else {
            this.activityConfig = await this.identitySrv.setActivityNotificationsAsync(this.activityConfig);
        }

        this.close();
    }

    /**
     * Validates the email address
     * @param email Email address string
     */
    isEmailValid(email: string) {
        return UrlHelper$v1.isEmailValid(email);
    }

    /**
     * Validates max email count
     * @param $event Input event
     */
    validateEmailInput($event: any): void {
        if ($event.target.value < 0) {
            $event.target.value = 0;
        }

        if ($event.target.value > 24) {
            $event.target.value = 24;
        }
    }

    /**
     * Validates thresholds input
     * @param $event Input event
     */
    validateThresholdInput($event: any): void {
        if ($event.target.value < 0) {
            $event.target.value = 0;
        }

        if ($event.target.value > 100) {
            $event.target.value = 100;
        }
    }
}
