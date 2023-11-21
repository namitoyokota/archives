import type { DialogCloseResult } from 'aurelia-dialog';
import { DialogService } from 'aurelia-dialog';
import { inject, PLATFORM } from 'aurelia-framework';

export class VMDialogDemoComponent {
    constructor(@inject(DialogService) private dialogService: DialogService) {}

    openDialog(isLarge: boolean): void {
        this.dialogService
            .open({
                viewModel: PLATFORM.moduleName('vm-dialog-demo/vm-dialog-demo.dialog', 'testbed'),
                model: {
                    isLarge,
                },
            })
            .whenClosed((response: DialogCloseResult) => {
                if (!response.wasCancelled) {
                    alert('ok button clicked');
                }
            });
    }

    openDuotone(type): void {
        this.dialogService.open({
            viewModel: PLATFORM.moduleName('vm-dialog-demo/vm-dialog-duotone-demo.dialog', 'testbed'),
            model: {
                type,
            },
        });
    }
}
