import { DialogController } from 'aurelia-dialog';
import { inject } from 'aurelia-framework';
import type { AlertTypes } from 'resources';

export class VMDialogDuotoneDemo {
    type: AlertTypes;

    constructor(@inject(DialogController) private dialog: DialogController) {}

    activate(data: { type: AlertTypes }): void {
        this.type = data?.type;
    }

    save(): void {
        this.dialog.ok();
    }
}
