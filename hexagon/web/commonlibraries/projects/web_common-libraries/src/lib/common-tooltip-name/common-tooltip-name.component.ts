import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'hxgn-common-tooltip-name',
    templateUrl: './common-tooltip-name.component.html',
    styleUrls: ['./common-tooltip-name.component.scss']
})
export class CommonTooltipNameComponent implements OnInit, OnDestroy {

    /** View child to determine if ellipsis is needed after initialization. */
    @ViewChild('ellipsis', { static: true }) ellipsis: ElementRef;

    /** The name to display */
    @Input() name = '';

    /** The show delay of the tooltip */
    @Input() showDelay = 1500;

    /** The hide delay of the tooltip */
    @Input() hideDelay = 1500;

    /** Determines if ellipsis is occurring or not. */
    hasEllipsis = false;

    constructor() { }

    /** Used to cleanup subscriptions */
    private destroy$: Subject<void> = new Subject<void>();

    /** Ng */
    ngOnInit() {
        setTimeout(() => {
            this.setEllipsis();
        }, 200);
    }

    /** Function run on component destroy. Destroys any subscriptions. */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Determines if the element has an ellipsis showing. */
    setEllipsis() {
        this.hasEllipsis = this.ellipsis.nativeElement.offsetWidth < this.ellipsis.nativeElement.scrollWidth;
    }
}
