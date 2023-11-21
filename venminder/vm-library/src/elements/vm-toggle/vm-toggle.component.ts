import { bindable, computedFrom, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';

enum VMToggleClasses {
    Disabled = 'vm-toggle__disabled',
    Small = 'vm-toggle__small',
    Toggled = 'vm-toggle__toggled',
}

@customElement('vm-toggle')
export class VMToggleComponent {
    /** Whether or not the toggle should be disabled. Default value is false. */
    @bindable(BINDING_MODES.TO_VIEW) isDisabled = false;

    /** Whether or not the small toggle should be shown instead of the normal size. Default value is false. */
    @bindable(BINDING_MODES.ONE_TIME) isSmall = false;

    /** The value of the toggle. */
    @bindable(BINDING_MODES.TWO_WAY) value = false;

    /** Event emitter for when the input value has changed. */
    @bindable changed?: ($event: Event) => void = null;

    @computedFrom('isDisabled', 'isSmall', 'value')
    get vmToggleClasses(): string {
        const classes: string[] = [];

        if (this.isDisabled) {
            classes.push(VMToggleClasses.Disabled);
        }

        if (this.isSmall) {
            classes.push(VMToggleClasses.Small);
        }

        if (this.value) {
            classes.push(VMToggleClasses.Toggled);
        }

        return classes.join(' ');
    }

    constructor() {}

    onChanged($event: Event): void {
        /** Type: 'change' is a generic Event */
        this.changed?.($event);
    }
}
