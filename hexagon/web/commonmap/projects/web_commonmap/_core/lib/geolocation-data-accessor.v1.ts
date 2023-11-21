import { HttpParams } from '@angular/common/http';
import {
    BaseErrorResponse,
    BaseResultResponse,
    CommonHttpClient,
    HttpClientOptions,
    HTTPCode,
    UrlMap$v2,
} from '@galileo/web_common-http';
import { Location$v1 } from '@galileo/web_common-libraries';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class GeolocationDataAccessor$v1 {

    @UrlMap$v2()
    private apiRootUrl = 'api/commonMap/geolocation/v1';

    constructor(
        private http: CommonHttpClient
    ) { }

    /**
     * Gets a list of possible addresses from search string
     * @param address Search string
     * @returns List of possible addresses to use
     */
    searchAddress$(address: string): Observable<Location$v1[]> {
        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: new HttpParams().set('address', address)
            }
        });

        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/geolocation`, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    return response.result.addresses.map(address => {
                        return new Location$v1(address);
                    });
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.statusCode === HTTPCode.NotFound) {
                    return of(null);
                }

                return this.catchError(err);
            })
        );
    }

    /**
     * Gets closest address from a coordinate
     * @param latitude 
     * @param longitude 
     * @returns 
     */
    reverseGeolocation$(latitude: string, longitude: string): Observable<Location$v1> {
        let params = new HttpParams();

        if (latitude) {
            params = params.append('latitude', latitude);
        }

        if (longitude) {
            params = params.append('longitude', longitude);
        }

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.get<BaseResultResponse>(`${this.apiRootUrl}/reverseGeolocation`, options).pipe(
            map((response: BaseResultResponse) => {
                if (response.statusCode === HTTPCode.Ok) {
                    if (response.result.addresses?.length) {
                        return new Location$v1(response.result.addresses[0]);
                    }
                }

                throw new Error(`Unexpected response - ${response.statusCode}`);
            }),
            catchError((err) => {
                if (err.statusCode === HTTPCode.NotFound) {
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
