import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject, interval } from 'rxjs';
import { RemarksTranslationTokens } from './common-remarks.translation';
import { Remark$v1 } from '@galileo/platform_common-libraries';

@Component({
    selector: 'hxgn-common-remarks',
    templateUrl: 'common-remarks.component.html',
    styleUrls: ['common-remarks.component.scss']
})
export class CommonRemarksComponent implements OnInit, OnDestroy {

    /** Remarks */
    @Input() remarks: Remark$v1[];

    /** When false only the first comment is shown */
    viewAll = false;

    /** Expose tokens to HTML */
    tokens: typeof RemarksTranslationTokens = RemarksTranslationTokens;

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor() { }

    /** OnInit */
    ngOnInit() {

        interval(60000).pipe(
            takeUntil(this.destroy$)
        )
        .subscribe(() => {
            this.refreshToggle = !this.refreshToggle;
        });
    }

    /** On destroy life cycle hook. Update the selection state */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

}
