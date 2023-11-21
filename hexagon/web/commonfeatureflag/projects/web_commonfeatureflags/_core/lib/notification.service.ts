import { Injectable } from '@angular/core';
import {
    CommonHttpClient,
    CommonHubManagerService,
    CommonNotificationHubService$v2,
    CommonWindowCommunicationService,
} from '@galileo/web_common-http';
import { capabilityId, ChangeNotification$v1, ChangeNotificationReason$v1 } from '@galileo/web_commonfeatureflags/_common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export class FeatureFlagChangeNotification$v1 extends ChangeNotification$v1 {

    /** Id of the group the notification is for */
    groupId?: string;

    constructor(params: FeatureFlagChangeNotification$v1 = {} as FeatureFlagChangeNotification$v1) {
        super(params);

        const {
            groupId = null
        } = params;

        this.groupId = groupId;
    }
}

/***
 * The notification hub service handles notification processing from signalR or the window service.
 */
@Injectable()
export class NotificationService extends CommonNotificationHubService$v2 {

    /** Bus for connection established event */
    private connectionEstablishedSub = new BehaviorSubject(false);

    /** Bus for connection closed event */
    private connectionClosedSub = new Subject<void>();

    /**
     * Event that is raised when the notification connection is established
     */
    readonly connectionEstablished$ = this.connectionEstablishedSub.asObservable();

    /** Bus for updated notification */
    private updatedSub: Subject<FeatureFlagChangeNotification$v1>;

    /** Event that is raised for an update */
    updated$: Observable<FeatureFlagChangeNotification$v1>;

    /**
     * Event that is raised when the notification connection is closed
     */
    connectionClosed$: Observable<void> = this.connectionClosedSub.asObservable();

    constructor(private commonWindowCommSrv: CommonWindowCommunicationService,
        // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
        private _httpSrv: CommonHttpClient,
        private commonManager: CommonHubManagerService) {
        super('api/commonFeatureFlags/hub/changeNotification/v1',
            false, capabilityId, commonWindowCommSrv, _httpSrv, commonManager);
    }

    /** On Hub init life cycle hook */
    onHubInit() {
        this.updatedSub = new Subject<FeatureFlagChangeNotification$v1>();
        this.updated$ = this.updatedSub.asObservable();
    }

    eventNames(): string[] {
        return ['changeNotification'];
    }

    onEvent(eventName: string, notification: FeatureFlagChangeNotification$v1) {
        if (eventName === 'changeNotification') {
            switch (notification.reason) {
                case ChangeNotificationReason$v1.updated:
                    this.updatedSub.next(notification);
                    break;
                default:
                    console.error('Unknown change notification', notification);
            }
        } else {
            console.error('Unknown change notification', eventName, notification);
        }
    }

    onConnectionEstablished() {
        this.connectionEstablishedSub.next(true);
    }

    onConnectionClosed() {
        this.connectionClosedSub.next();
    }

}
