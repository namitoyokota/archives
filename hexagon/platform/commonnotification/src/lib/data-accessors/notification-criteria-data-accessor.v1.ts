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

import { NotificationResponse$v1 } from '../abstractions/notification-criteria-response.v1';
import { NotificationCriteria$v1 } from '../abstractions/notification-criteria.v1';

/**
 * Notification Criteria related REST API
 */
export class NotificationCriteriaDataAccessor$v1 {
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
     * Retrieves a collection of notification criteria
     * @param capabilityId The capability to which the criteria apply. Required.
     * @param preset The name of a collection of criteria. Optional.
     * @param notificationType Used to filter criteria down to specific types of notification. Optional.
     * @param notificationSubtype Used to filter criteria down to specific subtypes of notification. Optional.
     */
    get$(
        capabilityId: string, preset?: string,
        notificationType?: string[], notificationSubtype?: string[]
    ): Observable<NotificationCriteria$v1[]> {
        const params = new URLSearchParams();
        params.append('capabilityId', capabilityId);

        if (preset) {
            params.append('preset', preset);
        }

        if (notificationType) {
            notificationType.forEach(type => {
                params.append('notificationType', type);
            });
        }

        if (notificationSubtype) {
            notificationSubtype.forEach(type => {
                params.append('notificationType', type);
            });
        }

        const httpOptions: HttpClientOptions$v1 = new HttpClientOptions$v1({
            httpOptions: {
                params: params
            }
        } as HttpClientOptions$v1);

        return this.http.get(this.baseUrl + '/criteria', httpOptions).pipe(
            map((response: BaseResultResponse$v1<NotificationCriteria$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response.result.map(item => {
                        return new NotificationCriteria$v1(item);
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
     * Updates criteria object
     * @param criteria Criteria to be updated. Required.
     */
    update$(criteria: NotificationCriteria$v1[]): Observable<NotificationCriteria$v1[]> {
        return this.http.put(this.baseUrl + '/criteria', criteria).pipe(
            map((response: BaseResultResponse$v1<NotificationResponse$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.MultiStatus) {
                    return response.result.map(criteria => {
                        return new NotificationCriteria$v1(criteria.payload);
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
