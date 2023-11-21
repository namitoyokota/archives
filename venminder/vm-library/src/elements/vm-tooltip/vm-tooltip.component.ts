import { bindable, computedFrom, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';
import { VMTooltipPins } from '../../enums/vm-tooltip-pins.enum';
import { VMTooltipPositions } from '../../enums/vm-tooltip-positions.enum';
import type { VMTooltipTextOptions } from '../../interfaces/vm-tooltip-text-options';

const VM_TOOLTIP_PIN_CLASSES = {
    [VMTooltipPins.Left]: 'tooltip__info--pin-left',
    [VMTooltipPins.Right]: 'tooltip__info--pin-right',
};

const VM_TOOLTIP_POSITION_CLASSES = {
    [VMTooltipPositions.Bottom]: 'tooltip__info--bottom',
    [VMTooltipPositions.Left]: 'tooltip__info--left',
    [VMTooltipPositions.Right]: 'tooltip__info--right',
    [VMTooltipPositions.Top]: 'tooltip__info--top',
};

@customElement('vm-tooltip')
export class VMTooltipComponent {
    /** Whether or not the tooltip should be shown. */
    @bindable(BINDING_MODES.TO_VIEW) showTooltip = true;

    /** The text to be displayed within the tooltip. */
    @bindable(BINDING_MODES.ONE_TIME) text = '';

    /** The position the tooltip should be rendered in. Defaults to bottom. */
    @bindable(BINDING_MODES.ONE_TIME) private position: string = VMTooltipPositions.Bottom;

    /** 'Starting direction' of the text. Use Right if you expect clipping on the right. */
    @bindable(BINDING_MODES.ONE_TIME) private pin: string = VMTooltipPins.Left;

    /** Options for width and text wrap, see interface. */
    @bindable(BINDING_MODES.ONE_TIME) private textOptions: Partial<VMTooltipTextOptions> = {};

    /** The class applied to the tooltip based on its pin direction. */
    pinClass = '';

    /** The class applied to the tooltip based on position. */
    positionClass = '';

    @computedFrom('textOptions')
    get style(): string {
        return Object.keys(this.textOptions)
            .map((key) => `${key}: ${this.textOptions[key]}`)
            .join('; ');
    }

    /**
     * Attached life cycle hook.
     */
    attached(): void {
        this.positionClass = VM_TOOLTIP_POSITION_CLASSES[this.position];
        this.pinClass = VM_TOOLTIP_PIN_CLASSES[this.pin];
    }
}
