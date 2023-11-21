import { observable } from 'aurelia-framework';
import { bindable } from 'aurelia-templating';
import { EllipsisOption } from '../abstractions/ellipsis-option';

export class EllipsisContextMenu {
    /** Enum used to generate options */
    @bindable @observable options: EllipsisOption[];

    /** Event emitter for when option was selected */
    @bindable selected: ($event: string) => void = null;

    /** Flag to indicate whether to show/hide context menu */
    showMenu = false;

    /** Handles tab refresh/close when unsaved changes exist */
    private handleClick = (event: MouseEvent) => {
        const outsideElement = !event.composedPath().includes(this.menuElement);
        if (outsideElement) {
            this.hideMenu();
        }
    };

    /** HTML element of the context menu */
    private readonly menuElement: HTMLElement = document.querySelector('.option-list');

    constructor() {}

    /** Toggles menu to show/hide context menu */
    toggleMenu(): void {
        this.showMenu = !this.showMenu;

        if (this.showMenu) {
            this.addClickListener();
        }
    }

    /** Hides context menu */
    hideMenu(): void {
        this.showMenu = false;
        this.removeClickListener();
    }

    /** Emits event for option selected */
    selectOption(id: string): void {
        this.selected(id);
        this.hideMenu();
    }

    /**  Listens to any click in the DOM */
    private addClickListener(): void {
        document.addEventListener('click', this.handleClick);
    }

    /** Removes click listener */
    private removeClickListener(): void {
        document.removeEventListener('click', this.handleClick);
    }
}
