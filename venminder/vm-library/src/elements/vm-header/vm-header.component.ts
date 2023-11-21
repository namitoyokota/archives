import { bindable, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';

@customElement('vm-header')
export class VMHeaderComponent {
    /** Font awesome class to be displayed as an icon next to the header on the left-hand side. */
    @bindable(BINDING_MODES.ONE_TIME) faClass = '';

    /** Whether or not the border underneath the component should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) showBorder = true;

    /** The text displayed as the header on the left-hand side. */
    @bindable(BINDING_MODES.ONE_TIME) text = '';

    /** Handles the click event on the provided fa icon. */
    @bindable faClick: () => void = null;

    constructor() {}
}
