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
import { DescriptorList$v1 } from '@galileo/platform_common-libraries';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { RawUserInfo$v1 } from '../abstractions/raw-user-info.v1';
import { RawUser$v1 } from '../abstractions/raw-user.v1';
import { TenantSettings$v1 } from '../abstractions/tenant-settings.v1';
import { UserInfo$v1 } from '../abstractions/user-info.v1';
import { UserPresence$v1 } from '../abstractions/user-presence.v1';
import { UserSession$v1 } from '../abstractions/user-session.v1';
import { User$v1 } from '../abstractions/user.v1';
import { UsersGroups$v1 } from '../abstractions/users-groups.v1';
import { UserVisibility$v1 } from '../abstractions/visibility.v1';

/**
 * Type sent down by rest api.
 */
class RawUserSession$v1 extends UserSession$v1 {
  name: string;
}

/**
 * Access user related REST API
 */
export class UserDataAccessor$v1 {
  /** The http client to use to make REST calls */
  private http: HttpClient$v1;

  /** Url to api */
  private readonly apiUrl = '/api/commonIdentities';

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
   * Retrieves info about the current user
   * The response is from the identity server and cannot use our common models.
   * Continue using any time until the model for this call can be worked out after next release.
   * @returns User
   */
  getInfo$(): Observable<UserInfo$v1> {
    return this.http.get(`${this.baseUrl}/connect/userinfo`).pipe(
      map((response: RawUserInfo$v1) => {
        if (!Array.isArray(response.tenantId)) {
          response.tenantId = [response.tenantId];
        }

        const capabilityClaims = new Map<string, string[]>();

        // Preprocess capability claims
        const rawCapabilityClaimsList: string[] = [];

        for (const property in response) {
          try {
            if (property.includes('@hxgn/')) {
              rawCapabilityClaimsList.push(property);
            }
          } catch (error) {
            console.error('Could not pre process property =>', property);
          }
        }

        if (rawCapabilityClaimsList?.length) {
          rawCapabilityClaimsList.forEach((id) => {
            try {
              // Get the capability id
              const parser = id.split('/');
              const capabilityID = parser[0] + '/' + parser[1];

              let rawClaims = response[id];

              if (!Array.isArray(rawClaims)) {
                rawClaims = [rawClaims];
              }

              let claimList = capabilityClaims.get(capabilityID);
              if (claimList?.length) {
                rawClaims.forEach((claimId) => {
                  if (!claimList.find((cId) => cId === claimId)) {
                    claimList.push(claimId);
                  }
                });
              } else {
                claimList = rawClaims;
              }

              capabilityClaims.set(capabilityID, claimList);
            } catch (error) {
              console.error('Error processing claims', error);
            }
          });
        } else {
          console.error('No raw claims found');
        }

        // Process group selection
        let groups: string[] = [];
        if (response?.group) {
          if (Array.isArray(response.group)) {
            groups = response.group;
          } else {
            groups = [response.group];
          }
        }

        const userInfo = new UserInfo$v1({
          id: response.userId,
          displayName: response.display_name,
          givenName: response.given_name,
          familyName: response.family_name,
          email: response.email,
          phone: response.phone,
          title: response.title,
          profileImage: response.picture,
          tenantId: response.tenantId,
          activeTenant: response.activeTenantId
            ? response.activeTenantId
            : response.activeTenant,
          capabilityClaims: capabilityClaims,
          refreshTokenId: response.refreshTokenId,
          softLimitReached: response.softLimitReached,
          maxLicensesReached: response.maxLicensesReached,
          hasCoreAccess: response.uiCoreAccess,
          culture: response.culture,
          visibilities: response.visibilities,
          visibility: response.visibility,
          group: groups,
          providerScheme: response.providerScheme,
          sessionLocked: !!response.sessionLocked,
          accountUserName: response.accountUserName,
          noUserRoles: response.noUserRoles,
        } as UserInfo$v1);

        return userInfo;
      })
    );
  }

