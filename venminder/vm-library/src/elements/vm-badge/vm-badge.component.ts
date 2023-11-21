import { bindable, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';
import type { VMBadgeTypes } from '../../enums/vm-badge-types.enum';

@customElement('vm-badge')
export class VMBadgeComponent {
    /** The type the badge should be. */
    @bindable(BINDING_MODES.ONE_TIME) type: VMBadgeTypes = null;

    constructor() {}
}
