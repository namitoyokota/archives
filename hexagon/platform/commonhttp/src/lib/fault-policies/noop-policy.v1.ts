import { Observable } from 'rxjs';

import { Policy$v1 } from './policy.v1';

export class NoopPolicy$v1 extends Policy$v1<void> {
  constructor() {
    super();
  }

  /**
   * Returns an Observable that performs no special operations
   * @param governed Returns the Observable to be governed by the NoopPolicy
   */
  execute(governed: () => Observable<void>): Observable<void> {
    return governed();
  }
}
