import { bindable, computedFrom, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';
import { AlertIcons } from '../../enums/alert-icons.enum';
import { AlertTypes } from '../../enums/alert-types.enum';

enum VMAlertClasses {
    Hide = 'vm-alert__hidden',
    Large = 'vm-alert__lg',
}

@customElement('vm-alert')
export class VMAlertComponent {
    /** Whether or not the large alert size should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) isLarge = false;

    /** Whether or not the dismiss icon should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) showDismiss = false;

    /** Whether or not the icon on the left hand side should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) showIcon = true;

    /** The type of alert to be displayed. */
    @bindable(BINDING_MODES.ONE_TIME) private type: AlertTypes = null;

    /** Tracks whether or not the component has been dismissed. Once true, the component will no longer be shown. */
    hasBeenDismissed = false;

    @computedFrom('hasBeenDismissed', 'isLarge', 'type')
    get alertClasses(): string {
        const classes: string[] = [`vm-alert__${this.type}`];

        if (this.hasBeenDismissed) {
            classes.push(VMAlertClasses.Hide);
        }

        if (this.isLarge) {
            classes.push(VMAlertClasses.Large);
        }

        return classes.join(' ');
    }

    @computedFrom('type')
    get iconClasses(): string {
        const classes: string[] = ['vm-alert--icon'];

        switch (this.type) {
            case AlertTypes.Danger:
            case AlertTypes.Warning:
                classes.push(AlertIcons.Exclamation);
                break;
            case AlertTypes.Info:
                classes.push(AlertIcons.Info);
                break;
            case AlertTypes.Success:
                classes.push(AlertIcons.Check);
                break;
        }

        return classes.join(' ');
    }

    constructor() {}
}
