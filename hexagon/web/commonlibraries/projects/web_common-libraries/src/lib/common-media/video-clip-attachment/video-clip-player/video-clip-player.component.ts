import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core';
import { UrlHelper } from '@galileo/web_common-http';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Media$v1 } from '@galileo/platform_common-libraries';
import { CommonMediaService } from '../../common-media.service';
import { MediaURLFetcher } from '../../media-url-fetcher.interface';
import { TranslatedTokens, TranslationTokens } from './video-clip.translate';

@Component({
    selector: 'hxgn-common-media-video-clip-player-logic',
    templateUrl: 'video-clip-player.component.html',
    styleUrls: ['video-clip-player.component.scss']
})
export class VideoClipPlayerComponent implements AfterViewInit, OnDestroy {

    /** Shows or hides the full screen button. */
    @HostBinding('class.full-screen') @Input() hideFullscreenBtn = false;

    /** The media to use as the video source */
    @Input() media: Media$v1;

    /** Object to use to fetch the attachment url */
    @Input() fetcher: MediaURLFetcher;

    @Output() goFullscreen = new EventEmitter<Media$v1>();

    /** Reference to the video tag element */
    @ViewChild('videoplayer', { static: true }) videoPlayer: ElementRef;

    /** Video control element */
    video: HTMLVideoElement;

    /** True if the video clip is playing */
    isPlaying = false;

    /** True if the video clip is loading */
    showSpinner = false;

    /** True if the video clip failed to load */
    showError = false;

    /** True if the video clip failed initially, but is attempting to reload */
    retryTriggered = false;

    /** Destory subscription */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    constructor(private cdr: ChangeDetectorRef,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private commonMediaSrv: CommonMediaService
    ) { }

    /** OnDestroy */
    ngOnDestroy(): void {
        this.isPlaying = false;
        this.showSpinner = false;
        this.showError = false;
        this.retryTriggered = false;

        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** OnAfterViewInit */
    async ngAfterViewInit() {
        this.video = this.videoPlayer.nativeElement;
        this.showSpinner = true;

        // If url isn't already a blob, make it a blob
        // Otherwise, use the blob url
        if (!this.media.url || !this.media.url.includes('blob:')) {
            this.media.uri = UrlHelper.mapMediaUrl(this.media.uri);
            await this.createNewBlob();
            this.triggerChange();
        } else {
            this.video.src = this.media.url;
            this.triggerChange();
        }

        this.video.oncanplay = () => {
            this.showSpinner = false;
            this.showError = false;
            this.retryTriggered = false;
            this.triggerChange();
        };

        this.video.onended = () => {
            this.isPlaying = false;
            this.triggerChange();
        };

        this.video.onerror = async () => {
            await this.refreshVideoAsync();
            this.triggerChange();
        };

        this.video.onloadstart = () => {
            this.showSpinner = true;
            this.showError = false;
            this.triggerChange();
        };

        this.video.onpause = () => {
            this.isPlaying = false;
            this.triggerChange();
        };

        this.video.onplaying = () => {
            this.isPlaying = true;
            this.triggerChange();
        };

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.initLocalizationAsync();
        });

        this.initLocalizationAsync();
    }

    /**
     * Opens video in full screen dialog.
     */
    openFullscreen(): void {
        if (this.isPlaying) {
            this.video.pause();
        }

        this.goFullscreen.emit(this.media);
    }

    /**
     * Toggles playing and pausing video
     */
    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }

        this.triggerChange();
    }

    /**
     * Creates a new blob and saves it to the media.url and video.src
     */
    private async createNewBlob() {
        // Videos aren't caching in the browser since the backend moved over to the proxy service
        // Current solution is the store the video as a blob to prevent constant redownloading the the video files

        // Revoke previous blob if it exists
        if (this.media.url && this.media.url.includes('blob:')) {
            URL.revokeObjectURL(this.media.url);
        }

        const blob = await this.commonMediaSrv.getVideoContentAsync(this.media.uri);
        const blobUrl = URL.createObjectURL(blob);
        this.media.url = blobUrl;
        this.video.src = this.media.url;
    }

    /**
     * Updates the Media to refresh the URI
     * Generates a new blob from that and tries to load it
     */
    private async refreshVideoAsync() {
        // Retry loading it once. After that, show error
        if (!this.retryTriggered) {
            const updatedMedia = await this.commonMediaSrv.updateMediaAsync(this.media, this.fetcher);
            if (!updatedMedia) {
                this.showError = true;
                this.showSpinner = false;
                return;
            }
            this.media = updatedMedia;

            await this.createNewBlob();
            this.video.load();

            this.retryTriggered = true;
        } else {
            this.showError = true;
            this.showSpinner = false;
        }
    }

    /**
     * Triggers the change detector ref
     */
    private triggerChange() {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
    }

    /**
     * Set up routine for localization
     */
    private async initLocalizationAsync() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.failedToLoadVideo = translatedTokens[TranslationTokens.failedToLoadVideo];
    }
}
