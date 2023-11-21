import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BaseErrorResponse,
    BaseResultResponse,
    CommonHttpClient,
    HttpClientOptions,
    HTTPCode,
    UrlMap$v2,
} from '@galileo/web_common-http';
import { Documentation$v1 } from '@galileo/web_documentation/_common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Service for calling REST api.
 */
@Injectable({
    providedIn: 'root'
})
export class DataService {

    @UrlMap$v2()
    private apiRootUrl = 'api/documentation/v1';

    constructor(private http: CommonHttpClient) { }

    /**
     * Gets list of documentation documents.
     * @param ids Documentation ids.
     */
    getAll$(ids?: string[]): Observable<Documentation$v1[]> {
        let params = new HttpParams();

        if (ids?.length) {
            ids.forEach((id: string) => {
                params = params.append('id', id);
            });
        }

        const httpOptions: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params
            }
        });

        return this.http.get<BaseResultResponse>(this.apiRootUrl, httpOptions).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.map((item: any) => {
                        return new Documentation$v1(item);
                    });
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
     * Gets documentation document by id
     * @param id Documentation id
     */
    get$(id: string): Observable<Documentation$v1> {
        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/${id}`).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return new Documentation$v1(response.result);
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return of(new Documentation$v1());
                }

                return this.catchError(err);
            })
        );
    }

    /**
     * Gets URI of markdown associated with a specific documentation document.
     * @param id Documentation id
     * @param markdownId Markdown id
     */
    getMarkdown$(id: string, markdownId: string): Observable<string> {
        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/${id}/markdown/${markdownId}`).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return of('');
                }

                return this.catchError(err);
            })
        );
    }

    /**
     * Gets URI of markdown associated with a specific documentation document.
     * @param id Documentation id
     * @param codeSampleId Code sample id
     */
    getCodeSample$(id: string, codeSampleId: string): Observable<string> {
        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/${id}/codeSample/${codeSampleId}`).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return of('');
                }

                return this.catchError(err);
            })
        );
    }

    /**
     * Process errors
     * @param err Error object
     */
    private catchError(err: any): Observable<never> {
        if (err.error) {
            return throwError(err.error);
        } else if (err.status) {
            return throwError({
                statusCode: err.status,
                errors: [err.message],
                errorId: ''
            } as BaseErrorResponse);
        } else {
            return throwError({
                statusCode: 0,
                errors: [err],
                errorId: ''
            } as BaseErrorResponse);
        }
    }
}
