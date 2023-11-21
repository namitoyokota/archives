import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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

import { DataService } from '../../../data.service';
import { EventService } from '../../../event.service';
import { HistoryDialogComponent, HistoryDialogData } from './history-dialog/history-dialog.component';
import { HistoryTranslationTokens } from './history.translation';

@Component({
    selector: 'hxgn-alarms-history',
    templateUrl: 'history.component.html',
    styleUrls: ['history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {

    /** The alarm data for this component. */
    @Input() alarm: Alarm$v1;

    /** The context id of the view using this component.  Needed for portal injection. */
    @Input() contextId: string;

    /** History objects associated with this alarm. */
    alarmHistory: ChangeRecord$v1[] = [];

    /** Tracks alarms loading status */
    alarmsLoading = true;

    /** Tracks asset associations loading status. */
    assetAssociationsLoading = true;

    /** Expose change operator to html. */
    changeOperator: typeof ChangeOperator$v1 = ChangeOperator$v1;

    /** Tracks device associations loading status. */
    deviceAssociationsLoading = true;

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    /** Expose translation tokens to html. */
    tokens: typeof HistoryTranslationTokens = HistoryTranslationTokens;

    /** Observable returning list of asset associations */
    private assetAssociations$: Observable<AlarmWithAssetAssociation$v1[]>;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Observable returning list of device associations */
    private deviceAssociations$: Observable<AlarmWithDeviceAssociation$v1[]>;

    constructor(private alarmStore: StoreService<Alarm$v1>,
                private alarmWithAssetSrv: AlarmWithAssetAdapterService$v1,
                private alarmWithDeviceSrv: AlarmWithDeviceAdapterService$v1,
                private dataSrv: DataService,
                private dialog: MatDialog,
                private eventSrv: EventService,
                private historySrv: EntityHistoryStoreService$v1) { }

    async ngOnInit() {

        if (this.historySrv.get$(this.alarm.id, this.contextId) === null) {
            await this.requestHistoryAsync(2);
            this.setupHistoryListener();
        } else {
            this.setupHistoryListener();
        }

        this.alarmStore.upserted$.pipe(
            takeUntil(this.destroy$),
            filter(changes => !!changes?.updates?.length),
            map(changes => changes?.updates?.find(c => c.id === this.alarm.id)),
            filter(alarm => !!alarm)
        ).subscribe(async () => {
            await this.requestHistoryAsync(2);
        });

        // Listen for asset associations
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
            await Promise.all(timelineData).then((timeline: Map<string, ChangeRecord$v1[]>[]) => {
                timeline.forEach((timelineItem: Map<string, ChangeRecord$v1[]>) => {
                    timelineItem.forEach((value, key) => {
                        this.historySrv.concatenate(this.alarm.id, value, this.contextId);
                    });
                });
            });

            this.assetAssociationsLoading = false;
        });

        // Listen for device associations
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

        this.eventSrv.minuteTick$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.refreshToggle = !this.refreshToggle;
        });
    }

    ngOnDestroy() {
        this.historySrv.remove(this.alarm.id, this.contextId);

        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Opens history dialog. */
    openHistoryDialog() {
        this.dialog.open(HistoryDialogComponent, {
            height: '600px',
            width: '500px',
            data: {
                contextId: this.contextId,
                alarmId: this.alarm?.id
            } as HistoryDialogData
        });
    }

    /**
     * Gets a specified amount of history items
     * @param pageSize the number of history items to request
     */
    private async requestHistoryAsync(pageSize: number): Promise<void> {
        const descriptor = new Descriptor$v1({
            id: this.alarm.id,
            pageSize: pageSize
        });

        const history: ChangeRecord$v1[] = await this.dataSrv.getTimelinePage$(
            [descriptor], this.alarm.tenantId
        ).toPromise().then((group: Map<string, ChangeRecord$v1[]>) => {
            return group.get(descriptor.id);
        });

        this.historySrv.concatenate(this.alarm.id, history, this.contextId);
    }

    /**
     * Sets up listener for history.
     */
    private setupHistoryListener(): void {
        this.historySrv.get$(this.alarm.id, this.contextId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((history: ChangeRecord$v1[]) => {
                this.alarmHistory = this.sortHistory(history).slice(0, 2);
            });

        this.alarmsLoading = false;
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