  /**
   * Retrieves users
   * @param userIds Ids to get users for
   * @returns List of user info
   */
  get$(userIds?: string[]): Observable<UserInfo$v1[]> {
    const params = new URLSearchParams();

    if (userIds) {
      userIds.forEach((id) => {
        params.append('id', id);
      });
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/v1/users`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<RawUser$v1[]>) => {
        if (
          response.statusCode === HTTPCode$v1.Ok ||
          response.statusCode === HTTPCode$v1.MultiStatus
        ) {
          const result: UserInfo$v1[] = [];
          response.result.forEach((user) => {
            if (user.claims) {
              const newInfo: UserInfo$v1 = new UserInfo$v1({
                id: user.id,
                displayName: user.claims.display_name,
                givenName: user.claims.given_name,
                familyName: user.claims.family_name,
                email: user.claims.email,
                phone: user.claims.phone,
                title: user.claims.title,
                tenantId: user.claims.tenantId,
                profileImage: user.claims.picture,
                activeTenant: user.activeTenant,
                accountUserName: user.claims.accountUserName,
                group: user.groups,
                visibilities: new Map(Object.entries(user.visibilities)),
                visibility: user.visibility,
                noUserRoles: user.noUserRoles,
                status: user.status,
              });
              result.push(newInfo);
            } else {
              result.push({ id: user.id } as UserInfo$v1);
            }
          });
          return result;
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
   * Retrieves abbreviated users
   * @param userIds Ids to get users for
   * @param tenantId Id of the tenant the users are part of
   * @returns List of user
   */
  getAbbreviated$(
    userIds?: string[],
    tenantId: string = null
  ): Observable<UserInfo$v1[]> {
    const params = new URLSearchParams();

    if (userIds) {
      userIds.forEach((id) => {
        params.append('id', id);
      });
    }

    if (tenantId) {
      params.append('tenantId', tenantId);
    }

    const options = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/v1/abbreviatedUsers`, options).pipe(
      map((response: BaseResultResponse$v1<UserInfo$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          const result: UserInfo$v1[] = [];
          response.result.forEach((user) => {
            const newUser = new UserInfo$v1(user);
            newUser.visibilities = new Map(Object.entries(user.visibilities));
            result.push(newUser);
          });

          return result;
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
   * Disassociate a list of users from a tenant
   * @param userIds List of user to disassociate
   * @returns
   */
  remove$(userIds: string[]): Observable<string[]> {
    return this.http.put(`${this.baseUrl}/v1/removeUsers`, userIds).pipe(
      map((response: BaseResultResponse$v1<UserInfo$v1[]>) => {
        if (
          response.statusCode === HTTPCode$v1.Ok ||
          response.statusCode === HTTPCode$v1.MultiStatus
        ) {
          return response.result?.map((result) => {
            return result.id;
          });
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
   * Disassociate the active user from specified tenants.
   * @param tenantIds List of tenants to remove users from
   * @returns List of tenant ids the user was removed from
   */
  removeTenants$(tenantIds: string[]): Observable<string[]> {
    return this.http.put(`${this.baseUrl}/v1/removeUser`, tenantIds).pipe(
      map((response: BaseResultResponse$v1<string[]>) => {
        if (
          response.statusCode === HTTPCode$v1.Ok ||
          response.statusCode === HTTPCode$v1.MultiStatus
        ) {
          return response.result;
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
   * Retrieves a list of groups and users where the names start with the search string
   * @param searchString The search string of the start of the use names and group names
   * @param maxResult  The max results to be returned
   * @param includeSelf If true, will return the current user if self is in the list
   * @param filterAvailability When true will only return users that are available for a call
   * @returns  List of User and groups
   */
  groups$(
    searchString: string,
    maxResult: number,
    includeSelf: boolean,
    filterAvailability = false
  ): Observable<UsersGroups$v1> {
    const params = new URLSearchParams();
    params.append('includeSelf', includeSelf.toString());

    if (searchString) {
      params.append('partial', searchString);
    }

    if (maxResult) {
      params.append('maxResult', maxResult.toString());
    }

    if (filterAvailability) {
      params.append('filterAvailability', filterAvailability.toString());
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/v1/userGroups`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<UsersGroups$v1>) => {
        if (
          response.statusCode === HTTPCode$v1.Ok ||
          response.statusCode === HTTPCode$v1.MultiStatus
        ) {
          if (response.result) {
            return new UsersGroups$v1(response.result);
          } else {
            return null;
          }
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
   * Changes the tenant under which a user is currently working
   * @param tenantId  The active tenant
   */
  updateActiveTenant$(tenantId: string): Observable<void> {
    const params = new URLSearchParams();
    params.append('tenantId', tenantId);

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
        headers: {
          'Content-Type': 'application/json',
        } as Record<string, string>,
      },
    } as HttpClientOptions$v1);

    return this.http
      .put(`${this.baseUrl}/v1/activeTenant`, null, httpOptions)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (response.statusCode !== HTTPCode$v1.Ok) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Retrieves the list of tenants associated wit the requesting user.
   * @returns List of tenant ids the user is part of
   */
  getTenants$(): Observable<string[]> {
    return this.http.get(`${this.baseUrl}/v1/userTenants`).pipe(
      map((response: BaseResultResponse$v1<string[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return response.result;
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
   * Sets a users preferred culture code for localization
   */
  updateCulture$(culture?: string): Observable<void> {
    const params = new URLSearchParams();
    if (culture) {
      params.append('culture', culture);
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .put<void>(`${this.baseUrl}/v1/culture/`, null, httpOptions)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (response.statusCode !== HTTPCode$v1.Ok) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Returns all users for each tenant
   * @returns List of users for each tenant
   */
  getAll$(): Observable<Map<string, User$v1[]>> {
    return this.http.get(`${this.baseUrl}/v1/totalUsers`).pipe(
      map((response: BaseResultResponse$v1<Map<string, User$v1[]>>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return new Map(Object.entries(response.result));
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Returns all active user for each tenant
   * @returns List of users for each tenant
   */
  getActive$(): Observable<Map<string, User$v1[]>> {
    return this.http.get(`${this.baseUrl}/v1/activeUsers`).pipe(
      map((response: BaseResultResponse$v1<Map<string, User$v1[]>>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return new Map(Object.entries(response.result));
        }

        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Gets the most recent user's login time for a given tenant
   * @param tenantIds The tenants to get the most recent login of.
   */
  getTenantLastLogin$(tenantIds: string[]): Observable<Map<string, string>> {
    const params = new URLSearchParams();
    tenantIds.forEach((id) => {
      params.append('tenantIds', id);
    });

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .get(`${this.baseUrl}/v1/tenantLastLogin`, httpOptions)
      .pipe(
        map((response: BaseResultResponse$v1<Map<string, string>>) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return new Map(Object.entries(response.result));
          }

          throw new Error(`Unexpected response - ${response.statusCode}`);
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Update a user's visibility setting
   * @param userId The id of the user to update
   * @param visibility The new visibility value for the user
   * @param tenantId Defaults to the current active tenant of the current user if not provided
   * @returns
   */
  updateVisibility$(
    userId: string,
    visibility: UserVisibility$v1,
    tenantId?: string
  ): Observable<void> {
    const params = new URLSearchParams();
    if (userId) {
      params.append('userId', userId);
    }
    if (visibility) {
      params.append('visibility', visibility);
    }
    if (tenantId) {
      params.append('tenantId', tenantId);
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http
      .put<void>(`${this.baseUrl}/v1/userVisibility`, null, httpOptions)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (response.statusCode !== HTTPCode$v1.Ok) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Update a users presence for the tenant.
   * @param userId the id of the user to update
   * @param status the new presence value for the user
   * @param tenantId defaults to the current active tenant of the current user if not provided
   */
  updateStatus$(
    userId: string,
    status: UserPresence$v1,
    tenantId?: string
  ): Observable<void> {
    const params = new URLSearchParams();
    if (userId) {
      params.append('userId', userId);
    }
    if (status) {
      params.append('status', status);
    }
    if (tenantId) {
      params.append('tenantId', tenantId);
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);
    return this.http
      .put<void>(`${this.baseUrl}/v1/userStatus`, null, httpOptions)
      .pipe(
        map((response: BaseResultResponse$v1<void>) => {
          if (response.statusCode !== HTTPCode$v1.Ok) {
            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        }),
        catchError((err) => {
          return this.catchError(err);
        })
      );
  }

  /**
   * Gets tenant settings for the user
   * @param tenantId The tenant id to get settings for
   */
  getTenantSettings$(tenantId: string): Observable<TenantSettings$v1> {
    return this.http.get(`${this.baseUrl}/v1/tenantSettings/${tenantId}`).pipe(
      map((response: BaseResultResponse$v1<TenantSettings$v1>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          return new TenantSettings$v1(response.result);
        }
        throw new Error(`Unexpected response - ${response.statusCode}`);
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Update tenant settings
   * @param settings Tenant settings
   */
  updateTenantSettings$(settings: TenantSettings$v1): Observable<void> {
    return this.http.put(`${this.baseUrl}/v1/tenantSettings`, settings).pipe(
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
   * Retrieves a list of all user access tokens under a tenant
   * TODO - This whole method needs to be redo. The logic to convert the response from
   * the REST api so live outside of the dat accessor.
   */
  getSessions$(): Observable<UserSession$v1[]> {
    return this.http.get(`${this.baseUrl}/v1/userAccessTokens/all`).pipe(
      map(async (response: BaseResultResponse$v1<RawUserSession$v1[]>) => {
        if (response.statusCode === HTTPCode$v1.Ok) {
          let position = 1;
          const userIds: string[] = [];
          const sessions: UserSession$v1[] = [];
          const validResponses = response.result.filter((response) => {
            return response.name !== null;
          });

          for (let i = 0; i < validResponses.length; i++) {
            if (!userIds.includes(validResponses[i].name)) {
              userIds.push(validResponses[i].name);
            }
          }

          await this.get$(userIds)
            .toPromise()
            .then((userInfo) => {
              for (let i = 0; i < validResponses.length; i++) {
                const selectedUser = userInfo.find((info) => {
                  return info.id === validResponses[i].name;
                });

                const newSession: UserSession$v1 = {
                  id: validResponses[i].id,
                  position: position,
                  displayName:
                    (selectedUser.givenName ? selectedUser.givenName : '') +
                    ' ' +
                    (selectedUser.familyName ? selectedUser.familyName : ''),
                  creationTime: validResponses[i].creationTime,
                  browser:
                    validResponses[i].browser === null
                      ? ''
                      : validResponses[i].browser,
                  ip: validResponses[i].ip === null ? '' : validResponses[i].ip,
                  region: '',
                  tombstoned: validResponses[i].tombstoned,
                  userInfo: selectedUser,
                };

                sessions.push(newSession);
                position++;
              }
            });

          return sessions;
        }
        throw new Error(`Unexpected response - ${response.statusCode}`);
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
   * Gets list of User sessions
   */
  listSessions$(
    descriptors: DescriptorList$v1[]
  ): Observable<UserSession$v1[]> {
    return new Observable((subscriber) => {
      const getPATPage = (
        desc: DescriptorList$v1[],
        cToken: string,
        sList: UserSession$v1[]
      ) => {
        this.sessionListPage$(desc, cToken).subscribe(([sessions, token]) => {
          sList = sList.concat(sessions);
          if (token) {
            getPATPage(desc, token, sList);
          } else {
            subscriber.next(sList);
            subscriber.complete();
          }
        });
      };

      getPATPage(descriptors, null, []);
    });
  }

  /**
   * Gets a page of user sessions based on provided descriptors
   */
  sessionListPage$(
    descriptors: DescriptorList$v1[],
    continuationToken: string = null
  ): Observable<[UserSession$v1[], string]> {
    return this.http
      .put(`${this.baseUrl}/v1/userAccessTokens/descriptors`, {
        descriptors,
        pageSize: 100,
        continuationToken,
      })
      .pipe(
        map(
          (
            response: BaseResultResponse$v1<
              PageResponse$v1<RawUserSession$v1[]>
            >
          ) => {
            if (response.statusCode === HTTPCode$v1.Ok) {
              return [
                response.result?.page.map((sessionInfo) => {
                  return new UserSession$v1({
                    id: sessionInfo.id,
                    position: 0,
                    displayName: sessionInfo.name,
                    creationTime: sessionInfo.creationTime,
                    browser: sessionInfo.browser,
                    ip: sessionInfo.ip,
                    region: '',
                    tombstoned: true,
                  });
                }),
                response.result.continuationToken,
              ];
            }

            throw new Error(`Unexpected response - ${response.statusCode}`);
          }
        ),
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
