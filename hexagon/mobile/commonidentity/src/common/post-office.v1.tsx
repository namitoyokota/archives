import { BehaviorSubject, Subject } from "rxjs";

export enum AuthenticationAppState {
  /** The app is still starting up */
  pending,

  /** The user is authenticated and does not need to log in */
  authenticated,

  /** The user must authenticate before using the app */
  unauthenticated
}

export class PostOffice$v1 {

  /** State of the app's authentication */
  authenticationInit$ = new BehaviorSubject<AuthenticationAppState>(AuthenticationAppState.pending);

  /** The current base URL for the app */
  baseUrl$ = new BehaviorSubject<string | null>(null);

  /** Log out the user */
  logOut$ = new Subject<void>();
}
