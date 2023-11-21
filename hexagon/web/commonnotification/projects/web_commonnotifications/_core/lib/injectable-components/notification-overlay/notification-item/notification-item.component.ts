import { AfterViewInit, Component, ComponentRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService, MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import {
    AppNotification$v1,
    AppNotificationInjectionRequest$v1,
    AppNotificationInjectionResponse$v1,
    CommonMailboxService,
} from '@galileo/web_commonnotifications/_common';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { NotificationStoreService } from '../../../notification-store.service';

@Component({
    selector: 'hxgn-commonnotifications-item',
    templateUrl: 'notification-item.component.html',
    styleUrls: ['notification-item.component.scss']
})

export class NotificationItemComponent implements AfterViewInit, OnDestroy {

    /** Notifications to roll up into this item */
    @Input('appNotifications')
    set setAppNotifications(list: AppNotification$v1<string, string>[]) {

        /** Don't do anything if no changes have been made */
        if (this.appNotifications?.length === list?.length && this.appNotifications?.length) {
            return;
        }

        this.appNotifications = list;
        this.notificationList.next([].concat(list));

        // Make sure the core is loaded before the timer is started
        this.layoutAdapter.loadCapabilityCoreAsync(this.appNotifications[0].capabilityId).then(() => {
            if (this.isToast && this.appNotifications[this.appNotifications.length - 1].uiSettings.toastDuration !== -1) {
                this.listenForToastExpire();
            }
        });
    }

    /** Notifications to roll up into this item */
    appNotifications: AppNotification$v1<string, string>[];

    /** True if this is a toast notification item */
    @Input('isToast')
    set setIsToast(toast: boolean) {
        if (!toast && this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        this.isToast = toast;
    }

    /** True if this is a toast notification item */
    isToast = true;

    /** Id of context */
    @Input('contextId')
    set setContextId(id: string) {
        this.contextId.next(id);
    }

    /** Bus for context id */
    private contextId = new BehaviorSubject<string>(null);

    /** Stream for context id */
    private contextId$ = this.contextId.pipe(
        filter(data => !!data)
    );

    /** Event when the toast has expired */
    @Output() toastExpired = new EventEmitter<void>();

    /** Clear the notification */
    @Output() clear = new EventEmitter<string[]>();

    /** Timeout for toast clear */
    toastTimeout: any;

    /** Color of the notification */
    color$: Observable<string>;

    /** Title of the notification */
    title$: Observable<string>;

    /** Id of the div that capabilities add their item content to */
    itemContextId = 'app-notification-item_' + Guid.NewGuid();

    /** Id of the div that capabilities add their item content to */
    iconContextId = 'app-notification-icon_' + Guid.NewGuid();

    /** Notifications to send to the capability */
    private notificationList = new BehaviorSubject<AppNotification$v1<string, string>[]>([]);

    /** Ref to icon component */
    private iconComponentRef: ComponentRef<any>;

    /** Ref to item component */
    private itemComponentRef: ComponentRef<any>;

    constructor(private mailboxSrv: CommonMailboxService,
                private layoutAdapter: LayoutCompilerAdapterService,
                private notificationStore: NotificationStoreService) { }

    async ngAfterViewInit(): Promise<void> {
        let success: boolean;
        let retryCount = 0;
        do {
            await this.sleep(retryCount * 100);

            success = await this.createInjectionRequestAsync().then(() => {
                return true;
            }).catch(() => {
                return false;
            });

            retryCount += 1;
        } while (!success && retryCount < 8);
    }

    ngOnDestroy() {
        // Destroy injected component
        // Wait for animation before doing this
        setTimeout(() => {
            if (this.iconComponentRef) {
                this.iconComponentRef.destroy();
                this.iconComponentRef = null;
            }

            if (this.itemComponentRef) {
                this.itemComponentRef.destroy();
                this.itemComponentRef = null;
            }
        }, 700);

    }

    /**
     * Create a injection request for a notification
     */
    createInjectionRequestAsync(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            // Make sure core is loaded
            await this.mailboxSrv.mailbox$v1.isCapabilityReadyAsync(this.appNotifications[0].capabilityId);
            // Set up injection
            const data = new AppNotificationInjectionRequest$v1({
                capabilityId:  this.appNotifications[0].capabilityId,
                appNotifications: this.notificationList.asObservable(),
                iconContentId: this.iconContextId,
                itemContentId: this.itemContextId,
                contextId$: this.contextId$
            });

            const request = new MailBox<AppNotificationInjectionRequest$v1, AppNotificationInjectionResponse$v1>(data);

            request.response.pipe(first()).subscribe(async response => {
                    // Check for icon component Ref
                    if (!response.iconComponentRef || !response.itemComponentRef) {
                        // Make sure things are cleaned up
                        if (response.iconComponentRef) {
                            response.iconComponentRef.destroy();
                        }

                        if (response.itemComponentRef) {
                            response.itemComponentRef.destroy();
                        }

                        reject();
                    }

                    this.color$ = response.color$;
                    this.title$ = response.title$;
                    this.iconComponentRef = response.iconComponentRef;
                    this.itemComponentRef = response.itemComponentRef;

                    resolve();
            });

            // Wait for the next angular tick
            setTimeout(() => {
                this.mailboxSrv.mailbox$v1.notificationInjectionRequest$.next(request);
            });
        });
    }

    /**
     * Clear the notifications
     */
    clearNotifications(): void {
       this.clear.emit(this.appNotifications.map(n => n.systemCorrelationId));
    }

    /**
     * Toggles the notifications being flagged
     */
    flag(event: MouseEvent): void {
        event.stopPropagation();
        const isFlagged = !this.appNotifications[0].flagged;

        this.appNotifications.forEach(n => {
            n.flagged = isFlagged;

            this.notificationStore.upsert(n);
        });

        this.toastExpired.emit();
    }

    /**
     * Set up listener for when the toast notification expires
     */
    private listenForToastExpire(): void {
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        const timeoutTime = this.appNotifications[this.appNotifications.length - 1].uiSettings.toastDuration * 1000;

        this.toastTimeout = setTimeout(() => {
            this.toastExpired.emit();
        }, timeoutTime);
    }

    /**
     * Causes the current execution stack to wait for a set amount of time
     * @param time How long to sleep for
     */
    private sleep(time: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }
}
