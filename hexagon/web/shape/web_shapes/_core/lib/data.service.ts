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
import { ChangeRecord$v1, Descriptor$v1, DescriptorList$v1 } from '@galileo/web_common-libraries';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { capabilityId, Shape$v1 } from '@galileo/web_shapes/_common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class DataService {

  /** Root url to the REST api */
  @UrlMap$v2()
  private apiRootUrl = 'api/shapes/v1';

  constructor(
    private http: CommonHttpClient,
    private tenantSrv: CommontenantAdapterService$v1
  ) { }

  /**
   * Returns list of shapes. If no descriptors are provided then all of the shapes
   * in the system are returned;
   * @param descriptors Filter on specific shapes
   */
  get$(descriptors: DescriptorList$v1[] = null): Observable<Shape$v1[]> {
    return new Observable((subscriber) => {

      if (descriptors) {
        /** Recursive function to get shape pages */
        const getShapePage = (desc: DescriptorList$v1[], cToken: string, shapeList) => {

          this.getShapePage$(descriptors, cToken).subscribe(([shapes, token]) => {
            shapeList = shapeList.concat(shapes);
            if (token) {
              getShapePage(descriptors, token, shapeList);
            } else {
              subscriber.next(shapeList);
              subscriber.complete();
            }
          });
        };

        getShapePage(descriptors, null, []);
      } else {
        /** Recursive function to get shape pages */
        const getShapePage = (cToken: string, shapeList: Shape$v1[], tenantList: string[]) => {
          // Get first tenant Id in the list
          const tenantId = tenantList[0];

          this.getShapeListPage$(cToken, tenantId).subscribe(([shapes, token]) => {
            shapeList = shapeList.concat(shapes);
            if (token) {
              getShapePage(token, shapeList, tenantList);
            } else {
              subscriber.next(shapeList);
              // Pop the tent id off the list
              tenantList.shift();

              if (tenantList.length) {
                getShapePage(null, shapeList, tenantList);
              } else {
                subscriber.complete();
              }
            }
          });
        };

        //Get all tenants
        this.tenantSrv.getDataAccessMapAsync(capabilityId).then(async tenantList => {
          // Add null item to tenant list for user's current tenant
          tenantList = [null].concat(tenantList);
          getShapePage(null, [], tenantList);
        });
      }

    });

  }

  /**
   * Creates the given shape
   * @param shapes The shapes to create
   */
  create$(shape: Shape$v1): Observable<Shape$v1> {
    return this.http.post(`${this.apiRootUrl}`, shape).pipe(
      map((response: BaseResultResponse) => {
        if (response.statusCode === HTTPCode.Created) {
          return new Shape$v1(response.result);
        }
        throw new Error(`@hxgn/shapes: create$: Unexpected response - ${response.statusCode}`)
      }),
      catchError((err: BaseErrorResponse) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Updates the given shape
   * @param shape The shape to update
   */
  update$(shape: Shape$v1): Observable<Shape$v1> {
    return this.http.put(`${this.apiRootUrl}`, shape).pipe(
      map((response: BaseResultResponse) => {
        if (response.statusCode === HTTPCode.Ok) {
          return new Shape$v1(shape);
        }
        throw new Error(`@hxgn/shapes: update$: Unexpected response - ${response.statusCode}`)
      }),
      catchError((err: BaseErrorResponse) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Deletes the given shape
   * @param id Shape id to delete
   */
  delete$(id: string): Observable<void> {
    return this.http.delete(`${this.apiRootUrl}/${id}`).pipe(
      map((response: BaseResultResponse) => {
        if (response.statusCode === HTTPCode.Ok) {
          return;
        }
        throw new Error(`@hxgn/shapes: delete$: Unexpected response - ${response.statusCode}`)
      }),
      catchError((err: BaseErrorResponse) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Gets timeline data
   * @param descriptors Descriptor used to query timeline data
   * @param tenantId Tenant id that owns the data
   */
  timeline$(descriptors: Descriptor$v1[], tenantId: string = null): Observable<Map<string, ChangeRecord$v1[]>> {
    let params = new HttpParams();

    if (tenantId) {
        params = params.append('tenantId', tenantId);
    }

    const options: HttpClientOptions = new HttpClientOptions({
        httpOptions: {
            params: params
        }
    });

    return this.http.put(`${this.apiRootUrl}/timeline`, descriptors, options).pipe(
        map((response: BaseResultResponse) => {
            if (response.statusCode === HTTPCode.Ok) {
                const result = new Map<string, ChangeRecord$v1[]>();

                response.result.forEach((group, index) => {
                    result.set(descriptors[index].id, group.page.map(cr => new ChangeRecord$v1(cr)));
                });

                return result;
            }

            throw new Error(`Unexpected response - ${response.statusCode}`);
        }),
        catchError((err: BaseErrorResponse, caught) => {
            return this.catchError(err);
        })
    );
}


  /**
   * Gets a page of shapes based on provided descriptors.
   */
  private getShapePage$(descriptors: DescriptorList$v1[], continuationToken: string = null): Observable<[Shape$v1[], string]> {
    return this.http.put(`${this.apiRootUrl}/descriptors`, {
      descriptors,
      pageSize: 100,
      continuationToken
    }).pipe(
      map((response: BaseResultResponse) => {
        if (response.statusCode === HTTPCode.Ok) {
          return [
            response.result?.page.map(r => new Shape$v1(r)),
            response.result.continuationToken
          ];

        }

        throw new Error(`@hxgn/shapes:: getShapePage$: Unexpected response - ${response.statusCode}`);

      }),
      catchError((err: BaseErrorResponse) => {
        if (err.statusCode === HTTPCode.NotFound ||
          err.statusCode === HTTPCode.Unauthorized) {
          return of(null);
        }
        return this.catchError(err);
      })
    );
  }

  /**
   * Gets a page of data
   * @param continuationToken Token used to get next page of data
   */
  private getShapeListPage$(continuationToken: string = null, tenantId: string = null) {
    let params = null;

    if (continuationToken || tenantId) {
      params = new HttpParams();
    }

    if (continuationToken) {
      params = params.append('continuationToken', continuationToken);
    }

    if (tenantId) {
      params = params.append('tenantId', tenantId);
    }

    const options: HttpClientOptions = new HttpClientOptions({
      httpOptions: { params }
    });

    return this.http.get<BaseResultResponse>(`${this.apiRootUrl}`, options).pipe(
      map((response) => {
        if (response.statusCode === HTTPCode.Ok) {
          return [response.result?.page, response.result?.continuationToken];
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err: BaseErrorResponse) => {
        if (err.statusCode === HTTPCode.NotFound ||
          err.statusCode === HTTPCode.Unauthorized) {
          return of(null);
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
