/**
 * Represents a operator for the presses
 */
export class Operator {
    constructor(
        /** Identifier of the operator */
        public id: number = null,

        /** Name of the operator */
        public name: string = null,
    ) {}

    static create(item: Operator = null): Operator {
        return item == null ? new Operator() : new Operator(item.id, item.name);
    }
}
