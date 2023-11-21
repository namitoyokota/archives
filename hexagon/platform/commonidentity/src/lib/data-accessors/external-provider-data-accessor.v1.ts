import {
  BaseErrorResponse$v1,
  BaseResultResponse$v1,
  HttpClient$v1,
  HttpClientOptions$v1,
  HTTPCode$v1,
  TokenManager$v1,
  UrlHelper$v1,
} from '@galileo/platform_common-http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProviderConfiguration$v1 } from '../abstractions/provider-configuration.v1';

/**
 * External provider token related REST API
 */
export class ExternalProviderDataAccessor$v1 {
  /** The http client to use to make REST calls */
  private http: HttpClient$v1;

  /** Url to api */
  private readonly apiUrl = '/api/commonIdentities/v1/externalProviderConfiguration';

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
   * Make REST api call to get external provider configuration based on the provided ID, or all if this is not present.
   * @param id (optional) string
   */
  get$(id?: string): Observable<ProviderConfiguration$v1[]> {
    const params = new URLSearchParams();

    if (id) {
      params.append('id', id);
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(this.baseUrl, httpOptions).pipe(
      map((response: BaseResultResponse$v1<ProviderConfiguration$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return response.result.map((e) => new ProviderConfiguration$v1(e));
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        console.log('err', err);
        return this.catchError(err);
      })
    );
  }

  /**
   * Saves an external provider
   * @param provider The updated provider
   */
  save$(
    provider: ProviderConfiguration$v1
  ): Observable<ProviderConfiguration$v1> {
    // newIconFile is only used on the frontend
    delete provider.newIconFile;
    return this.http.put(this.baseUrl, provider).pipe(
      map((response: BaseResultResponse$v1<ProviderConfiguration$v1>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return new ProviderConfiguration$v1(response.result);
        }
        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of(null);
        }
        return this.catchError(err);
      })
    );
  }

  /**
   * Deletes specified external provider
   * @param configurationId Id of the external provider
   */
  delete$(configurationId: string): Observable<void> {
    return this.http
      .delete<boolean>(`${this.baseUrl}?id=${configurationId}`)
      .pipe(
        map((response: BaseResultResponse$v1<never>) => {
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
   * Uploads the icon for a tenant and updates the corresponding tenant
   * @param iconFile Icon to upload
   * @param configurationId Id of the external provider
   * tenant icon.
   */
  uploadIcon$(
    iconFile: File,
    configurationId: string
  ): Observable<ProviderConfiguration$v1> {
    const fd = new FormData();
    fd.append('file', iconFile);

    return this.http
      .post(`${this.baseUrl}Icon?configurationId=${configurationId}`, fd)
      .pipe(
        map((response: BaseResultResponse$v1<ProviderConfiguration$v1>) => {
          if (response.statusCode === HTTPCode$v1.Created) {
            return new ProviderConfiguration$v1(response.result);
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
