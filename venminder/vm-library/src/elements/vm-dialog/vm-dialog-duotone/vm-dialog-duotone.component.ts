import { DialogController } from 'aurelia-dialog';
import { bindable, customElement, inject } from 'aurelia-framework';
import { BINDING_MODES } from '../../../constants/binding-modes';
import { AlertIcons } from '../../../enums/alert-icons.enum';
import { AlertTypes } from '../../../enums/alert-types.enum';
import { VMButtonTypes } from '../../../enums/vm-button-types.enum';

@customElement('vm-dialog-duotone')
export class VMDialogDuotoneComponent {
    /** The text to be displayed within the cancel button. Defaults to "Cancel". */
    @bindable(BINDING_MODES.ONE_TIME) cancelLabel = 'Cancel';

    /** Whether or not the cancel button should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) cancelShown = true;

    /** Whether or not the ok button should be disabled. */
    @bindable(BINDING_MODES.TO_VIEW) okDisabled = false;

    /** The text to be displayed within the ok button, i.e. the non-cancel button. Defaults to "Submit". */
    @bindable(BINDING_MODES.ONE_TIME) okLabel = 'Submit';

    /** Whether or not the ok button should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) okShown = true;

    /** Event emitter for when the primary button has been clicked. */
    @bindable okClick: () => void = null;

    /** The tone pairings match alert types, so we use AlertTypes. */
    @bindable(BINDING_MODES.TO_VIEW) private type: AlertTypes = AlertTypes.Info;

    iconClass = '';
    headerClass = '';
    buttonType = VMButtonTypes.Primary;

    constructor(@inject(DialogController) private dialog: DialogController) {}

    bind(): void {
        this.iconClass = {
            [AlertTypes.Danger]: AlertIcons.Exclamation,
            [AlertTypes.Warning]: AlertIcons.Exclamation,
            [AlertTypes.Info]: AlertIcons.Info,
            [AlertTypes.Success]: AlertIcons.Check,
        }[this.type];

        this.headerClass = `vm-dialog-duotone__${this.type}`;

        if (this.type === AlertTypes.Danger) {
            this.buttonType = VMButtonTypes.Deny;
        }
    }

    attached(): void {
        const closeEle: HTMLButtonElement = document.querySelector('.vm-dialog-duotone--header button');
        closeEle?.focus();
    }

    /**
     * Handles cancel button or X click.
     */
    cancel(): void {
        this.dialog.cancel();
    }
}
