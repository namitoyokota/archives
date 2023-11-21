import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Alarm$v1 } from '@galileo/web_alarms/_common';
import {
    ChangeOperator$v1,
    ChangeRecord$v1,
    Descriptor$v1,
    EntityHistoryStoreService$v1,
    StoreService,
} from '@galileo/web_common-libraries';
import {
    AlarmWithAssetAdapterService$v1,
    AlarmWithAssetAssociation$v1,
    AlarmWithDeviceAdapterService$v1,
    AlarmWithDeviceAssociation$v1,
} from '@galileo/web_commonassociation/adapter';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { DataService } from '../../../../data.service';
import { EventService } from '../../../../event.service';
import { HistoryDialogTranslationTokens } from './history-dialog.translation';

export interface HistoryDialogData {

    /** Id of incident */
    alarmId: string;

    /** Context id to use for history service */
    contextId: string;
}

@Component({
    templateUrl: 'history-dialog.component.html',
    styleUrls: ['history-dialog.component.scss']
})
export class HistoryDialogComponent implements OnInit, OnDestroy {

    /** The alarm to show history for. Needed for displaying attachments. */
    alarm: Alarm$v1;

    /** History objects associated with this alarm. */
    alarmHistory: ChangeRecord$v1[] = [];

    /** Tracks alarms loading status */
    alarmsLoading = true;

    /** Tracks asset associations loading status. */
    assetAssociationsLoading = true;

    /** Tracks device associations loading status. */
    deviceAssociationsLoading = true;

    /** Flag used to disable load of infinite scroll once last element has been loaded. */
    disableLoad = false;

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    /** Expose translation tokens to html. */
    tokens: typeof HistoryDialogTranslationTokens = HistoryDialogTranslationTokens;

    /** The min height an item can be. */
    readonly itemMinHeight = 49;

    private alarmHistoryStore: ChangeRecord$v1[] = [];

    /** Observable returning list of asset associations */
    private assetAssociations$: Observable<AlarmWithAssetAssociation$v1[]>;

    private contextId: string;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Observable returning list of device associations */
    private deviceAssociations$: Observable<AlarmWithDeviceAssociation$v1[]>;

    constructor(@Inject(MAT_DIALOG_DATA) private data: HistoryDialogData,
        private alarmStore: StoreService<Alarm$v1>,
        private alarmWithAssetSrv: AlarmWithAssetAdapterService$v1,
        private alarmWithDeviceSrv: AlarmWithDeviceAdapterService$v1,
        private dataSrv: DataService,
        private dialogRef: MatDialogRef<HistoryDialogComponent>,
        private eventSrv: EventService,
        private historySrv: EntityHistoryStoreService$v1) { }

    async ngOnInit() {
        this.alarm = this.alarmStore.snapshot(this.data.alarmId);
        this.contextId = this.data.contextId + '-dialog';

        // Set up listener to history store
        this.historySrv.get$(this.alarm.id, this.contextId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((alarmHistory: ChangeRecord$v1[]) => {
                this.alarmHistoryStore = this.sortHistory(alarmHistory);
                this.alarmHistory = this.alarmHistoryStore.slice(0, this.alarmHistory.length + 1);
            });

        this.eventSrv.minuteTick$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.refreshToggle = !this.refreshToggle;
        });

        // Keep alarm up to date
        this.alarmStore.entity$.pipe(
            takeUntil(this.destroy$),
            map((alarms: Alarm$v1[]) => {
                return alarms.find(x => x.id === this.data.alarmId);
            })
        ).subscribe((alarm: Alarm$v1) => {
            this.alarm = new Alarm$v1(alarm);
        });

        const getRequests = [];
        getRequests.push(this.getAlarmHistoryAsync());
        getRequests.push(this.getAssetAssociationsHistoryAsync());
        getRequests.push(this.getDeviceAssociationsHistoryAsync());

        if (getRequests?.length) {
            await Promise.all(getRequests);
        }
        this.alarmHistory = this.alarmHistoryStore.slice(0, 10);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Closes nested view. */
    close(): void {
        this.dialogRef.close();
    }

