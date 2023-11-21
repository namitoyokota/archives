import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { Alarm$v1, AlarmMediaSettings$v1, LAYOUT_MANAGER_SETTINGS, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { Media$v1, MediaURLFetcher, StoreService } from '@galileo/web_common-libraries';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataService } from '../../data.service';

export class UrlFetcher implements MediaURLFetcher {

    /** Id of the tenant the attachment is for */
    alarmTenantMap = new Map<string, string>();

    constructor(private dataService: DataService) { }

    /**
     * Returns list of attachments for the alarm
     * @param alarmId Alarm id
     */
    getEntityAttachments(alarmId: string): Promise<Media$v1[]> {
        return this.dataService.getAlarm$(alarmId, this.alarmTenantMap.get(alarmId)).toPromise().then(alarm => {
            if (alarm && alarm.attachments) {
                return alarm.attachments;
            }
            return [];
        });
    }

    /**
     * Returns an updated attachment. Used to keep the saas token and expiration date updated
     * @param alarmId Alarm id
     * @param attachmentId Attachment id
     */
     refreshAttachment(alarmId: string, attachmentId: string): Promise<Media$v1> {
        return this.dataService.getAttachmentUri$(alarmId, attachmentId).toPromise().then(attachment => {
            return attachment;
        });
    }
}

@Component({
    templateUrl: 'alarm-media.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlarmMediaComponent {

    /**  Alarm list */
    alarmMedia$ = combineLatest([this.alarmStore.entity$, this.settings.alarmIds$]).pipe(
        map(([alarms, ids]) => {

            // Update alarm tenant mapping
            alarms.forEach(alarm => {
                this.fetcher.alarmTenantMap.set(alarm.id, alarm.tenantId);
            });

            // Check if the alarms media is redacted
            if (alarms?.length) {
                // Is the first alarm media redacted
                if (alarms[0].isRedacted(RestrictIds$v1.attachments)) {
                    this.settings.setIsRedacted(true);
                    return [] as Media$v1[];
                }
            }

            // Filter alarms based on the ids passed in
            const filterAlarms = alarms.filter(alarm => {
                return !!ids.find(id => id === alarm.id);
            });

            let media: Media$v1[] = [];

            if (filterAlarms?.length) {
                filterAlarms.forEach(alarm => {
                    media = media.concat(alarm.attachments);
                });
            }
            return media;
        })
    );

    /** Used to get file URLS */
    fetcher: UrlFetcher;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) private settings: AlarmMediaSettings$v1,
        private alarmStore: StoreService<Alarm$v1>,
        private cdr: ChangeDetectorRef,
        private dataSrv: DataService) {
        this.fetcher = new UrlFetcher(this.dataSrv);

    }
}
