/**
 * Represents a ink used within the press
 */
export class Ink {
    constructor(
        /** Identifier of the ink */
        public id: number = null,

        /** Name of the press */
        public name: string = null,
    ) {}

    static create(item: Ink = null): Ink {
        return item == null ? new Ink() : new Ink(item.id, item.name);
    }
}
