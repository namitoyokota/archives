import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
    selector: 'hxgn-alarms-priority-icon',
    template: '',
    styleUrls: ['alarm-priority-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmPriorityIconComponent implements OnInit {

    /** Alarm priority to display. */
    @Input() priority: number;

    /** Binding to class */
    @HostBinding('className') priorityClass;

    constructor(private cdr: ChangeDetectorRef) { }

    /** Function ran on component initialization. */
    ngOnInit() {
        if (this.priority || this.priority === 0) {
            switch (+this.priority) {
                case 0:
                    this.priorityClass = 'priority-0-icon';
                    break;
                case 1:
                    this.priorityClass = 'priority-1-icon';
                    break;
                case 2:
                    this.priorityClass = 'priority-2-icon';
                    break;
                default:
                    this.priorityClass = 'priority-3-icon';
            }
        } else {
            this.priorityClass = 'priority-none-icon';
        }

        setTimeout(() => {
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });

    }
}
