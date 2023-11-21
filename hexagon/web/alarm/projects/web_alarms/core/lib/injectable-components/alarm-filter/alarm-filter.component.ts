import { Component, Inject } from '@angular/core';
import { AlarmFilterSettings$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';

@Component({
    templateUrl: 'alarm-filter.component.html',
    styleUrls: ['alarm-filter.component.scss']
})
export class AlarmFilterInjectableComponent {

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public settings: AlarmFilterSettings$v1) { }
}
