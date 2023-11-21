import { inject } from "aurelia-framework";
import { ApiUrlService } from "shared-from-dcdev/shared/services/apiUrlService";
import { AppSettingsService } from "shared-from-dcdev/shared/services/appSettingsService";
import { AuthService } from "shared-from-dcdev/shared/services/authService";
import { DataCacheService } from "shared-from-dcdev/shared/services/data-cache-service";
import type { IApiService } from "shared/interfaces/IApiService";
import { GetApiRequest, GetJsonRequest } from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { ContentType } from "../content-type";
import { Endpoints } from "../endpoints";
import type { IDataCache } from "../interfaces/data-cache-interface";
import { DataCacheOptions } from "../interfaces/data-cache-interface";
import type { IApiUrlService } from "../interfaces/IApiUrlService";
import type { IAppSettingsService } from "../interfaces/IAppSettingsService";
import type { IAuthService } from "../interfaces/IAuthService";
import type { IUserService } from "../interfaces/IUserService";
import {
  FIRoleForDisplayModel,
  PhoneTypeModel,
} from "../models/add-user/add-user-model";
import { FIContact } from "../models/contact";
import { LoggedInUser, UserRole } from "../models/userInfo";
import { ViewModelResponse } from "../models/viewModelResponse";
import { Guid } from "../utilities/guid";

export class UserService implements IUserService {
  private static getUserInfoCacheKey: string = Guid.newGuid().format("N");
  private static getUserRolesCacheKey: string = Guid.newGuid().format("N");
  private static getUnreadInboxMessageCountCacheKey: string =
    Guid.newGuid().format("N");

  constructor(
    @inject(ApiService) private api: IApiService,
    @inject(ApiUrlService) private apiUrl: IApiUrlService,
    @inject(AppSettingsService) private appSettingsService: IAppSettingsService,
    @inject(DataCacheService) private dataCache: IDataCache,
    @inject(AuthService) private authService: IAuthService
  ) {}

  clearUserInfo(): void {
    this.dataCache.delete(UserService.getUserInfoCacheKey);
    this.dataCache.delete(UserService.getUserRolesCacheKey);
  }

  async getUserInfo(forceRefresh?: boolean): Promise<LoggedInUser> {
    if (forceRefresh === true)
      this.dataCache.delete(UserService.getUserInfoCacheKey);

    return await this.dataCache.get(
      UserService.getUserInfoCacheKey,
      async () => {
        let result = await this.api.getJson(
          new GetJsonRequest(Endpoints.Api.Global.Users.GET_USER_INFO)
        );
        return new LoggedInUser(result.value);
      },
      DataCacheOptions.NeverExpires
    );
  }

  async getUserInfoByContactID(contactID: string): Promise<FIContact> {
    return new Promise<FIContact>((resolve, reject) => {
      let q: Promise<ViewModelResponse<FIContact>> = null;
      q = this.api.getJson(
        new GetJsonRequest(
          Endpoints.Api.Global.Users.GET_USER_INFO_BY_CONTACT_ID,
          `contactID=${contactID}`
        )
      );
      q.then((r) => {
        resolve(r.value);
      });
    });
  }

  getUserRolesInfo(forceRefresh?: boolean): Promise<UserRole[]> {
    if (forceRefresh === true)
      this.dataCache.delete(UserService.getUserRolesCacheKey);

    return this.dataCache.get(
      UserService.getUserRolesCacheKey,
      () => {
        return new Promise<UserRole[]>((resolve, reject) => {
          this.api
            .getJson(
              new GetJsonRequest(Endpoints.Api.Global.Users.GET_USER_ROLES_INFO)
            )
            .then((u) => {
              resolve(u.value);
            }, reject);
        });
      },
      DataCacheOptions.NeverExpires
    );
  }

  async getUnreadInboxMessageCount(): Promise<number> {
    return await this.dataCache.get(
      UserService.getUnreadInboxMessageCountCacheKey,
      async () => {
        let appSettings = await this.appSettingsService.getAppSettings();
        let messageCount = await this.api.getAsGeneric<number>(
          new GetApiRequest(
            this.apiUrl.getUrl(
              Endpoints.Api.Global.Users.GET_INBOX_MESSAGE_COUNT,
              null,
              appSettings.appUrl
            ),
            [ContentType.Json]
          )
        );
        return messageCount;
      },
      DataCacheOptions.FiveSecondsNotSliding
    );
  }

  isFeatureOnForUser(featureID: number): Promise<boolean> {
    return this.dataCache.get(
      `isFeatureOnForUser_${featureID}`,
      () => {
        return this.api
          .getJson<boolean>(
            new GetJsonRequest(
              Endpoints.Api.Global.Users.IS_FEATURE_ON_FOR_USER,
              `featureId=${featureID}`
            )
          )
          .then((u) => u);
      },
      DataCacheOptions.Default
    );
  }

  async areFeaturesOnForUser(
    featureIDs: number[]
  ): Promise<Map<number, boolean>> {
    var qp = "";
    featureIDs.forEach((featureId) => {
      if (qp != "") {
        qp += "&";
      }
      qp += `featureIds=${featureId}`;
    });

    let res = await this.api.getJson<boolean[]>(
      new GetJsonRequest(
        Endpoints.Api.Global.Users.ARE_FEATURES_ON_FOR_USER,
        qp
      )
    );
    let map = new Map<number, boolean>();
    for (let i in res) {
      let featureId = parseInt(i);
      if (!isNaN(featureId)) {
        map.set(featureId, res[i]);
      }
    }

    return map;
  }

  getFIRolesForUser(
    FIID: string,
    contactID: string
  ): Promise<FIRoleForDisplayModel[]> {
    return new Promise<FIRoleForDisplayModel[]>((resolve, reject) => {
      let q: Promise<ViewModelResponse<FIRoleForDisplayModel[]>> = null;
      q = this.api.getJson(
        new GetJsonRequest(
          Endpoints.Api.Clients.Admin.GET_FI_ROLES_FOR_USER,
          `clientID=${FIID}&contactID=${contactID}`
        )
      );
      q.then((r) => {
        resolve(r.value);
      });
    });
  }

  public getPhoneTypes(): Promise<PhoneTypeModel[]> {
    return this.dataCache.get(
      "UserService::getPhoneTypes",
      () => {
        return new Promise<PhoneTypeModel[]>((resolve, reject) => {
          this.appSettingsService.getAppSettings().then((appSettings) => {
            this.api
              .getAsGeneric<PhoneTypeModel[]>(
                new GetApiRequest(
                  this.apiUrl.getUrl(
                    Endpoints.Api.Global.GET_PHONE_NUMBER_TYPES,
                    ``,
                    appSettings.appUrl
                  ),
                  [ContentType.Json]
                )
              )
              .then((r) => {
                resolve(r);
              });
          });
        });
      },
      DataCacheOptions.NeverExpires
    );
  }

  async getZendeskChatToken(): Promise<string> {
    let p = await new Promise<string>((resolve, reject) => {
      let q: Promise<string> = null;
      q = this.api.getAsGeneric<string>(
        new GetApiRequest(
          this.apiUrl.getUrl(Endpoints.Api.Global.Users.GET_ZENDESK_CHAT_TOKEN),
          [ContentType.Json]
        )
      );
      q.then((r) => {
        resolve(r);
      });
    });
    return p;
  }
}
