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

import { SharingCriteria$v1 } from '../abstractions/sharing-criteria.v1';

/**
 * Sharing Criteria related REST API
 */
export class SharingCriteriaDataAccessor$v1 {
    /** The http client to use to make REST calls */
    private http: HttpClient$v1;

    /** Url to api */
    private readonly apiUrl = 'api/commonTenants/dataSharing/v1/capabilities/dataAccess';

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
     * Creates new sharing criteria
     * @param criteria The sharing criteria to add. Can be a single sharing criteria or a list
     */
    create$(criteria: SharingCriteria$v1<string, string> | SharingCriteria$v1<string, string>[]): Observable<SharingCriteria$v1<string, string>[]> {
        let sharingList = [];

        if (!Array.isArray(criteria)) {
            sharingList = [criteria];
        } else {
            sharingList = criteria;
        }

        return this.http.put(`${this.baseUrl}/share`, sharingList).pipe(
            map((response: BaseResultResponse$v1<SharingCriteria$v1<string, string>[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response?.result?.map(r => {
                        return new SharingCriteria$v1<string, string>(r);
                    });
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
     * Retrieves sharing criteria info for a particular sharer
     */
    get$(): Observable<SharingCriteria$v1<string, string>[]> {
        return this.http.get(`${this.baseUrl}`).pipe(
            map((response: BaseResultResponse$v1<SharingCriteria$v1<string, string>[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {

                    return response?.result?.map(r => new SharingCriteria$v1<string, string>(r));
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
     * Retrieves the list of tenant IDs with which the caller's tenant is sharing.
     */
    getShareeIds$(): Observable<string[]> {
        return this.http.get(`${this.baseUrl}/shareeTenants`).pipe(
            map((response: BaseResultResponse$v1<string[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response.result;
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
     * Retrieves a mapping of capabilities to tenant IDs. Each corresponding tenant is
     * currently sharing the capability with the caller.
     */
    getMap$(): Observable<Map<string, string[]>> {
        return this.http.get(`${this.baseUrl}/map`).pipe(
            map((response: BaseResultResponse$v1<any>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    const m = new Map<string, string[]>();
                    for (const property in response.result.capabilities) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (response.result.capabilities.hasOwnProperty(property)) {
                            m.set(property, response.result.capabilities[property]);
                        }
                    }
                    return m;
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.status === HTTPCode$v1.NotFound) {
                    return of(new Map<string, string[]>());
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Updates sharing criteria.
     * @param criteria The criteria to update
     */
    update$(criteria: SharingCriteria$v1<string, string>[]): Observable<SharingCriteria$v1<string, string>[]> {
        return this.http.put(`${this.baseUrl}`, criteria).pipe(
            map((response: BaseResultResponse$v1<SharingCriteria$v1<string, string>[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    const update = criteria.map(c => new SharingCriteria$v1<string, string>(c));
                    for (let i = 0; i < update.length; i++) {
                        update[i].etag = response.result[i].etag;
                    }
                    return update;
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
     * Deletes sharing criteria
     * @param id Sharing criteria ids to be delete
     */
    delete$(ids: string[]): Observable<void> {
        return this.http.put(`${this.baseUrl}/stopSharing`, ids).pipe(
            map((response: BaseResultResponse$v1<void>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return;
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
        if (err.error) {
            return throwError(err.error);
        } else if (err.status) {
            return throwError({
                statusCode: err.status,
                errors: [err.message],
                errorId: null
            } as BaseErrorResponse$v1);
        } else {
            return throwError({
                statusCode: null,
                errors: [err],
                errorId: null
            } as BaseErrorResponse$v1);
        }
    }
}
