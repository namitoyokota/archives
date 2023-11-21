import type { Subscription } from 'aurelia-event-aggregator';
import { EventAggregator } from 'aurelia-event-aggregator';
import { bindable, customElement, inject, observable } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';
import { EventNames } from '../../enums/event-names.enum';

@customElement('vm-dropdown')
export class VMDropdownComponent {
    /** Whether or not the search input should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) allowSearch = false;

    /** The text to be displayed within the dropdown. Overrides placeholder text once a value is provided. */
    @bindable(BINDING_MODES.TO_VIEW) displayText = '';

    /** Whether or not the dropdown is disabled. */
    @bindable(BINDING_MODES.TO_VIEW) isDisabled = false;

    /** The initial text to be displayed within the dropdown. Will be overridden once display text has a value. */
    @bindable(BINDING_MODES.ONE_TIME) placeholderText = 'Select';

    /** Placeholder text for the search input when search is enabled. */
    @bindable(BINDING_MODES.ONE_TIME) searchPlaceholderText = 'Search';

    /** Event handler for when a search occurs. Event is currently entered search string. */
    @bindable onSearch: ($event: string) => void = null;

    /** Tracks whether or not the dropdown menu is currently open. */
    @observable isOpen = false;

    /** Tracks the search value from the search input. */
    searchText: string = null;

    /**
     * Reference to click listener function that is set when the dropdown is opened and reset on close.
     * Needed to ensure the listener can be safely removed.
     */
    private clickListener: () => void = null;

    /** Subscription for close event coming from vm-dropdown-item. */
    private closeSub: Subscription = null;

    /**
     * Reference to keyup listener function that is set when the dropdown is opened and reset on close.
     * Needed to ensure the listener can be safely removed.
     */
    private keyupListener: () => void = null;

    constructor(@inject(EventAggregator) private ea: EventAggregator, @inject(Element) private element: Element) {}

    /**
     * Detached life cycle hook.
     */
    detached(): void {
        this.removeListeners();
    }

    /**
     * Change function for when the value of isOpen changes.
     * Adds listeners to determine when dropdown should be closed on open, and destroys said listeners on close.
     */
    isOpenChanged(): void {
        if (this.isOpen) {
            this.closeSub = this.ea.subscribe(EventNames.VMDropdownClose, () => {
                this.isOpen = false;
            });

            this.clickListener = function (event: PointerEvent): void {
                if (event.target !== this.element && !this.element.contains(event.target as Node)) {
                    this.isOpen = false;
                }
            }.bind(this);

            this.keyupListener = function (event: KeyboardEvent): void {
                if (event.key === 'Escape') {
                    this.isOpen = false;
                }
            }.bind(this);

            window.addEventListener('click', this.clickListener);
            window.addEventListener('keyup', this.keyupListener);
        } else {
            if (this.allowSearch && this.searchText) {
                this.searchText = null;
                this.onSearch(this.searchText);
            }

            this.removeListeners();
        }
    }

    /**
     * Toggles dropdown state on button click.
     */
    toggleDropdown($event: PointerEvent): void {
        if (!$event || $event.pointerType) {
            this.isOpen = !this.isDisabled && !this.isOpen;
        }
    }

    /**
     * Removes and resets all listeners.
     */
    private removeListeners(): void {
        this.closeSub?.dispose();
        this.closeSub = null;

        if (this.clickListener) {
            window.removeEventListener('click', this.clickListener);
            this.clickListener = null;
        }

        if (this.keyupListener) {
            window.removeEventListener('keyup', this.keyupListener);
            this.keyupListener = null;
        }
    }
}
