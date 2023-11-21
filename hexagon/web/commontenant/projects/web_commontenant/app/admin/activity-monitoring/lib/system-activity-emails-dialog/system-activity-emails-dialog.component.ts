import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UrlHelper$v1 } from '@galileo/web_common-http';
import { ActivityNotificationSystemConfig$v1, CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';

import { SystemActivityEmailsDialogTranslationTokens } from './system-activity-emails-dialog.translation';

interface KeyValuePair {

    /** Key */
    key: string;

    /** Value */
    value: number;
}

@Component({
    templateUrl: 'system-activity-emails-dialog.component.html',
    styleUrls: ['system-activity-emails-dialog.component.scss']
})
export class SystemActivityEmailsDialogComponent implements OnInit {

    /** Tracks page (1-2). */
    activePage = 1;

    /** Tracks loading state. */
    isLoading = true;

    /** Tracks emails per day. */
    maxEmailsPerDay = 0;

    /** System config. */
    systemConfig: ActivityNotificationSystemConfig$v1 = new ActivityNotificationSystemConfig$v1();

    /** List of spike percentages */
    spikePercentages: KeyValuePair[] = [
        {
            key: '50%',
            value: 0.5
        },
        {
            key: '75%',
            value: 0.75
        },
        {
            key: '100%',
            value: 1.0
        },
        {
            key: '125%',
            value: 1.25
        },
        {
            key: '150%',
            value: 1.5
        }
    ];

    /** System thresholds. */
    thresholds = [0, 0];

    /** List of timeframes. */
    timeframes: KeyValuePair[] = [
        {
            key: SystemActivityEmailsDialogTranslationTokens.dailyAverage,
            value: 24
        },
        {
            key: SystemActivityEmailsDialogTranslationTokens.weeklyAverage,
            value: 168
        },
        {
            key: SystemActivityEmailsDialogTranslationTokens.monthlyAverage,
            value: 730
        }
    ];

    /** Expose translation tokens to html. */
    tokens: typeof SystemActivityEmailsDialogTranslationTokens = SystemActivityEmailsDialogTranslationTokens;

    constructor(
        private dialogRef: MatDialogRef<SystemActivityEmailsDialogComponent>,
        private identitySrv: CommonidentityAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit(): Promise<void> {
        this.systemConfig = await this.identitySrv.getSystemActivityNotificationsAsync();
        this.maxEmailsPerDay = Math.ceil(24 / this.systemConfig.defaultNotificationCooldownHours);
        this.systemConfig.defaultAnnualTenantThresholds.forEach((threshold: number, index: number) => {
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
     * Saves changes and closes dialog
     */
    async saveChangesAsync(): Promise<void> {
        this.isLoading = true;
        this.systemConfig.defaultNotificationCooldownHours = 24 / this.maxEmailsPerDay;
        this.systemConfig.defaultSalesContact.cooldownHours = 24 / this.maxEmailsPerDay;
        this.systemConfig.defaultSalesContact.isBurstEnabled = false;
        this.thresholds.forEach((threshold: number, index: number) => {
            this.systemConfig.defaultAnnualTenantThresholds[index] = threshold / 100;
        });

        this.systemConfig = await this.identitySrv.setSystemActivityNotificationsAsync(this.systemConfig);
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
