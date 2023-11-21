import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Alarm$v1, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EventService } from '../../../../event.service';
import { TranslationTokens } from './bar.translate';

@Component({
    selector: 'hxgn-alarms-bar',
    templateUrl: 'bar.component.html',
    styleUrls: ['bar.component.scss']
})
export class BarComponent implements OnInit, OnDestroy {

    /** Alarm data */
    @Input() alarm: Alarm$v1;

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Expose RestrictIds$v1 to HTML */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private eventSrv: EventService) { }

    async ngOnInit() {

        this.eventSrv.minuteTick$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.refreshToggle = !this.refreshToggle;
        });
    }

    /**
     * On destroy life cycle hook. Update the selection state
     */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

}
