import { EventAggregator } from 'aurelia-event-aggregator';
import { bindable, customElement, inject } from 'aurelia-framework';
import { BINDING_MODES } from '../../../constants/binding-modes';
import { EventNames } from '../../../enums/event-names.enum';

@customElement('vm-dropdown-item')
export class VMDropdownItemComponent {
    /** Whether or not the item should be disabled. */
    @bindable(BINDING_MODES.TO_VIEW) isDisabled = false;

    /** Whether or not this item is selected. */
    @bindable(BINDING_MODES.TO_VIEW) isSelected = false;

    /** Whether or not this item should be a multiselect item. */
    @bindable(BINDING_MODES.ONE_TIME) multiselect = false;

    /** The value of the given item. Ex) ID. */
    @bindable(BINDING_MODES.ONE_TIME) value: unknown;

    /** Event handler for when an item has been selected. */
    @bindable onSelection: ($event: unknown) => void = null;

    constructor(@inject(EventAggregator) private ea: EventAggregator) {}

    /**
     * Handles click event for the item.
     */
    itemSelected(): void {
        this.onSelection(this.value);

        if (!this.multiselect) {
            this.ea.publish(EventNames.VMDropdownClose);
        }
    }
}
