import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';

/**
 * Provides a store and a timer to manage the access token.
 * When the token has 5 mins or less time left on its lifetime it will event that a new token is needed.
 */
export class TokenManager$v1 {
  /** Store for authentication token */
  private readonly authenticationToken = new BehaviorSubject<string>(null);

  /** The authentication token that is currently active */
  readonly authenticationToken$ = this.authenticationToken.asObservable();

  /** Event the token has expired */
  private readonly tokenExpired = new Subject<void>();

  /** Event the token has expired */
  readonly tokenExpired$ = this.tokenExpired.asObservable();

  /** How long before the token expires in seconds. */
  private readonly refreshWindow = 300; // 5 mins

  /** Subscription to timer */
  private timerSub: Subscription;

  /**
   * Sets the active bearer token.
   * @param token The bearer token to use to access rest api
   * @param expiresIn The lifetime left on the token
   */
  setToken(token: string, expiresIn: number): void {
    if (!token || !expiresIn) {
      throw console.error(
        '@galileo/platform-http: Token and expiresIn cannot be null'
      );
    }

    if (this.isTokenStale(expiresIn)) {
      this.tokenExpired.next();
      return;
    }

    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = null;
    }

    this.timerSub = timer((expiresIn - this.refreshWindow) * 1000).subscribe(
      () => {
        this.tokenExpired.next();
      }
    );

    this.authenticationToken.next(token);
  }

  /**
   * Clears the active bearer token
   */
  clearToken(): void {
    this.authenticationToken.next(null);
  }

  /**
   * Checks if the token is about to expire.
   * @param expiresIn How long in seconds until the token expires.
   */
  private isTokenStale(expiresIn: number): boolean {
    return expiresIn - this.refreshWindow < 10;
  }
}
