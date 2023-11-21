import {
    BaseErrorResponse$v1,
    BaseResultResponse$v1,
    HttpClient$v1,
    HTTPCode$v1,
    TokenManager$v1,
    UrlHelper$v1,
} from '@galileo/platform_common-http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Tenant$v1 } from '../abstractions/tenant.v1';

/**
 * Jargon related REST API
 */
export class JargonDataAccessor$v1 {
    /** The http client to use to make REST calls */
    private http: HttpClient$v1;

    /** Url to api */
    private readonly apiUrl = '/api/commonTenants/v2';

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
     * Updates EnableJargon tenant property
     * @param tenant The updated tenant
     */
    update$(tenant: Tenant$v1): Observable<Tenant$v1> {
        return this.http.patch(`${this.baseUrl}/updateJargon`, tenant).pipe(
            map((response: BaseResultResponse$v1<Tenant$v1>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return new Tenant$v1(response.result);
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
