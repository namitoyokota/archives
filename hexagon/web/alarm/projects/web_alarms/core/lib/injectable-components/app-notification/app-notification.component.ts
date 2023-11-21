import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { Asset$v1, AssetsAdapterService$v1 } from '@galileo/web_assets/adapter';
import { Guid, StoreService } from '@galileo/web_common-libraries';
import { AlarmWithAssetAdapterService$v1, AlarmWithDeviceAdapterService$v1 } from '@galileo/web_commonassociation/adapter';
import { CommontenantAdapterService$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { Device$v1, DevicesAdapterService$v1 } from '@galileo/web_devices/adapter';
import { combineLatest, from, Observable, Subscription } from 'rxjs';
import { filter, first, map, mergeMap } from 'rxjs/operators';

import { ActionStoreService } from '../../action-store.service';
import { AppNotificationSubtype, AppNotificationType } from '../../app-notification.service';
import { TombstonedService } from '../../tombstoned.service';
import { AppNotificationSettings } from './app-notification-settings';
import { AppNotificationTranslationTokens } from './app-notification.translation';

@Component({
    templateUrl: 'app-notification.component.html',
    styleUrls: ['app-notification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppNotificationComponent implements OnInit, OnDestroy {

    /** Stream of alarm ids */
    alarmIds$: Observable<string[]>;

    /** Stream of alarms to display data for */
    alarms$: Observable<Alarm$v1[]>;

    /** The main notification type */
    notificationType: AppNotificationType;

    /** The main notification subtype */
    notificationSubtype: AppNotificationSubtype;

    /** Main notification alarm id */
    alarmId: string;

    /** Tenant to the unit from the main notification */
    tenant: Tenant$v1;

    /** Main notification assets */
    assets: Asset$v1[];

    /** Main  notification devices */
    devices: Device$v1[];

    /** Flag that is true when the translation component should be shown */
    isReady = false;

    /** Translation token for msg */
    token: AppNotificationTranslationTokens;

    private dataContext = Guid.NewGuid();

    private notificationSub: Subscription;

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public settings: AppNotificationSettings,
        private store: StoreService<Alarm$v1>,
        private tenantAdapter: CommontenantAdapterService$v1,
        private actionStore: ActionStoreService,
        private assetAssociationAdapter: AlarmWithAssetAdapterService$v1,
        private assetAdapter: AssetsAdapterService$v1,
        private deviceAssociationAdapter: AlarmWithDeviceAdapterService$v1,
        private deviceAdapter: DevicesAdapterService$v1,
        private tombstonedSrv: TombstonedService,
        private cdr: ChangeDetectorRef
    ) { }

    async ngOnInit() {

        await this.settings.notifications$.pipe(
            first()
        ).toPromise().then(async nList => {
            // Make sure tombstoned items are loaded
            const loadMap = new Map<string, string[]>();
            nList.forEach(n => {
                if (loadMap.has(n.tenantId)) {
                    let list = loadMap.get(n.tenantId);

                    // Add to list
                    list.push(n.id);
                    list = [...new Set(list)];
                    loadMap.set(n.tenantId, list);
                } else {
                    loadMap.set(n.tenantId, [n.id]);
                }
            });

            // Lock items
            const lockList: Promise<void>[] = [];
            loadMap.forEach((list, key) => {
                lockList.push(this.tombstonedSrv.lockAsync(list, this.dataContext, key));
            });

            if (lockList?.length) {
                await Promise.all(lockList);
            }

            this.notificationType = nList[0].notificationType;
            this.notificationSubtype = nList[0].notificationSubtype;
            this.alarmId = nList[0].id;

            this.tenant = await this.getTenantAsync();
            this.devices = await this.getDevicesAsync();
            this.assets = await this.getAssetsAsync();
        });

        this.alarmIds$ = this.settings.notifications$.pipe(
            map(notifications => {
                return [...new Set(notifications.map(n => n.id))];
            })
        );

        this.alarms$ = combineLatest([
            this.alarmIds$, this.store.entity$
        ]).pipe(
            map(([ids, alarms]) => {
                // Get the list of alarms that are part of the alarm ids
                // Return a max of 2 alarms
                const foundAlarms = alarms.filter(unit => {
                    return !!ids.find(id => id === unit.id);
                }).slice(0, 2);

                return foundAlarms;
            })
        );

        this.notificationSub = this.settings.notifications$.subscribe(async () => {
            this.isReady = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();

            this.token = await this.getTokenAsync();
            this.isReady = true;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy() {
        if (this.notificationSubtype) {
            this.notificationSub.unsubscribe();
        }
        this.tombstonedSrv.release(this.dataContext);
    }

    /**
     * Select the clicked on item
     */
    async selectAsync(id: string, event: MouseEvent): Promise<void> {
        event.stopPropagation();
        const contextId = await this.settings.contextId$.pipe(first()).toPromise();
        this.actionStore.multiselect(contextId, [id], false);
    }

    /**
     * Returns the token that is used to translate the notification message
     */
    async getTokenAsync() {
        return this.alarmIds$.pipe(
            first(),
            map(ids => {
                switch (this.notificationType) {
                    case AppNotificationType.alarmClosed:
                        if (ids.length === 1) {
                            return AppNotificationTranslationTokens.alarmClosedBy;
                        } else if (ids.length === 2) {
                            return AppNotificationTranslationTokens.alarmsClosed;
                        } else {
                            return AppNotificationTranslationTokens.alarmAndMoreClosed;
                        }
                    case AppNotificationType.alarmUpdate:
                        if (ids.length === 1) {
                            if (this.notificationSubtype === AppNotificationSubtype.mediaAdded) {
                                return AppNotificationTranslationTokens.mediaAddedToAlarm;
                            } else {
                                return AppNotificationTranslationTokens.remarkAddedToAlarm;
                            }
                        } else if (ids.length === 2) {
                            return AppNotificationTranslationTokens.alarmsHaveUpdates;
                        } else {
                            return AppNotificationTranslationTokens.alarmsAndMoreHaveUpdates;
                        }
                    case AppNotificationType.newAlarm:
                        if (ids.length === 1) {
                            if (this.devices?.length) {
                                return AppNotificationTranslationTokens.alarmFromDeviceFrom;
                            }

                            if (this.assets?.length) {
                                return AppNotificationTranslationTokens.alarmFromAssetFrom;
                            }

                            return AppNotificationTranslationTokens.alarmFrom;
                        } else if (ids.length === 2) {
                            return AppNotificationTranslationTokens.alarms;
                        } else {
                            return AppNotificationTranslationTokens.alarmsAndMoreAlarms;
                        }
                }
            })
        ).toPromise();
    }

    /**
     * Returns the tenant for the main alarm
     */
    async getTenantAsync(): Promise<Tenant$v1> {
        const alarm = await this.store.entity$.pipe(
            map(alarms => {
                return alarms.find(u => u.id === this.alarmId);
            }),
            filter(alarms => !!alarms),
            first()
        ).toPromise();

        const tenant = await this.tenantAdapter.getTenantAsync(alarm.tenantId);
        return tenant;
    }

    /**
     * Return list of assets alarm is associated to
     */
    async getAssetsAsync(): Promise<Asset$v1[]> {
        const associations$ = from(this.assetAssociationAdapter.getAssociationsAsync(this.alarmId, null)).pipe(
            mergeMap(val => val)
        );

        const assetIds = (await associations$.pipe(first()).toPromise()).map(associations => associations.assetId);
        const assetList: Asset$v1[] = [];

        if (assetIds?.length) {
            // Get list of assets the alarm is associated with
            for (const id of assetIds) {
                const asset = await this.assetAdapter.getAssetAsync(id);
                assetList.push(asset);
            }
        }

        return assetList;
    }

    /**
     * Return list of devices alarm is associated to
     */
    async getDevicesAsync(): Promise<Device$v1[]> {
        const associations$ = from(this.deviceAssociationAdapter.getAssociationsAsync(this.alarmId, null)).pipe(
            mergeMap(val => val)
        );

        const deviceIds = (await associations$.pipe(first()).toPromise()).map(associations => associations.deviceId);
        const deviceList: Device$v1[] = [];

        if (deviceIds?.length) {
            // Get list of assets the alarm is associated with
            for (const id of deviceIds) {
                const device = await this.deviceAdapter.getDeviceAsync(id);
                deviceList.push(device);
            }
        }

        return deviceList;
    }

}
