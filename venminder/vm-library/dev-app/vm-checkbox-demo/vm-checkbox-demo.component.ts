import type { VMCheckboxPicklist } from 'resources';

export class VMCheckboxDemoComponent {
    isSelected = false;
    items: VMCheckboxPicklist[] = [];

    constructor() {}

    attached(): void {
        for (let i = 0; i < 10; i++) {
            this.items.push({
                id: 'id-' + i,
                display: 'Item ' + i,
                isSelected: false,
            });
        }
    }

    handleItemsChange(items: VMCheckboxPicklist[]): void {
        // eslint-disable-next-line no-console
        console.log(items);
    }
}
