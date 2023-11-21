import { BehaviorSubject, interval, Subject, Subscription, timer } from 'rxjs';

/** How long to debounce for */
enum ThrottleLimits {
  low = 200,
  med = 600,
  high = 900,
}

export class DebounceDataManager$v1<T> {
  /** How long to wait between items */
  private windowTime = ThrottleLimits.med;

  /** Max time to wait to make a data call */
  private readonly maxTime = 2500;

  /** List of items to debounce */
  private list = new BehaviorSubject<T[]>(null);

  /** Bus for list of items that was debounced */
  private debounced = new Subject<T[]>();

  /** List of items that was debounced */
  readonly debounced$ = this.debounced.asObservable();

  /** Ref to max timer */
  private maxTimer: Subscription;

  /** Ref to window timer */
  private windowTimer: Subscription;

  /** The current throttle rate */
  private throttleCount = 0;

  constructor() {
    const lowerLimit = 20;
    const upperLimit = 29;
    const throttleCheckTime = 60000;

    // Try to keep the max number of items debounced less than 30 using
    // lowest throttle times as possible.
    interval(throttleCheckTime).subscribe(() => {
      if (this.throttleCount < lowerLimit) {
        if (this.windowTime === ThrottleLimits.high) {
          this.windowTime = ThrottleLimits.med;
        } else if (this.windowTime === ThrottleLimits.med) {
          this.windowTime = ThrottleLimits.low;
        }
      } else if (this.throttleCount > upperLimit) {
        if (this.windowTime === ThrottleLimits.low) {
          this.windowTime = ThrottleLimits.med;
        } else if (this.windowTime === ThrottleLimits.med) {
          this.windowTime = ThrottleLimits.high;
        }
      }

      this.throttleCount = 0;
    });
  }

  /** Debounce item */
  debounce(item: T): void {
    if (!item) {
      return;
    }

    let list = this.list.getValue();

    if (!list) {
      list = [];
      // Start max debounce timer
      this.maxTimer = timer(this.maxTime).subscribe(() => {
        const debounceList = this.list.getValue();
        if (debounceList?.length) {
          this.throttleCount += 1;
          this.debounced.next(debounceList);
        }
        this.list.next(null);
      });
    }

    list = [...list, item];
    this.list.next(list);

    if (this.windowTimer) {
      this.windowTimer.unsubscribe();
      this.windowTimer = null;
    }

    // Start window debounce timer
    this.windowTimer = timer(this.windowTime).subscribe(() => {
      this.maxTimer.unsubscribe();
      this.maxTimer = null;
      const debounceList = this.list.getValue();
      if (debounceList?.length) {
        this.throttleCount += 1;
        this.debounced.next(debounceList);
      }
      this.list.next(null);
    });
  }
}
