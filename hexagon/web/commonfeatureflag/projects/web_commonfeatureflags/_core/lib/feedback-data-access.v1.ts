import { HttpParams } from '@angular/common/http';
import {
    BaseErrorResponse,
    BaseResultResponse,
    CommonHttpClient,
    HttpClientOptions,
    HTTPCode,
    UrlMap$v2,
} from '@galileo/web_common-http';
import { AddFeedbackMessage$v1, FeedbackMessage$v1 } from '@galileo/web_commonfeatureflags/_common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * First version of the feedback messages data access
 */
export class FeedbackDataAccess$v1 {

    @UrlMap$v2()
    private feedbackUrl = 'api/commonFeatureFlags/feedbackMessages/v1';

    constructor(private http: CommonHttpClient) { }

    /**
     * Returns feedback messages. Only accessible to Provisioners.
     * @param tenantId The tenant ID that the messages are assigned to. If no ID is specified, defaults to all messages.
     * @param category The feature flag that the message applies to. Optional.
     */
    getFeedback$(tenantId?: string, category?: string): Observable<FeedbackMessage$v1> {
        let params = new HttpParams();

        if (tenantId) {
            params = params.append('tenantId', tenantId);
        }

        if (category) {
            params = params.append('category', category);
        }

        const httpOptions: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params
            }
        });

        return this.http.get<BaseResultResponse>(this.feedbackUrl, httpOptions).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return new FeedbackMessage$v1(response.result);
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Creates feedback message
     * @param message Add feedback message
     */
    createFeedback$(message: AddFeedbackMessage$v1): Observable<void> {
        return this.http.post<BaseResultResponse>(this.feedbackUrl, message).pipe(
            map((response: BaseResultResponse) => {
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
     * Deletes feedback messages
     * @param tenantId Associated tenant id
     * @param ids List of feedback message ids
     */
    deleteFeedback$(tenantId: string, ids: string[]): Observable<void> {
        let params = new HttpParams();
        params = params.append('tenantId', tenantId);

        if (ids.length) {
            ids.forEach(id => {
                params = params.append('ids', id);
            });
        }

        const httpOptions: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params
            }
        });

        return this.http.delete<BaseResultResponse>(this.feedbackUrl, httpOptions).pipe(
            map((response: BaseResultResponse) => {
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
