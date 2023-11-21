import { Injectable } from '@angular/core';
import {
    CommonHttpClient,
    CommonHubManagerService,
    CommonNotificationHubService$v2,
    CommonWindowCommunicationService,
} from '@galileo/web_common-http';
import { capabilityId, PipelineChangeNotifications$v1, PipelineChangeReason$v1 } from '@galileo/web_commonrecovery/_common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class NotificationService extends CommonNotificationHubService$v2 {

    /** Bus for connection established event */
    private connectionEstablishedSub: BehaviorSubject<boolean>;

    /** Bus for connection closed event */
    private connectionClosedSub = new Subject<void>();

    /** Event that is raised when the notification connection is established */
    connectionEstablished$: Observable<boolean>;

    /** Bus for updated notification. This is for sharing capability map notification. */
    private updatedSub: Subject<PipelineChangeNotifications$v1>;

    /** Event that is raised for an update. This is for sharing capability map notification. */
    updated$: Observable<PipelineChangeNotifications$v1>;

    /**
     * Event that is raised when the notification connection is closed
     */
    connectionClosed$: Observable<void> = this.connectionClosedSub.asObservable();

    constructor(
        private commonWindowCommSrv: CommonWindowCommunicationService,
        // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
        private _httpSrv: CommonHttpClient,
        private commonManager: CommonHubManagerService
    ) {
        super('api/commonRecovery/hub/changeNotification/v1',
            false, capabilityId, commonWindowCommSrv, _httpSrv, commonManager, true);
    }

    /** On Hub init life cycle hook */
    onHubInit() {
        this.connectionEstablishedSub = new BehaviorSubject(false);
        this.connectionClosedSub = new Subject<void>();
        this.updatedSub = new Subject<PipelineChangeNotifications$v1>();
        this.connectionEstablished$ = this.connectionEstablishedSub.asObservable();
        this.connectionClosed$ = this.connectionClosedSub.asObservable();
        this.updated$ = this.updatedSub.asObservable();
    }

    /** Notification event names */
    eventNames(): string[] {
        return ['changeNotification'];
    }

    /**
     * Process when an event happens
     */
    onEvent(eventName: string, notification: PipelineChangeNotifications$v1) {
        console.info(notification);

        if (eventName === 'changeNotification') {
            switch (notification.reason) {
                case PipelineChangeReason$v1.BackupStarted:
                case PipelineChangeReason$v1.BackupComplete:
                case PipelineChangeReason$v1.BackupCompleteWithErrors:
                case PipelineChangeReason$v1.RestoreStarted:
                case PipelineChangeReason$v1.RestoreComplete:
                case PipelineChangeReason$v1.RestoreCompleteWithErrors:
                case PipelineChangeReason$v1.DeleteStarted:
                case PipelineChangeReason$v1.DeleteComplete:
                case PipelineChangeReason$v1.GeneratingDownload:
                case PipelineChangeReason$v1.DownloadReady:
                case PipelineChangeReason$v1.DownloadFailed:
                case PipelineChangeReason$v1.DeleteBackupStarted:
                case PipelineChangeReason$v1.DeleteBackupComplete:
                case PipelineChangeReason$v1.PipelineFailure:
                case PipelineChangeReason$v1.PipelineCancelled:
                case PipelineChangeReason$v1.PipelineNotFoundFailure:
                case PipelineChangeReason$v1.PipelineUpdated:
                    this.updatedSub.next(notification);
                    break;
                case PipelineChangeReason$v1.Unknown:
                default:
                    console.error('Unknown change notification', notification);
            }
        } else {
            console.error('Unknown change notification', eventName, notification);
        }
    }

    /**
     * Process connection established
     */
    onConnectionEstablished() {
        this.connectionEstablishedSub.next(true);
    }

    /**
     * Process connection closed
     */
    onConnectionClosed() {
        this.connectionClosedSub.next();
    }

    /**
     * Emit a updated notification
     * @param notification Incident change notification object
     */
    updated(notification: PipelineChangeNotifications$v1) {
        this.updatedSub.next(notification);
    }
}
