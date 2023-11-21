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
import { ChangelogDescriptor$v1 } from '@galileo/platform_commonidentity'
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CapabilityManifest$v1 } from '../abstractions/capability-manifest.v1';
import { Changelog$v1 } from '../abstractions/changelog.v1';
import { OptInResponse$v1 } from '../abstractions/opt-in-response.v1';
import { Tenant$v1 } from '../abstractions/tenant.v1';

/**
 * Data Sharing related REST API
 */
export class DataSharingDataAccessor$v1 {
    /** The http client to use to make REST calls */
    private http: HttpClient$v1;

    /** Url to api */
    private readonly apiUrl = 'api/commonTenants/dataSharing/v1';

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
     * Retrieves information about the tenants that have chosen to opt-in as sharees
     */
    getSharees$(): Observable<Tenant$v1[]> {
        return this.http.get(`${this.baseUrl}/optInInfo`).pipe(
            map((response: BaseResultResponse$v1<OptInResponse$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    if (response?.result?.length) {
                        return response.result.map(r => {
                            return new Tenant$v1({
                                id: r.shareeTenantId,
                                name: r.tenantName,
                                city: r.city,
                                state: r.state,
                                country: r.country,
                                tenantIconUrl: r.tenantIconUrl,
                                industryIds: [].concat(r.industryIds)
                            } as Tenant$v1);
                        });
                    }

                    return [];
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
     * Retrieves the list of capability manifests.
     * @param includeUnlicensed A flag that is true if unlicensed capabilities should be loaded
     */
    getCapabilityManifests$(includeUnlicensed = false): Observable<CapabilityManifest$v1[]> {
        let options: HttpClientOptions$v1 = new HttpClientOptions$v1();

        if (includeUnlicensed) {
            const params = new URLSearchParams();
            params.append('includeUnlicensed', 'true');

            options = new HttpClientOptions$v1({
                httpOptions: {
                    params: params
                }
            } as HttpClientOptions$v1);
        }

        return this.http.get(`${this.baseUrl}/capabilities`, options).pipe(
            map((response: BaseResultResponse$v1<CapabilityManifest$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    if (response.result) {
                        return response.result.map(r => new CapabilityManifest$v1(r));
                    }
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
     * Retrieves the list of capability operations for which the tenant is licensed.
     */
    getLicensedOperations$(): Observable<Map<string, string[]>> {
        return this.http.get(`${this.baseUrl}/capabilities/licensedOperations`).pipe(
            map((response: BaseResultResponse$v1<any>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    const m = new Map<string, string[]>();
                    for (const property in response.result.capabilityOperations) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (response.result.capabilityOperations.hasOwnProperty(property)) {
                            m.set(property, response.result.capabilityOperations[property]);
                        }
                    }
                    return m;
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
     * Get data sharing changelogs
     */
    getTimeline$(
        descriptor: ChangelogDescriptor$v1,
        entityType?: string,
        actorUserId?: string,
        startTime?: string,
        endTime?: string
    ): Observable<Map<string, Changelog$v1[]>> {
        const params = new URLSearchParams();

        if (entityType) {
            params.append('filter_entityType', entityType);
        }

        if (actorUserId) {
            params.append('filter_actorUserId', actorUserId);
        }

        if (startTime) {
            params.append('filter_endTime', startTime);
        }

        if (endTime) {
            descriptor.changeRecordCreationTime = endTime;
        }

        const options: HttpClientOptions$v1 = new HttpClientOptions$v1({
            httpOptions: {
                params: params
            }
        } as HttpClientOptions$v1);

        return this.http.put(`${this.baseUrl}/timeline`, [descriptor], options).pipe(
            map((response: BaseResultResponse$v1<PageResponse$v1<Changelog$v1[]>>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return new Map<string, Changelog$v1[]>([[
                        response.result.continuationToken,
                        response.result.page.map(log => {
                            return new Changelog$v1(log)
                        })
                    ]]);
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