    /**
     * Gets next page of alarm history
     * @param pageSize the number of items requested by the infinite scroll component
     */
    async getAlarmHistoryPageAsync(pageSize: number): Promise<void> {
        if (!this.alarmsLoading && !this.assetAssociationsLoading && !this.deviceAssociationsLoading) {
            let lastElement = this.alarmHistory[this.alarmHistory.length - 1];
            if (lastElement.operations.some(x => x.operator === ChangeOperator$v1.addition &&
                x.propertyName !== 'AssociatedCapability1')) {
                this.disableLoad = true;
            }

            if (!this.disableLoad) {
                this.alarmHistory = this.alarmHistoryStore.slice(0, this.alarmHistory.length + pageSize);

                lastElement = this.alarmHistory[this.alarmHistory.length - 1];
                if (lastElement.operations.some(x => x.operator === ChangeOperator$v1.addition &&
                    x.propertyName !== 'AssociatedCapability1')) {
                    this.disableLoad = true;
                }
            }
        }
    }

    /**
     * Gets a specified amount of history items
     */
    private async getAlarmHistoryAsync(): Promise<void> {
        const descriptor = new Descriptor$v1({
            id: this.alarm.id,
            pageSize: 100
        });

        const alarmHistory: ChangeRecord$v1[] = await this.dataSrv.getTimelinePage$(
            [descriptor], this.alarm.tenantId
        ).toPromise().then(group => {
            return group.get(descriptor.id);
        });

        this.historySrv.concatenate(this.alarm.id, alarmHistory, this.contextId);
        this.alarmsLoading = false;
    }

    /**
     * Gets asset associations and adds it to the history store
     */
    private async getAssetAssociationsHistoryAsync(): Promise<void> {
        this.assetAssociations$ = await this.alarmWithAssetSrv.getAssociationsAsync(this.alarm.id, null);
        this.assetAssociations$.pipe(
            takeUntil(this.destroy$),
            filter(item => !!item)
        ).subscribe(async (assocs: AlarmWithAssetAssociation$v1[]) => {
            const timelineData = [];

            // Get timeline data
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < assocs.length; i++) {
                const id: string = this.alarmWithAssetSrv.buildTimelineId(
                    '@hxgn_alarms', assocs[i].alarmId, '@hxgn_assets', assocs[i].assetId
                );

                const descriptor = {
                    id: id,
                    pageSize: 2
                } as Descriptor$v1;

                timelineData.push(this.alarmWithAssetSrv.getTimelineAsync([descriptor]));
            }

            // Add timeline data to history store
            if (timelineData?.length) {
                await Promise.all(timelineData).then((timeline: Map<string, ChangeRecord$v1[]>[]) => {
                    timeline.forEach((timelineItem: Map<string, ChangeRecord$v1[]>) => {
                        timelineItem.forEach((value, key) => {
                            this.historySrv.concatenate(this.alarm.id, value, this.contextId);
                        });
                    });
                });
            }

            this.assetAssociationsLoading = false;
        });
    }

    /**
     * Gets device associations and adds it to the history store
     */
    private async getDeviceAssociationsHistoryAsync(): Promise<void> {
        this.deviceAssociations$ = await this.alarmWithDeviceSrv.getAssociationsAsync(this.alarm.id, null);
        this.deviceAssociations$.pipe(
            takeUntil(this.destroy$),
            filter(item => !!item)
        ).subscribe(async (assocs: AlarmWithDeviceAssociation$v1[]) => {
            const timelineData = [];

            // Get timeline data
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < assocs.length; i++) {
                const id: string = this.alarmWithDeviceSrv.buildTimelineId(
                    '@hxgn_alarms', assocs[i].alarmId, '@hxgn_devices', assocs[i].deviceId
                );

                const descriptor = {
                    id: id,
                    pageSize: 2
                } as Descriptor$v1;

                timelineData.push(this.alarmWithDeviceSrv.getTimelineAsync([descriptor]));
            }

            // Add timeline data to history store
            if (timelineData?.length) {
                await Promise.all(timelineData).then((timeline: Map<string, ChangeRecord$v1[]>[]) => {
                    timeline.forEach((timelineItem: Map<string, ChangeRecord$v1[]>) => {
                        timelineItem.forEach((value, key) => {
                            this.historySrv.concatenate(this.alarm.id, value, this.contextId);
                        });
                    });
                });
            }

            this.deviceAssociationsLoading = false;
        });
    }

    /**
     * Sorts history by date.
     */
    private sortHistory(history: ChangeRecord$v1[]): ChangeRecord$v1[] {
        const sortedHistory = history.sort((a, b) => {
            return b.timestampDate.getTime() - a.timestampDate.getTime();
        });

        return sortedHistory;
    }
}
