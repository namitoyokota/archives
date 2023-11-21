import { inject } from 'aurelia-framework';
import { VMContextMenuService } from 'resources';

export class VMContextMenuDemoComponent {
    constructor(@inject(VMContextMenuService) private contextMenuService: VMContextMenuService) {}

    /**
     * Opens filter list on filter button click.
     */
    openContextMenu($event: unknown): void {
        const items: string[] = [];
        let event = $event['target'];

        for (let i = 0; i < 10; i++) {
            items.push('Item ' + i);
        }

        while (event.localName !== 'vm-button') {
            event = event.parentElement;
        }

        this.contextMenuService.open({
            component: 'vm-context-menu-demo/vm-context-menu-demo-items.component',
            x: event.offsetLeft,
            y: event.offsetTop + event.offsetHeight + 15 - window.scrollY,
            data: {
                items: items,
            },
        });
    }
}
