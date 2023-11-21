import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface FullScreenImageSettings {
    /** Url to image */
    url: string;

    /** Flag that is true if image is a panoramic */
    isPanoramic: boolean;
}

@Component({
    templateUrl: 'fullscreen-image-viewer.html',
    styleUrls: ['fullscreen-image-viewer.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FullscreenImageViewerComponent {
    constructor(private dialogRef: MatDialogRef<FullscreenImageViewerComponent>,
        @Inject(MAT_DIALOG_DATA) public settings: FullScreenImageSettings,
        public dialog: MatDialog
    ) { }

    /**
     * Closes the image viewer
     */
    close() {
        this.dialogRef.close();
    }
}
