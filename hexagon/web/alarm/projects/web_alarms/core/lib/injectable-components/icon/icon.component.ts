import { Component, Inject, OnInit } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    templateUrl: 'icon.component.html',
    styleUrls: ['icon.component.scss']
})
export class IconInjectableComponent implements OnInit {

    /** Alarm data */
    alarm$: Observable<Alarm$v1>;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) private alarmId: string,
                private alarmStore: StoreService<Alarm$v1>) { }

    ngOnInit() {
        this.alarm$ = this.alarmStore.entity$.pipe(
            map(alarms => {
                return alarms.find(x => x.id === this.alarmId);
            })
        );
    }
}
