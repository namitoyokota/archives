import { Injectable } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import {
    AppNotification$v1,
    capabilityId,
    CommonMailboxService,
    NotificationSettings$v1,
} from '@galileo/web_commonnotifications/_common';

import { DataService } from './data.service';
import { EventService } from './event.service';
import { NotificationStoreService } from './notification-store.service';
import { NotificationService } from './notification.service';
import { SettingsStoreService } from './settings-store.service';


@Injectable({
    providedIn: 'root'
})
/**
 * The core service is the place where you tie all your other service
 * together. It should not be provided to any component or service. This
 * is where you will set up the listeners to the common mailbox, and
 * set up converting notifications into events.
 */
export class CoreService {

    constructor(
        private mailbox: CommonMailboxService,
        private dataSrv: DataService,
        private eventSrv: EventService,
        private notificationSrv: NotificationService,
        private storeSrv: NotificationStoreService,
        private layoutAdapter: LayoutCompilerAdapterService,
        private settingsStoreSrv: SettingsStoreService
    ) {
        this.initListeners();
        this.initPostOffice();
        this.initSettingsStore();
    }

    /**
     * Listen for notifications and trigger events off of them
     */
    private initListeners(): void {
        this.listenNewAppNotification();

        this.layoutAdapter.coreIsLoadedAsync(capabilityId);
    }

    /**
     * Listen to all messages in the mailbox service
     */
    private initPostOffice(): void {
        this.mailbox.mailbox$v1.coreIsLoaded$.next(true);
        this.listenClearNotification();
    }

    private initSettingsStore(): void {
        this.settingsStoreSrv.clear();
        this.dataSrv.setting.get$().subscribe((settings: NotificationSettings$v1[]) => {
            this.settingsStoreSrv.upsert(settings);
        }, (err) => {
            console.error('HxgnConnect:: CommonNotifications: An unexpected error occurred getting notification settings', err);
        });
    }

    /**
     * Listen to the new app notification event
     */
    private listenNewAppNotification() {
        this.notificationSrv.notification$.subscribe(async (notification: AppNotification$v1<string, string>) => {
            // Make sure the core is loaded
            await this.layoutAdapter.loadCapabilityCoreAsync(notification.capabilityId);

            // Make sure notification is valid before adding it to the store
            const isValid = await this.mailbox.mailbox$v1.isNotificationValidAsync(notification);
            if (isValid) {
                this.storeSrv.upsert(notification);

                if (notification.uiSettings.audio && notification.uiSettings.audioFile && this.settingsStoreSrv.enableSound) {
                    this.eventSrv.playSound(notification.uiSettings.audioFile);
                }
            }

        });
    }

    /**
     * Listen to the clear notification event
     */
    private listenClearNotification() {
        this.mailbox.mailbox$v1.clearNotificationRequest$.subscribe(id => {
            this.storeSrv.remove(id);
        });
    }
}
