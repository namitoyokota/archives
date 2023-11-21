import { AxiosRequestConfig } from 'axios';

export class HttpClientOptions$v1 {
  /** Should the standard identity authentication be used. If true the authorization header will be set. */
  useStandardAuthentication?: boolean;

  /** Options that are applied to the http request. */
  httpOptions?: AxiosRequestConfig;

  /** Options for request policies. (i.e. timeout, retry) */
  policyOptions? = new PolicyOptions();

  constructor(params: HttpClientOptions$v1 = {} as HttpClientOptions$v1) {
    const { useStandardAuthentication = true, httpOptions = {} } = params;

    this.useStandardAuthentication = useStandardAuthentication;
    this.httpOptions = httpOptions;
  }

  /**
   * Adds the authorization header to the http request header list.
   */
  setStandardAuthentication(authenticationToken: string): void {
    if (!authenticationToken) {
      console.warn(
        'HxGn Connect:: CommonHttp:: No authentication token found. Request will be made without authorization.'
      );
      return;
    }

    if (!this.httpOptions.headers) {
      this.httpOptions.headers = {
        Authorization: `Bearer ${authenticationToken}`,
      };
    } else {
      this.httpOptions.headers = {
        ...this.httpOptions.headers,
        Authorization: `Bearer ${authenticationToken}`,
      };
    }
    this.httpOptions.withCredentials = false;
  }
}

/**
 * Represents the policy options for http calls.
 */
export class PolicyOptions {
  /**
   * Use the default retry policy. Default is false.
   */
  retryPolicyOn?: boolean;

  constructor(params: PolicyOptions = {} as PolicyOptions) {
    const { retryPolicyOn = false } = params;

    this.retryPolicyOn = retryPolicyOn;
  }
}
