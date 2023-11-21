import { bindable, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';
import type { VMCheckboxPicklist } from '../../interfaces/vm-checkbox-picklist';
import type { VMCheckboxComponent } from '../vm-checkbox/vm-checkbox.component';

@customElement('vm-checkbox-picklist')
export class VMCheckboxPicklistComponent {
    /** List of items to select. */
    @bindable(BINDING_MODES.TWO_WAY) model: VMCheckboxPicklist[] = [];

    /** Event handler for change event to any picklist items. */
    @bindable change: (selectedItems: VMCheckboxPicklist[]) => void = null;

    /** Tracks the value of the select all checkbox. */
    allSelected = false;

    /** Tracks selected items in list. */
    selectedItems: VMCheckboxPicklist[] = [];

    constructor() {}

    /**
     * Sets checkbox name based on item label and index.
     */
    getCheckboxName(itemLabel: string, index: number): string {
        return ['checkbox', ...itemLabel.toLowerCase().split(' '), index.toString()].join('-');
    }

    /**
     * Handles change to any picklist items.
     */
    handleChange(e?: { $event: Event; element: VMCheckboxComponent }, index?: number): void {
        this.allSelected = this.model.length === this.selectedItems.length;

        const update = this.model.splice(0, this.model.length);
        if (e) {
            update[index].isSelected = !update[index].isSelected;
        }

        this.model.push(...update);

        if (this.change) {
            this.change(this.selectedItems);
        }
    }

    /**
     * Handles all selected checkbox click. Toggles all requests on or off based on value.
     */
    toggleAllSelected(): void {
        this.model.forEach((item: VMCheckboxPicklist) => {
            item.isSelected = this.allSelected;
        });

        if (this.allSelected) {
            this.selectedItems = [...this.model];
        } else {
            this.selectedItems = [];
        }

        this.handleChange();
    }

    /**
     * Resets picklist to blank/empty
     */
    clear(): void {
        this.model.forEach((item: VMCheckboxPicklist) => {
            item.isSelected = false;
        });

        this.selectedItems = [];
        this.handleChange();
    }
}
