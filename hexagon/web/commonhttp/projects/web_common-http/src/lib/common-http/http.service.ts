import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { CommonFaultPoliciesService } from '../common-fault-policies/fault-policies.service';
import { NoopPolicy } from '../common-fault-policies/noop-policy';
import { Policy } from '../common-fault-policies/policy';
import { TimeoutLength } from '../common-fault-policies/timeout-length.enum';
import { AUTHENTICATION_TOKEN, HttpClientOptions } from './http-client-options';

export enum HTTPCode {
    Ok = 200,
    Created = 201,
    MultiStatus = 207,
    NotModified = 304,
    BadRequest = 400,
    NotFound = 404,
    Unauthorized = 401,
    Forbidden = 403,
    Conflict = 409,
    PreconditionFailed = 412,
    InternalServiceError = 500
}

@Injectable()
export class CommonHttpClient {
    /** String representing localhost. Used to test if running locally */
    readonly localhost: string = 'localhost';

    /**
     * Event that authentication is ready to use
     */
    public authenticationTokenSet$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private noopPolicy = new NoopPolicy();
    private timeoutPolicy = this.commonFaultPolicyService.createTimeoutPolicy(TimeoutLength.Standard);
    private retryPolicy = this.commonFaultPolicyService.createRetryPolicy(3, 100, [400, 401, 403, 404, 412]);
    private wrappedPolicy = this.commonFaultPolicyService.createWrappedPolicy(this.retryPolicy, this.timeoutPolicy);

    constructor(public commonFaultPolicyService: CommonFaultPoliciesService, public http: HttpClient) {
        sessionStorage.removeItem(AUTHENTICATION_TOKEN);
    }

    /**
     * Construct a GET request which interprets the body as JSON and returns it.
     * @param endPoint The url end point for the request.
     * @param options Options used for the request.
     */
    get<T>(endPoint: string, options: HttpClientOptions = new HttpClientOptions()): Observable<T> {
        if (options.useStandardAuthentication) {
            return from(this.authenticatedGet(endPoint, options)) as Observable<T>;
        } else {
            return this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
            .execute(() => this.http.get<T>(endPoint, options.httpOptions)) as Observable<T>;
        }
    }

    /**
     * Construct a DELETE request which interprets the body as JSON and returns it.
     * @param endPoint The url end point for the request.
     * @param options Options used for the request. Header, policy, query string params ect.
     */
    delete<T>(endPoint: string, options: HttpClientOptions = new HttpClientOptions()): Observable<T> {
        if (options.useStandardAuthentication) {
            return from(this.authenticatedDelete(endPoint, options)) as Observable<T>;
        } else {
            return this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
            .execute(() => this.http.delete<T>(endPoint, options.httpOptions)) as Observable<T>;
        }
    }

    /**
     * Construct a PUT request which interprets the body as JSON and returns it.
     * @param endPoint The url end point for the request.
     * @param body Body of the request.
     * @param options Options used for the request. Header, policy, query string params ect.
     */
    put<T>(endPoint: string, body: any, options: HttpClientOptions = new HttpClientOptions()): Observable<T> {
        if (options.useStandardAuthentication) {
            return from(this.authenticatedPut(endPoint, body, options)) as Observable<T>;
        } else {
            return this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
            .execute(() => this.http.put<T>(endPoint, body, options.httpOptions)) as Observable<T>;
        }
    }

    /**
     * Construct a POST request which interprets the body as JSON and returns it.
     * @param endPoint The url end point for the request.
     * @param body Body of the request.
     * @param options Options used for the request. Header, policy, query string params ect.
     */
    post<T>(endPoint: string, body: any, options: HttpClientOptions = new HttpClientOptions()): Observable<T> {
        if (options.useStandardAuthentication) {
            return from(this.authenticatedPost(endPoint, body, options)) as Observable<T>;
        } else {
            return this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
            .execute(() => this.http.post<T>(endPoint, body, options.httpOptions)) as Observable<T>;
        }
    }

    /**
     * Construct a PATCH request which interprets the body as JSON and returns it.
     * @param endPoint The url end point for the request.
     * @param body Body of the request.
     * @param options Options used for the request. Header, policy, query string params ect.
     */
    patch<T>(endPoint: string, body: any, options: HttpClientOptions = new HttpClientOptions()): Observable<T> {
        if (options.useStandardAuthentication) {
            return from(this.authenticatedPatch(endPoint, body, options)) as Observable<T>;
        } else {
            return this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
            .execute(() => this.http.patch<T>(endPoint, body, options.httpOptions)) as Observable<T>;
        }
    }

    /**
     * Sets the authorization token that will be used when standard authentication is turned on.
     * This token will be used on all standard authentication calls until another token is set.
     * @param token The authorization token.
     */
    setAuthorizationToken(token: string): void {
        sessionStorage.setItem(AUTHENTICATION_TOKEN, token);
        this.authenticationTokenSet$.next(token);
    }

