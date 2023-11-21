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

import { ActivityNotificationConfig$v1 } from '../abstractions/activity-notification-config.v1';
import { ActivityNotificationSystemConfig$v1 } from '../abstractions/activity-notification-system-config.v1';
import { MonitorResponse$v1 } from '../abstractions/monitor-response.v1';

/**
 * Access Invitation related REST API
 */
export class ActivityDataAccessor$v1 {
  /** The http client to use to make REST calls */
  private http: HttpClient$v1;

  /** Url to api */
  private readonly apiUrl = '/api/commonIdentities/v1';

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
   * Gets monitoring data for licensing dashboard
   */
  getMonitoring$(
    capability?: string,
    includeTokens?: boolean
  ): Observable<MonitorResponse$v1[]> {
    const params = new URLSearchParams();

    if (capability) {
      params.append('capabilityId', capability);
    }

    if (includeTokens) {
      params.append('includeTokens', includeTokens.toString());
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/monitoring`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<MonitorResponse$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return response.result.map((item) => new MonitorResponse$v1(item));
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Gets system monitoring data
   */
  getSystemMonitoring$(
    tenantId?: string,
    capability?: string,
    includeTokens?: boolean
  ): Observable<MonitorResponse$v1[]> {
    const params = new URLSearchParams();

    if (tenantId) {
      params.append('tenantId', tenantId);
    }

    if (capability) {
      params.append('capabilityId', capability);
    }

    if (includeTokens) {
      params.append('includeTokens', includeTokens.toString());
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/systemMonitoring`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<MonitorResponse$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return response.result.map((item) => new MonitorResponse$v1(item));
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Gets the current tenant's Notification Configuration settings
   */
  getActivityNotifications$(): Observable<ActivityNotificationConfig$v1> {
    return this.http.get(`${this.baseUrl}/activityNotifications`).pipe(
      map((response: BaseResultResponse$v1<ActivityNotificationConfig$v1>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return new ActivityNotificationConfig$v1(response.result);
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of(new ActivityNotificationConfig$v1());
        }

        return this.catchError(err);
      })
    );
  }

  /**
   * Updates the current tenant's Notification Configuration settings
   */
  setActivityNotifications$(
    activityNotificationConfig: ActivityNotificationConfig$v1
  ): Observable<ActivityNotificationConfig$v1> {
    return this.http
      .put(`${this.baseUrl}/activityNotifications`, activityNotificationConfig)
      .pipe(
        map(
          (response: BaseResultResponse$v1<ActivityNotificationConfig$v1>) => {
            if (response.statusCode === HTTPCode$v1.Ok) {
              return new ActivityNotificationConfig$v1(response.result);
            }

            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        ),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Gets a specified tenant's Notification Configuration settings
   */
  getActivityNotificationsAdmin$(
    tenantId: string
  ): Observable<ActivityNotificationConfig$v1> {
    const params = new URLSearchParams();
    params.append('tenantId', tenantId);

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .get(`${this.baseUrl}/activityNotificationsAdmin`, httpOptions)
      .pipe(
        map(
          (response: BaseResultResponse$v1<ActivityNotificationConfig$v1>) => {
            if (response.statusCode === HTTPCode$v1.Ok) {
              return new ActivityNotificationConfig$v1(response.result);
            }

            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        ),
        catchError((err) => {
          if (err.status === HTTPCode$v1.NotFound) {
            return of(new ActivityNotificationConfig$v1());
          }

          return this.catchError(err);
        })
      );
  }

  /**
   * Updates a specified tenant's Notification Configuration settings
   */
  setActivityNotificationsAdmin$(
    tenantId: string,
    activityNotificationConfig: ActivityNotificationConfig$v1
  ): Observable<ActivityNotificationConfig$v1> {
    const params = new URLSearchParams();
    params.append('tenantId', tenantId);

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .put(
        `${this.baseUrl}/activityNotificationsAdmin`,
        {
          tenantContact: activityNotificationConfig.tenantContact,
          salesContact: activityNotificationConfig.salesContact,
        },
        httpOptions
      )
      .pipe(
        map(
          (response: BaseResultResponse$v1<ActivityNotificationConfig$v1>) => {
            if (response.statusCode === HTTPCode$v1.Ok) {
              return new ActivityNotificationConfig$v1(response.result);
            }

            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        ),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Gets the system's Notification Configuration settings
   */
  getSystemActivityNotifications$(): Observable<ActivityNotificationSystemConfig$v1> {
    return this.http.get(`${this.baseUrl}/systemActivityNotifications`).pipe(
      map(
        (
          response: BaseResultResponse$v1<ActivityNotificationSystemConfig$v1>
        ) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return new ActivityNotificationSystemConfig$v1(response.result);
          }

          throw new Error(`Unexpected response - ${response.statusCode}`);
        }
      ),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of(new ActivityNotificationSystemConfig$v1());
        }

        return this.catchError(err);
      })
    );
  }

  /**
   * Updates the system's Notification Configuration settings
   */
  setSystemActivityNotifications$(
    activityNotificationSystemConfig: ActivityNotificationSystemConfig$v1
  ): Observable<ActivityNotificationSystemConfig$v1> {
    return this.http
      .put(
        `${this.baseUrl}/systemActivityNotifications`,
        activityNotificationSystemConfig
      )
      .pipe(
        map(
          (
            response: BaseResultResponse$v1<ActivityNotificationSystemConfig$v1>
          ) => {
            if (response.statusCode === HTTPCode$v1.Ok) {
              return new ActivityNotificationSystemConfig$v1(response.result);
            }

            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        ),
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
