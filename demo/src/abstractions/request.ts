export class Request {
    id: string;
    data: unknown;

    constructor() {
        (this.id = '123'), (this.data = { name: 'John' });
    }
}
