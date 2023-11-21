export class ResponseError extends Error {
    response: Response;

    constructor(response: Response) {
        super(response.statusText);
        this.response = response;
        Object.setPrototypeOf(this, ResponseError.prototype);
    }

    public getResponse() {
        return this.response;
    }
}

export class TimeoutError extends Error {
    constructor() {
        super("Timeout");
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}