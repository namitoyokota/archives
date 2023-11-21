import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Alarm$v1, capabilityId } from '@galileo/web_alarms/_common';
import {
    BaseErrorResponse,
    BaseResultResponse,
    CommonHttpClient,
    HttpClientOptions,
    HTTPCode,
    UrlMap$v2,
} from '@galileo/web_common-http';
import { ChangeRecord$v1, Descriptor$v1, DescriptorList$v1, Media$v1 } from '@galileo/web_common-libraries';
import { CommonAssociationAdapterService$v1 } from '@galileo/web_commonassociation/adapter';
import { CommonLoggingAdapterService$v1, PerformanceLogType } from '@galileo/web_commonlogging/adapter';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
/**
 * Service for calling REST api.
 */
export class DataService {

    @UrlMap$v2()
    private apiRootUrl = 'api/alarms/v1';

    /** Cache for request to get alarms by id */
    private requestCache = new Map<string, Observable<any>>();

    constructor(private http: CommonHttpClient,
                private tenantSrv: CommontenantAdapterService$v1,
                private loggingAdapter: CommonLoggingAdapterService$v1,
                private associationSrv: CommonAssociationAdapterService$v1) { }

    /**
     * Returns an alarm from REST api by id
     * @param id Alarm id
     */
    getAlarm$(id: string, tenantId: string = null): Observable<Alarm$v1> {
        let params = null;

        if (tenantId) {
            params = new HttpParams().set('tenantId', tenantId);
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {params}
        });

