import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppNotification$v1 } from '@galileo/web_commonnotifications/_common';

import { ToastNotificationPaneTranslationTokens } from './toast-notification-pane.translation';

@Component({
    selector: 'hxgn-commonnotifications-toast-pane',
    templateUrl: 'toast-notification-pane.component.html',
    styleUrls: ['toast-notification-pane.component.scss'],
    animations: [
        trigger('slideOut', [
            transition(':leave', [
                animate('600ms ease-out', style({transform: 'translateX(100%)'}))
            ])
        ])
    ]
})
export class ToastNotificationPaneComponent {

    /** List of notification groups to show */
    @Input() appNotificationGroups: AppNotification$v1<string, string>[][] = [];

    /** The max number of notifications to show on screen */
    @Input() maxItemCount = 4;

    /** Id of context */
    @Input() contextId: string;

    /** Event that the notification has been updated */
    @Output() notificationsUpdated = new EventEmitter<AppNotification$v1<string, string>[]>();

    /** Event that a notification has been cleared */
    @Output() clear = new EventEmitter<string[]>();

    /** Event that the full notification pane should be shown */
    @Output() showFullPane = new EventEmitter<void>();

    /** Expose ToastNotificationPaneTranslationTokens to HTML */
    tokens: typeof ToastNotificationPaneTranslationTokens = ToastNotificationPaneTranslationTokens;

    constructor() { }

    /**
     * Track by function
     * @param index Index
     * @param n App Notification
     */
    trackByFn(index, n) {
        return n[0].groupId;
    }

    /**
     * The given app notification toast has expired
     * @param appNotification App notification object
     */
    expire(notifications: AppNotification$v1<string, string>[]) {
        const updateList = notifications.map(n => {
            const update = new AppNotification$v1<string, string>(n);
            update.toastDisplayed = true;
            return update;
        });

        this.notificationsUpdated.emit(updateList);
    }

    /**
     * Clears a notification
     * @param ids Notification id
     */
    clearNotification(ids: string[]): void {
        this.clear.emit(ids);
    }
}
