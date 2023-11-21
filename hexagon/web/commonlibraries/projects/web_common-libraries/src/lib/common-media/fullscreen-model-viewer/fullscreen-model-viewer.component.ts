import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: 'fullscreen-model-viewer.component.html',
    styleUrls: ['fullscreen-model-viewer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FullscreenModelViewerComponent {
    constructor(private dialogRef: MatDialogRef<FullscreenModelViewerComponent>,
        @Inject(MAT_DIALOG_DATA) public url,
        public dialog: MatDialog
    ) { }

    /** The background color for the model viewer */
    backgroundColor = '#b3b3b3';

    /**
     * Closes the image viewer
     */
    close() {
        this.dialogRef.close();
    }
}
