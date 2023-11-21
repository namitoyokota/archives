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

import { NotificationResponse$v1 } from '../abstractions/notification-criteria-response.v1';
import { NotificationSettings$v1 } from '../abstractions/notification-settings.v1';

/**
 * Notification Setting related REST API
 */
export class NotificationSettingDataAccessor$v1 {
    /** The http client to use to make REST calls */
    private http: HttpClient$v1;

    /** Url to api */
    private readonly apiUrl = 'api/commonNotifications/v1';

    /** Base URL for the api */
    private baseUrl = UrlHelper$v1.mapUrl(this.apiUrl);

    /**
     * Constructs a new Data Accessor $v1
     * @param tokenManager Manager for the access token
     * @param baseUrl Base URL to use. If not provide it will fallback to relative paths)
     */
    constructor(tokenManager: TokenManager$v1, baseUrl: string = null) {
        this.http = new HttpClient$v1(tokenManager);

        if (baseUrl) {
            this.baseUrl = `${baseUrl}${this.apiUrl}`;
        }
    }

    /**
     * Creates settings object
     * @param settings Settings to be created. Required.
     */
    create$(settings: NotificationSettings$v1): Observable<NotificationSettings$v1> {
        return this.http.post(this.baseUrl + '/settings', settings).pipe(
            map((response: BaseResultResponse$v1<NotificationSettings$v1>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return new NotificationSettings$v1(response.result);
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets all settings or settings object by preset name
     * @param preset The name of a settings preset. Optional.
     */
    get$(preset?: string): Observable<NotificationSettings$v1[]> {
        const params = new URLSearchParams();

        if (preset) {
            params.append('preset', preset);
        }

        const httpOptions: HttpClientOptions$v1 = new HttpClientOptions$v1({
            httpOptions: {
                params: params
            }
        } as HttpClientOptions$v1);

        return this.http.get(this.baseUrl + '/settings', httpOptions).pipe(
            map((response: BaseResultResponse$v1<NotificationSettings$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response.result.map(item => {
                        return new NotificationSettings$v1(item);
                    });
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Retrieves the system defined default preset
     */
    getDefault$(): Observable<NotificationSettings$v1> {
        return this.http.get(this.baseUrl + '/defaultSettings').pipe(
            map((response: BaseResultResponse$v1<NotificationSettings$v1>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return new NotificationSettings$v1(response.result);
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err: BaseErrorResponse$v1) => {
                if (err.statusCode === HTTPCode$v1.NotFound) {
                    return of(null);
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets default system defined settings.
     * This settings preset is not included in the getSettings call.
     * @param preset The name of a settings preset. Optional.
     */
    getSystemDefined$(preset?: string): Observable<NotificationSettings$v1[]> {
        const params = new URLSearchParams();

        if (preset) {
            params.append('preset', preset);
        }

        const httpOptions: HttpClientOptions$v1 = new HttpClientOptions$v1({
            httpOptions: {
                params: params
            }
        } as HttpClientOptions$v1);

        return this.http.get(this.baseUrl + '/systemDefinedSettings', httpOptions).pipe(
            map((response: BaseResultResponse$v1<NotificationSettings$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response.result.map(item => {
                        return new NotificationSettings$v1(item);
                    });
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Retrieves the system defined default preset
     */
    getSystemDefinedDefault$(): Observable<NotificationSettings$v1> {
        return this.http.get(this.baseUrl + '/systemDefinedDefault').pipe(
            map((response: BaseResultResponse$v1<NotificationSettings$v1>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return new NotificationSettings$v1(response.result);
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Updates a collection of notification settings documents.
     * @param settings Settings to be updated. Required.
     */
    update$(settings: NotificationSettings$v1[]): Observable<NotificationSettings$v1[]> {
        return this.http.put(this.baseUrl + '/bulkSettings', settings).pipe(
            map((response: BaseResultResponse$v1<NotificationResponse$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.MultiStatus) {
                    return response.result.map(x => {
                        return new NotificationSettings$v1(x.payload)
                    });
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Deletes settings
     * @param preset Name of settings to delete
     */
    delete$(preset: string): Observable<void> {
        const params = new URLSearchParams();
        params.append('preset', preset);

        const httpOptions: HttpClientOptions$v1 = new HttpClientOptions$v1({
            httpOptions: {
                params: params
            }
        } as HttpClientOptions$v1);

        return this.http.delete(this.baseUrl + '/settings', httpOptions).pipe(
            map((response: BaseResultResponse$v1<void>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return;
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
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
