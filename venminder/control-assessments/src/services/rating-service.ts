import { inject } from "aurelia-dependency-injection";
import { ControlAssessmentsEndpoints } from "shared/control-assessment-endpoints";
import type { IApiService } from "shared/interfaces/IApiService";
import { GetJsonRequest } from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";

export class RatingService {
  constructor(@inject(ApiService) private readonly apiService: IApiService) {}

  public async getSectionRating(score: number) {
    return new Promise<string>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Ratings.GET_RATING,
            `/${score}/Section`,
            null,
            true
          )
        )
        .then(
          (u: string) => {
            resolve(u);
          },
          (e) => {
            reject(e);
          }
        );
    });
  }
}
