import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorHelper } from './color-helper.v1';
import { ColorSelectorTranslationTokens } from './color-selector.translation';
import { ColorType$v1 } from './color-type.v1';
import { Colors } from './colors.v1';

@Component({
    selector: 'hxgn-common-color-selector-v1',
    templateUrl: 'color-selector.component.v1.html',
    styleUrls: ['color-selector.component.v1.scss']
})

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ColorSelectorComponent$v1 {

    /** The active color */
    @Input() activeColor: string;

    /** Is the color for a fill or stroke */
    @Input() colorType: ColorType$v1;

    /** Flag that is true when component is disabled */
    @Input() disabled = false;

    /** Color has changed */
    @Output() colorChange = new EventEmitter<string>();

    constructor() { }

    /**
     * Returns opacity for active color
     */
    opacity(): number {
        if (this.activeColor) {
            return ColorHelper.getOpacity(this.activeColor) * 100;
        }

        return 0;
    }

    /**
     * Returns a color name token for the active color
     */
    colorToken(): string {
        switch(this.activeColor.substring(0, 7)) {
            case Colors.darkRed:
                return ColorSelectorTranslationTokens.darkRed;
            case Colors.red:
                return ColorSelectorTranslationTokens.red;
            case Colors.orange:
                return ColorSelectorTranslationTokens.orange;
            case Colors.yellow:
                return ColorSelectorTranslationTokens.yellow;
            case Colors.green:
                return ColorSelectorTranslationTokens.green;
            case Colors.darkGreen:
                return ColorSelectorTranslationTokens.darkGreen;
            case Colors.cyan:
                return ColorSelectorTranslationTokens.cyan;
            case Colors.blue:
                return ColorSelectorTranslationTokens.blue;
            case Colors.indigo:
                return ColorSelectorTranslationTokens.indigo;
            case Colors.purple:
                return ColorSelectorTranslationTokens.purple;
            case Colors.maroon:
                return ColorSelectorTranslationTokens.maroon;
            case Colors.pink:
                return ColorSelectorTranslationTokens.pink;
            case Colors.brown:
                return ColorSelectorTranslationTokens.brown;
            case Colors.black:
                return ColorSelectorTranslationTokens.black;
            case Colors.white:
                return ColorSelectorTranslationTokens.white;
            default:
                return null;
        }
    }
}