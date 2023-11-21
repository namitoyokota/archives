import { TokenManager$v1 } from "@galileo/platform_common-http";
import { ServiceManager$v1 } from '@galileo/mobile_dynamic-injection-engine';

import { DataService } from "./data.service";
import { Subject, Subscription } from "rxjs";
import CookieManager from '@react-native-cookies/cookies';
import { AuthenticationAppState, capabilityId, PostOffice$v1 } from "../../common";
import { UserStore$v1 } from "@galileo/platform_commonidentity";
import { PersistentStorage$v1 } from "@galileo/mobile_commonlibraries";

export class AccessTokenService {

  /** Authorization cookie used to get an access token */
  private authCookie?: string;

  /** Subscription to access token expired */
  private tokenExpiredSub?: Subscription;

  /** Key used to check storage for auth cookie */
  private readonly storageKey = `${capabilityId}/authCookie/v1`;

  /** Current session has ended */
  private loggedOut = new Subject<void>();


  /** Current session has ended */
  loggedOut$ = this.loggedOut.asObservable();

  constructor(
    private tokenManager = ServiceManager$v1.get(TokenManager$v1),
    private dataSrv = ServiceManager$v1.get(DataService),
    private postOffice = ServiceManager$v1.get(PostOffice$v1),
    private userStore = ServiceManager$v1.get(UserStore$v1)
  ) {
    try {
      PersistentStorage$v1.get<string>(this.storageKey).then( cookie => {
        if (!cookie) {
          console.log('COOKIE NOT FOUND');
          this.logOut();
        } else {
          console.log('Cookie found');
          this.setAuthCookieAsync(cookie);
        }
      });
    } catch(e) {
      console.log('No Cookie found need to log in');
      this.logOut();
    }

    this.postOffice?.logOut$.subscribe(() => {
      this.logOut();
    });
  }

  /**
   * Returns the current auth cookie
   */
  getAuthCookie(): string {
    return this.authCookie as string;
  }

  /**
   * Sets the auth cookie
   */
  async setAuthCookieAsync(cookie: string) {
    this.authCookie = cookie;

    if (!cookie) {
      CookieManager.clearAll();
      this.authCookie = undefined;
      this.tokenManager.clearToken();
      return;
    }

    // Set cookie into storage
    try {
      await PersistentStorage$v1.set(this.storageKey, cookie);
    } catch(ex) {}

    // Get Access token
    const accessToken = await this.dataSrv?.accessToken?.get$(cookie).toPromise().catch( () => {
      return null;
    });

    if (!accessToken) {
      console.error('HxGN Connect:: Common Identity: Invalid access token.', accessToken);
      this.logOut();
      return;
    }

    this.tokenManager.setToken(accessToken.accessToken, accessToken.expiresIn);

    if (this.tokenExpiredSub) {
      try {
        this.tokenExpiredSub.unsubscribe();
        this.tokenExpiredSub = undefined;
      }catch(ex) {}
    }

    this.tokenExpiredSub = this.tokenManager.tokenExpired$.subscribe(async () => {
      const updatedToken = await this.dataSrv?.accessToken?.get$(cookie).toPromise().catch( () => {
        return null;
      });

      if (!updatedToken) {
        console.warn('HxGN Connect:: Common Identity: Invalid access token.', updatedToken);
        this.logOut();
      } else {
        this.tokenManager.setToken(updatedToken.accessToken, updatedToken.expiresIn);
      }
    });

    this.postOffice?.authenticationInit$.next(AuthenticationAppState.authenticated);
  }

  /**
   * Clears the current access token
   */
  clearAccessToken() {
    this.tokenManager.clearToken();
  }

  /**
   * Closes down the user's session
   */
  logOut(): void {
    const user = this.userStore.activeUserSnapshot();
    if (user) {
      this.dataSrv?.pat?.deleteUser$([this.userStore.activeUserSnapshot()?.refreshTokenId as string]).toPromise().catch(err => {
        console.warn('LOG OUT ERROR', err);
      });
    }

    CookieManager.clearAll();
    this.authCookie = undefined;
    this.tokenManager.clearToken();

    try {
      PersistentStorage$v1.removeItem(this.storageKey).then(() => {
        // Send out notification that the user is being logged out
        this.postOffice?.authenticationInit$.next(AuthenticationAppState.unauthenticated);
      });
    } catch(ex) {}

    this.loggedOut.next();

  }
}
