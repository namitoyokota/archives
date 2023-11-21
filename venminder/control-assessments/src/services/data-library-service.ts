import { inject } from "aurelia-dependency-injection";
import { ControlAssessmentsEndpoints } from "shared/control-assessment-endpoints";
import type { IApiService } from "shared/interfaces/IApiService";
import { PutPostJsonRequest } from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { SaveDataLibraryRequest } from "./models/data-library/save-data-library-request";

export class DataLibraryService {
  constructor(@inject(ApiService) private readonly apiService: IApiService) {}

  public saveDataLibrary(request: SaveDataLibraryRequest[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new PutPostJsonRequest(
            ControlAssessmentsEndpoints.Api.DataLibrary.SAVE_DATA_LIBRARY,
            request,
            null,
            true
          )
        )
        .then((u: any) => {
          resolve(u);
        }, reject);
    });
  }
}
