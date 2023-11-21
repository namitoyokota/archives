import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Media$v1 } from '@galileo/platform_common-libraries';
import { AttachmentTab } from '../attachment-tab/attachment-tab.component';
import { CommonMediaService } from '../common-media.service';
import { FullscreenModelViewerComponent } from '../fullscreen-model-viewer/fullscreen-model-viewer.component';
import { MediaExpiryTime$v1 } from '../media-expiry-time.v1';
import { MediaURLFetcher } from '../media-url-fetcher.interface';
import { MediaGridTranslationTokens } from './media-grid.translation';
import { UrlHelper } from '@galileo/web_common-http';

@Component({
    selector: 'hxgn-common-media-grid',
    templateUrl: 'media-grid.component.html',
    styleUrls: ['media-grid.component.scss']
})
export class MediaGridComponent implements AfterViewInit, OnDestroy, OnChanges {

    fetcher: MediaURLFetcher;

    /** Object to use to fetch the attachment url */
    @Input('fetcher')
    set setFetcher(fetcher: MediaURLFetcher) {
        if (fetcher) {
            this.fetcher = fetcher;
        }
    }

    /** List of image media objects */
    @Input('mediaList')
    set setMediaList(mediaList: Media$v1[]) {
        this.fullMediaList = [].concat(mediaList);

        if (this.fullMediaList?.length) {
            this.fullMediaList.forEach(media => {
                media.uri = UrlHelper.mapMediaUrl(media.uri);
            });
        }

        this.processMediaList(true);
    }

    /** Event when the size of the control changes */
    @Output() sizeChange = new EventEmitter();

    /** A flag that is true if all media items should be shown */
    showAll = false;

    /** Tracks when show all has been enabled. */
    haveAllBeenShown = false;

    /** List of video and photo media */
    videoPhotoMedia: Media$v1[] = [];

    /** List of other media */
    otherMedia: Media$v1[] = [];

    /** Expose AttachmentTab to html */
    mediaType: typeof AttachmentTab = AttachmentTab;

    /** True if two grid should be shown */
    ShowGridTwo = false;

    /** Number of items that is hidden */
    hiddenItems = 0;

    /** The point where the format changes */
    readonly minWidth = 575;

    /** Full list of media items */
    private fullMediaList: Media$v1[] = [];

    /** The max number of items to show */
    private maxItemCount = 5;

    /** Expose MediaGridTranslationTokens to HTML */
    tokens: typeof MediaGridTranslationTokens = MediaGridTranslationTokens;

    /** Array of intervals to keep track of */
    /** interval is type NodeJS.Timeout, but causes errors when explicitly defined */
    private existingIntervals: Array<{ mediaET: MediaExpiryTime$v1, interval: any }> = [];

    /** Fired when window is resized */
    @HostListener('window:resize', ['$event.target'])
    onResize(target) {
        this.ShowGridTwo = this.checkShowGridTwo();
    }

    constructor(
        private elRef: ElementRef,
        private cdr: ChangeDetectorRef,
        public dialog: MatDialog,
        public commonMediaSrv: CommonMediaService
    ) { }

    /** OnChanges */
    async ngOnChanges() {
        await this.setAttachmentIntervalsAsync();
    }

    /** AfterViewInit */
    ngAfterViewInit(): void {
        this.ShowGridTwo = this.checkShowGridTwo();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }

    /** OnDestroy */
    ngOnDestroy() {
        // Revoke all blob urls if they exist
        const blobs = this.fullMediaList.filter(x => x.url && x.url.includes('blob:'));
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
     * Opens the media viewer panel
     */
    openModelViewer(media: Media$v1): void {
        this.dialog.open(FullscreenModelViewerComponent, {
            panelClass: 'hxgn-common-fullscreen',
            data: media.uri
        });
    }

    /**
     * Return true if the model viewer should be shown
     * @param contentType media content type
     */
    showModelViewer(contentType: string): boolean {
        return contentType === 'model/gltf-binary';
    }

    /**
     * Checks to see if the media type matches the attachment tab type
     * @param media The media object to map to attachment tab
     * @param attachmentType The type of attachment tab to check
     */
    checkMedia(media: Media$v1, attachmentType: AttachmentTab): boolean {
        return this.commonMediaSrv.mapMedia(media) === attachmentType;
    }

    /**
     * Returns true if grid two should be shown
     */
    checkShowGridTwo(): boolean {
        const showTwo = this.elRef?.nativeElement?.offsetWidth < this.minWidth;
        this.maxItemCount = showTwo ? 2 : 5;

        if (!this.showAll) {
            this.processMediaList(true);
        }

        return showTwo;
    }

    /**
     * Toggle the show all flag
     */
    toggleShowAll() {
        this.showAll = !this.showAll;
        this.processMediaList(true);

        if (this.showAll) {
            this.haveAllBeenShown = true;
        }
    }

    /** 
     * Sets the intervals for when each attachment needs to be updated
     */
    private async setAttachmentIntervalsAsync() {
        const timeIntervals = this.commonMediaSrv.getExpiryTimeIntervals(this.fullMediaList);
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
        const refreshMedia = this.fullMediaList.filter(x => ids.includes(x.id));
        const updatedMedia = await this.commonMediaSrv.updateAttachmentsAsync(refreshMedia, this.fetcher);

        this.fullMediaList.forEach(media => {
            const hasBeenUpdated = updatedMedia.find(x => x.id === media.id);
            if (hasBeenUpdated) {
                media.uriExpirationTime = hasBeenUpdated?.uriExpirationTime ?? media.uriExpirationTime;
                media.uri = hasBeenUpdated?.uri ?? media.uri;
            }
        });

        this.processMediaList(false);

        this.cdr.markForCheck();
        this.cdr.detectChanges();

        await this.setAttachmentIntervalsAsync();
    }

    /**
     * Sets the separate media lists
     * @param includeTimeout Whether to include the setTimeout logic
     */
    private processMediaList(includeTimeout: boolean): void {
        this.videoPhotoMedia = this.fullMediaList.filter(item => {
            const type = this.commonMediaSrv.mapMedia(item);
            return type === AttachmentTab.images ||
                type === AttachmentTab.videoClips;
        });

        if (!this.showAll) {
            this.videoPhotoMedia = this.videoPhotoMedia.splice(0, this.maxItemCount);
        }

        this.otherMedia = this.fullMediaList.filter(item => {
            return this.commonMediaSrv.mapMedia(item) === AttachmentTab.other;
        });

        if (!this.showAll) {
            const maxCount = Math.max(0, this.maxItemCount - this.videoPhotoMedia.length);
            this.otherMedia = this.otherMedia.splice(0, maxCount);
        }

        this.hiddenItems = this.fullMediaList.length - this.videoPhotoMedia.length - this.otherMedia.length;

        if (includeTimeout) {
            setTimeout(() => {
                this.sizeChange.emit();
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            });
        }
    }
}
