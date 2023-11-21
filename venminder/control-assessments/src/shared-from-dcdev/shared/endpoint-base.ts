import { hasValue, isNullOrUndefined, stringsEqual } from "./utilities/globals";

export class QueryStringParameterRule {
    constructor(public name: string, public isRequired: boolean = true, public order: number = 0) { }
}

export enum QueryStringParameterReplacementRule {
    valueOnlyWithSlashes = 1,
    nameEqualsValue = 2,
}

export class QueryStringParameter {
    constructor(public name: string, public value: string) { }

    getParameter(rule: QueryStringParameterReplacementRule): string {
        return rule === QueryStringParameterReplacementRule.valueOnlyWithSlashes ? encodeURIComponent(this.value) : `${encodeURIComponent(this.name)}=${encodeURIComponent(this.value)}`;
    }
}

export abstract class EndpointBase {
    private static allEndpoints: EndpointBase[] = [];

    constructor(public name: string, protected rootPath: string, public isRemote: boolean = false, public parameterReplacementRule: QueryStringParameterReplacementRule = QueryStringParameterReplacementRule.valueOnlyWithSlashes, public parameterRules: QueryStringParameterRule[] = []) {
        if (!this.rootPath.startsWith('/')) {
            throw new Error(`The path parameter must start with a forward slash (/): ${this.rootPath}.`);
        }

        if (this.rootPath.endsWith('/')) {
            throw new Error(`The path parameter must not end with a forward slash (/): ${this.rootPath}.`);
        }

        if (this.parameterRules.length > 1) {
            this.parameterRules.sort((left, right) => {
                if (left.order > right.order) {
                    return 1;
                } else if (left.order < right.order) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }

        if (!isNullOrUndefined(EndpointBase.allEndpoints.find((url) => url.rootPath.toUpperCase() === this.rootPath.toUpperCase() && url.isRemote === this.isRemote))) {
            if (this.isRemote) {
                throw new Error(`The remote url with path ${rootPath} already exists.`);
            } else {
                throw new Error(`The local url with path ${rootPath} already exists.`);
            }
        }

        EndpointBase.allEndpoints.push(this);
    }

    abstract getPath(params: QueryStringParameter[]): string;
}