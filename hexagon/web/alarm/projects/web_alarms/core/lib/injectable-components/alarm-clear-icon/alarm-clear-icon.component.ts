import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Alarm$v1, AlarmClearIconSettings$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ClearAlarmsDialogComponent } from '../../shared/clear-alarms-dialog/clear-alarms-dialog.component';

@Component({
    templateUrl: 'alarm-clear-icon.component.html',
    styleUrls: ['alarm-clear-icon.component.scss']
})
export class AlarmClearIconComponent implements OnInit, OnDestroy {

    /** Alarms from store to check  */
    alarms$: Observable<Alarm$v1[]> = combineLatest(
        [this.alarmStore.entity$, this.settings.alarmIds$, this.settings.selected$]
    ).pipe(map(([alarms, ids, selected]) => {
        this.alarmIds = ids;
        this.selected = selected;

        // Filter alarms based on the ids passed in
        const alarmList = alarms.filter(alarm => {
            return !!ids?.find(id => id === alarm.id);
        });

        this.alarmCount = alarmList.length;

        if (alarmList?.length) {
            // Return top priority
            return alarmList.sort((a, b) => {
                return a.priority - b.priority;
            });
        } else {
            return null;
        }
    }));

    /** Number of alarms in store. */
    alarmCount = 0;

    /** Alarm Ids to pass to clear dialog component and alarm status component. */
    alarmIds: string[] = [];

    /** Used to track whether there are any clearable alarms */
    hasClearableAlarms = false;

    /** Whether or not to show the selected icon. */
    selected: boolean;

    /** Whether or not to show the device info in the menu. */
    showDeviceInfo: boolean;

    // Ref to the alarm subscription
    private subRef: Subscription;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public settings: AlarmClearIconSettings$v1,
                private alarmStore: StoreService<Alarm$v1>,
                private dialog: MatDialog) { }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.subRef = this.alarms$.subscribe(alarms => {
            if (alarms) {
                this.hasClearableAlarms = alarms.filter(x => !x.isManaged).length > 0;
            } else {
                this.hasClearableAlarms = false;
            }
        });

        this.showDeviceInfo = this.settings.showDeviceInfo;
    }

    /** Function ran on component destroy. */
    ngOnDestroy() {
        this.subRef.unsubscribe();
    }

    /** Opens clear alarms dialog. */
    openClearDialog() {
        this.dialog.open(ClearAlarmsDialogComponent, {
            height: '550px',
            width: '790px',
            disableClose: true,
            autoFocus: false,
            data: {
                ids: this.alarmIds
            }
        });
    }
}
