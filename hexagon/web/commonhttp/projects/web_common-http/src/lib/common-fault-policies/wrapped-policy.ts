import { Policy } from './policy';
import { Observable } from 'rxjs';

export class WrappedPolicy<T> extends Policy<T> {
    constructor(private outer: Policy<T>, private inner: Policy<T>) {
        super();
    }

    /**
     * Returns an Observable with multiple Policies applied to it
     * @param governed Returns the Observable to be governed by the WrappedPolicy
     */
    execute(governed: () => Observable<T>): Observable<T> {
        return this.outer.execute(() => this.inner.execute(governed));
    }
}
