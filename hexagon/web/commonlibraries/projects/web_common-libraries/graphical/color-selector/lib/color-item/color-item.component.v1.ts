import { Component, HostBinding, Input } from '@angular/core';
import { ColorType$v1 } from '../color-type.v1';

@Component({
    selector: 'hxgn-common-color-item-v1',
    template: '',
    styleUrls: ['color-item.component.v1.scss']
})

export class ColorItemComponent {

    /** Color to show */
    @Input('color')
    set setColor(c: string) {
        this.color = c;
        if (this.colorType === ColorType$v1.fill) {
            this.fillColor = this.color;
        } else if (this.colorType === ColorType$v1.line) {
            this.lineColor = this.color;
            this.showLineType = true;
        }
    }
    
    /** Color to show */
    color: string;

    /** Fill or line color */
    @Input('colorType')
    set setColorType(cType: ColorType$v1) {
        this.colorType = cType;
        if (cType === ColorType$v1.fill) {
            this.fillColor = this.color;
        } else if (this.colorType === ColorType$v1.line) {
            this.lineColor = this.color;
            this.showLineType = true;
        }
    } 

    /** Fill or line color */
    colorType: ColorType$v1;

    /** Style for fill color */
    @HostBinding('style.background-color') fillColor;

    /** Style for line color */
    @HostBinding('style.border-color') lineColor;

    /** Class for line type */
    @HostBinding('class.line-type') showLineType;

    

    constructor() { }
}