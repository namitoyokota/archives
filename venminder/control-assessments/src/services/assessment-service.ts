import { inject } from "aurelia-dependency-injection";
import { ControlAssessmentsEndpoints } from "shared/control-assessment-endpoints";
import type { IApiService } from "shared/interfaces/IApiService";
import {
  GetJsonRequest,
  PutPostJsonRequest,
} from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { AssessmentData } from "./models/assessments/assessment-data";
import { CreateNewAssessmentRequest } from "./models/assessments/create-new-assessment-request";
import { DoesAssessmentExistResponse } from "./models/assessments/does-assessment-exist-response";

export class AssessmentService {
  constructor(@inject(ApiService) private readonly apiService: IApiService) {}

  /** Saves provided assessment data */
  public saveAssessment(request: AssessmentData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new PutPostJsonRequest(
            ControlAssessmentsEndpoints.Api.Assessments.SAVE_ASSESSMENT,
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

  /** Finds and returns existing assessment with provided key */
  public getAssessment(assessmentKey: string): Promise<AssessmentData> {
    return new Promise((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Assessments.GET_ASSESSMENT_DATA,
            `assessmentKey=${assessmentKey}`,
            null,
            true
          )
        )
        .then((response: AssessmentData) => {
          resolve(response);
        }, reject);
    });
  }

  /** Creates new assessment */
  public createAssessment(
    newAssessment: CreateNewAssessmentRequest
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService
        .postJson(
          new PutPostJsonRequest(
            ControlAssessmentsEndpoints.Api.Assessments.CREATE_NEW_ASSESSMENT,
            newAssessment,
            null,
            true
          )
        )
        .then(() => {
          resolve();
        }, reject);
    });
  }

  /** Checks if the assessment with given key already exists */
  public doesAssessmentExist(assessmentKey: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Assessments.DOES_ASSESSMENT_EXIST,
            `assessmentKey=${assessmentKey}`,
            null,
            true
          )
        )
        .then((response: DoesAssessmentExistResponse) => {
          resolve(response.doesAssessmentExist);
        }, reject);
    });
  }

  /** Creates preview from assessment key */
  public previewAssessment(assessmentKey: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Assessments.GET_MERGED_ASSESSMENT,
              `assessmentID=${assessmentKey}`,
            null,
            true
          )
        )
        .then((previewHtml: string) => {
          resolve(previewHtml);
        }, reject);
    });
  }
}
