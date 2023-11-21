import { DialogController } from 'aurelia-dialog';
import { bindable, computedFrom, customElement, inject } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';

@customElement('vm-dialog')
export class VMDialogComponent {
    /** The text to be displayed within the cancel button. Defaults to "Cancel". */
    @bindable(BINDING_MODES.ONE_TIME) cancelLabel = 'Cancel';

    /** Whether or not the cancel button should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) cancelShown = true;

    /** The title to be displayed at the top of the dialog. */
    @bindable(BINDING_MODES.ONE_TIME) dialogTitle = '';

    /** Whether or not the large dialog should be displayed. */
    @bindable(BINDING_MODES.ONE_TIME) isLarge = false;

    /** Whether or not the ok button should be disabled. */
    @bindable(BINDING_MODES.TO_VIEW) okDisabled = false;

    /** The text to be displayed within the ok button, i.e. the non-cancel button. Defaults to "Submit". */
    @bindable(BINDING_MODES.ONE_TIME) okLabel = 'Submit';

    /** Whether or not the ok button should be shown. */
    @bindable(BINDING_MODES.ONE_TIME) okShown = true;

    /** Event emitter for when the primary button has been clicked. */
    @bindable okClick: () => void = null;

    @computedFrom('isLarge')
    get largeClass(): string {
        return this.isLarge ? 'vm-dialog__lg' : '';
    }

    constructor(@inject(DialogController) private dialog: DialogController) {}

    attached(): void {
        const closeEle: HTMLButtonElement = document.querySelector('.vm-dialog--header button');
        closeEle?.focus();
    }

    /**
     * Handles cancel button or X click.
     */
    cancel(): void {
        this.dialog.cancel();
    }
}
