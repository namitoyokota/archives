import { inject, customElement, computedFrom } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import type { IPleaseWait } from '../interfaces/please-wait-interface';
import { hasValue, isNullOrUndefined } from '../utilities/globals';
import { PleaseWaitViewModel } from './please-wait-dialog-models';


@customElement('please-wait-dialog')
export class PleaseWaitDialog {
    imgElem: Element;
    statusModel: PleaseWaitViewModel;

    constructor(
        @inject(DialogController) private controller: DialogController
    ) { }

    @computedFrom('statusModel', 'statusModel.statusText')
    get showStatusText(): boolean {
        if (isNullOrUndefined(this.statusModel))
            return false;
        return hasValue(this.statusModel.statusText); 
    }

    @computedFrom('statusModel', 'statusModel.statusText')
    get statusText(): string {
        return this.statusModel.statusText;
    }

    @computedFrom('statusModel', 'statusModel.totalWork', 'statusModel.workCompleted')
    get showProgress(): boolean {
        if (isNullOrUndefined(this.statusModel))
            return false;
        return !isNullOrUndefined(this.statusModel.totalWork) && this.statusModel.totalWork > 0 && !isNullOrUndefined(this.statusModel.workCompleted);
    }

    @computedFrom('statusModel', 'statusModel.workCompleted')
    get workCompleted(): number {
        return this.statusModel.workCompleted;
    }

    @computedFrom('statusModel', 'statusModel.totalWork')
    get totalWork(): number {
        return this.statusModel.totalWork;
    }

    @computedFrom('workCompleted', 'totalWork')
    get percentComplete(): number {
        if (this.workCompleted == null || this.totalWork == null || this.totalWork == 0)
            return 0;
        return (100 * this.workCompleted) / this.totalWork;
    }

    activate(model: PleaseWaitViewModel) {
        this.statusModel = model;
    }
    attached() {
        let $elem = $(this.imgElem);
        let $dialogContainer = $elem.parents('ux-dialog-container');
        let $dialogOverlay = $dialogContainer.prev('ux-dialog-overlay');
        $dialogOverlay.css('background', 'rgba(0,0,0,.7)');
    }
    cancel() {
        this.statusModel.pleaseWaitService.cancel();
    }
}

