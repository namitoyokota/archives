import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Alarm$v1, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlarmItemTranslationTokens } from './mini-card.translation';

@Component({
    selector: 'hxgn-alarms-mini-card',
    templateUrl: 'mini-card.component.html',
    styleUrls: ['mini-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class MiniCardComponent implements OnInit, OnDestroy {

    /** Alarms */
    @Input() alarm: Alarm$v1;

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    /** Expose tokens to HTML */
    tokens: typeof AlarmItemTranslationTokens = AlarmItemTranslationTokens;

    /** Expose RestrictIds$v1 to the HTML */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Subject used unsubscribe to all subject on destroy of component */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor() { }

    /** On init lifecycle hook */
    ngOnInit() {
        interval(1000).pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.refreshToggle = !this.refreshToggle;
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
