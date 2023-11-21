import { Observable } from 'rxjs';

export abstract class Policy$v1<T> {
  /**
   * Returns an Observable with an applied Policy
   * @param governed Returns the Observable to be governed by the Policy
   */
  abstract execute(governed: () => Observable<T>): Observable<T>;
}
