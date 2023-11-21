import { Policy } from './policy';
import { Observable,  of,  throwError as _throw,  timer } from 'rxjs';
import { retryWhen, catchError, mergeMap } from 'rxjs/operators';

export class RetryPolicy<T> extends Policy<T> {

    constructor(
        private maxRetryAttempts: number,
        private scalingDuration: number,
        private excludedStatusCodes: number[] = []) {
        super();
    }

    /**
     * Returns an Observable that will retry on error as described by the RetryPolicy
     * @param governed Returns the Observable to be governed by the RetryPolicy
     */
    execute(governed: () => Observable<T>): Observable<T> {
        return governed().pipe(
            retryWhen(this.createRetryStrategy(this.maxRetryAttempts, this.scalingDuration, this.excludedStatusCodes))
        );
    }

    private createRetryStrategy = (maxRetryAttempts: number, scalingDuration: number, excludedStatusCodes: number[]) =>
        (attempts: Observable<any>): Observable<any> => {
            return attempts.pipe(
                mergeMap((error, i) => {
                    const retryAttempt = i + 1;
                    if (retryAttempt > maxRetryAttempts || excludedStatusCodes.find(e => e === error.status)) {
                        return _throw(error);
                    }

                    const nextWait = retryAttempt * scalingDuration;
                    console.log(`Attempt ${retryAttempt}: retrying in ${nextWait}ms`);
                    return timer(nextWait);
                })
            );
        }
}
