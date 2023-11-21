import { Policy } from './policy';
import { Observable } from 'rxjs';
import { TimeoutLength } from './timeout-length.enum';

export class NoopPolicy<T> extends Policy<T> {
    constructor() {
        super();
    }

    /**
     * Returns an Observable that performs no special operations
     * @param governed Returns the Observable to be governed by the NoopPolicy
     */
    execute(governed: () => Observable<T>): Observable<T> {
        return governed();
    }
}
