import { Component, Inject } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StoreService } from '@galileo/web_common-libraries';

@Component({
    template: `
        <hxgn-alarms-mini-card [alarm]="alarm$ | async" >
        </hxgn-alarms-mini-card>
    `,
    styles: [
        `:host {
            display: flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
export class MiniCardInjectableComponent {
    /** Alarm data */
    alarm$: Observable<Alarm$v1> = this.storeSrv.entity$.pipe(
        map(items => {
            return items.find(i => i.id === this.id);
        })
    );

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) private id: string,
        private storeSrv: StoreService<Alarm$v1>
    ) { }
}
