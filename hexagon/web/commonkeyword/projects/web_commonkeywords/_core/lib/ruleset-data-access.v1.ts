import { HttpParams } from '@angular/common/http';
import {
  BaseErrorResponse,
  BaseResultResponse,
  CommonHttpClient,
  HttpClientOptions,
  HTTPCode,
  UrlMap$v2,
} from '@galileo/web_common-http';
import { KeywordRuleset$v1, ResourceType$v1, RulesetRequest$v1 } from '@galileo/web_commonkeywords/_common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class RulesetDataAccess$v1Service {

	@UrlMap$v2()
	private apiRootUrl = 'api/commonKeywords/rulesets/v1';

	constructor(private http: CommonHttpClient) { }

    /**
     * Retrieves an keyword ruleset object
     * @param capabilityId The ID of the capability to which the resource belongs
     * @param industry The industry with which the resource is associated
     * @param resourceType A member of the Hexagon.Galileo.Common.CommonKeywordService.Abstractions.ResourceType enumeration (e.g. Icon)
     */
    get$(
        capabilityId: string,
        industry: string,
        resourceType: ResourceType$v1 = ResourceType$v1.Icon
    ): Observable<KeywordRuleset$v1> {
        const params = new HttpParams().append('resourceType', resourceType)
            .append('capabilityId', capabilityId)
            .append('industryId', industry);

        const httpOptions: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}`, httpOptions).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return new KeywordRuleset$v1(response.result);
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return of(null);
                }
                return this.catchError(err);
            })
        );
    }

	/**
     * Retrieves a keyword ruleset object in bulk
     * @param capabilityId The ID of the capability to which the resource belongs
     * @param resourceType A member of the Hexagon.Galileo.Common.CommonKeywordService.Abstractions.ResourceType enumeration (e.g. Icon)
     */
	getBulk$(capabilityId: string, resourceType: ResourceType$v1 = ResourceType$v1.Icon): Observable<KeywordRuleset$v1[]> {
        const params = new HttpParams()
            .append('resourceType', resourceType)
            .append('capabilityId', capabilityId);

        const httpOptions: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/bulk`, httpOptions).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result;
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return of(null);
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Retrieves the system defined keyword ruleset options
     * @param type A member of the ResourceType$v1 enumeration (e.g. Icon)
     * @param capabilityId The ID of the capability to which the resource belongs
     * @param industryId The industryId with which the resource is associated
     */
    getSystemDefined$(
        type: ResourceType$v1,
        capabilityId: string,
        industryId: string = null
    ): Observable<KeywordRuleset$v1[]> {

        let params = new HttpParams()
            .append('resourceType', type)
            .append('capabilityId', capabilityId);

        if (industryId) {
            params = params.append('industryId', industryId);
        }

        const httpOptions: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.get(`${this.apiRootUrl}/systemDefinedKeywordRulesets`, httpOptions).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.map(rule => new KeywordRuleset$v1(rule));
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return [];
                }
                return this.catchError(err);
            })
        );
    }

	/**
     * Sets the list of system defined keywords
     * @param capabilityId The ID of the capability to which the resources belong
     * @param ruleSetRequests The pairings of rulesetID and industryID
     */
    setSystemDefined$(capabilityId: string, ruleSetRequests: RulesetRequest$v1[]): Observable<KeywordRuleset$v1> {
        const params = new HttpParams().append('capabilityId', capabilityId);
        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.post<BaseResultResponse>(
            `${this.apiRootUrl}/systemDefinedKeywordRulesets`, ruleSetRequests, options
        ).pipe(
            map((response) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result;
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    return null;
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
