import { bindable, computedFrom, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';
import { VMButtonSizes } from '../../enums/vm-button-sizes.enum';
import type { VMButtonTypes } from '../../enums/vm-button-types.enum';

@customElement('vm-button')
export class VMButtonComponent {
    /** Event emitter for when the button has been clicked. */
    @bindable click: ($event: PointerEvent) => void = null;

    /** Whether or not the button should be disabled. */
    @bindable(BINDING_MODES.TO_VIEW) isDisabled = false;

    /** The size the button should be displayed as. Defaults to medium, aka "normal" size. */
    @bindable(BINDING_MODES.ONE_TIME) size: VMButtonSizes = VMButtonSizes.Medium;

    /** The button type. Defaults to secondary (previously default). */
    @bindable(BINDING_MODES.ONE_TIME) type: VMButtonTypes = null;

    @computedFrom('size', 'type')
    get buttonClasses(): string {
        const buttonClasses: string[] = [];
        const classPrefix = 'vm-btn__';

        if (this.type) {
            buttonClasses.push(`${classPrefix}${this.type}`);
        }

        if (this.size !== VMButtonSizes.Medium) {
            buttonClasses.push(`${classPrefix}${this.size}`);
        }

        return buttonClasses.join(' ');
    }

    constructor() {}

    /**
     * Handles button click event.
     * Used to prevent click firing when it shouldn't, such as when the button is disabled or .click hasn't been provided.
     */
    onClick($event: PointerEvent): void {
        if (!this.isDisabled && this.click) {
            this.click($event);
        }
    }
}
