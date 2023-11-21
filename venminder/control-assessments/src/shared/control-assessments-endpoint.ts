import { EndpointBase, QueryStringParameter, QueryStringParameterReplacementRule, QueryStringParameterRule } from "shared-from-dcdev/shared/endpoint-base";
import { hasValue, isNullOrUndefined, stringsEqual } from "../shared-from-dcdev/shared/utilities/globals";
import appsettings from '../../config/appsettings.json';

export class ControlAssessmentsEndpoint extends EndpointBase {

    constructor(name: string, rootPath: string) {
        super(name, rootPath);
    }

    override getPath(params: QueryStringParameter[] = []): string {
        const requiredQueryStringParameters = this.parameterRules.filter((pr) => pr.isRequired);
        const missingParameters = requiredQueryStringParameters.filter((rpr) => !hasValue(params.find((p) => stringsEqual(p.name, rpr.name, false, true))));

        if (missingParameters.length) {
            throw new Error(`The following required query string parameters are missing: ${missingParameters.join(', ')}.`);
        }

        let path = appsettings.Control_Assessments_Api + this.rootPath;

        if (this.parameterRules.length) {
            let separatorToken = this.parameterReplacementRule === QueryStringParameterReplacementRule.nameEqualsValue ? '?' : '/';

            this.parameterRules.forEach((pr: QueryStringParameterRule) => {
                const param: QueryStringParameter = params.find((p) => stringsEqual(p.name, pr.name, false, true));

                if (!isNullOrUndefined(param)) {
                    const paramString = param.getParameter(this.parameterReplacementRule);
                    path = `${path}${separatorToken}${paramString}`;

                    if (this.parameterReplacementRule === QueryStringParameterReplacementRule.nameEqualsValue) {
                        separatorToken = '&';
                    }
                }
            });
        }

        return path;
    }

}
