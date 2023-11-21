import { Policy } from './policy';
import { Observable,  of } from 'rxjs';
import { TimeoutLength } from './timeout-length.enum';
import { timeout, catchError } from 'rxjs/operators';

export class TimeoutPolicy<T> extends Policy<T> {

    constructor(private duration: TimeoutLength) {
        super();
    }

    /**
     * Returns an Observable that will timeout after the time determined by the TimeoutPolicy
     * @param governed Returns the Observable to be governed by the TimeoutPolicy
     */
    execute(governed: () => Observable<T>): Observable<T> {
        return governed().pipe(
            timeout(this.duration)
        );
    }
}
