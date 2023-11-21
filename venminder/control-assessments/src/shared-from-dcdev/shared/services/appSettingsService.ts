import { inject } from "aurelia-framework";
import type { IDataCache } from "shared-from-dcdev/shared/interfaces/data-cache-interface";
import { DataCacheOptions } from "shared-from-dcdev/shared/interfaces/data-cache-interface";
import { ApiUrlService } from "shared-from-dcdev/shared/services/apiUrlService";
import { DataCacheService } from "shared-from-dcdev/shared/services/data-cache-service";
import { Guid } from "shared-from-dcdev/shared/utilities/guid";
import type { IApiService } from "shared/interfaces/IApiService";
import { GetJsonRequest } from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { Endpoints } from "../endpoints";
import type { IApiUrlService } from "../interfaces/IApiUrlService";
import type { IAppSettingsService } from "../interfaces/IAppSettingsService";
import { LayoutInformation, PublicAppSettings } from "../models/app-settings";
import { ViewModelResponse } from "../models/viewModelResponse";

export class AppSettingsService implements IAppSettingsService {
  private static getAppSettingsCacheKey: string = Guid.newGuid().format("N");
  private static getLayoutInformationCacheKey: string =
    Guid.newGuid().format("N");

  constructor(
    @inject(ApiService) private api: IApiService,
    @inject(ApiUrlService) private apiUrl: IApiUrlService,
    @inject(DataCacheService) private dataCache: IDataCache
  ) {}

  async getAppSettings(): Promise<PublicAppSettings> {
    let settings = await this.dataCache.get(
      AppSettingsService.getAppSettingsCacheKey,
      async () => {
        let result = await this.api.getJson(
          new GetJsonRequest(Endpoints.Api.Global.GET_APP_SETTINGS)
        );
        let settings = PublicAppSettings.create(result.value);
        settings.authUrl = this.fixURL(settings.authUrl);
        settings.appUrl = this.fixURL(settings.appUrl);
        settings.rsdUrl = this.fixURL(settings.rsdUrl);
        settings.argosRootUrl = this.fixURL(settings.argosRootUrl);
        settings.controlAssessmentsUrl = this.fixURL(
          settings.controlAssessmentsUrl
        );
        this.apiUrl.setDefaultRemoteBaseUrl(settings.appUrl);

        let elm = <HTMLLinkElement>document.getElementById("DistFolder");
        settings.distFolder = elm?.href;

        return settings;
      },
      DataCacheOptions.NeverExpires
    );
    // Return a new copy because we know that consumers will likely mess with Urls and such.
    // Since it's cached, we don't want one consumer to change something after another has
    // set the values of the properties to their own expectations.
    let copy = PublicAppSettings.create(settings);
    copy.distFolder = settings.distFolder;
    return copy;
  }

  getLayoutInformation(
    forceRefresh: boolean = false
  ): Promise<LayoutInformation> {
    if (forceRefresh)
      this.dataCache.delete(AppSettingsService.getLayoutInformationCacheKey);

    return this.dataCache.get(
      AppSettingsService.getLayoutInformationCacheKey,
      () => {
        return this.api
          .getJson(
            new GetJsonRequest(Endpoints.Api.Global.GET_LAYOUT_INFORMATION)
          )
          .then((u) => {
            let layoutInformation = LayoutInformation.create(u.value);
            return layoutInformation;
          });
      },
      DataCacheOptions.NeverExpires
    );
  }

  getClientLayoutInformation(clientId: string): Promise<LayoutInformation> {
    return this.dataCache.get(
      "DCACID_" + clientId,
      () => {
        return new Promise<LayoutInformation>((resolve, reject) => {
          this.api
            .getJson(
              new GetJsonRequest(
                Endpoints.Api.Global.GET_LAYOUT_INFORMATION,
                "clientId=" + clientId
              )
            )
            .then((u) => {
              let layoutInformation = LayoutInformation.create(u.value);
              resolve(layoutInformation);
            }, reject);
        });
      },
      DataCacheOptions.NeverExpires
    );
  }

  useLiteWidgets(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.api
        .getJson(new GetJsonRequest(Endpoints.Api.Global.USE_LITE_WIDGETS))
        .then((u: ViewModelResponse<boolean>) => {
          resolve(u.value);
        });
    });
  }

  hasAccessToControlAssessments(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.api
        .getJson(
          new GetJsonRequest(
            Endpoints.Api.Global.HAS_ACCESS_TO_CONTROL_ASSESSMENTS
          )
        )
        .then((u: ViewModelResponse<any>) => {
          resolve(u.value);
        }),
        reject;
    });
  }

  fixURL(url: string) {
    if (url && url[url.length - 1] !== "/") return url + "/";
    else return url;
  }
}
