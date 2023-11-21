import { PleaseWaitService } from 'shared-from-dcdev/shared/services/please-wait-service';
import { DialogController } from "aurelia-dialog";
import { inject, customElement } from "aurelia-framework";
import type { IPleaseWait } from "shared-from-dcdev/shared/interfaces/please-wait-interface";
import { ErrorDialogModel } from './error-dialog-models';
import { EventNames } from '../../../shared/event-names';
import { EventAggregator } from 'aurelia-event-aggregator';


@customElement('error-dialog')
export class ErrorDialog {
    message: string;

    constructor(
        @inject(DialogController) private controller: DialogController,
        @inject(PleaseWaitService) private pleaseWait: IPleaseWait,
        @inject(EventAggregator) private ea: EventAggregator
    ) {
    }

    activate(data: ErrorDialogModel) {
        this.pleaseWait.cancel();
        this.message = data.message;
        this.ea.publish(EventNames.Api.API_ERROR_DIALOG_OPEN);
    }
}

