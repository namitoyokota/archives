import { inject } from "aurelia-framework";
import { Endpoints } from "shared-from-dcdev/shared/endpoints";
import type { IApiService } from "shared/interfaces/IApiService";
import {
  GetJsonRequest,
  PutPostJsonRequest,
} from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { QueryStringParameter } from "../../../../shared/endpoint-base";

import type { IGridSettingsService } from "../interfaces/grid-settings-service-interface";
import { GridSettings } from "../models/vm-grid-models";

export class GridSettingsService implements IGridSettingsService {
  constructor(@inject(ApiService) public api: IApiService) {}

  public getGridSettingsForUser(
    clientID: string,
    gridName: string
  ): Promise<GridSettings> {
    const endPoint = Endpoints.Api.Grid.GET_GRID_SETTINGS_FOR_USER;

    return new Promise<GridSettings>((resolve, reject) => {
      const params = [
        new QueryStringParameter("clientID", clientID),
        new QueryStringParameter("gridName", gridName),
      ];

      this.api
        .getJson<GridSettings>(
          new GetJsonRequest(endPoint, params, null, null, 70000)
        )
        .then((u) => {
          resolve(u);
        }, reject);
    });
  }

  public saveGridSettingsForUser(
    clientID: string,
    gridName: string,
    value: string
  ): Promise<void> {
    var request = new GridSettings();
    request.clientID = clientID;
    request.gridName = gridName;
    request.value = value;

    return this.api
      .postJson(
        new PutPostJsonRequest(
          Endpoints.Api.Grid.SAVE_GRID_SETTINGS_FOR_USER,
          request
        )
      )
      .then();
  }

  public deleteGridSettingsForUser(
    clientID: string,
    gridName: string
  ): Promise<void> {
    var request = new GridSettings();
    request.clientID = clientID;
    request.gridName = gridName;

    return this.api
      .postJson(
        new PutPostJsonRequest(
          Endpoints.Api.Grid.DELETE_GRID_SETTINGS_FOR_USER,
          request
        )
      )
      .then();
  }
}
