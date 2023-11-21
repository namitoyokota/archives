import { DialogController } from 'aurelia-dialog';
import { inject, bindable, customElement } from 'aurelia-framework';
import { MessageDialogModel } from './message-dialog-models';


@customElement('message-dialog')
export class MessageDialog {
    title: string;
    body: string;

    constructor(
        @inject(DialogController) public controller: DialogController
    ) {
        this.controller = controller;
    }

    activate(data: MessageDialogModel) {
        this.title = data.title;
        this.body = data.body;
    }
}
