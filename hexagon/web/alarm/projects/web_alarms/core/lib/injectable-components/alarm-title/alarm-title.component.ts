import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    template: `<span *ngIf="(alarm$ | async) as alarm">
                    {{alarm?.title}}
                </span>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmTitleComponent {

    /**
     * Alarm to show title for
     */
    alarm$: Observable<Alarm$v1> = combineLatest([this.alarmStore.entity$, this.alarmIds$]).pipe(
        map(([alarms, ids]) => {

            // Filter alarms based on the ids passed in
            const alarmList = alarms.filter(alarm => {
                return !!ids?.find(id => id === alarm.id);
            });

            if (alarmList?.length) {

                // Return top priority
                const alarm = alarmList.sort( (a, b) => {
                    if (a.priority > b.priority) {
                        return 1;
                    } else if (a.priority < b.priority) {
                        return -1;
                    } else {
                        // Sort on date
                        if (a.reportedTime > b.reportedTime) {
                            return -1;
                        } else if (a.reportedTime < b.reportedTime) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                })[0];
                return alarm;
            } else {
                return null;
            }
        })
    );

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) private alarmIds$: Observable<string[]>,
                private alarmStore: StoreService<Alarm$v1>,
                private cdr: ChangeDetectorRef) { }
}
