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
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Invitation$v1 } from '../abstractions/invitation.v1';

/**
 * Access Invitation related REST API
 */
export class InviteDataAccessor$v1 {
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
   * Retrieves a list of invitations
   */
  get$(): Observable<Invitation$v1[]> {
    return new Observable((subscriber) => {
      const page = (
        invitationList: Invitation$v1[],
        continuationToken: string = null
      ) => {
        this.getPage$(continuationToken).subscribe(
          ([list, token]) => {
            invitationList = invitationList.concat(list);
            if (token) {
              page(invitationList, continuationToken);
            } else {
              subscriber.next(invitationList);
              subscriber.complete();
            }
          },
          (err) => {
            subscriber.error(err);
          }
        );
      };

      page([]);
    });
  }

  /**
   * Creates new invitations
   */
  create$(invitations: Invitation$v1[]): Observable<void> {
    return this.http.put(`${this.baseUrl}/invite`, invitations).pipe(
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
   * Delete the given invitations
   * @param ids List of invitation ids to delete1
   */
  delete$(ids: string[]): Observable<void> {
    const params = new URLSearchParams();

    if (ids) {
      ids.forEach((id) => {
        params.append('id', id);
      });
    }

    const httpOptions = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.delete(`${this.baseUrl}/invite`, httpOptions).pipe(
      map((response: BaseResultResponse$v1<void>) => {
        if (
          response.statusCode === HTTPCode$v1.Ok ||
          response.statusCode === HTTPCode$v1.MultiStatus
        ) {
          return;
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
   * Invites a site admin to a tenant
   * @param tenantId Id of the tenant to invite
   */
  createAdmin$(tenantId: string): Observable<void> {
    const invite = new Invitation$v1({
      tenantId: tenantId,
    });

    return this.http.put(`${this.baseUrl}/inviteTenant`, invite).pipe(
      map((response: BaseResultResponse$v1<void>) => {
        if (response.statusCode !== HTTPCode$v1.Ok) {
          throw new Error(
            `HxGN Connect:: CommonIdentity: Unexpected response - ${response.statusCode}`
          );
        }
      }),
      catchError((err) => {
        return this.catchError(err);
      })
    );
  }

  /**
   * Returns a page of invites
   * @param continuationToken Token used to get next page of data
   */
  private getPage$(
    continuationToken: string = null
  ): Observable<[Invitation$v1[], string]> {
    const params = new URLSearchParams();

    if (continuationToken) {
      params.append('continuationToken', continuationToken);
    }

    const options = new HttpClientOptions$v1({
      httpOptions: {
        params: params,
      },
    } as HttpClientOptions$v1);

    return this.http.get(`${this.baseUrl}/invite`, options).pipe(
      map(
        (response: BaseResultResponse$v1<PageResponse$v1<Invitation$v1[]>>) => {
          if (response.statusCode === HTTPCode$v1.Ok) {
            return [
              response.result?.page?.map((item) => new Invitation$v1(item)),
              response.result?.continuationToken,
            ] as [Invitation$v1[], string];
          }
          throw new Error(`Unexpected response - ${response.statusCode}`);
        }
      ),
      catchError((err) => {
        if (err.status === HTTPCode$v1.NotFound) {
          return of([[], null] as [Invitation$v1[], string]);
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
