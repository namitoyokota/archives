import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FullScreenImageSettings, FullscreenImageViewerComponent } from './fullscreen-image-viewer/fullscreen-image-viewer';
import { MediaURLFetcher } from '../media-url-fetcher.interface';
import { Media$v1 } from '@galileo/platform_common-libraries';

@Component({
    selector: 'hxgn-common-media-image-attachment',
    templateUrl: 'image-attachment.component.html',
    styleUrls: ['image-attachment.component.scss']
})

export class ImageAttachmentComponent {

    /** Object to use to fetch the attachment url */
    @Input() fetcher: MediaURLFetcher;

    /** List of image media objects */
    @Input() mediaList: Media$v1[] = [];

    private readonly panoramicType = 'image/panoramic';

    constructor(public dialog: MatDialog) { }

    /**
     * Method that allow ng for to track changes better
     */
    trackByFn(index, item: Media$v1) {
        return item.id;
    }

    /**
     * Show an image in the fullscreen viewer
     * @param url The url to the image
     */
    show(url: string, contentType: string) {
        if (!url) {
            return;
        }

        this.dialog.open(FullscreenImageViewerComponent, {
            panelClass: 'hxgn-common-fullscreen',
            data: {
                url,
                isPanoramic: contentType === this.panoramicType
            } as FullScreenImageSettings
        });
    }
}
