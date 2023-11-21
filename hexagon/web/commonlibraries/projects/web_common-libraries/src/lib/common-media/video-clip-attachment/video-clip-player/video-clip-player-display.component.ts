import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FullscreenVideoViewerComponent } from '../fullscreen-video-viewer/fullscreen-video-viewer.component';
import { Media$v1 } from '@galileo/platform_common-libraries';
import { MediaURLFetcher } from '../../media-url-fetcher.interface';

@Component({
    selector: 'hxgn-common-media-video-clip-player',
    template: `
        <hxgn-common-media-video-clip-player-logic [hideFullscreenBtn]="hideFullscreenBtn"
           [media]="media" [fetcher]="fetcher" (goFullscreen)="openFullScreen(media, fetcher)" ></hxgn-common-media-video-clip-player-logic>
    `,
    styles: [`
        :host {
            width: 100%;
            height: 100%;
        }
    `]
})
export class VideoClipPlayerDisplayComponent {

    /** Shows or hides the full screen button. */
    @Input() hideFullscreenBtn = false;

    /** The media to use as the video source */
    @Input() media: Media$v1;

    /** Object to use to fetch the attachment url */
    @Input() fetcher: MediaURLFetcher;

    constructor(private dialog: MatDialog) { }

    /**
     * Opens video in full screen dialog.
     */
    openFullScreen(media: Media$v1, fetcher: MediaURLFetcher): void {
        this.dialog.open(FullscreenVideoViewerComponent, {
            panelClass: 'hxgn-common-fullscreen',
            data: {
                media,
                fetcher
            }
        });
    }
}