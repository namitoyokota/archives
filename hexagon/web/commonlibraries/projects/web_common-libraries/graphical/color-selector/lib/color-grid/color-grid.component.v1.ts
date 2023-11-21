import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ColorType$v1 } from '../color-type.v1';
import { ColorHelper } from '../color-helper.v1';
import { Colors } from '../colors.v1';

@Component({
    selector: 'hxgn-common-color-grid-v1',
    templateUrl: 'color-grid.component.v1.html',
    styleUrls: ['color-grid.component.v1.scss']
})

export class ColorGridComponent {

    /** Is the color for a fill or stroke */
    @Input() colorType: ColorType$v1;

    /** The color that is currently active */
    @Input('activeColor') 
    set setActiveColor(color: string) {
        this.activeColor = color.substring(0, 7);
        this.opacity = ColorHelper.getOpacity(color) * 100;
    }

    /** The color that is currently active */
    activeColor: string;

    /** Color that was changed */
    @Output() colorChange = new EventEmitter<string>();

    /** Colors that can be selected */
    colorOptions = Object.values(Colors);

    /** The color's opacity */
    opacity = 100;

    constructor() { }

    /**
     * Select color the given color
    */
    selectColor(color: string): void {
        const hex = ColorHelper.getOpacityHex(this.opacity/ 100);
        this.colorChange.emit(color + hex);
    }

    /**
     * Set the opacity of the color
     */
    setOpacity(event: MatSliderChange) {
        this.opacity = event.value;
             
        const hex = ColorHelper.getOpacityHex(this.opacity/ 100);
        this.colorChange.emit(this.activeColor + hex);
    }
}