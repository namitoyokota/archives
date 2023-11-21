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
import { DescriptorList$v1, Guid } from '@galileo/platform_common-libraries';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Group$v1 } from '../abstractions/group.v1';
import { UserInfo$v1 } from '../abstractions/user-info.v1';

/**
 * Mapping of user id to group id. Is only used to interact with the rest api
 */
interface GroupAssignment {
  /** The Id of the user */
  userId: string;

  /** The id of the group */
  groupId: string;
}

/**
 * Access group related REST API
 */
export class GroupDataAccessor$v1 {
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
   * Retrieves a list of groups by Id. If the list of supplied Ids is null, this method returns all groups.
   * @param ids Lit of groups to filter on
   * @param includeTombstoned Will return tombstoned groups if true
   * @returns List of groups
   */
  get$(ids?: string[], includeTombstoned?: boolean): Observable<Group$v1[]> {
    const params = new URLSearchParams();

    if (ids) {
      ids.forEach((id) => {
        params.append('id', id);
      });
    }

    if (includeTombstoned) {
      params.append('includeTombstoned', includeTombstoned.toString());
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/groups`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<Group$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return response.result.map((item) => new Group$v1(item));
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of([]);
        }
        return this.catchError(err);
      })
    );
  }

  /**
   * Retrieves a collection of groups by their descriptors. Tombstoned groups are always included.
   */
  list$(descriptors: DescriptorList$v1[]): Observable<Group$v1[]> {
    return new Observable((subscriber) => {
      const getGroupPage = (
        desc: DescriptorList$v1[],
        cToken: string,
        tList: Group$v1[]
      ) => {
        this.listPage$(desc, cToken).subscribe(([groups, token]) => {
          tList = tList.concat(groups);
          if (token) {
            getGroupPage(desc, token, tList);
          } else {
            subscriber.next(tList);
            subscriber.complete();
          }
        });
      };

      getGroupPage(descriptors, null, []);
    });
  }

  /**
   * Creates a group
   * @param group The group to create
   * @returns The created group
   */
  create$(group: Group$v1): Observable<Group$v1> {
    return this.http.post(`${this.baseUrl}/groups`, group).pipe(
      map((response: BaseResultResponse$v1<Group$v1>) => {
        if (response.statusCode === HTTPCode$v1.Created) {
          return new Group$v1(response.result);
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Updates given group or groups
   * @param group Group or groups to update
   */
  update$(group: Group$v1 | Group$v1[]): Observable<Group$v1 | Group$v1[]> {
    const updateList = Array.isArray(group) ? group : [group];

    return this.http.put(`${this.baseUrl}/groupsBulk`, updateList).pipe(
      map((response: BaseResultResponse$v1<Group$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          if (Array.isArray(group)) {
            return response.result.map((r) => new Group$v1(r));
          } else {
            return response.result.map((r) => new Group$v1(r))[0];
          }
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Deletes a group
   * @param id Id of group to delete
   */
  delete$(id: string): Observable<void> {
    const params = new URLSearchParams();
    params.append('id', id);

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.delete(`${this.baseUrl}/groups`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<void>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
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
   * Uploads a group icon
   * @param groupId The id of the group the icon is for
   * @param icon The icon file to upload
   * @returns Returns the URL to the new group icon
   */
  uploadIcon$(groupId: string, icon: File): Observable<string> {
    const fd = new FormData();
    fd.append('file', icon);

    const params = new URLSearchParams();
    params.append('groupId', groupId);

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.post(`${this.baseUrl}/groups/icon`, fd, httpOptions).pipe(
      map((response: BaseResultResponse$v1<Group$v1>) => {
        if (response.statusCode === HTTPCode$v1.Created) {
          return response.result.groupIconUrl + '?v=' + Guid.NewGuid();
        } else {
          throw new Error(`Unexpected response - ${response.statusCode}`);
        }
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Adds the given users to the give groups
   * @param groupId Group id
   * @param userIds Ids of the users to add to the group
   */
  addUser$(groupId: string, userIds: string[]) {
    const groupAssignment: GroupAssignment[] = userIds.map((userId) => {
      return {
        userId,
        groupId,
      } as GroupAssignment;
    });

    return this.http.put(`${this.baseUrl}/addToGroup`, groupAssignment).pipe(
      map((response: BaseResultResponse$v1<void>) => {
        if (response.statusCode === HTTPCode$v1.MultiStatus) {
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
   * Adds the given users to the give groups
   * @param groupId Group id
   * @param userIds Ids of the users to add to the group
   */
  removeUser$(groupId: string, userIds: string[]) {
    const groupAssignment: GroupAssignment[] = userIds.map((userId) => {
      return {
        userId,
        groupId,
      } as GroupAssignment;
    });

    return this.http
      .put(`${this.baseUrl}/removeFromGroup`, groupAssignment)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (response.statusCode === HTTPCode$v1.MultiStatus) {
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
   * Retrieves a list of users that are in the group
   * @param groupId The id of the group
   * @param tenantId The id of the tenant
   * @returns List of users in the group
   */
  getUsers$(groupId: string, tenantId: string): Observable<UserInfo$v1[]> {
    const params = new URLSearchParams();

    if (groupId) {
      params.append('groupId', groupId);
    }

    if (tenantId) {
      params.append('tenantId', tenantId);
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/usersInGroup`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<UserInfo$v1[]>) => {
        if (
          response.statusCode === HTTPCode$v1.Ok ||
          response.statusCode === HTTPCode$v1.MultiStatus
        ) {
          return response.result.map((user) => new UserInfo$v1(user));
        } else {
          throw new Error(`Unexpected response - ${response.statusCode}`);
        }
      }),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of(null);
        }

        return this.catchError(err);
      })
    );
  }

  /**
   * Gets a page of Groups based on provided descriptors.
   */
  private listPage$(
    descriptors: DescriptorList$v1[],
    continuationToken: string = null
  ): Observable<[Group$v1[], string]> {
    return this.http
      .put(`${this.baseUrl}/groups/descriptors`, {
        descriptors,
        pageSize: 100,
        continuationToken,
      })
      .pipe(
        map((response: BaseResultResponse$v1<PageResponse$v1<Group$v1[]>>) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return [
              response.result?.page.map((r) => {
                const group = new Group$v1(r);
                group.tombstoned = true;
                return group;
              }),
              response.result.continuationToken,
            ];
          }

          throw new Error(`Unexpected response - ${response.statusCode}`);
        }),
        catchError((err: BaseErrorResponse$v1) => {
          if (
            err.statusCode === HTTPCode$v1.NotFound ||
            err.statusCode === HTTPCode$v1.Unauthorized
          ) {
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
