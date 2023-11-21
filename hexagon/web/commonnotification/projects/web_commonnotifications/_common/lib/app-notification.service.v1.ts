import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppNotificationInjectionResponse$v1 } from './abstractions/app-notification-injection-response.v1';
import { AppNotification$v1 } from '@galileo/platform_commonnotifications';
import { CommonMailboxService } from './common.mailbox';

@Injectable()
export abstract class AppNotificationService$v1 {

    private appNotificationMailbox: CommonMailboxService;

    constructor(private injector: Injector) {
        this.appNotificationMailbox = injector.get(CommonMailboxService);

        this.listenToIsValidCheck();
        this.listenToInjectionRequest();
        this.isReady();
    }

    /**
     * Returns the color the notification bar should be.
     * Color must be hex value;
     * @param notifications Stream of app notifications
     */
    abstract getNotificationColorAsync(notifications$: Observable<AppNotification$v1<any, any>[]>): Promise<Observable<string>>;

    /**
     * Returns the text for the notification
     * @param notifications Stream of app notifications
     */
    abstract getNotificationTitleAsync(notifications$: Observable<AppNotification$v1<any, any>[]>): Promise<Observable<string>>;

    /**
     * Inject the notification icon component
     * @param notifications Stream of app notifications
     * @param id Id of the div the component will be injected into
     */
    abstract injectIconAsync(notifications$: Observable<AppNotification$v1<any, any>[]>, id: string): Promise<ComponentRef<any>>;

    /**
     * Inject the notification item component
     * @param notifications Stream of app notifications
     * @param id Id of the div the component will be injected into
     * @param contextId Stream for context id
     */
    abstract injectItemAsync(notifications$: Observable<AppNotification$v1<any, any>[]>, id: string,
                             contextId$: Observable<string>): Promise<ComponentRef<any>>;

    /**
     * Returns the capability id
     */
    abstract getCapabilityId(): string;

    /**
     * Clears a notification by a given id
     * @param id Notification id
     */
    clearNotification(id: string): void {
        this.appNotificationMailbox.mailbox$v1.clearNotificationRequest$.next(id);
    }

    /**
     * Returns true if the notification is valid. Optional for capabilities that need to
     * be able to set this.
     * @param appNotification The notification to check
     */
    isNotificationValidAsync(appNotification: AppNotification$v1<any, any>): Promise<boolean> {
        return new Promise<boolean>(resolve => resolve(true));
    }

    /**
     * Listen to a request to inject a notification
     */
    private listenToInjectionRequest() {
        // Wire up to injection request

        this.appNotificationMailbox.mailbox$v1.notificationInjectionRequest$.pipe(
            filter(mailbox => {
                // Filter on capability id
                return mailbox.payload.capabilityId === this.getCapabilityId();
            })
        ).subscribe(async mailbox => {
            const request = mailbox.payload;
            Promise.all([
                this.getNotificationColorAsync(request.appNotifications),
                this.getNotificationTitleAsync(request.appNotifications),
                this.injectIconAsync(request.appNotifications, request.iconContentId),
                this.injectItemAsync(request.appNotifications, request.itemContentId, request.contextId$)
            ]).then(([color$, title$, iconComponentRef, itemComponentRef]) => {
                mailbox.response.next(new AppNotificationInjectionResponse$v1({
                    color$, title$, iconComponentRef, itemComponentRef
                }));
            });
        });
    }

    /**
     * Listen to is valid check request
     */
    private listenToIsValidCheck() {
        this.appNotificationMailbox.mailbox$v1.isNotificationValid$.pipe(
            filter(mailbox => {
                // Filter on capability id
                return mailbox.payload.capabilityId === this.getCapabilityId();
            })
        ).subscribe(async mailbox => {
            mailbox.response.next(await this.isNotificationValidAsync(mailbox.payload));
        });
    }

    /**
     * Let notifications know this notification service is ready to start processing
     */
    private isReady(): void {
        // Send message to channel core about being ready
        this.appNotificationMailbox.mailbox$v1.setCapabilityReady(
            this.getCapabilityId()
        );
    }

}
