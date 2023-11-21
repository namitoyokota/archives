import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseErrorResponse, CommonHttpClient, HttpClientOptions, HTTPCode, UrlMap$v2 } from '@galileo/web_common-http';
import { Pipeline$v1 } from '@galileo/web_commonrecovery/_common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
/**
 * Service for calling REST api.
 */
export class DataService {

    @UrlMap$v2()
    private apiRootUrl = 'api/commonRecovery/v1';

    constructor(private httpClient: CommonHttpClient) { }

    /**
     * Gets the pipeline for the given run id
     * @param id Id of pipeline run
     */
    getPipeline$(id: string, tenantId: string): Observable<Pipeline$v1> {
        let httpOptions: HttpClientOptions = new HttpClientOptions();
        const params = new HttpParams().append('tenantId', tenantId);
        httpOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.httpClient.get(`${this.apiRootUrl}/${id}`, httpOptions).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Ok) {
                    const pipeline = new Pipeline$v1(response.result);
                    pipeline.tenantId = tenantId;
                    return pipeline;
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Get the list of pipeline runs for tenant, system or global
     * @param tenantId Id of the tenant to retrive the piplines for
     */
    getPipelines$(tenantId: string): Observable<Pipeline$v1[]> {
        let httpOptions: HttpClientOptions = new HttpClientOptions();
        const params = new HttpParams().append('tenantId', tenantId);
        httpOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.httpClient.get(this.apiRootUrl, httpOptions).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.page.map(r => {
                        return new Pipeline$v1(r);
                    });
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets the list of child pipeline runs
     * @param id Id of the parent pipeline
     */
    getChildPipelines$(id: string): Observable<Pipeline$v1[]> {
        return this.httpClient.get(`${this.apiRootUrl}/${id}/children`).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.page.map(r => {
                        return new Pipeline$v1(r);
                    });
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets the list of capabilities
     */
    getCapabilities$(tenantId: string, runId?: string): Observable<string[]> {
        let httpOptions: HttpClientOptions = new HttpClientOptions();
        let params = new HttpParams().append('tenantId', tenantId);

        if (runId) {
            params = params.append('id', runId);
        }

        httpOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.httpClient.get(`${this.apiRootUrl}/Capability`, httpOptions).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.messages;
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets the list of configuration values
     */
    getConfigurations$(): Observable<Map<string, string>> {
        return this.httpClient.get(`${this.apiRootUrl}/Configuration`).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Ok) {
                    const m = new Map<string, string>();
                    response.result.map(configuration => {
                        m.set(configuration.token, configuration.value);
                    });
                    return m;
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets the list of tenants that have existing backup records
     */
    getTenants$(): Observable<string[]> {
        return this.httpClient.get(`${this.apiRootUrl}/Tenant`).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.messages;
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Backups a tenant or system
     * @param tenantId Id of the tenant to backup
     */
    backup$(tenantId: string): Observable<Pipeline$v1> {
        let httpOptions: HttpClientOptions = new HttpClientOptions();
        const params = new HttpParams().append('tenantId', tenantId);
        httpOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.httpClient.post(`${this.apiRootUrl}/Backup`, null, httpOptions).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Created) {
                    return new Pipeline$v1(response.result);
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Backup all data (system and tenant)
     */
    backupAll$(): Observable<Pipeline$v1> {
        return this.httpClient.post(`${this.apiRootUrl}/BackupAll`, null).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Created) {
                    return new Pipeline$v1(response.result);
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Restores data from a previous pipeline run
     * @param capabilityIds Ids of capabilities to restore
     * @param tenantId Id of the tenant in which the pipeline is in
     * @param runId Id of the pipeline run
     */
    restore$(capabilityIds: string[], tenantId: string, runId?: string): Observable<Pipeline$v1> {
        let httpOptions: HttpClientOptions = new HttpClientOptions();
        let params = new HttpParams().append('capabilityIds', btoa(capabilityIds.toString()));
        params = params.append('tenantId', tenantId);

        if (runId) {
            params = params.append('id', runId);
        }

        httpOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.httpClient.post(`${this.apiRootUrl}/Restore`, null, httpOptions).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Created) {
                    return new Pipeline$v1(response.result);
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Restores the latest pipeline run globally
     * @param capabilityIds Ids of capabilities to restore
     */
    restoreAll$(capabilityIds: string[]): Observable<Pipeline$v1> {
        let httpOptions: HttpClientOptions = new HttpClientOptions();
        const params = new HttpParams().append('capabilityIds', btoa(capabilityIds.toString()));

        httpOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.httpClient.post(`${this.apiRootUrl}/RestoreAll`, null, httpOptions).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Created) {
                    return new Pipeline$v1(response.result);
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Downloads a zip file of a previous pipeline run
     * @param id Id of the pipeline run to download
     * @param tenantId Id of where the pipeline is stored
     */
    download$(id: string, tenantId: string): Observable<Pipeline$v1> {
        let httpOptions: HttpClientOptions = new HttpClientOptions();
        const params = new HttpParams().append('tenantId', tenantId);

        httpOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.httpClient.post(`${this.apiRootUrl}/${id}/download`, null, httpOptions).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Created) {
                    return new Pipeline$v1(response.result);
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Delete a pipeline
     * @param id Id of the pipeline run to delete
     * @param tenantId Id of where the pipeline is stored
     */
    delete$(id: string, tenantId: string): Observable<Pipeline$v1> {
        let httpOptions: HttpClientOptions = new HttpClientOptions();
        const params = new HttpParams().append('tenantId', tenantId);

        httpOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.httpClient.delete(`${this.apiRootUrl}/${id}`, httpOptions).pipe(
            map((response: any) => {
                if (response.statusCode === HTTPCode.Created) {
                    return new Pipeline$v1(response.result);
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err, caught) => {
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
