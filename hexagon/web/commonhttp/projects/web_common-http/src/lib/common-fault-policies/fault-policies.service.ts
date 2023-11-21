import { Injectable } from '@angular/core';
import { TimeoutLength } from './timeout-length.enum';
import { RetryPolicy } from './retry-policy';
import { TimeoutPolicy } from './timeout-policy';
import { Policy } from './policy';
import { WrappedPolicy } from './wrapped-policy';
import { NoopPolicy } from './noop-policy';

@Injectable()
export class CommonFaultPoliciesService {
    // TODO:  Use the ConfigurationService instead once it exists
    private _enabled = true;

    constructor() { }

    /**
     * Creates a TimeoutPolicy to use with an Observable if this service is enabled
     * @param duration The length of the timeout policy
     */
    createTimeoutPolicy(duration: TimeoutLength) {
        if (this._enabled) {
            return new TimeoutPolicy(duration);
        } else {
            return new NoopPolicy();
        }
    }

    /**
     * Creates a RetryPolicy to use with an Observable if this service is enabled
     * @param maxRetryAttempts Maximum number of times to retry listening to the Observable
     * @param scalingDuration The amount of time to scale the wait timer by on failure
     * @param excludedStatusCodes List of error codes to not retry on
     */
    createRetryPolicy(maxRetryAttempts: number, scalingDuration: number, excludedStatusCodes: number[] = []) {
        if (this._enabled) {
            return new RetryPolicy(maxRetryAttempts, scalingDuration, excludedStatusCodes);
        } else {
            return new NoopPolicy();
        }
    }

    /**
     * Creates a WrappedPolicy to use with an Observable if this service is enabled
     * @param outer The second Policy to be applied to the Observable
     * @param inner The first Policy to be applied to the Observable
     */
    createWrappedPolicy<T>(outer: Policy<T>, inner: Policy<T>) {
        if (this._enabled) {
            return new WrappedPolicy(outer, inner);
        } else {
            return new NoopPolicy();
        }
    }
}
