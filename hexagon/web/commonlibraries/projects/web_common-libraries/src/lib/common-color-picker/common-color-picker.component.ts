import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { CommonColorPickerTranslationTokens } from './common-color-picker.translation';

@Component({
    selector: 'hxgn-common-color-picker',
    templateUrl: 'common-color-picker.component.html',
    styleUrls: ['common-color-picker.component.scss']
})

export class CommonColorPickerComponent {

    /** The color the picker will be set to by default. This must be a hex number. */
    @Input('defaultColor') 
    set setDefaultColor(color: string) {
        this.defaultColor = color.substring(0, 7);
        this.hexColor = this.defaultColor;
        if (color.length > 7) {
            this.hasOpacity = true;
            this.opacity = this.getOpacity(color) * 100;
        }
    }

    /** List of predefined colors a user can pick from. */
    @Input() presetColors: string[] = null;

    /** Flag to indicate if opacity control is shown */
    @Input() showOpacity = false;

    /** Flag to indicate if hex color input control is shown */
    @Input() showHexColor = false;

    /** Events out the when the selected color changes */
    @Output() selectedColor = new EventEmitter<string>();

    defaultColor = '#d81a1c';
    hexColor = '#d81a1c';

    opacity = 100;
    hasOpacity = false;
    tokens: typeof CommonColorPickerTranslationTokens = CommonColorPickerTranslationTokens;

    constructor() { }

    /** Events out when color changes */
    colorChanged() {
        this.hexColor = this.defaultColor;
        if (this.hasOpacity) {
            const hex = this.getOpacityHex(this.opacity/100);
            this.selectedColor.emit(this.defaultColor + hex);
        } else {
            this.selectedColor.emit(this.defaultColor);
        }
    }

    /**
     * Set the opacity of the color
     */
     setOpacity(event: MatSliderChange) {
        this.opacity = event.value;
        const hex = this.getOpacityHex(this.opacity/ 100);
        this.selectedColor.emit(this.defaultColor + hex);
    }

    /** Called to validate the input color */
    hexColorChanged() {
        if (this.validateHexColor(this.hexColor)) {
            this.defaultColor = this.hexColor;
        }
    }

    /** If the hex color string is valid, set the update the color using the hex color value.  If not reset
     * to the current color.
     */
    setHexColor() {
        if (!this.validateHexColor(this.hexColor)) {
            this.hexColor = this.defaultColor;
            return;
        }
        this.defaultColor = this.hexColor;
        this.selectedColor.emit(this.defaultColor);
        
    }

    /** Validate the input hex color string */
    private validateHexColor(hexColor: string) {
        if (!hexColor) {
            return false;
        }
        let temp = hexColor.substring(0,1);
        if (temp !== '#') {
            return false;
        }

        hexColor = hexColor.trim().substring(0, 7);
        if (hexColor.length != 7)  {
            return false;
        }

        temp = hexColor.substring(1,2);
        let color = parseInt(temp,16);
        if (color === -1) {
            return false;
        }
        
        temp = hexColor.substring(3,4);
        color = parseInt(temp,16);
        if (color === -1) {
            return false;
        }
        
        temp = hexColor.substring(5,2);
        color = parseInt(temp,16);
        if (color === -1) {
            return false;
        }

        return (true);
    }

    private getOpacity(color: string): number {
        if (color.length < 9) {
            return 1
        }

        // Look at the last two numbers
        const rawVal = parseInt(color.slice(-2), 16);
        return +(rawVal / 255).toFixed(2); // Convert to a number between 1 an 0
    }

    private getOpacityHex(opacity: number): string {
        const raw = (opacity * 255).toString(16).split('.')[0].substring(0, 2);
        return  raw.length === 2 ? raw : '0' + raw;
    }
}
