import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AppNotification$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_commonnotifications/_common';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { EventService } from '../../event.service';
import { NotificationStoreService } from '../../notification-store.service';
import { SettingsStoreService } from '../../settings-store.service';
import { slideInOut } from '../../shared/slide-in-out';

@Component({
    templateUrl: 'notification-overlay.component.html',
    styleUrls: ['notification-overlay.component.scss'],
    animations: [slideInOut]
})

export class NotificationOverlayComponent implements OnInit, OnDestroy {

    /** Flag that is true if the full notification panel should be shown */
    showNotificationPanel$ = this.eventSrv.panelShown$;

    /** List of all active notifications in the system */
    notifications$ = this.storeSrv.entity$;

    /** List of notifications to show in the toast notification pane */
    toastNotifications$ = this.storeSrv.entity$.pipe(
        map(notifications => {
            const showList = notifications.filter(n => {
                return !n.toastDisplayed && !n.hasBeenSeen;
            });

            // If nothing in show list return empty array
            if (!showList?.length) {
                return [];
            }

            // Group by capability id and type/ subtype
            const group = new Map<string, AppNotification$v1<string, string>[]>();

            for (const n of showList) {
                let groupList = group.get(n.groupId);

                if (groupList?.length) {
                    // Add to group
                    groupList = groupList.concat(n);
                } else {
                    // Create new group
                    groupList = [n];
                }

                group.set(n.groupId, groupList);
            }

            return Array.from(group, ([key, value]) => value);
        })
    );

    /** The max number of notifications to show */
    maxCount$: Observable<number> = this.settingsStore.defaultSettings$.pipe(
        map(settings => {
            return settings?.maxToDisplay ? settings?.maxToDisplay : 4;
        })
    );

    /**  Observable for component destroyed. Used to clean up subscriptions. */
    private destroy$ = new Subject<boolean>();

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public contextId$: Observable<string>,
        private eventSrv: EventService,
        private storeSrv: NotificationStoreService,
        private settingsStore: SettingsStoreService
    ) { }

    ngOnInit() {
        this.listenToPlaySound();
    }

    /**
     * On destroy life cycle hook
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Updates the notification
     * @param appNotification The updated notification
     */
    update(appNotification: AppNotification$v1<string, string> | AppNotification$v1<string, string>[]): void {
        let updates: AppNotification$v1<string, string>[] = [];
        if (Array.isArray(appNotification)) {
            updates = appNotification;
        } else {
            updates = [appNotification];
        }

        updates.forEach(n => {
            this.storeSrv.upsert(n);
        });
    }

    /**
     * Remove the notification from the store
     * @param ids app notification id
     */
    clear(ids: string | string[]) {
        let clearIds: string[] = [];
        if (Array.isArray(ids)) {
            clearIds = ids;
        } else {
            clearIds = [ids];
        }

        clearIds.forEach(id => {
            this.storeSrv.remove(id);
        });
    }


    /**
     * Listen to the play sound event. When the event is fired a notification sound will be played.
     */
    listenToPlaySound(): void {
        this.eventSrv.playNotificationSound$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((file) => {
            this.playSound(file);
        });
    }

    /**
     * Show the notification pane
     */
    showNotificationPane(): void {
        this.eventSrv.showPanel(true);
    }

    /**
     * Play the notification sound
     */
    private playSound(file: string) {
        const audio = new Audio('assets/commonnotifications-core/audio/' + file);
        audio.play();
    }
}
