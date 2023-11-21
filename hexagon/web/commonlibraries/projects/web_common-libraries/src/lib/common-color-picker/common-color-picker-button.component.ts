import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'hxgn-common-color-picker-button',
    templateUrl: 'common-color-picker-button.component.html',
    styleUrls: ['common-color-picker-button.component.scss']
})

export class CommonColorPickerButtonComponent {
    /** The color the picker will be set to by default. This must be a hex number. */
    @Input() defaultColor = '#d81a1c';

    /** List of predefined colors a user can pick from. */
    @Input() presetColors: string[] = null;

    /** Flag to indicate if opacity control is shown */
    @Input() showOpacity = false;

    /** Flag to indicate if hex color input control is shown */
    @Input() showHexColor = false;

    /** Events out the when the selected color changes */
    @Output() selectedColor = new EventEmitter<string>();

    constructor() { }

     /** Events out when color changes */
     colorChanged(color: string) {
        this.defaultColor = color;
        this.selectedColor.emit(this.defaultColor);
    }
}
