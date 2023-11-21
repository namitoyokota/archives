import type { VMContextMenu } from 'resources';

export class VMContextMenuDemoItemsComponent {
    items: string[] = [];
    private menu: VMContextMenu;

    constructor() {}

    activate(menu: VMContextMenu): void {
        this.menu = menu;
    }

    attached(): void {
        this.menu.render(this.menu);
        this.items = this.menu.data.items;
    }
}
