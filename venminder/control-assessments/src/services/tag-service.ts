import { GetJsonRequest } from "shared/models/api-service-model";
import { ControlAssessmentsEndpoints } from "shared/control-assessment-endpoints";
import { ApiService } from "../shared/services/apiService";
import { inject } from "aurelia-dependency-injection";

export class TagService {

    constructor(@inject(ApiService) private readonly apiService: ApiService) { }

    public getTags(request: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.apiService
                .getJson(
                    new GetJsonRequest(
                        ControlAssessmentsEndpoints.Api.Controls.GET_TAG_LIST,
                        "searchTerm=" + request,
                        null,
                        true
                    )
                )
                .then((u: string[]) => {
                    var tagList: string[] = u.map((x) => x);
                    if (tagList.length <= 0) {
                        tagList.push("No Tags");
                    }
                    resolve(tagList);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

}
