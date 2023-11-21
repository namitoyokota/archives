import { Component, Inject } from '@angular/core';
import { Alarm$v1, AlarmPanelSettings$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { AlarmListPanelTranslationTokens } from './alarm-list-panel.translation';

@Component({
    templateUrl: 'alarm-list-panel.component.html',
    styleUrls: ['alarm-list-panel.component.scss']
})

export class AlarmListPanelComponent {


    private filterAlarmIds$ = new BehaviorSubject<string[]>([]);

    /** Stream of alarms */
    alarms$ = combineLatest([
        this.alarmStore.entity$,
        this.filterAlarmIds$,
    ]).pipe(
        map(([alarms, ids]) => {
            // Return alarms that are in the id list
            return alarms.filter(alarm => {
                return !!ids.find(id => alarm.id === id);
            });
        })
    );

    /** The size of a page */
    private readonly pageSize = 10;

    /** How many items should be shown */
    private showCount$ = new BehaviorSubject<number>(this.pageSize);

    /** Paged list of alarms */
    pagedAlarms$ = combineLatest([
        this.alarms$,
        this.showCount$
    ]).pipe(
        map(([alarms, pageSize]) => {
            return alarms.slice(0, pageSize);
        })
    );

    /** Filtered status from filter component. */
    filteredStatus = '';

    /** Expose AlarmListPanelTranslationTokens to HTML */
    tokens: typeof AlarmListPanelTranslationTokens = AlarmListPanelTranslationTokens;

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public settings: AlarmPanelSettings$v1,
        private alarmStore: StoreService<Alarm$v1>
    ) { }

    setFilterAlarmIds(alarmIds: string[]) {
        this.filterAlarmIds$.next(alarmIds);
        this.showCount$.next(this.pageSize);
    }

    /** Load a page of alarm data */
    loadPage() {
        this.showCount$.next(this.showCount$.getValue() + this.pageSize);
    }

}
