import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { VMContextMenu } from '../../../classes/vm-context-menu';

export class VMSearchMenuComponent {
    /** Stores the menu state set on component activation. */
    contextMenu: VMContextMenu = null;

    /** List of items to be displayed. */
    items: string[] = [];

    /** Style string to set the width of the menu. */
    width: string;

    /** Reference used for component destroy. */
    private destroy: Subject<void> = new Subject<void>();

    constructor() {}

    /**
     * Activate life cycle hook.
     */
    activate(contextMenu: VMContextMenu): void {
        this.contextMenu = contextMenu;
    }

    /**
     * Attached life cycle hook.
     */
    attached(): void {
        this.contextMenu.render(this.contextMenu);
        this.width = `width: ${this.contextMenu.data.width}px`;

        this.contextMenu.data.items$.pipe(takeUntil(this.destroy)).subscribe((items: string[]) => {
            this.items = items;
        });
    }

    /**
     * Detached life cycle hook.
     */
    detached(): void {
        this.destroy.next();
        this.destroy.complete();
    }
}
