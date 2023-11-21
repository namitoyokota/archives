import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';

@Component({
    template: '<hxgn-alarms-priority [priority]="alarmPriority"></hxgn-alarms-priority>',
    styles: [
        `:host {
            display: flex;
            width: 100%;
            height: 100%;
        }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmPriorityInjectableComponent {

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public alarmPriority: number) { }
}
