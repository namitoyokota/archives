import {
  BaseErrorResponse$v1,
  BaseResultResponse$v1,
  HttpClient$v1,
  HttpClientOptions$v1,
  HTTPCode$v1,
  PageResponse$v1,
  TokenManager$v1,
  UrlHelper$v1,
} from '@galileo/platform_common-http';
import { DescriptorList$v1 } from '@galileo/platform_common-libraries';
import { getName } from 'country-list';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PatDefinition$v1 } from '../abstractions/pat-definition.v1';
import { Token$v1 } from '../abstractions/token.v1';

/**
 * Access token group related REST API
 */
export class PersonalAccessTokenDataAccessor$v1 {
  /** The http client to use to make REST calls */
  private http: HttpClient$v1;

  /** Url to api */
  private readonly apiUrl = '/api/commonIdentities/v1';

  /** Base URL for the api */
  private baseUrl = UrlHelper$v1.mapUrl(this.apiUrl);

  /** List of locations cache. Denoted by <IP, country>
   * TODO - NEED TO REMOVE THIS. THERE SHOULD BE NO CACHE IN THE DATA ACCESSOR
   */
  locations = new Map<string, string>();

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
   * Retrieves a list of personal access tokens
   * @returns PAT
   */
  get$(): Observable<Token$v1[]> {
    return this.http.get(`${this.baseUrl}/personalAccessTokens`).pipe(
      map((response: BaseResultResponse$v1<Token$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          if (response?.result?.length) {
            return response.result.map((tokenResponse) => {
              const token = new Token$v1(tokenResponse);
              token.expiration = this.getExpiration(
                token.lifetime,
                token.creationTime
              );
              return token;
            });
          } else {
            return [];
          }
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of([]);
        }
        return this.catchError(err);
      })
    );
  }

  /**
   * Create a personal access token
   * @param name Name of PAT
   * @param lifeTime How long the PAT should live
   * @param patDefIds Def ids
   * @returns
   */
  create$(
    name: string,
    lifeTime: number,
    patDefIds: string[]
  ): Observable<string> {
    return this.http
      .post(`${this.baseUrl}/personalAccessTokens`, {
        name: name,
        lifetime: lifeTime,
        patDefinitionIds: patDefIds,
      })
      .pipe(
        map((response: BaseResultResponse$v1<string>) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return response.result;
          } else {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Revoke specified tokens
   * @param tokenIds Ids of tokens to revoke
   */
  revoke$(tokenIds: string[]): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/personalAccessTokens/revoke`, tokenIds)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return;
          } else {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Delete specified tokens
   * @param tokenIds Ids of tokens to delete
   */
  delete$(tokenIds: string[]): Observable<void> {
    const params = new URLSearchParams();

    if (tokenIds) {
      tokenIds.forEach((id) => {
        params.append('id', id);
      });
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .delete(`${this.baseUrl}/personalAccessTokens`, httpOptions)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return;
          } else {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Delete an access token for the users.
   */
  deleteUser$(tokenIds: string[]): Observable<void> {
    const params = new URLSearchParams();

    if (tokenIds) {
      tokenIds.forEach((id) => {
        params.append('id', id);
      });
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .delete(`${this.baseUrl}/userAccessTokens`, httpOptions)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return;
          } else {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Retrieves a list of personal access token definitions
   */
  getDefinitions$(): Observable<PatDefinition$v1[]> {
    return this.http
      .get(`${this.baseUrl}/personalAccessTokens/definitions`)
      .pipe(
        map((response: BaseResultResponse$v1<PatDefinition$v1[]>) => {
          if (response.statusCode !== HTTPCode$v1.Ok) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }

          return response.result.map((pat) => new PatDefinition$v1(pat));
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /** Gets country isoCode based on ip address. */
  getLocation$(ipAddress: string): Observable<string> {
    if (this.locations.has(ipAddress)) {
      return of(this.locations.get(ipAddress)); // Need to add store and helper pattern to pull this out
    } else {
      const params = new URLSearchParams();
      params.append('ipAddress', ipAddress);

      const httpOptions = new HttpClientOptions$v1({
        httpOptions: {
          params: params,
        },
      } as HttpClientOptions$v1);

      return this.http.get(`${this.baseUrl}/location`, httpOptions).pipe(
        // TODO - Need to find the real type that this is returning
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((response: any) => {
          if (response.countryRegion?.isoCode) {
            const country = getName(response.countryRegion.isoCode);
            this.locations.set(ipAddress, country);
            return country;
          } else {
            const noCountry = 'N/A'; // TODO - Update this not to be hard coded
            this.locations.set(ipAddress, noCountry);
            return noCountry;
          }
        }),
        catchError((err) => {
          if (err.status === HTTPCode$v1.NotFound) {
            return of(null);
          }
          return this.catchError(err);
        })
      );
    }
  }

  /**
   * Supports "Away mode" by updating a user's session token to reflect a locked status.
   */
  lockSession$(): Observable<void> {
    return this.http.get(`${this.baseUrl}/userAccessTokens/lockSession`).pipe(
      map((response: BaseResultResponse$v1<void>) => {
        if (response.statusCode !== HTTPCode$v1.Ok) {
          throw new Error(`Unexpected response - ${response.statusCode}`);
        }
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Get an access token from a PAT
   */
  getTokenFromPAT$(baseUrl: string, pat: string): Observable<string> {
    const formData = new FormData();
    formData.append('refresh_token', pat);
    const options = new HttpClientOptions$v1({
      useStandardAuthentication: false,
    } as HttpClientOptions$v1);
    return this.http
      .post(`${baseUrl}/api/commonIdentities/v1/accessToken`, formData, options)
      .pipe(
        // TODO - need to look at why type of response object is really returned from this call
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((response: any) => {
          return response.access_token;
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Get list of PATs.
   */
  list$(descriptors: DescriptorList$v1[]): Observable<Token$v1[]> {
    return new Observable((subscriber) => {
      const getPATPage = (
        desc: DescriptorList$v1[],
        cToken: string,
        tList: Token$v1[]
      ) => {
        this.listPage$(descriptors, cToken).subscribe(
          ([accessTokens, token]) => {
            tList = tList.concat(accessTokens);
            if (token) {
              getPATPage(desc, token, tList);
            } else {
              subscriber.next(tList);
              subscriber.complete();
            }
          }
        );
      };

      getPATPage(descriptors, null, []);
    });
  }

  private listPage$(
    descriptors: DescriptorList$v1[],
    continuationToken: string = null
  ): Observable<[Token$v1[], string]> {
    return this.http
      .put(`${this.baseUrl}/personalAccessTokens/descriptors`, {
        descriptors,
        pageSize: 100,
        continuationToken,
      })
      .pipe(
        map((response: BaseResultResponse$v1<PageResponse$v1<Token$v1[]>>) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return [
              response.result?.page.map((r) => {
                const token = new Token$v1(r);
                token.tombstoned = true;
                return token;
              }),
              response.result.continuationToken,
            ];
          }

          throw new Error(`Unexpected response - ${response.statusCode}`);
        }),
        catchError((err: BaseErrorResponse$v1) => {
          if (
            err.statusCode === HTTPCode$v1.NotFound ||
            err.statusCode === HTTPCode$v1.Unauthorized
          ) {
            return of(null);
          }
          return this.catchError(err);
        })
      );
  }

  /** Sets token expiration date. */
  private getExpiration(lifetime: number, creationTime: string): string {
    const creationDate = new Date(creationTime);
    const expiration = new Date(
      creationDate.setSeconds(creationDate.getSeconds() + lifetime)
    ).toString();
    return expiration;
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
