/* eslint-disable @angular-eslint/no-host-metadata-property */
import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, VirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, Directive, ElementRef, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

interface Acc {
  /** Item index in the range */
  itemIndexesInRange: number[];

  /** The current offset */
  currentOffset: number;
}

export class VariableHeightVirtualScrollStrategy implements VirtualScrollStrategy {

  /** Bus for when scrolled index changes */
  scrolledIndexChange = new Subject<number>();

  /** Bus for when scrolled index changes */
  scrolledIndexChange$: Observable<number> = this.scrolledIndexChange.pipe(distinctUntilChanged());

  /** Ref to the cdk scroll viewport */
  private viewport?: CdkVirtualScrollViewport;

  constructor(private itemHeights: number[]) {}

  /**
   * Attache the scroll viewport
   */
  attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  /**
   * Detached the scroll viewport
   */
  detach(): void {
    this.scrolledIndexChange.complete();
    delete this.viewport;
  }

  /**
   * Update item heights
   * @param itemHeights Updated items heights
   */
  updateItemHeights(itemHeights: number[]): void {
    this.itemHeights = itemHeights;
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  /**
   * Event on content scrolled
   */
  onContentScrolled(): void {
    this.updateRenderedRange();
  }

  /**
   * Event on data length change
   */
  onDataLengthChanged(): void {
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  /**
   * Scroll to a specific index
   * @param index Index of item to scroll to
   * @param behavior Scroll behavior
   */
  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    this.viewport?.scrollToOffset(this.getItemOffset(index), behavior);
  }

  /** On content rendered event. Not Used. */
  onContentRendered(): void {}

  /** On rendered offset changed. Not Used. */
  onRenderedOffsetChanged(): void {}

  private intersects(a: [number, number], b: [number, number]): boolean {
    return (a[0] <= b[0] && b[0] <= a[1]) ||
    (a[0] <= b[1] && b[1] <= a[1]) ||
    (b[0] < a[0] && a[1] < b[1]);
  }

  private getItemOffset(index: number): number {
    return this.itemHeights.slice(0, index).reduce((acc, itemHeight) => acc + itemHeight, 0);
  }

  private getTotalContentSize(): number {
    let sum = 0;
    this.itemHeights.forEach(item => {
        sum += item;
    });
    return this.itemHeights.reduce((a, b) => a + b, 0);
  }

  private getListRangeAt(scrollOffset: number, viewportSize: number): ListRange {

    /** Tracking of indexes and offset */

    const visibleOffsetRange: [number, number] = [scrollOffset, scrollOffset + viewportSize];

    const itemsInRange = this.itemHeights.reduce<Acc>((acc, itemHeight, index) => {

      const itemOffsetRange: [number, number] = [acc.currentOffset, acc.currentOffset + itemHeight];

      return {
        currentOffset: acc.currentOffset + itemHeight,
        itemIndexesInRange: this.intersects(itemOffsetRange, visibleOffsetRange)
          ? [...acc.itemIndexesInRange, index]
          : acc.itemIndexesInRange
      };

    }, {itemIndexesInRange: [], currentOffset: 0}).itemIndexesInRange;

    const preBuffer = 5;
    const postBuffer = 5;

    return {
      start: this.clamp(0, (itemsInRange[0] ?? 0) - preBuffer, this.itemHeights.length - 1),
      end: this.clamp(0, (this.last(itemsInRange) ?? 0) + postBuffer, this.itemHeights.length)
    };
  }

  private updateRenderedRange() {
    if (!this.viewport) {
      return;
    }

    const viewportSize = this.viewport.getViewportSize();
    const scrollOffset = this.viewport.measureScrollOffset();
    const newRange = this.getListRangeAt(scrollOffset, viewportSize);
    const oldRange = this.viewport?.getRenderedRange();

    if (this.isEqual(newRange, oldRange)) {
      return;
    }

    this.viewport.setRenderedRange(newRange);
    this.viewport.setRenderedContentOffset(this.getItemOffset(newRange.start));
    this.scrolledIndexChange.next(newRange.start);
  }

  private updateTotalContentSize(): void {
    const contentSize = this.getTotalContentSize();
    this.viewport?.setTotalContentSize(contentSize);
  }

  private isEqual<T>(a: T, b: T): boolean {
    return a === b;
  }

  private clamp(min: number, value: number, max: number): number {
    return Math.min(Math.max(min, value), max);
  }

  private last<T>(value: T[]): T {
    return value[value.length - 1];
  }

}

/**
 * Factory function for creating variable height virtual scroll
 */
export function variableHeightScrollFactory(dir: VariableHeightVirtualScrollDirective) {
  return dir.scrollStrategy;
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'cdk-virtual-scroll-viewport[variableHeightVirtualScrollStrategy]',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useFactory: variableHeightScrollFactory,
    deps: [forwardRef(() => VariableHeightVirtualScrollDirective)]
  }],
  host: {
      '[style.width]': '"100%"',
      '[style.height]': '"100%"'
  }
})
export class VariableHeightVirtualScrollDirective implements OnChanges {

  /** Height of items in scroll pane*/
  @Input() itemHeights: number[] = [];

  /** Scroll strategy to use */
  scrollStrategy: VariableHeightVirtualScrollStrategy = new VariableHeightVirtualScrollStrategy(this.itemHeights);

  constructor(private elRef: ElementRef, private cdr: ChangeDetectorRef) {}

  /** On changes lifecycle hook */
  ngOnChanges(changes: SimpleChanges) {
    if ('itemHeights' in changes) {
      this.scrollStrategy.updateItemHeights(this.itemHeights);
      this.cdr.detectChanges();
    }
  }
}
