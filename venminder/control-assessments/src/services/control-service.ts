import { inject } from "aurelia-dependency-injection";
import { ControlAssessmentsEndpoints } from "shared/control-assessment-endpoints";
import type { IApiService } from "shared/interfaces/IApiService";
import {
  GetJsonRequest,
  PutPostJsonRequest,
} from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { Control } from "./models/controls/control";
import { ControlRequest } from "./models/controls/control-request";
import { DeleteControlRequest } from "./models/controls/delete-control-request";

export class ControlService {
  constructor(@inject(ApiService) private readonly apiService: IApiService) {}

  public getControlList(): Promise<Control[]> {
    return new Promise<Control[]>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Controls.GET_CONTROL_LIST,
            null,
            null,
            true
          )
        )
        .then((u: Control[]) => {
          var controlList: Control[] = u.map((x) => Control.create(x));
          resolve(controlList);
        }, reject);
    });
  }

  public saveControl(request: ControlRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new PutPostJsonRequest(
            ControlAssessmentsEndpoints.Api.Controls.SAVE_CONTROL,
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

  public deleteControl(request: DeleteControlRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new PutPostJsonRequest(
            ControlAssessmentsEndpoints.Api.Controls.DELETE_CONTROL,
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
