import { bindable, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';

@customElement('vm-checkbox')
export class VMCheckboxComponent {
    /** Tracks the value of the checkbox. */
    @bindable(BINDING_MODES.TWO_WAY) checked: unknown;

    /** Whether or not the checkbox should be disabled. */
    @bindable(BINDING_MODES.TO_VIEW) isDisabled = false;

    /** Sets the model for the checkbox. */
    @bindable(BINDING_MODES.ONE_TIME) model: unknown;

    /** Name of the checkbox used to set the input id and label for. */
    @bindable(BINDING_MODES.ONE_TIME) name: string | null = null;

    /** Event emitter for when a change has occurred. */
    @bindable change: (e: { $event: Event; element: VMCheckboxComponent }) => void = null;

    constructor() {}

    /**
     * Handles change events by firing function if one has been provided.
     */
    handleChange($event: Event): void {
        if (this.change) {
            try {
                this.change(Object.assign({ $event, element: this }));
            } catch (error) {
                console.error(error);
            }
        }
    }
}
