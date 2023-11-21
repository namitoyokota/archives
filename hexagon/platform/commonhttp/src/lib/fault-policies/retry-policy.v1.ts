/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

import { Policy$v1 } from './policy.v1';

export class RetryPolicy$v1 extends Policy$v1<unknown> {
  constructor(
    private maxRetryAttempts: number,
    private scalingDuration: number,
    private excludedStatusCodes: number[] = []
  ) {
    super();
  }

  /**
   * Returns an Observable that will retry on error as described by the RetryPolicy
   * @param governed Returns the Observable to be governed by the RetryPolicy
   */
  execute(governed: () => Observable<unknown>): Observable<unknown> {
    return governed().pipe(
      retryWhen(
        this.createRetryStrategy(
          this.maxRetryAttempts,
          this.scalingDuration,
          this.excludedStatusCodes
        )
      )
    );
  }

  private createRetryStrategy =
    (
      maxRetryAttempts: number,
      scalingDuration: number,
      excludedStatusCodes: number[]
    ) =>
    (attempts: Observable<any>): Observable<any> => {
      return attempts.pipe(
        mergeMap((error, i) => {
          const retryAttempt = i + 1;
          if (
            retryAttempt > maxRetryAttempts ||
            excludedStatusCodes.find((e) => e === error.status)
          ) {
            return throwError(error);
          }
          const nextWait = retryAttempt * scalingDuration;
          return timer(nextWait);
        })
      );
    };
}
