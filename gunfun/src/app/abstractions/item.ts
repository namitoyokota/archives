/**
 * Represents a item id option for batches
 */
export class Item {
    constructor(
        /** Identifier of the item */
        public id: number = null,

        /** Name of the press */
        public name: string = null,
    ) {}

    static create(item: Item = null): Item {
        return item == null ? new Item() : new Item(item.id, item.name);
    }
}
