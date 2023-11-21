/**
 * Represents a press within the warehouse
 */
export class Press {
    constructor(
        /** Identifier of the press */
        public id: number = null,

        /** Name of the press */
        public name: string = null,
    ) {}

    static create(item: Press = null): Press {
        return item == null ? new Press() : new Press(item.id, item.name);
    }
}
