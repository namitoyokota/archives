import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    Alarm$v1,
    AlarmChangeNotification$v1,
    AlarmChangeNotificationReason$v1,
    capabilityId,
    CommonMailboxService,
    RestrictIds$v1,
} from '@galileo/web_alarms/_common';
import {
    CommonConfirmDialogComponent,
    ConfirmDialogData,
    DebounceDataService,
    DescriptorList$v1,
    StoreService,
} from '@galileo/web_common-libraries';
import { AlarmWithAssetAdapterService$v1, AlarmWithDeviceAdapterService$v1 } from '@galileo/web_commonassociation/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonkeywordsAdapterService$v1, CompositeIconRequest$v1 } from '@galileo/web_commonkeywords/adapter';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { combineLatest, from, merge } from 'rxjs';
import { filter, first, flatMap, map } from 'rxjs/operators';

import { DataService } from './data.service';
import { EventService } from './event.service';
import { NotificationService } from './notification.service';
import { ClearAlarmsDialogComponent } from './shared/clear-alarms-dialog/clear-alarms-dialog.component';
import { TombstonedService } from './tombstoned.service';

enum TranslationTokens {
    closeAlarms = 'alarm-main.component.closeAlarms',
    closeAlarmsMsg = 'alarm.component.closeAlarmsMsg'
}

@Injectable()
export class CoreService {

    /** Flag that is set to true when the initial load of data is complete. */
    private dataLoaded = false;

    /** Tenant Id of user  */
    activeTenantId: string;

    constructor(private mailbox: CommonMailboxService,
        private eventSrv: EventService,
        private notificationSrv: NotificationService,
        private dataSrv: DataService,
        private alarmStore: StoreService<Alarm$v1>,
        private commonIdentAdapterSvc: CommonidentityAdapterService$v1,
        private layoutAdapter: LayoutCompilerAdapterService,
        private alarmWithDeviceSrv: AlarmWithDeviceAdapterService$v1,
        private alarmWithAssetSrv: AlarmWithAssetAdapterService$v1,
        private dialog: MatDialog,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private tombstonedSrv: TombstonedService,
        private keywordAdapter: CommonkeywordsAdapterService$v1,
        private debounceData: DebounceDataService<AlarmChangeNotification$v1>) {

        this.initListeners();
        this.initPostOffice();

        this.initLocalization();

        this.mailbox.mailbox$v1.coreIsLoaded$.next(true);
        this.layoutAdapter.coreIsLoadedAsync(capabilityId);
    }

