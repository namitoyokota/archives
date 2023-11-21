import axios from 'axios';
import { defer, from, Observable } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

import { BaseErrorResponse$v1 } from './base-error-response.v1';
import { BaseResultResponse$v1, HTTPCode$v1 } from './base-result-response.v1';
import { NoopPolicy$v1 } from './fault-policies/noop-policy.v1';
import { Policy$v1 } from './fault-policies/policy.v1';
import { RetryPolicy$v1 } from './fault-policies/retry-policy.v1';
import { HttpClientOptions$v1 } from './http-client-options.v1';
import { TokenManager$v1 } from './token-manager.v1';

export class HttpClient$v1 {
  private noopPolicy = new NoopPolicy$v1();

  private retryPolicy = new RetryPolicy$v1(3, 100, [
    HTTPCode$v1.BadRequest,
    HTTPCode$v1.Unauthorized,
    HTTPCode$v1.Forbidden,
    HTTPCode$v1.NotFound,
    HTTPCode$v1.PreconditionFailed,
  ]);

  /** Default timeout for a rest call 30 seconds */
  private defaultTimeout = 30000;

  constructor(private tokenManager: TokenManager$v1) { }

  /**
   * Construct a GET request which interprets the body as JSON and returns it.
   * @param endPoint The url end point for the request.
   * @param options Options used for the request.
   */
  get<T>(
    endPoint: string,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Observable<BaseResultResponse$v1<T> | T> {
    if (!options.httpOptions.timeout && options.httpOptions.timeout !== 0) {
      options.httpOptions.timeout = this.defaultTimeout;
    }

    if (options.useStandardAuthentication) {
      return from(this.authenticatedGet(endPoint, options)) as Observable<
        BaseResultResponse$v1<T>
      >;
    } else {
      return this.getPolicy(options.policyOptions.retryPolicyOn).execute(() => {
        return defer(() => axios.get(endPoint, options.httpOptions)).pipe(
          map((response) => response?.data)
        );
      });
    }
  }

  /**
   * Construct a DELETE request which interprets the body as JSON and returns it.
   * @param endPoint The url end point for the request.
   * @param options Options used for the request. Header, policy, query string params ect.
   */
  delete<T>(
    endPoint: string,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Observable<BaseResultResponse$v1<T> | T> {
    if (!options.httpOptions.timeout && options.httpOptions.timeout !== 0) {
      options.httpOptions.timeout = this.defaultTimeout;
    }

    if (options.useStandardAuthentication) {
      return from(this.authenticatedDelete(endPoint, options)) as Observable<
        BaseResultResponse$v1<T>
      >;
    } else {
      return this.getPolicy(options.policyOptions.retryPolicyOn).execute(() => {
        return defer(() => axios.delete(endPoint, options.httpOptions)).pipe(
          map((response) => response?.data)
        );
      });
    }
  }

  /**
   * Construct a PUT request which interprets the body as JSON and returns it.
   * @param endPoint The url end point for the request.
   * @param body Body of the request.
   * @param options Options used for the request. Header, policy, query string params ect.
   */
  put<T>(
    endPoint: string,
    body: any,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Observable<BaseResultResponse$v1<T> | T> {
    if (!options.httpOptions.timeout && options.httpOptions.timeout !== 0) {
      options.httpOptions.timeout = this.defaultTimeout;
    }

    if (options.useStandardAuthentication) {
      return from(this.authenticatedPut(endPoint, body, options)) as Observable<
        BaseResultResponse$v1<T>
      >;
    } else {
      return this.getPolicy(options.policyOptions.retryPolicyOn).execute(() => {
        return defer(() => axios.put(endPoint, body, options.httpOptions)).pipe(
          map((response) => response?.data)
        );
      });
    }
  }

  /**
   * Construct a POST request which interprets the body as JSON and returns it.
   * @param endPoint The url end point for the request.
   * @param body Body of the request.
   * @param options Options used for the request. Header, policy, query string params ect.
   */
  post<T>(
    endPoint: string,
    body: any,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Observable<BaseResultResponse$v1<T> | T> {
    if (!options.httpOptions.timeout && options.httpOptions.timeout !== 0) {
      options.httpOptions.timeout = this.defaultTimeout;
    }

    if (options.useStandardAuthentication) {
      return from(
        this.authenticatedPost(endPoint, body, options)
      ) as Observable<BaseResultResponse$v1<T>>;
    } else {
      return this.getPolicy(options.policyOptions.retryPolicyOn).execute(() => {
        return defer(() =>
          axios.post(endPoint, body, options.httpOptions)
        ).pipe(map((response) => response?.data));
      });
    }
  }

  /**
   * Construct a PATCH request which interprets the body as JSON and returns it.
   * @param endPoint The url end point for the request.
   * @param body Body of the request.
   * @param options Options used for the request. Header, policy, query string params ect.
   */
  patch<T>(
    endPoint: string,
    body: unknown,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Observable<BaseResultResponse$v1<T> | T> {
    if (!options.httpOptions.timeout && options.httpOptions.timeout !== 0) {
      options.httpOptions.timeout = this.defaultTimeout;
    }

    if (options.useStandardAuthentication) {
      return from(
        this.authenticatedPatch(endPoint, body, options)
      ) as Observable<BaseResultResponse$v1<T>>;
    } else {
      return this.getPolicy(options.policyOptions.retryPolicyOn).execute(() => {
        return defer(() =>
          axios.patch(endPoint, body, options.httpOptions)
        ).pipe(map((response) => response?.data));
      });
    }
  }

  /**
   * Construct a Get request which interprets the body as JSON and returns it after authentication is ready.
   * @param endPoint The url end point for the request.
   * @param options Options used for the request.
   */
  private authenticatedGet<T>(
    endPoint: string,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Promise<BaseResultResponse$v1<T>> {
    return new Promise((resolve) => {
      let ready = false;
      this.tokenManager.authenticationToken$
        .pipe(
          takeWhile(() => {
            return !ready;
          })
        )
        .subscribe((token) => {
          if (token) {
            ready = true;
            options.setStandardAuthentication(token);
            return resolve(
              this.getPolicy(options.policyOptions.retryPolicyOn)
                .execute(() => {
                  return defer(() =>
                    axios.get(endPoint, options.httpOptions).catch((err) => {
                      throw err?.response?.data as BaseErrorResponse$v1;
                    })
                  );
                })
                .toPromise()
                .then((response) => {
                  return response?.data;
                })
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
  private authenticatedDelete<T>(
    endPoint: string,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Promise<BaseResultResponse$v1<T>> {
    return new Promise((resolve) => {
      let ready = false;
      this.tokenManager.authenticationToken$
        .pipe(
          takeWhile(() => {
            return !ready;
          })
        )
        .subscribe((token) => {
          if (token) {
            ready = true;
            options.setStandardAuthentication(token);
            return resolve(
              this.getPolicy(options.policyOptions.retryPolicyOn)
                .execute(() => {
                  return defer(() =>
                    axios.delete(endPoint, options.httpOptions).catch((err) => {
                      throw err?.response?.data as BaseErrorResponse$v1;
                    })
                  );
                })
                .toPromise()
                .then((response) => {
                  return response?.data;
                })
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
  private authenticatedPut<T>(
    endPoint: string,
    body: T,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Promise<BaseResultResponse$v1<T>> {
    return new Promise((resolve) => {
      let ready = false;
      this.tokenManager.authenticationToken$
        .pipe(
          takeWhile(() => {
            return !ready;
          })
        )
        .subscribe((token) => {
          if (token) {
            ready = true;
            options.setStandardAuthentication(token);
            return resolve(
              this.getPolicy(options.policyOptions.retryPolicyOn)
                .execute(() => {
                  return defer(() =>
                    axios
                      .put(endPoint, body, options.httpOptions)
                      .catch((err) => {
                        throw err?.response?.data as BaseErrorResponse$v1;
                      })
                  );
                })
                .toPromise()
                .then((response) => {
                  return response?.data;
                })
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
  private authenticatedPost<T>(
    endPoint: string,
    body: T,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Promise<BaseResultResponse$v1<T>> {
    return new Promise((resolve) => {
      let ready = false;
      this.tokenManager.authenticationToken$
        .pipe(
          takeWhile(() => {
            return !ready;
          })
        )
        .subscribe((token) => {
          if (token) {
            ready = true;
            options.setStandardAuthentication(token);
            return resolve(
              this.getPolicy(options.policyOptions.retryPolicyOn)
                .execute(() => {
                  return defer(() =>
                    axios
                      .post(endPoint, body, options.httpOptions)
                      .catch((err) => {
                        throw err?.response?.data as BaseErrorResponse$v1;
                      })
                  );
                })
                .toPromise()
                .then((response) => {
                  return response?.data;
                })
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
  private authenticatedPatch<T>(
    endPoint: string,
    body: T,
    options: HttpClientOptions$v1 = new HttpClientOptions$v1()
  ): Promise<BaseResultResponse$v1<T>> {
    return new Promise((resolve) => {
      let ready = false;
      this.tokenManager.authenticationToken$
        .pipe(
          takeWhile(() => {
            return !ready;
          })
        )
        .subscribe((token) => {
          if (token) {
            ready = true;
            options.setStandardAuthentication(token);
            return resolve(
              this.getPolicy(options.policyOptions.retryPolicyOn)
                .execute(() => {
                  return defer(() =>
                    axios
                      .patch(endPoint, body, options.httpOptions)
                      .catch((err) => {
                        throw err?.response?.data as BaseErrorResponse$v1;
                      })
                  );
                })
                .toPromise()
                .then((response) => {
                  return response?.data;
                })
            );
          }
        });
    });
  }

  /**
   * Get the fault policies that should be applied to the rest call
   * @param timeoutPolicyOn
   * @param retryPolicyOn
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getPolicy(retryPolicyOn: boolean): Policy$v1<any> {
    if (retryPolicyOn) {
      return this.retryPolicy;
    } else {
      return this.noopPolicy;
    }
  }
}
