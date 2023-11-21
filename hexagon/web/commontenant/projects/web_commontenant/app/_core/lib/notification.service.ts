import { Injectable } from '@angular/core';
import {
    CommonHttpClient,
    CommonHubManagerService,
    CommonNotificationHubService$v2,
    CommonWindowCommunicationService,
} from '@galileo/web_common-http';
import {
    TenantChangeNotification$v1 as ChangeNotification$v1,
    TenantChangeNotificationReason$v1 as ChangeReason$v1
} from '@galileo/web_commontenant/_common';
import { capabilityId } from '@galileo/web_commontenant/_common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

enum EventName {
    changeNotification = 'changeNotification',
    sharingCriteriaNotification = 'sharingCriteriaNotification',
    sharingCapabilityMapNotification = 'sharingCapabilityMapNotification'
}

@Injectable({ providedIn: 'root' })
export class NotificationService extends CommonNotificationHubService$v2 {

    /** Bus for connection established event */
    private connectionEstablishedSub = new BehaviorSubject(false);

    /** Bus for connection closed event */
    private connectionClosedSub = new Subject<void>();

    /** Event that is raised when the notification connection is established */
    readonly connectionEstablished$ = this.connectionEstablishedSub.asObservable();

    /** Bus for updated notification. This is for sharing capability map notification. */
    private updatedSub: Subject<ChangeNotification$v1>;

    /** Event that is raised for an update. This is for sharing capability map notification. */
    updated$: Observable<ChangeNotification$v1>;

    /** Event that is raised when the notification connection is closed */
    connectionClosed$: Observable<void> = this.connectionClosedSub.asObservable();

    constructor(
        private commonWindowCommSrv: CommonWindowCommunicationService,
        // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
        private _httpSrv: CommonHttpClient,
        private commonManager: CommonHubManagerService
    ) {
        super('api/commonTenants/hub/changeNotification/v1',
            false, capabilityId, commonWindowCommSrv, _httpSrv, commonManager);
    }

    /** On Hub init life cycle hook */
    onHubInit() {
        this.updatedSub = new Subject<ChangeNotification$v1>();
        this.updated$ = this.updatedSub.asObservable();
    }

    /**
     * Returns a list of event names to care about
     * @returns List of names to care about
     */
    eventNames(): string[] {
        return [
            EventName.sharingCapabilityMapNotification,
            EventName.sharingCriteriaNotification,
            EventName.changeNotification
        ];
    }

    /**
     * Process when an event happens
     */
    onEvent(eventName: string, notification: ChangeNotification$v1) {
        const eventExists = this.eventNames().includes(eventName);
        if (eventExists) {
            switch (notification.reason) {
                case ChangeReason$v1.updated:
                case ChangeReason$v1.created:
                case ChangeReason$v1.deleted:
                case ChangeReason$v1.enableJargon:
                case ChangeReason$v1.configuredDataSharingType:
                    // Let UI know about the change
                    this.updatedSub.next(notification);
                    break;
                default:
                    console.warn('Unknown change notification', notification);
            }
        } else {
            console.warn('Unknown change notification', eventName, notification);
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
}
