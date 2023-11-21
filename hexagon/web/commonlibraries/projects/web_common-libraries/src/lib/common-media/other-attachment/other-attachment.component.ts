import { Component, Input } from '@angular/core';
import { MediaURLFetcher } from '../media-url-fetcher.interface';
import { Media$v1 } from '@galileo/platform_common-libraries';
import { MatDialog } from '@angular/material/dialog';
import { FullscreenModelViewerComponent } from '../fullscreen-model-viewer/fullscreen-model-viewer.component';
import { CommonMediaService } from '../common-media.service';

@Component({
    selector: 'hxgn-common-media-other-attachment',
    templateUrl: 'other-attachment.component.html',
    styleUrls: ['other-attachment.component.scss']
})
export class OtherAttachmentComponent {

    /** Object to use to fetch the attachment url */
    @Input() fetcher: MediaURLFetcher;

    /** List of image media objects */
    @Input() mediaList: Media$v1[] = [];

    constructor(public dialog: MatDialog,
        public commonMediaSrv: CommonMediaService) { }

    /**
     * Opens the media viewer panel
     */
    openModelViewer(media: Media$v1): void {
        if (media.contentType === 'application/octet-stream' || media.contentType === 'model/gltf-binary') {
            this.dialog.open(FullscreenModelViewerComponent, {
                panelClass: 'hxgn-common-fullscreen',
                data: media.uri
            });
        }
    }

    /**
     * Method that allow ng for to track changes better
     */
    trackByFn(index, item: Media$v1) {
        return item.id;
    }
}
