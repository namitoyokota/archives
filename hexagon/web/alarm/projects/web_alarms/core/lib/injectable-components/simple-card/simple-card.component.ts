import { Component, Inject } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    templateUrl: 'simple-card.component.html',
    styleUrls: ['simple-card.component.scss']
})
export class SimpleCardInjectableComponent {

    /** Alarm data */
    alarm$: Observable<Alarm$v1> = this.alarmStore.entity$.pipe(
        map((alarms: Alarm$v1[]) => {
            return alarms.find(x => x.id === this.id);
        })
    );

    /** Expose restrict ids to HTML */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) private id: string,
                private alarmStore: StoreService<Alarm$v1>) { }
}
