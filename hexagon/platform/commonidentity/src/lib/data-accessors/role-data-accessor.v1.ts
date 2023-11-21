import {
  BaseErrorResponse$v1,
  BaseResultResponse$v1,
  HttpClient$v1,
  HttpClientOptions$v1,
  HTTPCode$v1,
  TokenManager$v1,
  UrlHelper$v1,
} from '@galileo/platform_common-http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { InvitationRoles$v1 } from '../abstractions/invitation-roles.v1';
import { RolesExpiration } from '../abstractions/invitation.v1';
import { RoleAssignment$v1 } from '../abstractions/role-assignment.v1';
import { RoleDetails$v1 } from '../abstractions/role-details.v1';
import { Role$v1 } from '../abstractions/role.v1';

/**
 * Access role related REST API
 */
export class RoleDataAccessor$v1 {
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
   * Make REST api call to get all roles or only the ones specified by roleIds.
   * @param roleIds
   * @returns
   */
  get$(roleIds?: string[]): Observable<Role$v1[]> {
    const params = new URLSearchParams();

    if (roleIds) {
      roleIds.forEach((id) => {
        params.append('userIds', id);
      });
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/roles`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<Role$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return response.result?.map((r) => new Role$v1(r));
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
   * Returns list of role details
   */
  getDetails$(): Observable<RoleDetails$v1[]> {
    return this.http.get(`${this.baseUrl}/roleDetails`).pipe(
      map((response: BaseResultResponse$v1<RoleDetails$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return response?.result.map((item) => new RoleDetails$v1(item));
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
   * Retrieves the list of of active roles associated with the requesting users
   * @param userIds User id to get roles for
   * @returns
   */
  getUserRoles$(
    userIds?: string[]
  ): Observable<Record<string, RoleAssignment$v1[]>> {
    const params = new URLSearchParams();

    if (userIds && userIds.length) {
      userIds.forEach((id) => {
        params.append('userIds', id);
      });
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/userRoles`, httpOptions).pipe(
      map(
        (
          response: BaseResultResponse$v1<Record<string, RoleAssignment$v1[]>>
        ) => {
          if (
            response.statusCode === HTTPCode$v1.Ok ||
            response.statusCode === HTTPCode$v1.MultiStatus
          ) {
            const recordSet: Record<string, RoleAssignment$v1[]> = {};

            for (const property in response.result) {
              recordSet[property] = response.result[property]
                .filter((r) => {
                  return !!r;
                })
                .map((item) => new RoleAssignment$v1(item));
            }

            return recordSet;
          }
          throw new Error(`Unexpected response - ${response.statusCode}`);
        }
      ),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of(null);
        }
        return this.catchError(err);
      })
    );
  }

  /**
   * Associates users with roles
   * @param roleAssignments List of role assignments
   */
  createAssignments$(roleAssignments: RoleAssignment$v1[]): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/addRoleAssignments`, roleAssignments)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Updates users' associations with roles
   * @param roleAssignments List of role assignments
   */
  updateAssignments$(roleAssignments: RoleAssignment$v1[]): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/updateRoleAssignments`, roleAssignments)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Disassociates users with roles
   * @param roleAssignments List of role assignments
   */
  removeAssignments$(roleAssignments: RoleAssignment$v1[]): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/removeRoleAssignments`, roleAssignments)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Transitions a set of role assignments from the set of inactive roles to the set of active roles for a set of users
   * @param roleAssignments List of role assignments
   */
  activateRoleAssignments$(
    roleAssignments: RoleAssignment$v1[]
  ): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/activateRoleAssignments`, roleAssignments)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Transitions a set of role assignments from the set of active roles to the set of inactive roles
   * @param roleAssignments List of role assignments
   */
  deactivateAssignments$(
    roleAssignments: RoleAssignment$v1[]
  ): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/deactivateRoleAssignments`, roleAssignments)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Removes a collection of roles from an existing invitation
   * @param invitationId The unique identifier for an invitation
   * @param roles List of roles to remove
   */
  removeFromInvite$(invitationId: string, roles: string[]): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/removeInviteRoles/` + invitationId, roles)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Removes a collection of roles from a list of invitations
   * @param invitationRoles The lists of roles and invitations to perform the operation
   */
  removeFromInvites$(invitationRoles: InvitationRoles$v1[]): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/removeInviteRoles`, invitationRoles)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Adds a collection of roles to an existing invitation.
   * @param invitationId  The unique identifier for an invitation
   * @param roles The list of roles to add
   * @returns
   */
  addToInvite$(invitationId: string, roles: RolesExpiration): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/addInviteRoles/` + invitationId, roles)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Adds a collection of roles to a lit of invitations
   * @param invitationRoles The list of roles and invitations to perform the operation
   */
  addToInvites$(invitationRoles: InvitationRoles$v1[]): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/addInviteRoles`, invitationRoles)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Updates a collection of roles associated with an existing invitation.
   * @param invitationId The unique identifier for an invitation
   * @param roles The list of roles to update
   */
  updateInvite$(
    invitationId: string,
    roles: RolesExpiration
  ): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/updateInviteRoles/` + invitationId, roles)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Updates a collection of roles associated with a list of invitations
   * @param invitationRoles The list of roles and invitations to perform the operation
   */
  updateInvites$(invitationRoles: InvitationRoles$v1[]): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/updateInviteRoles`, invitationRoles)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (
            response.statusCode !== HTTPCode$v1.Ok &&
            response.statusCode !== HTTPCode$v1.MultiStatus
          ) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
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
