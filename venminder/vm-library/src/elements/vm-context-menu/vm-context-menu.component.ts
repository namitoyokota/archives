import { customElement, inject, PLATFORM } from 'aurelia-framework';
import type { Subscription } from 'rxjs';
import { fromEvent, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { VMContextMenu } from '../../classes/vm-context-menu';
import { VMContextMenuService } from '../../services/vm-context-menu.service';

const BASE_MARGIN = 15;

@customElement('vm-context-menu')
export class VMContextMenuComponent {
    contextMenuContainerRef: HTMLElement;
    menuElementRef: HTMLElement;
    menuState: VMContextMenu = new VMContextMenu();
    menuStyle = '';

    private contextMenuClickSubscription: Subscription = null;
    private serviceSubscription: Subscription;
    private windowEventsSubscription: Subscription;

    constructor(@inject(VMContextMenuService) private service: VMContextMenuService) {}

    /**
     * Attached life cycle hook.
     */
    attached(): void {
        this.serviceSubscription = this.service.getContextMenuState().subscribe(this.subscriptionHandler.bind(this));

        this.windowEventsSubscription = merge(fromEvent(window, 'scroll'), fromEvent(window, 'resize'))
            .pipe(filter(() => this.menuState.isOpen))
            .subscribe(() => this.close());
    }

    /**
     * Detached life cycle hook.
     */
    detached(): void {
        this.contextMenuClickSubscription.unsubscribe();
        this.serviceSubscription.unsubscribe();
        this.windowEventsSubscription.unsubscribe();
    }

    private subscriptionHandler(menuState: VMContextMenu): void {
        const recursion = menuState.component === PLATFORM.moduleName('./vm-context-menu.component', 'vm-library');

        try {
            if (recursion) {
                throw 'Context Menu cannot compose itself recursively.';
            }
        } catch (e) {
            console.error(e);
        }

        this.menuState = {
            ...menuState,
            component: recursion ? '' : menuState.component,
            render: (): void => {
                this.render();
            },
        };
    }

    private render(): void {
        const offsetX = window.innerWidth - this.menuState.x - this.menuElementRef.offsetWidth;
        const offsetY = window.innerHeight - this.menuState.y - this.menuElementRef.offsetHeight;
        const left = this.menuState.x + (offsetX < 0 ? offsetX - BASE_MARGIN : 0);
        const top = this.menuState.y + (offsetY < 0 ? offsetY : 0);

        this.menuStyle = `top:${top}px;left:${left}px;`;

        this.contextMenuClickSubscription = fromEvent(this.contextMenuContainerRef, 'click').subscribe((e) => {
            this.close(e);
        });
    }

    private close(event?: unknown): void {
        if (!event || !event['target'].closest('.actionable-item')) {
            this.service.close();
            this.contextMenuClickSubscription.unsubscribe();
        }
    }
}
