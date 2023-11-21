/* eslint-disable @angular-eslint/no-output-native */
/* eslint-disable @angular-eslint/component-class-suffix */
import {
    Component,
    ContentChild,
    ContentChildren,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnInit,
    Output,
    QueryList,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelect, MatSelectChange } from '@angular/material/select';

import { CommonConstants } from '../common-constants';
import { ICommonConstants } from '../common-constants.interfaces';

// Custom Template Sections
@Component({
    selector: 'hxgn-common-dropdown-item-v2',
    template: '<ng-template #content><ng-content></ng-content></ng-template>'
})
export class CommonDropdownItemComponent$v2 {

    /** Allows access to the DropdownItem in the DOM */
    @ViewChild('content', { static: true }) content: any;

    /** The identifier of the DropdownItem */
    @Input() value: any;

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
    selector: 'hxgn-common-dropdown-trigger-v2',
    template: '<ng-content></ng-content>'
})
export class CommonDropdownTriggerComponent$v2 { }

// Custom Component wrapping the mat-select
@Component({
    selector: 'hxgn-common-dropdown-v2',
    templateUrl: './common-dropdown.component.v2.html',
    styleUrls: ['./common-dropdown.component.v2.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CommonDropdownComponent$v2),
        multi: true
    }]
})
export class CommonDropdownComponent$v2 implements OnInit, ControlValueAccessor {

    /** Allows access to the Dropdown in the DOM */
    @ViewChild('matselect', { static: true }) matSelect: MatSelect;

    /** Gets a DropdownTrigger from the DOM if it exists */
    @ContentChild(CommonDropdownTriggerComponent$v2, { static: true }) trigger: CommonDropdownTriggerComponent$v2;

    /** Gets a list of DropdownItems from the DOM if any exist*/
    @ContentChildren(CommonDropdownItemComponent$v2) customDropdownItems: QueryList<CommonDropdownItemComponent$v2> =
        new QueryList<CommonDropdownItemComponent$v2>();

    /** Emits an event when the selected DropdownItem changes */
    @Output() selectionChange: EventEmitter<MatSelectChange> = new EventEmitter<MatSelectChange>();

    /** Emits an event when the value of the Dropdown changes */
    @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

    /** Emits an event when the Dropdown is toggled */
    @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Identifier of the currently selected DropdownItem */
    @Input() value: any;

    /** Sets a placeholder value when no items are selected */
    @Input() placeholder: string;

    /** Whether the Dropdown is required */
    @Input() required = false;

    /** Enables and disables the Dropdown */
    @Input() disabled = false;

    /** Allows for a custom comparison function to be input */
    @Input() compareWith: Function;

    /** Controls whether the user should be allowed to select multiple options */
    @Input() multiple = false;

    /** True if a DropdownTrigger exists */
    customTriggerMode = false;

    /** Tracks the selected item index when checkboxes are enabled in single selection mode */
    selectedIndex = -1;

    /** Panel class to pass down if multiple set */
    panelClass: string;

    constructor(@Inject(CommonConstants) public constants: ICommonConstants) { }

    /** OnInit */
    ngOnInit() {
        this.customTriggerMode = !!this.trigger;
        this.panelClass = this.multiple ? 'multi-select' : '';
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
        if (item1?.id && item2?.id) {
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
