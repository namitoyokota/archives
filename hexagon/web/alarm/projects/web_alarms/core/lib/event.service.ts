import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
/**
 * Events that happens system wide for the capability
 */
export class EventService {

    /**
     * Bus for data is initializing event
     */
    private dataInitSub = new BehaviorSubject<boolean>(false);

    private dataIsReady = new BehaviorSubject<boolean>(false);

    /** Observable for when data is ready. */
    readonly dataReady$ = this.dataIsReady.asObservable().pipe(
        filter(isReady => isReady)
    );

    /**
     * Event that is raised when notifications establishes a connection and data must be reread
     */
    readonly dataInit$: Observable<boolean> = this.dataInitSub.asObservable().pipe(
        filter(isStarted => isStarted)
    );

    /**
     * Event when a minute has passed
     */
    readonly minuteTick$ = interval(60000);

    /**
     * Event that data is ready
     */
    dataReady() {
        this.dataIsReady.next(true);
    }

    /**
     * Event that data is initializing
     * @param boolean The init has started
     */
    dataInit() {
        this.dataInitSub.next(true);
    }
}
