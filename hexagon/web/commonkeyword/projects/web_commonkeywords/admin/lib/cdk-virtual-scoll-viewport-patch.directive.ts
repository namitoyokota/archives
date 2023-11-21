import { OnInit, OnDestroy, Directive, Self, Inject } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'cdk-virtual-scroll-viewport',
})
export class CdkVirtualScrollViewportPatchDirective implements OnInit, OnDestroy {

    /**
	 * Used to clean up subject on destroy
	 */
    protected readonly destroy$ = new Subject();

    constructor(
        @Self() @Inject(CdkVirtualScrollViewport) private readonly viewportComponent: CdkVirtualScrollViewport,
    ) {}

    ngOnInit() {
        fromEvent(window, 'resize').pipe(
            debounceTime(100),
            takeUntil(this.destroy$),
        ).subscribe(() => {
            this.viewportComponent.checkViewportSize();
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