    /**
     * Clears the authorization token.
     */
    clearAuthorizationToken(): void {
        sessionStorage.removeItem(AUTHENTICATION_TOKEN);
        this.authenticationTokenSet$.next(null);
    }

    /**
     * Construct a Get request which interprets the body as JSON and returns it after authentication is ready.
     * @param endPoint The url end point for the request.
     * @param options Options used for the request.
     */
    private authenticatedGet<T>(endPoint: string, options: HttpClientOptions = new HttpClientOptions()): Promise<T> {
        return new Promise((resolve) => {
            let ready = false;
            this.authenticationTokenSet$.pipe(takeWhile(() => {
                return !ready;
            })).subscribe((token) => {
                if (token) {
                    ready = true;
                    options.setStandardAuthentication();
                    resolve(
                        this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
                                        .execute(() =>  this.http.get<T>(endPoint, options.httpOptions)).toPromise()
                    );
                }
            });
        });
    }

    /**
     * Construct a DELETE request which interprets the body as JSON and returns it after authentication is ready.
     * @param endPoint The url end point for the request.
     * @param options Options used for the request. Header, policy, query string params ect.
     */
    private authenticatedDelete<T>(endPoint: string, options: HttpClientOptions = new HttpClientOptions()): Promise<T> {
        return new Promise((resolve) => {
            let ready = false;
            this.authenticationTokenSet$.pipe(takeWhile(() => {
                return !ready;
            })).subscribe((token) => {
                if (token) {
                    ready = true;
                    options.setStandardAuthentication();
                    resolve(
                        this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
                        .execute(() => this.http.delete<T>(endPoint, options.httpOptions)).toPromise()
                    );
                }
            });
        });
    }

    /**
     * Construct a PUT request which interprets the body as JSON and returns it after authentication is ready.
     * @param endPoint The url end point for the request.
     * @param body Body of the request.
     * @param options Options used for the request. Header, policy, query string params ect.
     */
    private authenticatedPut<T>(endPoint: string, body: T, options: HttpClientOptions = new HttpClientOptions()): Promise<T> {
        return new Promise((resolve) => {
            let ready = false;
            this.authenticationTokenSet$.pipe(takeWhile(() => {
                return !ready;
            })).subscribe((token) => {
                if (token) {
                    ready = true;
                    options.setStandardAuthentication();
                    resolve(
                        this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
                        .execute(() => this.http.put<T>(endPoint, body, options.httpOptions)).toPromise()
                    );
                }
            });
        });
    }

    /**
     * Construct a POST request which interprets the body as JSON and returns it after authentication is ready.
     * @param endPoint The url end point for the request.
     * @param body Body of the request.
     * @param options Options used for the request. Header, policy, query string params ect.
     */
    private authenticatedPost<T>(endPoint: string, body: T, options: HttpClientOptions = new HttpClientOptions()): Promise<T> {
        return new Promise((resolve) => {
            let ready = false;
            this.authenticationTokenSet$.pipe(takeWhile(() => {
                return !ready;
            })).subscribe((token) => {
                if (token) {
                    ready = true;
                    options.setStandardAuthentication();
                    resolve(
                        this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
                        .execute(() => this.http.post<T>(endPoint, body,  options.httpOptions)).toPromise()
                    );
                }
            });
        });
    }

    /**
     * Construct a PATCH request which interprets the body as JSON and returns it after authentication is ready. The body
     * is a JSON object that is the differences between the original and current object.
     * @param endPoint The url end point for the request.
     * @param body Body of the request.
     * @param options Options used for the request. Header, policy, query string params ect.
     */
    private authenticatedPatch<T>(endPoint: string, body: T, options: HttpClientOptions = new HttpClientOptions()): Promise<T> {
        return new Promise((resolve) => {
            let ready = false;
            this.authenticationTokenSet$
            .pipe(takeWhile(() => {
                return !ready;
            }))
            .subscribe((token) => {
                if (token) {
                    ready = true;
                    options.setStandardAuthentication();
                    resolve(
                        this.getPolicy(options.policyOptions.timeoutPolicyOn, options.policyOptions.retryPolicyOn)
                        .execute(() => this.http.patch<T>(endPoint, body, options.httpOptions)).toPromise()
                    );
                }
            });
        });
    }

    private getPolicy(timeoutPolicyOn: boolean, retryPolicyOn: boolean): Policy<any> {
        // Deactivate for debugging purposes.
        if (window.location.hostname.indexOf(this.localhost) > -1) {
            return this.noopPolicy;
        }

        if (timeoutPolicyOn && retryPolicyOn) {
            return this.wrappedPolicy;
        } else if (timeoutPolicyOn) {
            return this.timeoutPolicy;
        } else if (retryPolicyOn) {
            return this.retryPolicy;
        } else {
            return this.noopPolicy;
        }
    }
}
