import { Injectable } from '@angular/core';
import {
    Alarm$v1,
    AlarmChangeNotification$v1,
    AlarmChangeNotificationReason$v1,
    capabilityId,
} from '@galileo/web_alarms/_common';
import {
    CommonHttpClient,
    CommonHubManagerService,
    CommonNotificationHubService$v2,
    CommonWindowCommunicationService,
} from '@galileo/web_common-http';
import { CommonLoggingAdapterService$v1, PerformanceLogType } from '@galileo/web_commonlogging/adapter';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

/***
 * The notification hub service handles notification processing from signalR or the window service.
 */
@Injectable()
export class NotificationService extends CommonNotificationHubService$v2 {

    /** Bus for connection established event */
    private connectionEstablished: BehaviorSubject<boolean>;

    /** Bus for connection closed event */
    private connectionClosed: Subject<void>;

    /** Bus for alarm delete notifications */
    private deleted: Subject<AlarmChangeNotification$v1>;

    /** Bus for alarm create notifications */
    private created: Subject<AlarmChangeNotification$v1>;

    /** Bus for alarm updated notifications */
    private updated: Subject<AlarmChangeNotification$v1>;

    /** Event that is raised when the notification connection is established */
    connectionEstablished$: Observable<boolean>;

    /** Event that is raised when the notification connection is closed */
    connectionClosed$: Observable<void>;

    /** Event that an alarm has been deleted */
    deleted$: Observable<AlarmChangeNotification$v1>;

    /** Event that an alarm has been created */
    created$: Observable<AlarmChangeNotification$v1>;

    /** Event that an alarm has been updated */
    updated$: Observable<AlarmChangeNotification$v1>;

    /** Holds notifications that comes in while the initial data load is going on. */
    private notificationQueue: AlarmChangeNotification$v1[];

    constructor(private commonWindowCommSrv: CommonWindowCommunicationService,
                private httpClient: CommonHttpClient,
                private commonManager: CommonHubManagerService,
                private loggingAdapter: CommonLoggingAdapterService$v1) {
            super('api/alarms/hub/changeNotification/v1',
                true, capabilityId, commonWindowCommSrv, httpClient, commonManager);
        }

    /** On Hub init life cycle hook */
    onHubInit() {
        this.connectionEstablished = new BehaviorSubject(false);
        this.connectionClosed = new Subject<void>();
        this.deleted = new Subject<AlarmChangeNotification$v1>();
        this.created = new Subject<AlarmChangeNotification$v1>();
        this.updated = new Subject<AlarmChangeNotification$v1>();

        this.connectionEstablished$ = this.connectionEstablished.asObservable();
        this.connectionClosed$ = this.connectionClosed.asObservable();
        this.deleted$ = this.deleted.asObservable();
        this.created$ = this.created.asObservable();
        this.updated$ = this.updated.asObservable();

        this.notificationQueue = [];
    }

    /**
     * Returns list of event names to listen on
     */
    eventNames(): string[] {
        return ['changeNotification'];
    }

    /**
     * Method that is called when an notification event is raised
     * @param eventName Name of event that was raised
     * @param notification Alarm change notification object
     */
    onEvent(eventName: string, notification: AlarmChangeNotification$v1) {
        if (eventName === 'changeNotification') {
            switch (notification.reason) {
                case AlarmChangeNotificationReason$v1.created:
                    this.loggingAdapter.performance(notification.id, capabilityId,
                        PerformanceLogType.signalRCreate, notification);
                    this.created.next(notification);
                    break;
                case AlarmChangeNotificationReason$v1.deleted:
                    this.loggingAdapter.performance(notification.id, capabilityId,
                        PerformanceLogType.signalRDelete, notification);
                    this.deleted.next(notification);
                    break;
                case AlarmChangeNotificationReason$v1.title:
                case AlarmChangeNotificationReason$v1.reportedTime:
                case AlarmChangeNotificationReason$v1.remark:
                case AlarmChangeNotificationReason$v1.property:
                case AlarmChangeNotificationReason$v1.priority:
                case AlarmChangeNotificationReason$v1.location:
                case AlarmChangeNotificationReason$v1.keyword:
                case AlarmChangeNotificationReason$v1.isManaged:
                case AlarmChangeNotificationReason$v1.attachment:
                case AlarmChangeNotificationReason$v1.industry:
                case AlarmChangeNotificationReason$v1.type:
                case AlarmChangeNotificationReason$v1.primaryContact:
                case AlarmChangeNotificationReason$v1.hyperlink:
                    this.loggingAdapter.performance(notification.id, capabilityId,
                        PerformanceLogType.signalRUpdate, notification);
                    this.updated.next(notification);
                    break;
                case AlarmChangeNotificationReason$v1.unknown:
                default:
                    console.error('Unknown alarms change notification', notification);
            }

        } else {
            console.error('Unknown alarms change notification', eventName, notification);
        }
    }

    /**
     * Connection established event
     */
    onConnectionEstablished() {
        this.connectionEstablished.next(true);
    }

    /**
     * Connection closed event
     */
    onConnectionClosed() {
        this.connectionClosed.next();
    }

    /**
     * Adds a notification to the notification queue
     * @param notification The notification to add to the queue
     */
    addToNotificationQueue(notification: AlarmChangeNotification$v1) {
        // Short circuit if the queue is empty
        if (!this.notificationQueue.length) {
            this.notificationQueue.push(notification);
            return;
        }

        // Check if there is a delete if there is throw out update
        const deleteNotification = this.notificationQueue
            .find(item => item.id === notification.id && item.reason === AlarmChangeNotificationReason$v1.deleted);

        if (deleteNotification) {
            return;
        }

        // If notifications is deleted purge all other notifications for this id
        if (notification.reason === AlarmChangeNotificationReason$v1.deleted) {
            this.notificationQueue = this.notificationQueue.filter(item => item.id !== notification.id);
        }

        // Make sure there that dup notifications are only added once
        const foundMatch = this.notificationQueue.find(item => item.id === notification.id && item.reason === notification.reason);
        if (foundMatch) {
            return;
        }

        const foundNotificationCreateIndex = this.notificationQueue.findIndex(item => item.id === notification.id);
        if (foundNotificationCreateIndex !== -1) {
            // Remove create
            this.notificationQueue.splice(foundNotificationCreateIndex, 1);
        }

        // Add to the queue
        this.notificationQueue.push(notification);
    }

    /**
     * Filters out dup notification for a single alarm.
     * Checks to make sure the notification type has not changed.
     * If an add notification comes in but it exists to the list then it should be changed to an update.
     * @param alarmList List of alarms to apply the notification queue to
     */
    processNotificationQueue(alarmList: Alarm$v1[]) {

        while (this.notificationQueue.length) {
            const notification: AlarmChangeNotification$v1 = this.notificationQueue.shift();

            // Make sure the create is still needed
            if (notification.reason === AlarmChangeNotificationReason$v1.created &&
                alarmList.find(item => item.id === notification.id)) {
                // This alarm is already in the list so we already have the newest data
                continue;
            }

            // Fire the event
            switch (notification.reason) {
                case AlarmChangeNotificationReason$v1.created:
                    this.created.next(notification);
                    break;
                case AlarmChangeNotificationReason$v1.deleted:
                    this.deleted.next(notification);
                    break;
                default:
                    this.updated.next(notification);
            }
        }
    }

}
