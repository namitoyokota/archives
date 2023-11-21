/* eslint-disable @angular-eslint/no-output-native */
import {
    Component,
    OnInit,
    Input,
    ViewEncapsulation,
    Output,
    EventEmitter,
    ContentChildren,
    QueryList,
    ViewChild,
    ContentChild,
    forwardRef,
    Inject
} from '@angular/core';

import { MatSelectChange, MatSelect } from '@angular/material/select';
import { DropdownItem } from './dropdown-item';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonConstants } from '../common-constants';
import { ICommonConstants } from '../common-constants.interfaces';

// Custom Template Sections
@Component({
    selector: 'hxgn-common-dropdown-item',
    template: '<ng-template #content><ng-content></ng-content></ng-template>'
})
export class CommonDropdownItemComponent {
    /** Allows access to the DropdownItem in the DOM */
    @ViewChild('content', { static: true }) content: any;

    /** The identifier of the DropdownItem */
    @Input() value: any;

    /** The width of the DropdownItem */
    @Input() width: string;

    /** The height of the DropdownItem */
    @Input() height: string;

    /** Emits a click event when the DropdownItem is clicked */
    @Output() click: EventEmitter<any> = new EventEmitter();

    /**
     * Emits a click event containing the item's value when the item is clicked
     */
    onClick() {
        this.click.emit(this.value);
    }
}

@Component({
    selector: 'hxgn-common-dropdown-trigger',
    template: '<ng-content></ng-content>'
})
export class CommonDropdownTriggerComponent { }

@Component({
    selector: 'hxgn-common-dropdown-toggle-button',
    template: '<ng-content></ng-content>'
})
export class CommonDropdownToggleButtonComponent { }

// Custom Component wrapping the mat-select
@Component({
    selector: 'hxgn-common-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CommonDropdownComponent),
        multi: true
    }]
})
export class CommonDropdownComponent implements OnInit, ControlValueAccessor {
    /** Allows access to the Dropdown in the DOM */
    @ViewChild('matselect', { static: true }) matSelect: MatSelect;

    /** Gets a DropdownTrigger from the DOM if it exists */
    @ContentChild(CommonDropdownTriggerComponent, { static: true }) trigger: CommonDropdownTriggerComponent;

    /** Gets a DropdownToggleButton from the DOM if it exists */
    @ContentChild(CommonDropdownToggleButtonComponent, { static: true }) toggleButton: CommonDropdownToggleButtonComponent;

    /** Gets a list of DropdownItems from the DOM if any exist*/
    @ContentChildren(CommonDropdownItemComponent) customDropdownItems: QueryList<CommonDropdownItemComponent> =
                                                                            new QueryList<CommonDropdownItemComponent>();

    /** Emits an event when the selected DropdownItem changes */
    @Output() selectionChange: EventEmitter<MatSelectChange> = new EventEmitter<MatSelectChange>();

    /** Emits an event when the value of the Dropdown changes */
    @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

    /** Emits an event when the Dropdown is toggled */
    @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Emits an event when the DropdownToggleButton is clicked */
    @Output() toggledOnChange: EventEmitter<any> = new EventEmitter<any>();

    /** Identifier of the currently selected DropdownItem */
    @Input() value: any;

    /** Populates the Dropdown with DropdownItems if no other DropdownItems exist */
    @Input() items: string[];

    /** Populates the Dropdown with DropdownItems if no custom DropdownItems exist */
    @Input() dropdownItems: DropdownItem[];

    /** Sets a placeholder value when no items are selected */
    @Input() placeholder: string;

    /** Sets the name of the Dropdown */
    @Input() name: string;

    /** Sets a title at the top of the list of DropdownItems */
    @Input() dropdownTitle: string;

    /** Records the state of the DropdownToggleButton */
    @Input() toggledOn = false;

    /** Controls whether the user should be allowed to select multiple options */
    @Input() multiple = false;

    /** Controls whether the Dropdown has checkboxes */
    @Input() checkboxes = false;

    /** Whether the Dropdown is required */
    @Input() required = false;

    /** Enables and disables the Dropdown */
    @Input() disabled = false;

    /** Sets the 'horizontal-list' class on the dropdown on or off */
    @Input() horizontalList = false;

    /** Dropdown only displays as the expansion button when true */
    @Input() buttonOnly = false;

    /** Allows for a custom comparison function to be input */
    @Input() compareWith: Function;

    /** True if a DropdownTrigger exists */
    customTriggerMode = false;

    /** True if a DropdownToggleButton exists */
    toggleButtonMode = false;

    /** Tracks the selected item index when checkboxes are enabled in single selection mode */
    selectedIndex = -1;

    constructor(@Inject(CommonConstants) public constants: ICommonConstants) { }

    /** OnInit */
    ngOnInit() {
        this.customTriggerMode = !!this.trigger;
        this.toggleButtonMode = !!this.toggleButton;
    }

    /**
     * Closes the Dropdown
     */
    close() {
        this.matSelect.close();
    }

    /**
     * Focuses the Dropdown
     */
    focus() {
        this.matSelect.focus();
    }

    /** Opens the Dropdown */
    open() {
        this.matSelect.open();
    }

    /**
     * Toggles the Dropdown between open and closed
     */
    toggle() {
        this.matSelect.toggle();
    }

    /**
     * Updates whether or not the Dropdown is in an error state
     */
    updateErrorState() {
        return this.matSelect.updateErrorState();
    }

    /**
     * Emits an event when the Dropdown is toggled
     * @param open Describes if the Dropdown is open
     */
    openedChanged(open: boolean) {
        this.openedChange.emit(open);
    }

    /**
     * Emits an event when the selected DropdownItem changes
     * @param event An object containing the index of the currently selected DropdownItem
     */
    selectionChanged(event: MatSelectChange) {
        this.selectionChange.emit(new MatSelectChange(this.matSelect, event.value));
        this.valueChange.emit(event.value);
        this.onChange(event.value);
        this.onTouched();
    }

    /**
     * Toggles the DropdownToggleButton when clicked if it exists
     * @param event The event associated with a Dropdown click
     */
    toggleClicked(event: any) {
        this.toggledOn = !this.toggledOn;
        this.toggledOnChange.emit(this.toggledOn);
        this.onTouched();

        // prevent the dropdown from opening
        event.stopPropagation();
    }

    /**
     * The default comparison function to use if no other function is given
     * @param item1 The first item to compare
     * @param item2 The second item to compare
     */
    defaultCompareWithFn(item1: any, item2: any): boolean {
        if (item1.id && item2.id) {
            return (item1.id === item2.id);
        }
        return item1 && item2 && item1 === item2;
    }

    // ControlValueAccessor Implementation
    /**
     * A custom function that is called when the selected value changes.
     * Receives the new selected index as a parameter
     */
    onChange: any = () => { };
    /**
     * A custom function that is called when the DropdownToggleButton is clicked
     */
    onTouched: any = () => { };

    /**
     * Registers an onChange function with the Dropdown
     * @param fn The new onChange function
     */
    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    /**
     * Registers an onTouched function with the Dropdown
     * @param fn The new onTouched function
     */
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    /**
     * Manually sets the selected DropdownItem
     * @param value The new value of the Dropdown
     */
    writeValue(value: any) {
        this.value = value;
    }

    /**
     * Manually sets the disabled state of the Dropdown
     * @param isDisabled True to disable Dropdown
     */
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }
}
