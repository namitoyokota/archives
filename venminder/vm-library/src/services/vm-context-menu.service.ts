import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { first, map, pairwise } from 'rxjs/operators';
import { VMContextMenu } from '../classes/vm-context-menu';
import type { IVMContextMenuService } from '../interfaces/vm-context-menu-service';

export class VMContextMenuService implements IVMContextMenuService {
    private contextMenu = new BehaviorSubject<VMContextMenu>(new VMContextMenu());
    private isOpen = false;

    constructor() {
        this.contextMenu.subscribe((contextMenu: VMContextMenu) => (this.isOpen = contextMenu.isOpen));
    }

    getContextMenuState(): Observable<VMContextMenu> {
        return this.contextMenu;
    }

    open(contextMenu: VMContextMenu): Observable<VMContextMenu> {
        if (!this.isOpen) {
            const initialMenuState = new VMContextMenu();
            this.contextMenu.next({
                ...initialMenuState,
                isOpen: true,
                ...contextMenu,
            });
        }

        return this.contextMenu.pipe(
            pairwise(),
            first((contextMenus: [VMContextMenu, VMContextMenu]) => contextMenus[0].isOpen && !contextMenus[1].isOpen),
            map((contextMenus: [VMContextMenu, VMContextMenu]) => contextMenus[0]),
        );
    }

    close(contextMenu = new VMContextMenu()): void {
        this.contextMenu.next({
            ...contextMenu,
            isOpen: false,
        });
    }
}
