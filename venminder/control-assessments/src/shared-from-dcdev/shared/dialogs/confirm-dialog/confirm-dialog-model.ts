export class ConfirmDialogModel {

	/** The text to be displayed within the cancel button, if shown. Defaults to "Cancel". */
	cancelText: string;

	/** The label for the confirmation checkbox, if shown. */
	confirmationLabel: string;

	/** The message to be displayed within the dialog body. */
	dialogMessage: string;

	/** The title of the dialog rendered in the dialog header. */
	dialogTitle: string;

	/** The text to be displayed within the ok button, if shown. Defaults to "OK". */
	okText: string;

	/** Whether or not the cancel button should be shown. Defaults to true. */
	showCancel: boolean;

	/** Whether or not the confirmation checkbox should be shown. Defaults to false. */
	showConfirmation: boolean;

	/** Whether or not the ok button should be shown. Defaults to true. */
	showOk: boolean;

	constructor(params: ConfirmDialogModel = {} as ConfirmDialogModel) {
		const {
			cancelText = 'Cancel',
			confirmationLabel = '',
			dialogMessage = '',
			dialogTitle = '',
			okText = 'OK',
			showCancel = true,
			showConfirmation = false,
			showOk = true
		} = params;

		this.cancelText = cancelText;
		this.confirmationLabel = confirmationLabel;
		this.dialogMessage = dialogMessage;
		this.dialogTitle = dialogTitle;
		this.okText = okText;
		this.showCancel = showCancel;
		this.showConfirmation = showConfirmation;
		this.showOk = showOk;
	}
}
