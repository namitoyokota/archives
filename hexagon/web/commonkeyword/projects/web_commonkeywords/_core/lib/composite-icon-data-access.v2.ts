import { HttpParams } from '@angular/common/http';
import {
  BaseErrorResponse,
  BaseResultResponse,
  CommonHttpClient,
  HttpClientOptions,
  HTTPCode,
  UrlMap$v2,
} from '@galileo/web_common-http';
import {
  CompositeIcon$v1,
  CompositeIconRequest$v1,
  IconRule$v1,
  IconSpecification$v1,
  KeywordRuleset$v1,
} from '@galileo/web_commonkeywords/_common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * V2 of the data accessor for composite icon. Users
 * the v2 rest api for composite icons to interact with backend services.
 */
export class CompositeIconDataAccess$v2Service {

    @UrlMap$v2()
    private apiRootUrl = 'api/commonKeywords/compositeIcons/v2';

    constructor(private http: CommonHttpClient) {}

    /**
     * Creates/ updates a ruleset along with all of its composite icons.
     * Composite icons should never be reused among instances of an icon ruleset. This method
     * will error out if a provided icon already exists in the database.
     * @param ruleSet Ruleset to update or create
     * @param icons List of icons to create
     */
    upsert$(ruleSet: KeywordRuleset$v1, icons: CompositeIcon$v1[]): Observable<IconSpecification$v1> {
        // Map needs to be converted to json
        const groups = {};
        ruleSet.groups.forEach((value, key) => {
            groups[key] = value;
        });

        const copy = new KeywordRuleset$v1(ruleSet) as any;
        copy.groups = groups;

        // Make sure that all icons have a reference in the ruleset
        let checkIcons = [].concat(icons);
        // Check groups
        ruleSet.groups.forEach((value, key) => {
            checkIcons = checkIcons.filter(i => i.id !== value.resourceId);
        });

        // Check rules
        ruleSet.rules.forEach(rule => {
            checkIcons = checkIcons.filter(i => i.id !== rule.resourceId);
        });

        // Remove any icons that are not part of the ruleset
        checkIcons.forEach(icon => {
            const index = icons.findIndex(i => i.id === icon.id);
            icons.splice(index, 1);
        });

        const iconSpecification = {
            ruleset: copy,
            icons: icons
        } as IconSpecification$v1;

        return this.http.post<BaseResultResponse>(`${this.apiRootUrl}/iconSpecification`, iconSpecification).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Created) {
                    return response.result;
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }), catchError((err) => {
                return this.catchError(err);
            })
        );
    }

    /**
     * Updates a single or collection of composite icons
     * @param icon Updated icon
     */
    update$(icon: CompositeIcon$v1 | CompositeIcon$v1[]) {
        let iconList: CompositeIcon$v1[] = [];

        // Support single and list calls
        if (icon && !Array.isArray(icon)) {
            iconList.push(icon);
        } else if (icon && Array.isArray(icon)) {
            iconList = icon;
        }

        return this.http.put<BaseResultResponse>(this.apiRootUrl, iconList).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.MultiStatus) {
                    const foundError = response.result.find(item => item.statusCode !== HTTPCode.Ok);
                    if (foundError) {
                        throw {
                            status: foundError.statusCode,
                            message: 'Unexpected response'
                        };
                    }

                    if (Array.isArray(icon)) {
                        return response.result.map(item => item.payload);
                    } else {
                        return response.result.map(item => item.payload)[0];
                    }
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err) => {
                if (err.status && err.status === HTTPCode.NotFound) {
                    if (Array.isArray(icon)) {
                        return of([]);
                    } else {
                        return null;
                    }
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Retrieves a collection of composite icons by their IDs.
     * @param id A single or list of composite icon IDs. Not specifying this argument results in all icons for this tenant being returned
     */
    get$(id: string | string[]): Observable<CompositeIcon$v1 | CompositeIcon$v1[]> {
        let idList: string[] = [];

        // Support single and list calls
        if (id && !Array.isArray(id)) {
            idList.push(id);
        } else if (id && Array.isArray(id)) {
            idList = id;
        }

        let params: HttpParams;
        if (idList.length) {
            params = new HttpParams();

            idList.forEach(i => {
                params = params.append('id', i);
            });
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.get<BaseResultResponse>(this.apiRootUrl, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    if (Array.isArray(id)) {
                        return response.result;
                    } else {
                        return response.result[0];
                    }
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    if (Array.isArray(id)) {
                        return of([]);
                    } else {
                        return of(null);
                    }
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Create a single or collection of composite icons
     * @param icon Icons to be created
     */
    create$(icon: CompositeIcon$v1 | CompositeIcon$v1[]): Observable<CompositeIcon$v1 | CompositeIcon$v1[]> {
        let iconList: CompositeIcon$v1[] = [];

        // Support single and list calls
        if (icon && !Array.isArray(icon)) {
            iconList.push(icon);
        } else if (icon && Array.isArray(icon)) {
            iconList = icon;
        }

        return this.http.post<BaseResultResponse>(this.apiRootUrl, iconList).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.MultiStatus) {
                    const foundError = response.result.find(item => item.statusCode !== HTTPCode.Ok);

                    if (foundError) {
                        throw {
                            status: foundError.statusCode,
                            message: 'Unexpected response'
                        };
                    }

                    if (Array.isArray(icon)) {
                        return response.result.map(item => item.payload);
                    } else {
                        return response.result.map(item => item.payload)[0];
                    }
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }),
            catchError((err) => {
                if (err.status === HTTPCode.NotFound) {
                    if (Array.isArray(icon)) {
                        return of([]);
                    } else {
                        return null;
                    }
                }
                return this.catchError(err);
            })
        );
    }

    /**
     * Retrieves composite icons based on search criteria
     * @param searchRequest Icons to search for
     */
    search$(searchRequest: CompositeIconRequest$v1[]): Observable<CompositeIconRequest$v1[]> {
        return this.http.post<BaseResultResponse>(`${this.apiRootUrl}/keywords`, searchRequest).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.map(data => new CompositeIconRequest$v1(data));
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
     * Retrieves composite icons based on search criteria
     * @param searchRequest Icons to search for
     */
    searchAll$(searchRequest: CompositeIconRequest$v1[]): Observable<IconRule$v1[]> {
        return this.http.post<BaseResultResponse>(`${this.apiRootUrl}/keywordsAll`, searchRequest).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result[0].iconRules.map(data => new IconRule$v1(data));
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
     * Creates/ updates a ruleset along with all of its composite icons.
     * Composite icons should never be reused among instances of an icon ruleset. This method
     * will error out if a provided icon already exists in the database.
     * @param ruleSet Ruleset to update or create
     * @param icons List of icons to create
     * @deprecated Use data service v2
     */
    upsertRuleset$(ruleSet: KeywordRuleset$v1, icons: CompositeIcon$v1[]): Observable<IconSpecification$v1> {
        // Map needs to be converted to json
        const groups = {};
        ruleSet.groups.forEach((value, key) => {
            groups[key] = value;
        });

        const copy = new KeywordRuleset$v1(ruleSet) as any;
        copy.groups = groups;

        // Make sure that all icons have a reference in the ruleset
        let checkIcons = [].concat(icons);
        // Check groups
        ruleSet.groups.forEach((value, key) => {
            checkIcons = checkIcons.filter(i => i.id !== value.resourceId);
        });

        // Check rules
        ruleSet.rules.forEach(rule => {
            checkIcons = checkIcons.filter(i => i.id !== rule.resourceId);
        });

        // Remove any icons that are not part of the ruleset
        checkIcons.forEach(icon => {
            const index = icons.findIndex(i => i.id === icon.id);
            icons.splice(index, 1);
        });

        const iconSpecification = {
            ruleset: copy,
            icons: icons
        } as IconSpecification$v1;

        return this.http.post<BaseResultResponse>(`${this.apiRootUrl}/iconSpecification`, iconSpecification).pipe(
            map(response => {
                if (response.statusCode === HTTPCode.Created) {
                    return response.result;
                } else {
                    throw new Error(`Unexpected response - ${response.statusCode}`);
                }
            }), catchError((err) => {
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
