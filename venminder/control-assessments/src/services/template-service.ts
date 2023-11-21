import { inject } from "aurelia-dependency-injection";
import { ControlAssessmentsEndpoints } from "shared/control-assessment-endpoints";
import type { IApiService } from "shared/interfaces/IApiService";
import {
  GetJsonRequest,
  PostApiRequest,
  PutPostJsonRequest,
} from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { AssessmentTypeWithIDs } from "./models/assessments/assessment-type";
import { Placeholder } from "./models/templates/placeholder";
import { SaveTemplateRequest } from "./models/templates/save-template-request";
import { Template } from "./models/templates/template";

export class TemplateService {
  constructor(@inject(ApiService) private readonly apiService: IApiService) {}

  public saveTemplate(request: SaveTemplateRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new PutPostJsonRequest(
            ControlAssessmentsEndpoints.Api.Templates.SAVE_TEMPLATE,
            request,
            null,
            true
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

  public dupeTemplate(title: string, dupeTitle: string): Promise<any> {
    const request = { title: title, dupeTitle: dupeTitle };
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new PutPostJsonRequest(
            ControlAssessmentsEndpoints.Api.Templates.DUPE_TEMPLATE,
            request,
            null,
            true
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

    public deleteTemplate(title: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.apiService
                .postJson(
                    new PutPostJsonRequest(
                        ControlAssessmentsEndpoints.Api.Templates.DELETE_TEMPLATE,
                        { templateTitle: title },
                        null,
                        true
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

  public getTemplateList(): Promise<Template[]> {
    return new Promise<Template[]>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Templates.GET_TEMPLATE_LIST,
            null,
            null,
            true
          )
        )
        .then((u: Template[]) => {
          const templateList: Template[] = u.map((x) => Template.create(x));
          resolve(templateList);
        }, reject);
    });
  }

  public getTemplate(templateTitle: string): Promise<Template> {
    return new Promise<Template>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Templates.GET_TEMPLATE,
            "templateTitle=" + encodeURIComponent(templateTitle),
            null,
            true
          )
        )
        .then((u: Template) => {
          resolve(u);
        }, reject);
    });
  }

  public getPlaceholderList(): Promise<Placeholder[]> {
    return new Promise<Placeholder[]>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Templates.GET_PLACEHOLDER_LIST,
            null,
            null,
            true
          )
        )
        .then((u: Placeholder[]) => {
          const placeholderList: Placeholder[] = u.map((x) =>
            Placeholder.create(x)
          );
          resolve(placeholderList);
        }, reject);
    });
  }

  public getAssessmentTypeList(): Promise<AssessmentTypeWithIDs[]> {
    return new Promise<AssessmentTypeWithIDs[]>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Templates.GET_TYPE_LIST,
            null,
            null,
            true
          )
        )
        .then((u: AssessmentTypeWithIDs[]) => {
          const templateList: AssessmentTypeWithIDs[] = u.map((x) =>
            AssessmentTypeWithIDs.create(x)
          );
          resolve(templateList);
        }, reject);
    });
  }

  public getAssessmentLevelList(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      const levels: string[] = ["Standard", "Enterprise", "Custom"];
      resolve(levels);
    });
  }
}
