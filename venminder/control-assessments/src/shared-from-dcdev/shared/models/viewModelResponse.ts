import { isNullOrWhitespace } from "../utilities/globals";

export class ViewModelResponse<T> {
    value: T;
    formatters: any[];
    contentTypes: any[];
    declaredType: any;
    statusCode: number;
}

export class TypedResult {
    constructor(public result: any, public type: string) { }
}

export class ApiError extends Error {
    constructor(public status: number, public statusText: string, public url: string, public message: string, public result: TypedResult) {
        super(message);
    }

    getHtmlMessage() {
        if (isNullOrWhitespace(this.message)) {
            let statusText = isNullOrWhitespace(this.statusText) ? "" : ` - ${this.statusText}`;
            return `Status: ${this.status}${statusText}<br/>Url: ${this.url}`;
        }

        return this.message;
    }
}
