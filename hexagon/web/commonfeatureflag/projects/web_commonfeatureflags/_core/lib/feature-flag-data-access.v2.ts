import { HttpParams } from '@angular/common/http';
import {
  BaseErrorResponse,
  BaseResultResponse,
  CommonHttpClient,
  HttpClientOptions,
  HTTPCode,
  UrlMap$v2,
} from '@galileo/web_common-http';
import { FeatureFlag$v2, GlobalStates$v1 } from '@galileo/web_commonfeatureflags/_common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { FlagStateRequest$v2 } from './abstractions/flag-state-request.v2';

/**
 * Second version of the feature flags data access
 */
export class FeatureFlagDataAccess$v2 {

    @UrlMap$v2()
    private apiRootUrl = 'api/commonFeatureFlags/v2';

    constructor(private http: CommonHttpClient) { }

    /**
     * Returns the collection of all feature flags.
     */
    getAll(): Observable<FeatureFlag$v2[]> {
        return this.http.get<BaseResultResponse>(this.apiRootUrl).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.map(obj => new FeatureFlag$v2(obj));
                }
                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return of([]);
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets all the enabled feature flags or optional feature flags for global or tenant
     * @param tenantId Id of the tenant to get enabled flags for
     */
    getStates(tenantId?: string): Observable<GlobalStates$v1> {
        let params = null;

        if (tenantId) {
            params = new HttpParams().set('tenantId', tenantId);
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: { params }
        });

        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/globalFlagStates`, options).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Ok) {
                    if (response.result) {
                        return response.result;
                    } else {
                        return {};
                    }
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return of({});
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Gets all the enabled feature flags or optional feature flags for groups
     */
    getGroupStates(): Observable<GlobalStates$v1> {
        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/flagStates`).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Ok) {
                    if (response.result) {
                        return response.result;
                    } else {
                        return [];
                    }
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return of([]);
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Updates the state of a feature flag globally or tenant wide
     * @param featureFlagState List of feature flags and their state
     * @param tenantId Id of the tenant the flags are being changed for
     */
    update(featureFlagState: FlagStateRequest$v2[], tenantId?: string): Observable<void> {
        let params = null;

        if (tenantId) {
            params = new HttpParams().set('tenantId', tenantId);
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: { params }
        });

        return this.http.put<BaseResultResponse>(`${this.apiRootUrl}/global`, featureFlagState, options).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Ok) {
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
     * Updates the states of feature flags for all groups
     * @param groupStates List of groups with its enabled and tenantOptional flags
     */
    updateGroups(groupStates: {groupId: string, flagStates: FlagStateRequest$v2[]}[]): Observable<void> {
        return this.http.put<BaseResultResponse>(`${this.apiRootUrl}`, groupStates).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Ok) {
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
     * Deletes all of the existing group flags
     */
    deleteGroups(): Observable<void> {
        return this.http.delete<BaseResultResponse>(this.apiRootUrl).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Ok) {
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
