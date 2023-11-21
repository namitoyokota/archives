export enum TranslationTokens {
    download = 'commonrecovery-common.operations.download',
    restore = 'commonrecovery-common.operations.restore',
    delete = 'commonrecovery-common.operations.delete',
    requestDownload = 'commonrecovery-common.operations.requestDownload',
    backup = 'commonrecovery-common.operations.backup',
    running = 'commonrecovery-common.statuses.running',
    complete = 'commonrecovery-common.statuses.complete',
    canceled = 'commonrecovery-common.statuses.canceled',
    failed = 'commonrecovery-common.statuses.failed',
    notFound = 'commonrecovery-common.statuses.notFound',
    completeWithErrors = 'commonrecovery-common.statuses.completeWithErrors',
    generatingDownload = 'commonrecovery-common.statuses.generatingDownload',
    organization = 'commonrecovery-common.component.organization',
    operation = 'commonrecovery-common.component.operation',
    status = 'commonrecovery-common.component.status',
    date = 'commonrecovery-common.component.dateTime',
    duration = 'commonrecovery-common.component.duration',
    days = 'commonrecovery-common.component.days',
    day = 'commonrecovery-common.component.day',
    hours = 'commonrecovery-common.component.hours',
    hour = 'commonrecovery-common.component.hour',
    minutes = 'commonrecovery-common.component.minutes',
    minute = 'commonrecovery-common.component.minute',
    seconds = 'commonrecovery-common.component.seconds',
    second = 'commonrecovery-common.component.second',
    deleteBackup = 'commonrecovery-common.component.deleteBackup',
    deleteWarningMsg = 'commonrecovery-common.component.deleteWarningMsg',
    cannotDelete = 'commonrecovery-common.component.cannotDeleteMsg'
}

/* eslint-disable */
export interface TranslatedTokens {
    days: string;
    day: string;
    hours: string;
    hour: string;
    minutes: string;
    minute: string;
    seconds: string;
    second: string;
    deleteBackup: string;
    deleteWarningMsg: string;
    cannotDelete: string;
    backup: string;
    requestDownload: string;
    delete: string;
    restore: string;
    download: string;
}
