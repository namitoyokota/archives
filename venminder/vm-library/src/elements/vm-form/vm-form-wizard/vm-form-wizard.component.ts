import { inject } from 'aurelia-dependency-injection';
import { DialogController } from 'aurelia-dialog';
import { customElement } from 'aurelia-framework';

@customElement('vm-form-wizard')
export class VMFormWizardComponent {
    constructor(@inject(DialogController) private dialog: DialogController) {}

    /**
     * Handles cancel button or X click.
     */
    cancel(): void {
        this.dialog.cancel();
    }
}
