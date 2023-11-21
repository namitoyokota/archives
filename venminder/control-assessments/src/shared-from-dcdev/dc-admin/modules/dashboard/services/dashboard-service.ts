import { inject } from "aurelia-framework";
import { Endpoints } from "shared-from-dcdev/shared/endpoints";
import type { IDataCache } from "shared-from-dcdev/shared/interfaces/data-cache-interface";
import { DataCacheOptions } from "shared-from-dcdev/shared/interfaces/data-cache-interface";
import { DataCacheService } from "shared-from-dcdev/shared/services/data-cache-service";
import type { IApiService } from "shared/interfaces/IApiService";
import {
  GetJsonRequest,
  PutPostJsonRequest,
} from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import type { IDashboardInterface } from "../interfaces/dashboard-interface";
import { ButtonInfo } from "../models/models";

export class DashboardService implements IDashboardInterface {
  constructor(
    @inject(ApiService) private api: IApiService,
    @inject(DataCacheService) private dataCache: IDataCache
  ) {}
  public async getButtons(): Promise<ButtonInfo[]> {
    return await this.dataCache.get(
      "DashboardService::getButtons",
      async () => {
        const response = await this.api.getJson(
          new GetJsonRequest(
            Endpoints.Api.VenminderAdmin.Dashboard.GET_DASHBOARD_BUTTONS
          )
        );
        return response.value.map((x) => ButtonInfo.create(x));
      },
      DataCacheOptions.Default
    );
  }

  public toggleFavoriteButton(buttonID: string): void {
    this.api.postJson(
      new PutPostJsonRequest(
        Endpoints.Api.VenminderAdmin.Dashboard.TOGGLE_FAVORITE_BUTTON,
        buttonID
      )
    );
  }
}
