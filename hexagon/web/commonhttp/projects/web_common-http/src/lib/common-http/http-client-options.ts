import { HttpHeaders, HttpParams } from '@angular/common/http';
export const AUTHENTICATION_TOKEN = '@hxgn/common/http/authentication_token';

/**
 * Represents request options that can be applied to a http request.
 */
export interface IRequestOptions {
    /**
     * Http headers that will be added to request.
     */
    headers?: HttpHeaders;

    /**
     * Observe
     */
    observe?: any;

    /**
     * Query string params to make part of the request.
     */
    params?: HttpParams;

    /**
     * Should the request report its progress.
     */
    reportProgress?: boolean;

    /**
     * The type the response is expected in.
     */
    responseType?: any;

    /**
     * Are credentials expected.
     */
    withCredentials?: boolean;

    /**
     * Body of request.
     */
    body?: any;
}

/**
 * Represents the policy options for http calls.
 */
export class PolicyOptions {
    /**
     * Use the default timeout policy. Default is true.
     */
    timeoutPolicyOn?: boolean;

    /**
     * Use the default retry policy. Default is false.
     */
    retryPolicyOn?: boolean;

    constructor(params: PolicyOptions = {} as PolicyOptions) {
        const {
            timeoutPolicyOn = true,
            retryPolicyOn = false
        } = params;

        this.timeoutPolicyOn = timeoutPolicyOn;
        this.retryPolicyOn = retryPolicyOn;
    }
}

/**
 * Interface that represents options that can be applied to a http service call.
 */
export interface IHttpClientOptions {
    /**
     * Should the standard identity authentication be used. If true the authorization header will be set.
     */
    useStandardAuthentication?: boolean;

    /**
     * Options that are applied to the http request.
     */
    httpOptions?: IRequestOptions;

    /**
     * Options for request policies. (i.e. timeout, retry)
     */
    policyOptions?: PolicyOptions;
}

/**
 * Represents options that can be applied to a http client call
 */
export class HttpClientOptions {
    /**
     * Should the standard identity authentication be used. If true the authorization header
     * will be set. Default is true.
     */
    useStandardAuthentication?: boolean;

        /**
     * Options that are applied to the http request.
     */
    httpOptions?: IRequestOptions;

    /**
     * Options for request policies. (i.e. timeout, retry)
     */
    policyOptions?: PolicyOptions;

    constructor(params: IHttpClientOptions = {} as IHttpClientOptions) {
        const {
            useStandardAuthentication = true,
            httpOptions = {},
            policyOptions = new PolicyOptions()
        } = params;

        this.useStandardAuthentication = useStandardAuthentication;
        this.httpOptions = httpOptions;
        this.policyOptions = policyOptions;
    }

    /**
    * Adds the authorization header to the http request header list.
    */
    public setStandardAuthentication() {
        const authenticationToken = this.getAuthenticationToken();

        if (!authenticationToken) {
            console.warn('HxGn Connect:: CommonHttp:: No authentication token found. Request will be made without authorization.');
            return;
        }

        if (!this.httpOptions.headers) {
            this.httpOptions.headers = new HttpHeaders().set('Authorization', `Bearer ${authenticationToken}`);
        } else {
            this.httpOptions.headers = this.httpOptions.headers.append(
                    'Authorization', `Bearer ${authenticationToken}`);
        }

        this.httpOptions.withCredentials = false;
    }

    /**
    * Gets the current authentication token from session storage.
    */
    private getAuthenticationToken(): string {
        return sessionStorage.getItem(AUTHENTICATION_TOKEN);
    }
}
