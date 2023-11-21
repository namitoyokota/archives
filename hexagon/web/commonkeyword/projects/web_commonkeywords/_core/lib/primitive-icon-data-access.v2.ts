import { HttpParams } from '@angular/common/http';
import {
  BaseErrorResponse,
  BaseResultResponse,
  CommonHttpClient,
  HttpClientOptions,
  HTTPCode,
  UrlMap$v2,
} from '@galileo/web_common-http';
import { CreatePrimitiveIcon$v1, PrimitiveIcon$v2, PrimitiveIconRequest$v1 } from '@galileo/web_commonkeywords/_common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class PrimitiveIconDataAccess$v2Service {

	@UrlMap$v2()
	private apiRootUrl = 'api/commonKeywords/primitiveIcons/v2';

	constructor(private http: CommonHttpClient) { }

	/**
	 * Returns a list of tenant owned primitive icons
	 * @param ids Icon ids
	 * @param tenantId Tenant that owns the icon
	 */
	get$(ids: string[], tenantId: string): Observable<PrimitiveIcon$v2[]> {
		const request = new PrimitiveIconRequest$v1({
			ids,
			tenantId
		});

		return this.http.put<BaseResultResponse>(this.apiRootUrl, [request]).pipe(
			map((response: BaseResultResponse) => {
				if (response.statusCode === HTTPCode.Ok) {
					return response.result.map(r => {
						return new PrimitiveIcon$v2(r);
					});
				} else {
					throw new Error(`Unexpected response - ${response.statusCode}`);
				}
			}),
			catchError((err) => {
				if (err.status === HTTPCode.NotFound) {
					return of ([]);
				}
				return this.catchError(err);
			})
		);
	}

	/**
	 * Returns system defined primitive icons by ids
	 * @param ids Icon ids
	 */
	systemGet$(ids: string[]): Observable<PrimitiveIcon$v2[]> {
		return this.http.put<BaseResultResponse>(`${this.apiRootUrl}/systemDefined`, ids).pipe(
			map((response: BaseResultResponse) => {
				if (response.statusCode === HTTPCode.Ok) {
					return response.result.map(r => {
						return new PrimitiveIcon$v2(r);
					});
				} else {
					throw new Error(`Unexpected response - ${response.statusCode}`);
				}
			}),
			catchError((err) => {
				if (err.status === HTTPCode.NotFound) {
					return of ([]);
				}
				return this.catchError(err);
			})
		);
	}

	/**
     * Retrieves a collection of system-defined primitive icons by capability ID
     * @param capabilityId The capability id in which the primitive icon is associated
     */
	getSystemDefinedByCapability$(capabilityId: string): Observable<PrimitiveIcon$v2[]> {
        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: new HttpParams().set('capabilityId', capabilityId)
            }
        });

        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/capability/systemDefined`, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
					return response.result.map(r => {
						return new PrimitiveIcon$v2(r);
					});
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
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
     * Retrieves a collection of primitive icons by capability ID
     * @param capabilityId The capability id in which the primitive icon is associated
     */
    getByCapability$(capabilityId: string): Observable<PrimitiveIcon$v2[]> {
        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: new HttpParams().set('capabilityId', capabilityId)
            }
        });

        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/capability`, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.map(r => {
						return new PrimitiveIcon$v2(r);
					});
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
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
     * Creates a new icon
     * @param icons List of primitive icon objects to create
     */
	create$(icons: CreatePrimitiveIcon$v1[]): Observable<PrimitiveIcon$v2[]> {
		return this.http.post<BaseResultResponse>(`${this.apiRootUrl}`, icons).pipe(
			map((response: BaseResultResponse) => {
				if (response.statusCode === HTTPCode.MultiStatus) {
					return response.result.map(r => {
						if (r.statusCode === HTTPCode.Conflict) {
							return null;
						} else {
							return new PrimitiveIcon$v2(r.payload);
						}
					});
				} else {
					throw new Error(`Unexpected response - ${response.statusCode}`);
				}
			}),
			catchError((err) => {
				if (err.status === HTTPCode.NotFound) {
					return of ([]);
				}
				return this.catchError(err);
			})
		);
	}

	/**
     * Creates a stage version of the new icon
     * @param file File object of the icon to be uploaded
     */
	stage$(icon: File): Observable<any> {
		const fd = new FormData();
        fd.append('icon', icon);

		return this.http.post<BaseResultResponse>(`${this.apiRootUrl}/icons`, fd).pipe(
			map((response: BaseResultResponse) => {
				if (response.statusCode === HTTPCode.Ok) {
					return response.messages[0];
				} else {
					throw new Error(`Unexpected response - ${response.statusCode}`);
				}
			}),
			catchError((err) => {
				if (err.status === HTTPCode.Conflict) {
					return of (null);
				}
				return this.catchError(err);
			})
		);
	}

	/**
     * Deletes an icon
     * @param ids List of primitive icon ids to delete
     */
	delete$(ids: string[]): Observable<string[]> {
        let params = new HttpParams();
        ids.forEach(i => {
            params = params.append('id', i);
        });

		const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

		return this.http.delete<BaseResultResponse>(`${this.apiRootUrl}`, options).pipe(
			map((response: BaseResultResponse) => {
				if (response.statusCode === HTTPCode.MultiStatus) {
					return response.result.map(icon => icon.id);
				} else {
					throw new Error(`Unexpected response - ${response.statusCode}`);
				}
			}),
			catchError((err) => {
				if (err.status === HTTPCode.NotFound) {
					return of ([]);
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
