import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
    /** Header for this confirm dialog */
    title = '';

    /** Description of what to ask */
    subtitle = '';

    /** Displays input for user to confirm */
    confirm = false;

    /** Text in the input box */
    confirmText = '';

    /** Text to display in the button */
    buttonText = 'Continue';

    /** Color of the button */
    buttonStatus = 'danger';

    /** Flag to indicate when action can be pursued */
    isValid = false;

    constructor(private dialogRef: NbDialogRef<ConfirmDialogComponent>) {}

    /**
     * Checks if confirm text is valid
     */
    checkValid(): void {
        this.isValid = this.confirmText === 'Confirm';
    }

    /**
     * Pursue action
     */
    yes() {
        const canContinue = !this.confirm || (this.confirm && this.isValid);
        if (canContinue) {
            this.dialogRef.close(true);
        }
    }

    /**
     * Cancel action
     */
    no() {
        this.dialogRef.close(false);
    }
}
