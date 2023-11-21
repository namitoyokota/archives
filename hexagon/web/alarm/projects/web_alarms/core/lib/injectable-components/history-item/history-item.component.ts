import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Alarm$v1, AlarmHistoryItemSettings$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    template: `
        <hxgn-alarms-history-item [operations]="historyItemSettings.operations" [concise]="historyItemSettings.concise"
            [alarm]="alarm$ | async">
        </hxgn-alarms-history-item>
    `,
    styles: [
        `:host {
            display: flex;
            width: 100%;
            height: 100%;
        }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryItemInjectableComponent {

    /** Current alarm */
    alarm$: Observable<Alarm$v1>;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public historyItemSettings: AlarmHistoryItemSettings$v1,
                private store: StoreService<Alarm$v1>) {
        this.alarm$ = this.store.entity$.pipe(
            map(incidents => incidents.find(i => i.id === this.historyItemSettings.alarmId))
        );
    }
}
