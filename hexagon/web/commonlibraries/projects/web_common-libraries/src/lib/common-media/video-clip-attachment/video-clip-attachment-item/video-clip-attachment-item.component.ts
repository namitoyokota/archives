import { Component, Input } from '@angular/core';
import { Media$v1 } from '@galileo/platform_common-libraries';
import { MediaURLFetcher } from '../../media-url-fetcher.interface';

@Component({
    selector: 'hxgn-common-media-video-clip-attachment-item',
    templateUrl: 'video-clip-attachment-item.component.html',
    styleUrls: ['video-clip-attachment-item.component.scss']
})

export class VideoClipAttachmentItemComponent {

    /** Media object */
    @Input() media: Media$v1;

    /** Object to use to fetch the attachment url */
    @Input() fetcher: MediaURLFetcher;

    /**
     * Returns true if the video can be played in the browser
     */
    isPlayable(media: Media$v1) {
        return media.contentType === 'video/mp4';
    }
}
