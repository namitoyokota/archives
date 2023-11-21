import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { AttachmentTab } from './attachment-tab/attachment-tab.component';
import { MediaURLFetcher } from './media-url-fetcher.interface';
import { Media$v1 } from '@galileo/platform_common-libraries';
import { CommonMediaService } from './common-media.service';
import { UrlHelper } from '@galileo/web_common-http';
import { MediaExpiryTime$v1 } from './media-expiry-time.v1';

@Component({
    selector: 'hxgn-common-media',
    templateUrl: 'common-media.component.html'
})
export class CommonMediaComponent implements OnChanges, OnDestroy {

    /** Object to use to fetch the attachment url */
    @Input() fetcher: MediaURLFetcher;

    /** List of media to display */
    mediaList: Media$v1[] = [];

    /** List of media to display */
    @Input() media: Media$v1[];

    /** Object that maps media object to attachment tab type */
    mediaMap = new Map<AttachmentTab, Media$v1[]>();

    /** What tab is currently selected */
    selectedTab: AttachmentTab;

    /** Expose AttachmentTab to the HTML */
    attachmentTab: typeof AttachmentTab = AttachmentTab;

    /** Array of intervals to keep track of */
    /** interval is type NodeJS.Timeout, but causes errors when explicitly defined */
    private existingIntervals: Array<{ mediaET: MediaExpiryTime$v1, interval: any }> = [];

    constructor(private commonMediaSrv: CommonMediaService,
        private cdr: ChangeDetectorRef) { }

    /** OnChanges */
    async ngOnChanges() {
        if (!this.mediaMap || this.mediaMap?.keys?.length === 0) {
            this.createMediaMapping();
        }
        await this.setAttachmentIntervalsAsync();
    }

    /** OnDestroy */
    ngOnDestroy() {
        // Revoke all blob urls if they exist
        const blobs = this.mediaList.filter(x => x.url && x.url.includes('blob:'));
        if (blobs?.length) {
            blobs.forEach(blob => {
                URL.revokeObjectURL(blob.url);
                blob.url = '';
            });
        }

        // Clear out any remaining intervals
        this.existingIntervals.forEach(existingInterval => {
            clearInterval(existingInterval.interval);
        });
    }

    /**
     * Event that is fired when the selected tab is changed
     * @param tab The newly selected attachment tab
     */
    onSelectionChange(tab: AttachmentTab) {
        this.selectedTab = tab;
    }

    /** 
     * Converts a list of media objects into a mapping of attachment tab type to media object
     */
    private createMediaMapping() {
        this.mediaMap.set(AttachmentTab.videoClips, []);
        this.mediaMap.set(AttachmentTab.liveVideos, []);
        this.mediaMap.set(AttachmentTab.images, []);
        this.mediaMap.set(AttachmentTab.other, []);

        this.mediaList = this.media ? this.media : [];

        if (this.mediaList?.length) {
            this.mediaList.forEach(media => {
                media.uri = UrlHelper.mapMediaUrl(media.uri);

                const tabType = this.commonMediaSrv.mapMedia(media);
                const mediaList: Media$v1[] = this.mediaMap.get(tabType);
                mediaList.push(media);
                this.mediaMap.set(tabType, mediaList);
            });
        }
    }

    /** 
     * Sets the intervals for when each attachment needs to be updated 
     */
    private async setAttachmentIntervalsAsync() {
        const timeIntervals = this.commonMediaSrv.getExpiryTimeIntervals(this.mediaList);
        if (timeIntervals && timeIntervals.length > 0) {
            timeIntervals.forEach(time => {
                let alreadyHasInterval = false;
                let needsToBeAdded = false;
                let oldInterval;

                time.ids.forEach(id => {
                    const existingItem = this.existingIntervals.find(x => x.mediaET.ids.includes(id));
                    if (existingItem && !alreadyHasInterval) {
                        alreadyHasInterval = true;
                        oldInterval = existingItem;
                    } else if (!existingItem && !alreadyHasInterval && !needsToBeAdded) {
                        needsToBeAdded = true;
                    }
                });

                // Clear out old interval
                if (alreadyHasInterval) {
                    clearInterval(oldInterval.interval);

                    const index = this.existingIntervals.findIndex(x => x.interval === oldInterval.interval);
                    this.existingIntervals.splice(index, 1);

                    needsToBeAdded = true;
                }

                // Add new interval
                if (needsToBeAdded) {
                    const etInterval = setInterval(async () => {
                        await this.updateAttachmentsAsync(time.ids);
                    }, time.expiryTime);

                    this.existingIntervals.push({
                        mediaET: time,
                        interval: etInterval
                    });
                }
            });
        }
    }

    /**
     * Updates the media attachments
     * @param ids Array of Media Ids to update
     */
    private async updateAttachmentsAsync(ids: string[]) {
        const refreshMedia = this.mediaList.filter(x => ids.includes(x.id));
        const updatedMedia = await this.commonMediaSrv.updateAttachmentsAsync(refreshMedia, this.fetcher);

        this.mediaList.forEach(media => {
            const hasBeenUpdated = updatedMedia.find(x => x.id === media.id);
            if (hasBeenUpdated) {
                media.uriExpirationTime = hasBeenUpdated?.uriExpirationTime ?? media.uriExpirationTime;
                media.uri = hasBeenUpdated?.uri ?? media.uri;
            }
        });

        this.cdr.markForCheck();
        this.cdr.detectChanges();

        await this.setAttachmentIntervalsAsync();
    }
}
