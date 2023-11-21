import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
    selector: 'hxgn-alarms-priority',
    template: '',
    styleUrls: ['alarm-priority.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmPriorityComponent {

    /** Alarm priority to display. */
    @Input('priority')
    set setPriority(priority: number) {
        this.setPriorityColor(priority);
    }

    /** Binding to class */
    @HostBinding('className') priorityClass;

    constructor() { }

    /** Sets class name by priority number */
    private setPriorityColor(priority: number) {
        if (priority || priority === 0) {
            switch (+priority) {
                case 0:
                    this.priorityClass = 'priority-0';
                    break;
                case 1:
                    this.priorityClass = 'priority-1';
                    break;
                case 2:
                    this.priorityClass = 'priority-2';
                    break;
                default:
                    this.priorityClass = 'priority-3';
            }
        } else {
            this.priorityClass = null;
        }
    }
}
