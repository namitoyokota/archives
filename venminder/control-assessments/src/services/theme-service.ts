import { inject } from "aurelia-dependency-injection";
import { ControlAssessmentsEndpoints } from "shared/control-assessment-endpoints";
import type { IApiService } from "shared/interfaces/IApiService";
import {
  DeleteJsonRequest,
  GetJsonRequest,
  PutPostJsonRequest,
} from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { TemplateTheme } from "./models/themes/theme";

export class ThemeService {
  constructor(@inject(ApiService) private readonly apiService: IApiService) {}

  public saveTheme(request: TemplateTheme): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new PutPostJsonRequest(
            ControlAssessmentsEndpoints.Api.Themes.SAVE_THEME,
            request,
            null,
            true,
            null
          )
        )
        .then(
          (u: any) => {
            resolve(u);
          },
          (e) => {
            reject(e);
          }
        );
    });
  }

  public deleteTheme(themeName: string, fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new DeleteJsonRequest(
            ControlAssessmentsEndpoints.Api.Themes.DELETE_THEME,
            { themeName: themeName, fileName: fileName },
            null,
            true,
            null
          )
        )
        .then(
          (u: any) => {
            resolve(u);
          },
          (e) => {
            reject(e);
          }
        );
    });
  }

  public getThemeList(): Promise<TemplateTheme[]> {
    return new Promise<TemplateTheme[]>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Themes.GET_THEME_LIST,
            null,
            null,
            true
          )
        )
        .then((u: TemplateTheme[]) => {
          var themeList: TemplateTheme[] = u.map((x) =>
            TemplateTheme.create(x)
          );
          resolve(themeList);
        }, reject);
    });
  }
}
