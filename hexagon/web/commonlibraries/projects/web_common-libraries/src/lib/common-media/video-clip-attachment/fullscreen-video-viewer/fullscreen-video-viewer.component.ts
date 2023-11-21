import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Media$v1 } from '@galileo/platform_common-libraries';
import { MediaURLFetcher } from '../../media-url-fetcher.interface';

@Component({
    templateUrl: 'fullscreen-video-viewer.component.html',
    styleUrls: ['fullscreen-video-viewer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FullscreenVideoViewerComponent {

    /** Media object */
    media: Media$v1;

    /** Object to use to fetch the attachment url */
    fetcher: MediaURLFetcher;

    constructor(
        private dialogRef: MatDialogRef<FullscreenVideoViewerComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) {
        this.media = data.media;
        this.fetcher = data.fetcher;
    }

    /**
     * Closes the video viewer
     */
    close() {
        this.dialogRef.close();
    }
}
