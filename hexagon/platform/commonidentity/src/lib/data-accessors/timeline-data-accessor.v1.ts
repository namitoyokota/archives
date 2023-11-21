import {
  BaseErrorResponse$v1,
  BaseResultResponse$v1,
  HttpClient$v1,
  HttpClientOptions$v1,
  HTTPCode$v1,
  PageResponse$v1,
  TokenManager$v1,
  UrlHelper$v1,
} from '@galileo/platform_common-http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AccessManagerLog$v1 } from '../abstractions/access-manager-log.v1';
import { ChangelogDescriptor$v1 } from '../abstractions/changelog-descriptor.v1';
import { ChangelogFilterParameters$v1 } from '../abstractions/changelog-filter-parameters.v1';
import { ChangelogRecord$v1 } from '../abstractions/changelog-record.v1';

/**
 * Access timeline related REST API
 */
export class TimelineDataAccessor$v1 {
  /** The http client to use to make REST calls */
  private http: HttpClient$v1;

  /** Url to api */
  private readonly apiUrl = '/api/commonIdentities/v1';

  /** Base URL for the api */
  private baseUrl = UrlHelper$v1.mapUrl(this.apiUrl);

  /**
   * Constructs a new Data Accessor $v1
   * @param tokenManager Manager for the access token
   * @param baseUrl Base URL to use. If not provide it will fallback to relative paths
   */
  constructor(tokenManager: TokenManager$v1, baseUrl: string = null) {
    this.http = new HttpClient$v1(tokenManager);

    if (baseUrl) {
      this.baseUrl = `${baseUrl}${this.apiUrl}`;
    }
  }

  /**
   * Make REST api call to get a group change records.
   * @param descriptors Descriptor$v1 + an extra field (continuationToken)
   * @param filterParams { actorUserId: string, typeFilter: string, startDate: isoDateString, endDate: isoDateString }
   */
  getUserGroupTimeline$(
    descriptors: ChangelogDescriptor$v1[],
    filterParams?: ChangelogFilterParameters$v1
  ): Observable<Map<string, ChangelogRecord$v1[]>> {
    const params = new URLSearchParams();

    if (filterParams.actorUserId) {
      params.append('filter_actorUserId', filterParams.actorUserId);
    }
    if (filterParams.typeFilter) {
      const typeAndPropFitlers = filterParams.typeFilter.split('.');
      // type will always be the 1st
      params.append('filter_entityType', typeAndPropFitlers[0]);
      // change record operation type will be 2nd
      params.append('filter_propertyName', typeAndPropFitlers[1]);
    }

    if (filterParams.startDate) {
      params.append('filter_endTime', filterParams.startDate);
    }

    if (filterParams.endDate) {
      descriptors[0].changeRecordCreationTime = filterParams.endDate;
    }

    if (filterParams.startDate && filterParams.endDate) {
      descriptors[0].pageSize = 10000;
      delete descriptors[0].continuationToken;
    }
    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .put(`${this.baseUrl}/usersAndGroupsTimeline`, descriptors, httpOptions)
      .pipe(
        map(
          (
            response: BaseResultResponse$v1<
              PageResponse$v1<ChangelogRecord$v1[]>
            >
          ) => {
            if (response.statusCode === HTTPCode$v1.Ok) {
              const result = new Map<string, ChangelogRecord$v1[]>();
              const key = response.result.continuationToken;
              result.set(
                key,
                response.result.page.map((r) => new ChangelogRecord$v1(r))
              );

              return result;
            }

            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        ),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Get access manager changelogs
   */
  getAccessTimeline$(
    descriptor: ChangelogDescriptor$v1,
    entityType?: string,
    actorUserId?: string,
    startTime?: string,
    endTime?: string
  ): Observable<Map<string, AccessManagerLog$v1[]>> {
    const params = new URLSearchParams();

    if (entityType) {
      params.append('filter_entityType', entityType);
    }

    if (actorUserId) {
      params.append('filter_actorUserId', actorUserId);
    }

    if (startTime) {
      params.append('filter_endTime', startTime);
    }

    if (endTime) {
      descriptor.changeRecordCreationTime = endTime;
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .put(`${this.baseUrl}/accessTimeline`, [descriptor], httpOptions)
      .pipe(
        map(
          (
            response: BaseResultResponse$v1<
              PageResponse$v1<AccessManagerLog$v1[]>
            >
          ) => {
            if (response.statusCode === HTTPCode$v1.Ok) {
              return new Map<string, AccessManagerLog$v1[]>([
                [
                  response.result.continuationToken,
                  response.result.page.map((log) => {
                    return new AccessManagerLog$v1(log);
                  }),
                ],
              ]);
            }

            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        ),
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
    if (err?.statusCode && err?.errors) {
      return throwError(err);
    } else if (err.status) {
      return throwError({
        statusCode: err.status,
        errors: [err.message],
        errorId: null,
      } as BaseErrorResponse$v1);
    } else {
      return throwError({
        statusCode: null,
        errors: [err],
        errorId: null,
      } as BaseErrorResponse$v1);
    }
  }
}
