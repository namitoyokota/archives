import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { AppNotificationInjectionRequest$v1 } from '../abstractions/app-notification-injection-request.v1';
import { AppNotificationInjectionResponse$v1 } from '../abstractions/app-notification-injection-response.v1';
import { AppNotification$v1 } from '@galileo/platform_commonnotifications';

/**
 * Version 1 of the methods used by the adapter and the core to communicate.
 */
export class Mailbox$v1 {

    /** Flag that is true when the core is loaded */
    coreIsLoaded$ = new BehaviorSubject<boolean>(false);

    /** Bus for notification injection request */
    notificationInjectionRequest$ = new Subject<MailBox<AppNotificationInjectionRequest$v1, AppNotificationInjectionResponse$v1>>();

    /** List of capabilities that is ready  */
    capabilityReady$ = new BehaviorSubject<string[]>([]);

    /** Bus for clearing a notification */
    clearNotificationRequest$ = new Subject<string>();

    /** Bus for asking notification service if a notification is valid */
    isNotificationValid$ = new Subject<MailBox<AppNotification$v1<any, any>, boolean>>();

    /** Sets a capability as being ready */
    setCapabilityReady(id: string) {
        this.capabilityReady$.next(this.capabilityReady$.getValue().concat(id));
    }

    /**
     * Method that is fired when a given capability is ready
     * @param id Capability id
     */
    isCapabilityReadyAsync(capabilityId: string): Promise<boolean> {
        return this.capabilityReady$.pipe(
            map(ids => !!ids.find(id => id === capabilityId)),
            filter(isReady => isReady),
            first()
        ).toPromise();
    }

    /**
     * Returns true if the notification is valid
     * @param notification Notification to check
     */
    isNotificationValidAsync(notification: AppNotification$v1<any, any>): Promise<boolean> {

        return new Promise<boolean>((async resolve => {
            // Wait for the capability to be ready
            await this.isCapabilityReadyAsync(notification.capabilityId);

            const request = new MailBox<AppNotification$v1<any, any>, boolean>(notification);

            request.response.pipe(first()).subscribe(isValid => {
                resolve(isValid);
            });

            this.isNotificationValid$.next(request);

        }));
    }
}
