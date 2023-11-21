import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Media$v1 } from '@galileo/platform_common-libraries';
import { FullscreenImageViewerComponent, FullScreenImageSettings } from '../fullscreen-image-viewer/fullscreen-image-viewer';

@Component({
    selector: 'hxgn-common-media-image-attachment-item',
    templateUrl: 'image-attachment-item.component.html',
    styleUrls: ['image-attachment-item.component.scss']
})
export class ImageAttachmentItemComponent {

    /** List of image media objects */
    @Input() media: Media$v1;

    private readonly panoramicType = 'image/panoramic';

    constructor(public dialog: MatDialog) { }

    /**
     * Show an image in the fullscreen viewer
     * @param url The url to the image
     */
    show(url: string) {
        if (!url) {
            return;
        }

        this.dialog.open(FullscreenImageViewerComponent, {
            panelClass: 'hxgn-common-fullscreen',
            data: {
                url,
                isPanoramic: this.media.contentType === this.panoramicType
            } as FullScreenImageSettings
        });
    }
}
