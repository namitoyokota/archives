import { inject } from "aurelia-framework";
import type { IApiService } from "shared/interfaces/IApiService";
import { GetJsonRequest } from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { Endpoints } from "../endpoints";
import type { IAuthService } from "../interfaces/IAuthService";
import { ViewModelResponse } from "../models/viewModelResponse";

export class AuthService implements IAuthService {
  constructor(@inject(ApiService) private apiService: IApiService) {}

  // simple check of logged in status: if there is a token, we're (probably) logged in.
  // ideally we check status and check token has not expired (server will back us up, if this not done, but it could be cleaner)
  public isLoggedIn(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(Endpoints.Api.Global.Users.IS_USER_AUTHENTICATED)
        )
        .then((u: ViewModelResponse<boolean>) => {
          resolve(u.value);
        }, reject);
    });
  }
}
