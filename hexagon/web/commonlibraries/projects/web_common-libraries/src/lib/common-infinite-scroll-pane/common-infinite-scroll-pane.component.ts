import {
    Component, OnInit, Input,
    Output, EventEmitter, ViewChild,
    ElementRef, AfterViewInit, OnDestroy, HostBinding
} from '@angular/core';
import { BehaviorSubject, fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-common-infinite-scroll-pane',
    templateUrl: 'common-infinite-scroll-pane.component.html',
    styleUrls: ['common-infinite-scroll-pane.component.scss']
})

export class CommonInfiniteScrollPaneComponent implements OnInit, AfterViewInit, OnDestroy {

    /** The min height an element can be in the pane  */
    @Input() itemMinHeight: number;

    /** Changes the direction of the scrolling so items are generated when scrolling up.  */
    @Input() scrollUp = false;

    /** How many items are currently loaded into the scroll pane. */
    @Input('itemCount')
    set setItemCount(count: number) {
        if (count === 0 && this.itemCount) {
            this.loadPageData();
        } else {
            this.itemCount = count;
            this.loadingItems = false;

            if (this.scrollUpHeight) {
                // Wait for the next angular tick
                setTimeout(() => {
                    const newHeight = this.listPaneElementRef.nativeElement.scrollHeight - this.scrollUpHeight;
                    this.listPaneElementRef.nativeElement.scrollTop = newHeight;
                    this.scrollUpHeight = null;
                });
            }
        }
    }

    /** When true the scroll load will be disabled.
     * This should be set to true when all the paged data is loaded
     */
    @Input('disableLoad')
    set setDisableLoad(disable: boolean) {
        this.disableLoad = disable;

        if (!this.disableLoad) {
            this.loadingItems = false;
        }
    }

    /**
     * How many pages of data should be loaded. Default is 2. A page is enough items to fill
     * what will fit in the infinite scroll pane.
     */
    @Input() bufferSize = 2;

    /** Event that a new page of data needs to be loaded */
    @Output() loadPage = new EventEmitter<number>();

    /** ELement reference to the list pane */
    @ViewChild('listPane') listPaneElementRef: ElementRef;

    /** How many items should be in the page size. This should be 1.5 times the number
     * of items that can fit on the screen.
     */
    pageSize = 0;

    /** When true the scroll load will be disabled. */
    disableLoad = false;

    /** Flag that is true when item data is loading */
    loadingItems = true;

    /** When the screen resizes then the page size needs to be updated */
    private windowResize$ = fromEvent(window, 'resize').pipe(
        debounceTime(500)
    );

    /** The count of the number of items in the list */
    private itemCount = 0;

    /** The scroll up height before items are loaded */
    private scrollUpHeight: number;

    /**  Observable for component destroyed. Used to clean up subscriptions. */
    private destroy$ = new Subject<boolean>();

    constructor() { }

    /**
     * On init life cycle hook
     */
    ngOnInit() {
       this.windowResize$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.pageSize = this.getPageSize();
            this.loadNeededItems();
        });
    }

    /**
     * After view init life cycle hook
     */
    ngAfterViewInit(): void {
        this.loadPageData();
        if (this.scrollUp) {
            setTimeout(() => {
                this.scrollListToBottom();
            });
        }
    }

    /**
     * On destroy life cycle hook
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Scroll to the bottom of the scroll height */
    scrollListToBottom() {
        this.listPaneElementRef.nativeElement.scrollTop = this.listPaneElementRef.nativeElement.scrollHeight;
    }

    /**
     * Process the scroll up event. Is fired when the list needs to load more items.
     */
    onScrollUp() {
        if (this.scrollUp) {
            this.loadingItems = true;
            this.loadPage.emit(this.pageSize);

            // Get current scroll height
            this.scrollUpHeight = this.listPaneElementRef.nativeElement.scrollHeight;
        }
    }

    /**
     * Resets the component
     */
    reset() {
        this.itemCount = 0;
        this.disableLoad = false;
        this.loadingItems = true;

        // Wait for next angular tick so loading has time to be shown
        setTimeout(() => {
            this.pageSize = this.getPageSize();
            this.loadNeededItems();
        });
    }

    /**
     * Process the scroll down event. Is fired when the list needs to load more items.
     */
    onScrollDown() {
        if (!this.scrollUp) {
            this.loadingItems = true;
            this.loadPage.emit(this.pageSize);
        }
    }

    /**
     * Returns the size a page of items should be.
     */
    private getPageSize(): number {
        const bufferSize = 2;
        const paneHeight = this.listPaneElementRef.nativeElement.offsetHeight;
        return Math.ceil((paneHeight / this.itemMinHeight) * bufferSize);
    }

    /**
     * Make sure the initial list is fully populated
     */
    private loadNeededItems() {
        // If items that is loaded is less then the new page size then try to load more items
        if (this.itemCount < this.pageSize && !this.loadingItems) {
            // Try to load more items
            this.loadingItems = true;
            this.loadPage.emit(this.pageSize);
        } else {
            this.loadingItems = false;
        }
    }

    /**
     * Load a page of data
     */
    private loadPageData() {
        this.loadingItems = true;
        this.pageSize = this.getPageSize();
        this.loadPage.emit(this.pageSize);
    }
}
