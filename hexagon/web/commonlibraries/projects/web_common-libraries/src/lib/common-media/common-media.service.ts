import { Media$v1 } from '@galileo/platform_common-libraries';
import { AttachmentTab } from './attachment-tab/attachment-tab.component';
import { MediaExpiryTime$v1 } from './media-expiry-time.v1';
import { MediaURLFetcher } from './media-url-fetcher.interface';
import * as moment from 'moment';
import { UrlHelper } from '@galileo/web_common-http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CommonMediaService {

    /** Number of milliseconds in 5 minutes */
    readonly fiveMinutesInMilliseconds: number = 300000;

    /** Number of milliseconds in 5 seconds */
    readonly fiveSecondsInMilliseconds: number = 5000;

    /**
     * Maps media to attachment type based on the media's content type
     * @param media The media object to map to attachment tab
     */
    mapMedia(media: Media$v1): AttachmentTab {
        if (!media?.contentType) {
            console.error('Missing content type', media);
            return AttachmentTab.other;
        }

        switch (media.contentType.toLocaleLowerCase()) {
            case 'image/bmp':
            case 'image/jpeg':
            case 'image/x-citrix-jpeg':
            case 'image/webp':
            case 'image/gif':
            case 'image/png':
            case 'image/x-citrix-png':
            case 'image/x-png':
            case 'image/panoramic':
                return AttachmentTab.images;
            case 'video/3gpp':
            case 'video/3gpp2':
            case 'video/x-msvideo':
            case 'video/vnd.dece.hd':
            case 'video/vnd.dece.mobile':
            case 'video/vnd.uvvu.mp4':
            case 'video/vnd.dece.pd':
            case 'video/vnd.dece.sd':
            case 'video/vnd.dece.video':
            case 'video/x-f4v':
            case 'video/x-flv':
            case 'video/h261':
            case 'video/h263':
            case 'video/h264':
            case 'video/jpm':
            case 'video/jpeg':
            case 'video/x-m4v':
            case 'video/x-ms-wm':
            case 'video/x-ms-wmv':
            case 'video/mpeg':
            case 'video/mp4': // can be played in the browser
            case 'video/ogg': // can be played in the browser chrome only
            case 'video/webm': // can be played in the browser chrome only
            case 'video/x-sgi-movie':
                return AttachmentTab.videoClips;
            case 'application/octet-stream':
            case 'model/gltf-binary':
            default:
                return AttachmentTab.other;
        }
    }

    /**
     * Returns the icon src for a given content type
     * @param contentType The content type of the media
     */
    private getAttachmentIcon(contentType: string): string {
        switch (contentType) {
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.templat':
            case 'application/vnd.ms-word.document.macroEnabled.12':
            case 'application/vnd.ms-word.template.macroEnabled.12':
                return 'document-word-file.png';
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            case 'application/vnd.openxmlformats-officedocument.presentationml.template':
            case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
            case 'application/vnd.ms-powerpoint.addin.macroEnabled.12':
            case 'application/vnd.ms-powerpoint.presentation.macroEnabled.12':
            case 'application/vnd.ms-powerpoint.presentation.macroEnabled.12':
            case 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12':
                return 'document-powerpoint.png';
            case 'audio/mpeg3':
            case 'audio/x-mpeg-3':
            case ' video/mpeg':
            case 'video/x-mpeg':
                return 'document-mp3.png';
            case 'application/pdf':
                return 'document-pdf.png';
            case 'application/octet-stream':
            case 'model/gltf-binary':
                return '3D-attachment-icon.svg';
            default:
                return 'document-generic.png';
        }
    }

    /**
     * Returns the attachment image src for a given content type
     * @param contentType The content type of the media
     */
    getAttachmentImageSrc(contentType: string): string {
        return `assets/common-libraries/images/${this.getAttachmentIcon(contentType)}`;
    }

    /**
     * Gets an array of number intervals
     * @param mediaList List of media attachments to check
     */
    getExpiryTimeIntervals(mediaList: Media$v1[]): MediaExpiryTime$v1[] {
        const timeInvervals: MediaExpiryTime$v1[] = [];

        // Loop through and get all the expiry times intervals
        if (mediaList && mediaList.length > 0) {
            mediaList.filter(x => x.isUploaded).forEach(item => {
                try {
                    const uriExpDate = new Date(item.uriExpirationTime);
                    uriExpDate.setMinutes(uriExpDate.getMinutes() - 5);
                    const expirationTimeUtc = moment.utc(uriExpDate);

                    const currentDateUtc = moment.utc(new Date());

                    let expiryTime = expirationTimeUtc.diff(currentDateUtc);
                    if (expiryTime < 0) {
                        expiryTime = this.fiveSecondsInMilliseconds;
                    }

                    const intervalExpiryTime = Date.now() + expiryTime;
                    const intervalExpiryTimeUtc = moment.utc(intervalExpiryTime);

                    if (!timeInvervals.find(x => x.ids.includes(item.id))) {
                        timeInvervals.push({
                            expiryTime: expiryTime,
                            ids: [item.id],
                            intervalTime: intervalExpiryTimeUtc.toLocaleString()
                        });
                    }
                }
                catch { }
            });
        }

        const distinctVals: MediaExpiryTime$v1[] = [];

        if (!timeInvervals || timeInvervals.length === 0) {
            return distinctVals;
        }

        // Loops through the time intervals to get a distinct array of similar values
        // Helps cut down on having to create multiple intervals when some are minutes apart
        timeInvervals
            .sort((a, b) => a.expiryTime < b.expiryTime ? -1 : 1)
            .forEach((timeItem) => {
                if (distinctVals.length === 0) {
                    // If there are no distinctVals, then automatically add the first timeInterval
                    distinctVals.push(timeItem);
                } else {
                    const currentId = timeItem.ids[0];
                    const exists = distinctVals.find(x => x.ids.includes(currentId));

                    // Don't readd an item that's already in the distinctVals
                    if (!exists) {
                        let addedToExistingItem = false;

                        // Loop through existing distinctVals and check to see if the current
                        // timeInterval can be added to an existing distinctVal
                        distinctVals.every(distinctItem => {
                            const time = Math.abs(timeItem.expiryTime - distinctItem.expiryTime);
                            const isInRange = time <= this.fiveMinutesInMilliseconds;

                            if (isInRange) {
                                distinctItem.ids.push(currentId);
                                addedToExistingItem = true;
                                return false;
                            }
                        });

                        // If it can't be added to an existing item, add the timeInterval as a new distinctVal
                        if (!addedToExistingItem) {
                            distinctVals.push(timeItem);
                        }
                    }
                }
            });

        return distinctVals;
    }

    /**
     * Returns true if the attachment is expired or will be expired in 5 min
     * @param uriExpirationTime Expiration time for the attachment
     */
    private isDateExpired(uriExpirationTime: string): boolean {
        if (!uriExpirationTime || uriExpirationTime === '') {
            return false;
        }

        try {
            const expirationTime = moment.utc(uriExpirationTime);
            const currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + 5)
            const currentDateUtc = moment.utc(currentDate);

            const isExpired = expirationTime <= currentDateUtc;
            return isExpired;
        }
        catch {
            return false;
        }
    }

    /**
     * Updates the attachments if they are expired
     * @param mediaList List of media attachments to check
     * @param fetcher Instance of MediaURLFetcher to get the entity attachments
     */
    async updateAttachmentsAsync(mediaList: Media$v1[], fetcher: MediaURLFetcher): Promise<Media$v1[]> {
        if (mediaList && mediaList.length > 0) {
            // Check for media where isUpload and the uriExpirationTime is expired
            const hasExpiredAttachments = mediaList.filter(x => x.isUploaded && this.isDateExpired(x.uriExpirationTime));

            if (hasExpiredAttachments && hasExpiredAttachments.length > 0) {
                let refreshedAttachments = [];

                if (fetcher.refreshAttachment) {
                    // This is needed otherwise the rest of the code will run before the fetcher returns
                    const promises = hasExpiredAttachments.map(async attachment => {
                        const refreshedAttachment = await fetcher.refreshAttachment(attachment.entityId, attachment.id);
                        if (refreshedAttachment) {
                            refreshedAttachments.push(refreshedAttachment);
                        }
                    });
                    await Promise.all(promises);
                } else if (fetcher.getEntityAttachments) {
                    const attachment = hasExpiredAttachments[0];
                    const entityAttachments = await fetcher.getEntityAttachments(attachment.entityId);
                    if (entityAttachments?.length) {
                        refreshedAttachments = [].concat(entityAttachments);
                    }
                }

                if (refreshedAttachments?.length) {
                    // if refreshedAttachment has a uriExpirationTime, then use it
                    // otherwise, use the current uriExpirationTime so it will try again on the next update interval
                    mediaList.forEach(item => {
                        const refreshedAttachment = refreshedAttachments.find(x => x.id === item.id);
                        item.uriExpirationTime = refreshedAttachment?.uriExpirationTime ?? item.uriExpirationTime;
                        item.uri = UrlHelper.mapMediaUrl(refreshedAttachment?.uri ?? item.uri);
                    });
                }
            }
        }

        return mediaList;
    }

    /**
     * Updates the media item to refresh the URI
     * @param media Media to update
     * @param fetcher Instance of MediaURLFetcher to get the entity attachments
     */
    async updateMediaAsync(media: Media$v1, fetcher: MediaURLFetcher): Promise<Media$v1> {
        if (media) {
            if (fetcher.refreshAttachment) {
                const refreshedMedia = await fetcher.refreshAttachment(media.entityId, media.id);
                if (refreshedMedia) {
                    media.uriExpirationTime = refreshedMedia?.uriExpirationTime ?? media.uriExpirationTime;
                    media.uri = UrlHelper.mapMediaUrl(refreshedMedia?.uri ?? media.uri);
                }
            } else if (fetcher.getEntityAttachments) {
                const entityAttachments = await fetcher.getEntityAttachments(media.entityId);
                if (entityAttachments?.length) {
                    const refreshedMedia = entityAttachments.find(x => x.id === media.id);
                    media.uriExpirationTime = refreshedMedia?.uriExpirationTime ?? media.uriExpirationTime;
                    media.uri = UrlHelper.mapMediaUrl(refreshedMedia?.uri ?? media.uri);
                }
            }
        }

        return media;
    }

    /**
     * Loads the video attachment and returns it in the form of a blob
     * @param url Video Attachment API URI
     */
    async getVideoContentAsync(url: string): Promise<Blob> {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'cache-control': 'no-store',
                'content-type': 'application/octet-stream',
                'accept': 'application/json, text/plain, */*',
            }
        });
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'video/mp4' })
        return Promise.resolve(blob);
    }
}