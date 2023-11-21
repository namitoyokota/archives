import { Component, Input } from '@angular/core';
import { MediaURLFetcher } from '../media-url-fetcher.interface';
import { Media$v1 } from '@galileo/platform_common-libraries';

@Component({
    selector: 'hxgn-common-media-video-clip-attachment',
    templateUrl: 'video-clip-attachment.component.html',
    styleUrls: ['video-clip-attachment.component.scss']
})
export class VideoClipAttachmentComponent {

    /** Object to use to fetch the attachment url */
    @Input() fetcher: MediaURLFetcher;

    /** List of image media objects */
    @Input() mediaList: Media$v1[] = [];

    /**
     * Returns true if the video can be played in the browser
     */
    isPlayable(media: Media$v1) {
        return media.contentType === 'video/mp4';
    }

    /**
     * Method that allow ng for to track changes better
     */
    trackByFn(index, item: Media$v1) {
        return item.id;
    }
}
