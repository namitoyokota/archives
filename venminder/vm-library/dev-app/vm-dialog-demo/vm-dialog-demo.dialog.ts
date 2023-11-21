import { DialogController } from 'aurelia-dialog';
import { inject } from 'aurelia-framework';

export class VMDialogDemo {
    isLarge = false;

    constructor(@inject(DialogController) private dialog: DialogController) {}

    activate(data: unknown): void {
        this.isLarge = data['isLarge'];
    }

    save(): void {
        this.dialog.ok();
    }
}