        if (this.requestCache.has(id)) {
            return this.requestCache.get(id);
        } else {
            const request = this.http.get<BaseResultResponse>(`${this.apiRootUrl}/${id}`, options).pipe(
                map((response) => {
                    if (response.statusCode === HTTPCode.Ok) {
                        const alarm = new Alarm$v1(response.result);

                        this.loggingAdapter.performance(alarm.id, capabilityId, PerformanceLogType.http, {
                            ...response,
                            url: `${this.apiRootUrl}/${id}`
                        });

                        // Empty cache
                        this.requestCache.delete(id);

                        return alarm;
                    }

                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }),
                catchError((err: BaseErrorResponse) => {
                    if (err.statusCode === HTTPCode.NotFound ||
                        err.statusCode === HTTPCode.Unauthorized) {
                        return of(null);
                    }
                    return this.catchError(err);
                })
            );

            this.requestCache.set(id, request);

            return request;
        }

    }

    /**
     * Returns a stream of Alarms
     */
    getAlarmList$(): Observable<Alarm$v1[]> {
        return new Observable((observer) => {
            let continuationToken: string;

            this.tenantSrv.getDataAccessMapAsync(capabilityId).then(async tenantList => {
                // Add null item to tenant list for user's current tenant
                tenantList = [null].concat(tenantList);

                for (const id of tenantList) {
                    do {
                        const result = await this.getAlarmPage$(continuationToken, id).toPromise();
                        if (result) {
                            const alarms: Alarm$v1[] = result?.page?.map(alarm => {
                                return new Alarm$v1(alarm);
                            });

                            observer.next(alarms);
                            continuationToken = result.continuationToken;
                        }
                    } while (continuationToken);
                }
                observer.complete();
            });
        });
    }

    /**
     * Returns a list of Alarms by their descriptors. Tombstoned Alarms are always included.
     */
    getAlarms$(descriptors: DescriptorList$v1[]): Observable<Alarm$v1[]> {
        return new Observable((subscriber) => {

            /** Recursive function to get unit pages */
            const getIncidentPage = (desc: DescriptorList$v1[], cToken: string, uList) => {

                this.getAlarmsPage$(descriptors, cToken).subscribe(([incidents, token]) => {
                    uList = uList.concat(incidents);
                    if (token) {
                        getIncidentPage(descriptors, token, uList);
                    } else {
                        subscriber.next(uList);
                        subscriber.complete();
                    }
                });
            };

            getIncidentPage(descriptors, null, []);
        });
    }

    /**
     * Gets a page of alarms based on provided descriptors.
     */
    private getAlarmsPage$(descriptors: DescriptorList$v1[], continuationToken: string = null): Observable<[Alarm$v1[], string]> {
        return this.http.put(`${this.apiRootUrl}/descriptors`, {
            descriptors,
            pageSize: 100,
            continuationToken
        }).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return [
                        response.result?.page.map(r => new Alarm$v1(r)),
                        response.result.continuationToken
                    ];

                }

                throw new Error(`@hxgn/alarm:: getAlarmsPage$: Unexpected response - ${response.statusCode}`);

            }),
            catchError((err: BaseErrorResponse) => {
                if (err.statusCode  === HTTPCode.NotFound ||
                    err.statusCode  === HTTPCode.Unauthorized) {
                    return of(null);
                }
                return this.catchError(err);
            })
        );
    }
    

    /**
     * Retrieves the Uri of an alarm attachment.
     * @param alarmId  Identifier of the alarm
     * @param attachmentId Identifier of the attachment
     * @param tenantId The ID of the tenant with which the alarm is associated
     */
    getAttachmentUri$(alarmId: string, attachmentId: string, tenantId: string = null): Observable<Media$v1> {
        const url = `${this.apiRootUrl}/${alarmId}/attachments/${attachmentId}`;

        let params = null;
        if (tenantId) {
            params = new HttpParams();
            params = params.append('tenantId', tenantId);
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.get(url, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return new Media$v1(response.result);
                }
                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err: BaseErrorResponse) => {
                if (err.statusCode === HTTPCode.NotFound ||
                    err.statusCode === HTTPCode.Unauthorized) {
                    return of(null);
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Deletes an alarm from REST api by id
     * @param id Alarm id
     */
    deleteAlarm$(id: string): Observable<void> {
        return this.http.delete(`${this.apiRootUrl}/${id}`).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode !== HTTPCode.Ok) {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                } else {
                    // clear associations
                    this.associationSrv.deleteAllAssociationsAsync([id], capabilityId);
                }
            }),
            catchError((err: BaseErrorResponse, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Deletes an unmanaged alarm from REST api by id
     * @param id Alarm id
     */
    deleteUnmanagedAlarm$(id: string, tenantId?: string, tombstone?: boolean): Observable<void> {
        let params = new HttpParams();

        if (tenantId) {
            params = params.append('tenantId', tenantId);
        }

        if (tombstone !== undefined) {
            params = params.append('tombstone', tombstone.toString());
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params
            }
        });

        return this.http.delete(`${this.apiRootUrl}/${id}/unmanaged`, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode !== HTTPCode.Ok) {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                } else {
                    // clear associations
                    this.associationSrv.deleteAllAssociationsAsync([id], capabilityId);
                }
            }),
            catchError((err: BaseErrorResponse, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets a page of data
     * @param continuationToken Token used to get next page of data
     */
    private getAlarmPage$(continuationToken: string = null, tenantId: string = null) {
        let params = null;

        if (continuationToken || tenantId) {
            params = new HttpParams();
        }

        if (continuationToken) {
            params = params.append('continuationToken', continuationToken);
        }

        if (tenantId) {
            params = params.append('tenantId', tenantId);
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {params}
        });

        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}`, options).pipe(
            map((response) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err: BaseErrorResponse) => {
                if (err.statusCode === HTTPCode.NotFound ||
                    err.statusCode === HTTPCode.Unauthorized) {
                    return of(null);
                }
                return this.catchError(err);
            })
        );
    }

    /** Gets a page of an alarm's timeline. */
    getTimelinePage$(descriptors: Descriptor$v1[], tenantId: string = null): Observable<Map<string, ChangeRecord$v1[]>> {
        let params = new HttpParams();

        if (tenantId) {
            params = params.append('tenantId', tenantId);
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.put(`${this.apiRootUrl}/timeline`, descriptors, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    const result = new Map<string, ChangeRecord$v1[]>();

                    response.result.forEach((group, index) => {
                        result.set(descriptors[index].id, group.page.map(cr => new ChangeRecord$v1(cr)));
                    });

                    return result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err: BaseErrorResponse, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Bulk deletes unmanaged alarms
     * @param ids The list of unmanaged alarms to delete
     * @param tenantId The ID of the tenant with which the alarm is associated. Defaults to the tenant ID of the requester.
     * @param tombstone If true, the entity will be tombstoned. If false, the entire entity’s document will be purged.
     */
    deleteUnmanagedAlarms$(ids: string[], tenantId?: string, tombstone?: boolean) {
        let params = new HttpParams();


        if (tenantId) {
            params = params.append('tenantId', tenantId);
        }

        if (tombstone !== undefined) {
            params = params.append('tombstone', tombstone.toString());
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params,
                body: ids
            }
        });

        return this.http.delete(`${this.apiRootUrl}/unmanagedBulk`, options).pipe(
            map(async (response: BaseResultResponse) => {
                if (response.statusCode !== HTTPCode.Ok) {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                } else {
                    // clear associations
                    await this.associationSrv.deleteAllAssociationsAsync(ids, capabilityId);
                }
            }),
            catchError((err: BaseErrorResponse, caught) => {
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
            } as BaseErrorResponse);
        } else {
            return throwError({
                statusCode: null,
                errors: [err],
                errorId: null
            } as BaseErrorResponse);
        }
    }
}
