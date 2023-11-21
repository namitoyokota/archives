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

import { UserPersonalization$v1 } from '../abstractions/user-personalization.v1';

/**
 * Access personalization related REST API
 */
export class PersonalizationDataAccessor$v1 {
  /** The http client to use to make REST calls */
  private http: HttpClient$v1;

  /** Url to api */
  private readonly apiUrl = '/api/commonIdentities/v1/personalization';

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
   * Retrieves personalization settings for the given user and key. If not setting key is provided then all the personalization settings for the user is returned.
   * @param userId UserId to get personalization settings for
   * @param settingsKey Key used to filter on personalization settings
   * @returns A list of personalization setting or a specific setting
   */
  get$(
    userId: string,
    settingsKey: string = null
  ): Observable<UserPersonalization$v1 | UserPersonalization$v1[]> {
    const params = new URLSearchParams();
    params.append('userId', userId);

    if (settingsKey) {
      params.append('capabilityKey', settingsKey);
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(this.baseUrl, httpOptions).pipe(
      map(
        (
          response: BaseResultResponse$v1<
            UserPersonalization$v1 | UserPersonalization$v1[]
          >
        ) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            if (Array.isArray(response.result)) {
              return response.result.map(
                (setting) => new UserPersonalization$v1(setting)
              );
            }

            // No personalization found
            if (!response?.result?.userId) {
              return null;
            }

            return new UserPersonalization$v1({
              userId: response.result.userId,
              capabilityKey: response.result.capabilityKey,
              personalizationSettings: response.result.personalizationSettings,
            } as UserPersonalization$v1);
          }

          throw new Error(`Unexpected response - ${response.statusCode}`);
        }
      ),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of(null);
        }

        return this.catchError(err);
      })
    );
  }

  /**
   * Creates or updates user personalization settings
   * @param personalization The personalization settings to upsert
   */
  upsert$(personalization: UserPersonalization$v1): Observable<void> {
    return this.http.put(this.baseUrl, personalization).pipe(
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
   * Deletes the corresponding personalization settings
   * @param userId UserId to that owns the personalization settings
   * @param settingsKey Key used to filter on personalization settings
   */
  delete$(userId: string, settingsKey: string = null): Observable<void> {
    const params = new URLSearchParams();
    params.append('userId', userId);

    if (settingsKey) {
      params.append('capabilityKey', settingsKey);
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.delete(this.baseUrl, httpOptions).pipe(
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
