import {
  BaseErrorResponse$v1,
  BaseResultResponse$v1,
  HttpClient$v1,
  HttpClientOptions$v1,
  HTTPCode$v1,
  TokenManager$v1,
  UrlHelper$v1,
} from '@galileo/platform_common-http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AccessTokenRequest } from '../abstractions/access-token-request.v1';

/**
 * Access token related REST API
 */
export class AccessTokenDataAccessor$v1 {
  /** The http client to use to make REST calls */
  private http: HttpClient$v1;

  /** Url to api */
  private readonly apiUrl = '/api/commonWebRoot/accessTokens/v1';

  /** Base URL for the api */
  private baseUrl = UrlHelper$v1.mapUrl(this.apiUrl);

  /**
   * Constructs a new Data Accessor $v1
   * @param tokenManager Manager for the access token
   * @param baseUrl Base URL to use. If not provide it will fallback to relative paths
   */
  constructor(tokenManager: TokenManager$v1, baseUrl: string = null) {
    this.http = new HttpClient$v1(tokenManager);

    if (baseUrl) {
      this.baseUrl = `${baseUrl}${this.apiUrl}`;
    }
  }

  /**
   * Make REST api call to get an access token.
   * @param authCookie Optional authentication cookie used to get access token
   */
  get$(authCookie?: string): Observable<AccessTokenRequest> {

    let header = null;
    if (authCookie) {
      header = {
        Cookie: `Authentication.Session=${authCookie}`
      }
    }

    const options = new HttpClientOptions$v1({
      useStandardAuthentication: false,
      httpOptions: {
        withCredentials: true,
        headers: header
      },
    } as HttpClientOptions$v1);


    return this.http.get(this.baseUrl, options).pipe(
      map((response: BaseResultResponse$v1<AccessTokenRequest>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return response.result;
        } else {
          console.warn(
            'Unknown response; getAccessToken(); ' + response.statusCode
          );
          return null;
        }
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Process errors
   * @param err Error object
   */
  private catchError(err) {
    if (err?.statusCode && err?.errors) {
      return throwError(err);
    } else if (err.status) {
      return throwError({
        statusCode: err.status,
        errors: [err.message],
        errorId: null,
      } as BaseErrorResponse$v1);
    } else {
      return throwError({
        statusCode: null,
        errors: [err],
        errorId: null,
      } as BaseErrorResponse$v1);
    }
  }
}