    /**
     * Shows a dialog to confirm the deletion of an alarm
     */
    async confirmDeleteAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.dialog.open(CommonConfirmDialogComponent, {
                width: '400px',
                autoFocus: false,
                data: {
                    titleToken: TranslationTokens.closeAlarms,
                    msgToken: TranslationTokens.closeAlarmsMsg
                } as ConfirmDialogData
            }).afterClosed().subscribe(confirm => {
                resolve(confirm);
            });
        });
    }

    /**
     * Shows a dialgo to confirm the deletion of bulk alarms
     * @param ids Alarm ids to delete
     * @param tenantId Current tenant id
     */
    async confirmDeleteBulkAsync(ids: string[], tenantId: string = null) {
        this.dialog.open(ClearAlarmsDialogComponent, {
            width: '800px',
            autoFocus: false,
            data: {
                ids,
                hideDevice: true,
                selectAll: true,
                tenantId
            }
        });
    }

    /**
     * Listen for notifications and trigger events off of them
     */
    private initListeners() {
        this.listenConnectionEstablished();
        this.listenAlarmsUpdatedCreated();
        this.listenAlarmDataRequest();
        this.listenAlarmDeleted();
    }

    /**
     * Listens to the connection established event on the notification service
     */
    private listenConnectionEstablished(): void {
        this.notificationSrv.connectionEstablished$.pipe(
            filter(isConnected => isConnected)
        ).subscribe(() => {
            this.dataLoaded = false;

            // Tell listeners we are starting the data retrieve
            this.eventSrv.dataInit();

            // Clear out store
            this.alarmStore.clear();
            this.dataSrv.getAlarmList$().subscribe(
                (alarms) => {
                    // Load composite icons
                    const request = alarms.map(a => {
                        return new CompositeIconRequest$v1({
                            keywords: a.keywords ? a.keywords : [],
                            tenantId: a.tenantId,
                            industryId: a.industryId,
                            capabilityId: capabilityId
                        });
                    });

                    this.keywordAdapter.loadCompositeIconsAsync(request);
                    this.alarmStore.upsert(alarms);
                },
                (err) => {
                    // On Error
                    console.error('HxgnConnect:: Alarms: An unexpected error occurred getting alarm data', err);
                },
                async () => {
                    // On Complete
                    this.dataLoaded = true;
                    const userInfo = await this.commonIdentAdapterSvc.getUserInfoAsync();

                    this.activeTenantId = userInfo.activeTenant;
                    await this.tombstonedSrv.reconcileLocksAsync();
                    this.eventSrv.dataReady();

                    this.alarmStore.entity$.pipe(
                        first()
                    ).subscribe(list => {
                        this.notificationSrv.processNotificationQueue(list);
                    });
                }
            );
        });
    }

    /**
     * Listens to alarm creates and updates from the notification service
     */
    private listenAlarmsUpdatedCreated(): void {
        merge<AlarmChangeNotification$v1>(
            this.notificationSrv.created$,
            this.notificationSrv.updated$
        ).subscribe(async notification => {
            if (this.isDataLoaded(notification)) {
                this.debounceData.debounce(notification);
            }
        });
    }

    /** Listen to request to go get data */
    private listenAlarmDataRequest(): void {
        this.debounceData.debounced$.subscribe(async (notifications: AlarmChangeNotification$v1[]) => {

            // Filter out dup or old notifications
            let cleanList: AlarmChangeNotification$v1[] = [];
            notifications.forEach(n => {
                const item = cleanList.find(i => i.id === n.id);
                if (!!item) {
                    // Update
                    cleanList = cleanList.map(i => {
                        if (i.id === item.id) {
                            i.systemCorrelationId = i.systemCorrelationId > item.systemCorrelationId ?
                                i.systemCorrelationId : item.systemCorrelationId;
                        }
                        return i;
                    });
                } else {
                    cleanList = [...cleanList, n];
                }
            });

            const descriptorList: DescriptorList$v1[] = [];
            cleanList.forEach(n => {
                const found = this.alarmStore.snapshot(n.id);
                if (!found || (found && !this.isUpdateNotificationRedacted(n, found))) {
                    descriptorList.push({
                        id: n.id,
                        tenantId: n.tenantId,
                        systemCorrelationId: n.systemCorrelationId
                    } as DescriptorList$v1);
                }
            });

            const alarms = await this.dataSrv.getAlarms$(descriptorList).toPromise();

            if (alarms) {
                this.alarmStore.upsert(alarms);

                const iconsToLoad: CompositeIconRequest$v1[] = alarms.map(incident => {
                    return new CompositeIconRequest$v1({
                        keywords: incident.keywords ? incident.keywords : [],
                        tenantId: incident.tenantId,
                        industryId: incident.industryId,
                        capabilityId: capabilityId
                    });
                });
                // Load composite icon
                this.keywordAdapter.loadCompositeIconsAsync(iconsToLoad);
            }
        });
    }

    /**
     * Listens to alarm deletes from the notification service
     */
    private listenAlarmDeleted(): void {
        this.notificationSrv.deleted$.subscribe(async (notification: AlarmChangeNotification$v1) => {
            if (this.isDataLoaded(notification)) {
                // If locked then update
                if (this.tombstonedSrv.isLocked(notification.id)) {
                    const entity: Alarm$v1 = await this.dataSrv.getAlarm$(notification.id, notification.tenantId).toPromise();
                    // Its possible the backend did not tombstone.  If not, then check to see if item
                    // is in the store and if so set the tombstone flag so that it will be removed when the lock is released
                    if (entity) {
                        this.alarmStore.upsert(entity);
                    } else {
                        const foundAlarm = this.alarmStore.snapshot(notification.id);
                        if (foundAlarm) {
                            foundAlarm.tombstoned = true;
                            this.alarmStore.upsert(foundAlarm);
                        }
                    }
                } else {
                    this.alarmStore.remove(notification.id);
                }
            }
        });
    }

    /**
     * Will queue the notification if the data is not loaded.
     * @param notification The notification that should be queued if data is not loaded
     */
    private isDataLoaded(notification: AlarmChangeNotification$v1): boolean {
        if (!this.dataLoaded) {
            this.notificationSrv.addToNotificationQueue(notification);
            return false;
        }

        return true;
    }

    /**
     * Returns true if the notification is for a property that is redacted
     */
    private isUpdateNotificationRedacted(notification: AlarmChangeNotification$v1, alarm: Alarm$v1): boolean {
        switch (notification.reason) {
            case AlarmChangeNotificationReason$v1.priority:
                return alarm.isRedacted(RestrictIds$v1.priority);
            case AlarmChangeNotificationReason$v1.attachment:
                return alarm.isRedacted(RestrictIds$v1.attachments);
            case AlarmChangeNotificationReason$v1.location:
                return alarm.isRedacted(RestrictIds$v1.location);
            case AlarmChangeNotificationReason$v1.remark:
                return alarm.isRedacted(RestrictIds$v1.remarks);
            case AlarmChangeNotificationReason$v1.keyword:
                return alarm.isRedacted(RestrictIds$v1.keywords);
            case AlarmChangeNotificationReason$v1.property:
                return alarm.isRedacted(RestrictIds$v1.properties);
            case AlarmChangeNotificationReason$v1.attachment:
                return alarm.isRedacted(RestrictIds$v1.attachments);
            case AlarmChangeNotificationReason$v1.industry:
                return alarm.isRedacted(RestrictIds$v1.industry);
            case AlarmChangeNotificationReason$v1.type:
                return alarm.isRedacted(RestrictIds$v1.type);
            case AlarmChangeNotificationReason$v1.primaryContact:
                return alarm.isRedacted(RestrictIds$v1.primaryContact);
            default:
                return false;
        }
    }

    /**
     * Listen to all messages in the mailbox service
     */
    private initPostOffice(): void {
        this.initFilterAlarmDeviceAssociationsByPriority();
        this.initFilterAlarmDeviceAssociationsByHighestPriority();
        this.initFilterAlarmDeviceAssociationsByMissingAlarms();
        this.initFilterAlarmAssetAssociationsByMissingAlarms();
        this.initListenerForGetAlarm();
    }

    /** Listen to filter alarm device associations by  priority api calls */
    private initFilterAlarmDeviceAssociationsByPriority() {
        this.mailbox.mailbox$v1.filterAlarmDeviceAssociationsByPriority$.subscribe(mailbox => {

            const filterPriority = mailbox.payload;

            // Get stream of associations
            const associations$ = from(this.alarmWithDeviceSrv.getAssociationsAsync()).pipe(
                flatMap(associations => associations)
            );

            // Filter associations based on alarm priority
            const alarmAssociation$ = combineLatest([associations$, this.alarmStore.entity$]).pipe(
                map(([associations, alarms]) => {
                    // Filter by given priority
                    return associations.filter(association => {
                        const alarm = alarms.find(a => a.id === association.alarmId);

                        if (!alarm) {
                            return false;
                        }

                        let passPriorityFilter = false;
                        /** Group alarms with priority greater then 2 together */
                        if (filterPriority < 3) {
                            passPriorityFilter = alarm.priority === filterPriority;
                        } else {
                            passPriorityFilter = alarm.priority >= filterPriority;
                        }

                        if (passPriorityFilter) {
                            // Make sure it does not fall into a higher (being lower number) priority
                            const deviceAssociations = associations.filter(a => {
                                return a.deviceId === association.deviceId && a.alarmId !== alarm.id;
                            });
                            passPriorityFilter = !deviceAssociations.find(da => {
                                // Look for a higher priority
                                return !!alarms.find(a => {
                                    const alarmPriority = (a.priority >= 3) ? 3 : a.priority;
                                    return a.id === da.alarmId && alarmPriority < filterPriority;
                                });
                            });
                        }

                        return passPriorityFilter;

                    });
                })
            );

            mailbox.response.next(alarmAssociation$);
        });
    }

    private initFilterAlarmDeviceAssociationsByHighestPriority() {
        this.mailbox.mailbox$v1.filterAlarmDeviceAssociationsByHighestPriority$.subscribe(mailbox => {

            // Get stream of associations
            const associations$ = from(this.alarmWithDeviceSrv.getAssociationsAsync()).pipe(
                flatMap(associations => associations)
            );

            // Filter associations based on highest priority alarm
            const alarmAssociation$ = combineLatest([associations$, this.alarmStore.entity$]).pipe(
                map(([associations, alarms]) => {

                    const deviceAlarmPriorityMap: Map<string, number> = new Map<string, number>();

                    associations.forEach(association => {
                        const alarm = alarms.find(a => a.id === association.alarmId);
                        if (alarm) {
                            if (deviceAlarmPriorityMap.has(association.deviceId)) {
                                if (deviceAlarmPriorityMap.get(association.deviceId) > alarm.priority) {
                                    deviceAlarmPriorityMap.set(association.deviceId, alarm.priority);
                                }
                            } else {
                                deviceAlarmPriorityMap.set(association.deviceId, alarm.priority);
                            }
                        }
                    });

                    return associations.filter(association => {
                        return deviceAlarmPriorityMap.has(association.deviceId);
                    });
                })
            );

            mailbox.response.next(alarmAssociation$);
        });
    }

    /** Listen to filter alarm device associations by missing alarms */
    private initFilterAlarmDeviceAssociationsByMissingAlarms() {
        this.mailbox.mailbox$v1.filterAlarmDeviceAssociationsByMissingAlarms$.subscribe(mailbox => {

            let alarmId;
            let deviceId;
            if (mailbox.payload) {
                alarmId = mailbox.payload.alarmId;
                deviceId = mailbox.payload.deviceId;
            }
            // Get stream of associations
            const associations$ = from(this.alarmWithDeviceSrv.getAssociationsAsync(alarmId, deviceId)).pipe(
                flatMap(associations => associations)
            );

            // Filter associations based on alarm missing
            const alarmAssociation$ = combineLatest([associations$, this.alarmStore.entity$]).pipe(
                map(([associations, alarms]) => {
                    return associations.filter(association => {
                        const alarm = alarms.find(a => a.id === association.alarmId);

                        if (!alarm) {
                            return false;
                        } else {
                            return (association);
                        }


                    });
                })
            );

            mailbox.response.next(alarmAssociation$);
        });
    }

    /** Listen to filter alarm asset associations by missing alarms */
    private initFilterAlarmAssetAssociationsByMissingAlarms() {
        this.mailbox.mailbox$v1.filterAlarmAssetAssociationsByMissingAlarms$.subscribe(mailbox => {

            let alarmId;
            let assetId;
            if (mailbox.payload) {
                alarmId = mailbox.payload.alarmId;
                assetId = mailbox.payload.assetId;
            }

            // Get stream of associations
            const associations$ = from(this.alarmWithAssetSrv.getAssociationsAsync(alarmId, assetId)).pipe(
                flatMap(associations => associations)
            );

            // Filter associations based on alarm missing
            const alarmAssociation$ = combineLatest([associations$, this.alarmStore.entity$]).pipe(
                map(([associations, alarms]) => {
                    return associations.filter(association => {
                        const alarm = alarms.find(a => a.id === association.alarmId);

                        if (!alarm) {
                            return false;
                        } else {
                            return (association);
                        }


                    });
                })
            );

            mailbox.response.next(alarmAssociation$);
        });
    }

    /**
     * Listen to get alarm adapter calls
     */
    private initListenerForGetAlarm(): void {
        this.mailbox.mailbox$v1.getAlarm$.subscribe(mailbox => {
            const alarmId = mailbox.payload;

            this.eventSrv.dataReady$.pipe(first()).subscribe(() => {
                const alarm: Alarm$v1 = this.alarmStore.snapshot(alarmId);
                mailbox.response.next(alarm ? alarm : null);
            });
        });
    }

    /** Set up routine for localization. */
    private initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        this.localizationSrv.localizeStringsAsync(tokens);
    }
}
