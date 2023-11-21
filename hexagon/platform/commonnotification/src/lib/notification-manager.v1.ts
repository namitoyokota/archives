import {
    HubManager$v1,
    NotificationHub$v1,
    TokenManager$v1,
    UrlHelper$v1,
    WindowCommunication$v1
} from '@galileo/platform_common-http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { AppNotification$v1 } from './abstractions/app-notification.v1';

const apiUrl = 'api/commonNotifications/hub/changeNotification/v1';
const capabilityId = '@hxgn/commonnotifications';

/***
 * The notification manager which handles notification processing from signalR or the window service
 */
export class NotificationManager$v1 extends NotificationHub$v1<AppNotification$v1<string, string>> {
    /** Bus for connection established event */
    private connectionEstablishedSub = new BehaviorSubject(false);

    /** Bus for connection closed event */
    private connectionClosedSub = new Subject<void>();

    /** Event that is raised when the notification connection is established */
    readonly connectionEstablished$ = this.connectionEstablishedSub.asObservable();

    /** Bus for notification messages */
    notification: Subject<AppNotification$v1<string, string>>;

    /** Event that is raised when a notification is received */
    notification$: Observable<AppNotification$v1<string, string>>;

    /** Event that is raised when the notification connection is closed */
    connectionClosed$: Observable<void> = this.connectionClosedSub.asObservable();

    constructor(
        tokenManager: TokenManager$v1,
        baseUrl: string = null,
        windowComm: WindowCommunication$v1 = null,
        manager: HubManager$v1 = null
    ) {
        super(
            baseUrl ? `${baseUrl}${apiUrl}` : UrlHelper$v1.mapUrl(apiUrl),
            tokenManager,
            capabilityId,
            windowComm,
            manager
        );

        this.initHub();
        this.hubEventsReady();
    }

    /** Initialize notification */
    initHub() {
        this.notification = new Subject<AppNotification$v1<string, string>>();
        this.notification$ = this.notification.asObservable();
    }

    /** Notification event names */
    eventNames(): string[] {
        return ['changeNotification'];
    }

    /** Triggered on event */
    onEvent(eventName: string, notification: AppNotification$v1<string, string>) {
        if (eventName === 'changeNotification') {
            this.notification.next(new AppNotification$v1<string, string>(notification));
        } else {
            console.error('Unknown app notification event');
        }
    }
}
