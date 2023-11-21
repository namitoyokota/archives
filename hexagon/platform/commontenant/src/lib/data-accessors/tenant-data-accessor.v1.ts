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

import { Application$v1 } from '../abstractions/application.v1';
import { Changelog$v1 } from '../abstractions/changelog.v1';
import { Industries$v1 } from '../abstractions/industries.v1';
import { Tenant$v1 } from '../abstractions/tenant.v1';

/**
 * Tenant related REST API
 */
export class TenantDataAccessor$v1 {
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
     * Make REST api call to create a tenant.
     * @param tenant The tenant to create
     */
    create$(tenant: Tenant$v1): Observable<Tenant$v1> {
        return this.http.post(`${this.baseUrl}`, tenant).pipe(
            map((response: BaseResultResponse$v1<Tenant$v1>) => {
                if (response.statusCode !== HTTPCode$v1.Created) {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                } else {
                    return new Tenant$v1(response.result);
                }
            }),
            catchError((err) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Returns a specific tenant
     * @param id The id of the tenant to return
     */
    get$(id: string): Observable<Tenant$v1> {
        return this.http.get(`${this.baseUrl}/${id}`).pipe(
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
    * Returns a specific tenant based on the input access token
    * @param accessToken The access token used to set authorization
    */
    getFromAccessToken$(baseUrl: string, accessToken: string): Observable<Tenant$v1> {
        let header = null;
        header = {
            Authorization: `Bearer ${accessToken}`,
        }

        const options = new HttpClientOptions$v1({
            useStandardAuthentication: false,
            httpOptions: {
                headers: header
            }
        } as HttpClientOptions$v1);

        return this.http.get(`${baseUrl}/current`, options).pipe(
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
     * Retrieves the caller's tenants
     */
    getUserTenants$(): Observable<Tenant$v1[]> {
        return this.http.get(`${this.baseUrl}/tenants`).pipe(
            map((response: BaseResultResponse$v1<Tenant$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    if (!response.result) {
                        return [];
                    }

                    return response.result.map(r => {
                        return new Tenant$v1(r);
                    });
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            })
        );
    }

    /**
     * Returns a list of tenants.
     */
    getList$(): Observable<Tenant$v1[]> {
        return new Observable(observer => {

            const request = async () => {
                let continuationToken: string;
                do {
                    const result = await this.getTenantPage$(continuationToken).toPromise();
                    const tenants: Tenant$v1[] = result.page.map((tenant) => {
                        return new Tenant$v1(tenant);
                    });
                    observer.next(tenants);
                    continuationToken = result.continuationToken;
                } while (continuationToken);
                observer.complete();
            };

            request();
        });
    }

    /**
     * Gets a page of tenant data
     * @param continuationToken Token used to get next page of data
     */
    private getTenantPage$(continuationToken: string = null): Observable<PageResponse$v1<Tenant$v1[]>> {
        const params = new URLSearchParams();

        if (continuationToken) {
            params.append('continuationToken', continuationToken);
        }

        const options = new HttpClientOptions$v1({
            httpOptions: {
                params: params,
            },
        } as HttpClientOptions$v1);

        return this.http.get(`${this.baseUrl}/abbreviatedTenants`, options).pipe(
            map((response: BaseResultResponse$v1<PageResponse$v1<Tenant$v1[]>>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response.result;
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
     * Returns list of tenants that has full details.
     */
    getDetailedList$(): Observable<Tenant$v1[]> {
        return new Observable(observer => {

            const request = async () => {
                let continuationToken: string;
                do {
                    const result = await this.getDetailTenantPage$(continuationToken).toPromise();
                    const tenants: Tenant$v1[] = result.page.map((tenant) => {
                        return new Tenant$v1(tenant);
                    });
                    observer.next(tenants);
                    continuationToken = result.continuationToken;
                } while (continuationToken);
                observer.complete();
            };

            request();
        });
    }

    /**
     * Gets a page of detailed tenant data
     * @param continuationToken Token used to get next page of data
     */
    private getDetailTenantPage$(continuationToken: string = null): Observable<PageResponse$v1<Tenant$v1[]>> {
        const params = new URLSearchParams();

        if (continuationToken) {
            params.append('continuationToken', continuationToken);
        }

        const options = new HttpClientOptions$v1({
            httpOptions: {
                params: params,
            },
        } as HttpClientOptions$v1);

        return this.http.get(`${this.baseUrl}`, options).pipe(
            map((response: BaseResultResponse$v1<PageResponse$v1<Tenant$v1[]>>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response.result;
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
     * Returns all applications
     */
    getApplications$(): Observable<Application$v1[]> {
        return this.http.get<Application$v1[]>(`${this.baseUrl}/applications`).pipe(
            map((response: BaseResultResponse$v1<Application$v1[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    if (!response.result) {
                        return [];
                    }

                    return response.result.map(item => {
                        return new Application$v1(item);
                    });
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            })
        );
    }

    /**
     * Returns a list of industries.
     */
    getIndustries$(): Observable<Industries$v1[]> {
        return new Observable(observer => {
            const request = async () => {
                let continuationToken: string;
                do {
                    const result = await this.getIndustryPage$(continuationToken).toPromise();
                    const industries: Industries$v1[] = result.page.map((industry) => {
                        return new Industries$v1(industry);
                    });
                    observer.next(industries);
                    continuationToken = result.continuationToken;
                } while (continuationToken);
                observer.complete();
            };

            request();
        });
    }

    /**
     * Gets a page of industry data
     * @param continuationToken Token used to get next page of data
     */
    private getIndustryPage$(continuationToken: string = null): Observable<PageResponse$v1<Industries$v1[]>> {
        const params = new URLSearchParams();

        if (continuationToken) {
            params.append('continuationToken', continuationToken);
        }

        const options = new HttpClientOptions$v1({
            httpOptions: {
                params: params,
            },
        } as HttpClientOptions$v1);

        return this.http.get(`${this.baseUrl}/industries`, options).pipe(
            map((response: BaseResultResponse$v1<PageResponse$v1<Industries$v1[]>>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response.result;
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
     * Returns a list of all available networks
     */
    getNetworks$(): Observable<string[]> {
        return this.http.get(`${this.baseUrl}/dataSharingNetworks`).pipe(
            map((response: BaseResultResponse$v1<string[]>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    return response.result;
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
     * A bulk operation for paging the timelines of a specific tenant
     * @param descriptors Descriptor$v1[]
     * @param actorUserId (optional) user Id filter value
     * @param typeFilter (optional) changelog change type
     * @param startDate (optional) beginning date for timeframe filter
     * @param endDate (optional) end date for timeframe filter
     */
    getTimeline$(
        descriptor: ChangelogDescriptor$v1,
        actorUserId?: string,
        entityType?: string,
        startDate?: string,
        endDate?: string
    ): Observable<Map<string, Changelog$v1[]>> {
        const params = new URLSearchParams();

        if (entityType) {
            params.append('filter_propertyName', entityType);
        }

        if (actorUserId) {
            params.append('filter_actorUserId', actorUserId);
        }

        if (endDate) {
            descriptor.changeRecordCreationTime = endDate;
        }

        if (startDate) {
            descriptor.pageSize = 5000;
            params.append('filter_endTime', startDate);
        }

        const options = new HttpClientOptions$v1({
            httpOptions: {
                params: params,
            },
        } as HttpClientOptions$v1);

        delete descriptor.continuationToken;

        return this.http.put(`${this.baseUrl}/timeline`, [descriptor], options).pipe(
            map((response: BaseResultResponse$v1<PageResponse$v1<Changelog$v1[]>>) => {
                if (response.statusCode === HTTPCode$v1.Ok) {
                    /** Key is continuationToken or "last" */
                    const result = new Map<string, Changelog$v1[]>();
                    const key = response.result.continuationToken;
                    result.set(key, response.result.page.map(r => new Changelog$v1(r)));
                    return result;
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
     * Updates a tenant
     * @param tenant The updated tenant
     */
    update$(tenant: Tenant$v1): Observable<Tenant$v1> {
        return this.http.put(`${this.baseUrl}`, tenant).pipe(
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
     * Updates all tenant properties
     * @param tenant The updated tenant
     */
    updateAll$(tenant: Tenant$v1): Observable<Tenant$v1> {
        return this.http.patch(`${this.baseUrl}`, tenant).pipe(
            map((response: BaseResultResponse$v1<Tenant$v1>) => {
                if (response.statusCode === HTTPCode$v1.Ok || response.statusCode === HTTPCode$v1.Created) {
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
     * Uploads the icon for a tenant and updates the corresponding tenant
     * @param iconFile Icon to upload
     * @param tenantId Id of the tenant the icon is for. Leave blank to update the current user's
     * tenant icon.
     */
    uploadIcon$(iconFile: File, tenantId: string = null): Observable<Tenant$v1> {
        const url = (tenantId) ? `${this.baseUrl}/tenantIcon/${tenantId}` : `${this.baseUrl}/tenantIcon`;

        const fd = new FormData();
        fd.append('file', iconFile);

        return this.http.post(url, fd).pipe(
            map((response: BaseResultResponse$v1<Tenant$v1>) => {
                if (response.statusCode === HTTPCode$v1.Created) {
                    return new Tenant$v1(response.result);
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
     * Deletes specified tenant
     * @param tenantId Id of the tenant
     */
    delete$(tenantId: string): Observable<void> {
        return this.http.delete(`${this.baseUrl}/${tenantId}`).pipe(
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
