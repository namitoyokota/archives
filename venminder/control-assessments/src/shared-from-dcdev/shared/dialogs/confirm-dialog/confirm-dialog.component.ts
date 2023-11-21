import { DialogController } from 'aurelia-dialog';
import { inject } from 'aurelia-framework';
import { ConfirmDialogModel } from './confirm-dialog-model';

export class ConfirmDialog {

	/** Tracks whether or not the confirmation has occurred. Tied to the value of the checkbox. */
	confirmed: boolean = false;

	/** The model containing all of the dialog parameters passed in from the parent. */
	model: ConfirmDialogModel = new ConfirmDialogModel();

	constructor(
		@inject(DialogController) private controller: DialogController,
	) { }

	/**
	 * Activate life cycle hook.
	 */
	activate(data: ConfirmDialogModel): void {
		this.model = data;
	}

	/**
	 * Handles the ok button click.
	 */
	ok(): void {
		this.controller.ok();
	}
}
