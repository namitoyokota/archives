import { HttpParams } from '@angular/common/http';
import {
  BaseErrorResponse,
  BaseResultResponse,
  CommonHttpClient,
  HttpClientOptions,
  HTTPCode,
  UrlMap$v2,
} from '@galileo/web_common-http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class KeywordsDataAccess$v1Service {

	@UrlMap$v2()
	private apiRootUrl = 'api/commonKeywords/v1';

	constructor(private http: CommonHttpClient) { }

    /**
     * Makes a REST call to search for the best composite icon match
     * @param capabilityId Capability to filter on
     * @param industry Industry to filter on
     * @param keywords Keywords to match to
     */
    getResourceId$(capabilityId: string, industry: string, keywords: string[]): Observable<string> {
        // Validate passed in params
        if (!capabilityId) {
            throwError('capabilityId cannot be null');
        }

        if (!industry) {
            throwError('industry cannot be null');
        }

        if (!keywords) {
            throwError('keywords cannot be null');
        }

        // Set up params
        let params = new HttpParams().append('capabilityId', capabilityId);
        params = params.append('industryId', industry);
        params = params.append('resourceType', 'Icon');

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        // Make rest call
        return this.http.post(`${this.apiRootUrl}`, keywords, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.resourceId;
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
