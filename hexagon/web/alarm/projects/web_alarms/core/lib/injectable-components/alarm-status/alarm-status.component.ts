import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Inject,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { Alarm$v1, AlarmStatusSettings$v1, LAYOUT_MANAGER_SETTINGS, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    template: '',
    styleUrls: ['alarm-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlarmStatusComponent implements OnInit, OnDestroy {

    /** Alarm to show status for */
    alarm$: Observable<Alarm$v1> = combineLatest([this.alarmStore.entity$, this.settings.alarmIds$]).pipe(
        map(([alarms, ids]) => {
            this.isMissing = false;
            // Filter alarms based on the ids passed in
            const alarmList = alarms.filter(alarm => {
                return !!ids?.find(id => id === alarm.id);
            });

            if (alarmList?.length) {
                // Return top priority
                return alarmList.sort((a, b) => {
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
            } else if (!alarmList?.length && ids?.length) {
                this.isMissing = true;
            }

            return null;
        })
    );

    /** Binding to class */
    @HostBinding('className') classes;

    /** Flag to indicate showing the border */
    showBorder = false;

    /** Flag to indicate showing the shadow border */
    showBorderShadow = false;

    // Ref to the alarm subscription
    private subRef: Subscription;

    private isMissing = false;

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) private settings: AlarmStatusSettings$v1,
        private alarmStore: StoreService<Alarm$v1>,
        private cdr: ChangeDetectorRef
    ) {
        this.showBorder = settings.showBorder;
        this.showBorderShadow = settings.showBorderShadow;
        this.classes = null;

        if (this.showBorder) {
            this.classes = 'border';
            if (this.showBorderShadow) {
                this.classes += ' shadow';
            }
        }
    }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.subRef = this.alarm$.subscribe(alarm => {
            if (this.isMissing) {
                this.classes = 'missing';
            } else if (!alarm) {
                this.classes = 'priority-none';
            } else {
                if (!alarm.isRedacted(RestrictIds$v1.priority)) {
                    switch (alarm.priority) {
                        case 0:
                            this.classes = 'priority-0';
                            break;
                        case 1:
                            this.classes = 'priority-1';
                            break;
                        case 2:
                            this.classes = 'priority-2';
                            break;
                        default: {
                            this.classes = 'priority-3';
                        }
                    }
                } else {
                    this.classes = null;
                }
            }

            if (this.showBorder) {
                this.classes += ' border';
                if (this.showBorderShadow) {
                    this.classes += ' shadow';
                }
            }

            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });
    }

    /** Function ran on component destroy. */
    ngOnDestroy(): void {
        this.subRef.unsubscribe();
    }
}
