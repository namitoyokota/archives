import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';


@Injectable()
/**
 * Events that happens system wide for the capability
 */
export class EventService {

    /** Bus for data ready event*/
    private dataReadySub = new BehaviorSubject<boolean>(false);

    /**
     * Bus for data is initializing event
     */
    private dataInitSub = new BehaviorSubject<boolean>(false);

    /**
     * Event that is raised when notifications and data is ready for processing
     */
    readonly dataReady$: Observable<boolean> = this.dataReadySub.asObservable().pipe(
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
     * @param boolean The data that is ready
     */
    dataReady() {
        this.dataReadySub.next(true);
    }

    /**
     * Event that data is initializing
     * @param boolean The init has started
     */
    dataInit() {
        this.dataInitSub.next(true);
    }
}
