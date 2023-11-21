import { ServiceManager$v1 } from '@galileo/mobile_dynamic-injection-engine';
import type { Observable } from 'rxjs';
import { AuthenticationAppState, PostOffice$v1 } from "../common";

/** Root ref to adapter */
let adapter$v1: Adapter$v1;

/**
 * Get a reference to the root adapter
 * @returns Reference to the root adapter
 */
export function getAdapter$v1() {
  if (!adapter$v1) {
    adapter$v1 = new Adapter$v1();
  }

  return adapter$v1;
}

export class Adapter$v1 {

  /** State of the app's authentication */
  authenticationInit$: Observable<AuthenticationAppState>;

  /** Base url the app is currently using */
  baseUrl$: Observable<string | null>;

  constructor(
    private postOffice = ServiceManager$v1.get(PostOffice$v1)
  ) {
    this.authenticationInit$ = this.postOffice.authenticationInit$.asObservable();
    this.baseUrl$ = this.postOffice.baseUrl$.asObservable();
  }

  /**
   * Logs the user out of the app
   */
  logOut(): void {
    this.postOffice.logOut$.next();
  }
}

