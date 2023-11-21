import { Component, Input, OnInit } from '@angular/core';
import { Alarm$v1, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { FeatureFlags } from '@galileo/web_common-libraries';
import { AlarmWithAssetAdapterService$v1, AlarmWithDeviceAdapterService$v1 } from '@galileo/web_commonassociation/adapter';
import { from, Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { DataService } from '../../../data.service';
import { UrlFetcher } from '../../../injectable-components/alarm-media/alarm-media.component';
import { TranslationTokens } from './detail-pane.translation';

@Component({
    selector: 'hxgn-alarms-detail-pane',
    templateUrl: 'detail-pane.component.html',
    styleUrls: ['detail-pane.component.scss']
})
export class DetailPaneComponent implements OnInit {

    /** Alarm for the details pane */
    @Input() alarm: Alarm$v1;

    /** When true shows remarks if they are not redacted. */
    @Input() enableRemarks = false;

    /** When true will show media if they are not redacted */
    @Input() enableMedia = false;

    /** When true will show keywords if they are not redacted */
    @Input() enableKeywords = false;

    /** The context id of the view using this component.  Needed for portal injection */
    @Input() contextId: string;

    assetIds$: Observable<string[]> = from(this.alarmWithAssetSrv.getAssociationsAsync()).pipe(
        flatMap(data => data),
        map(associations => {
            return associations.filter(a => a.alarmId === this.alarm?.id).map(a => a.assetId);
        })
    );

    /** Stream of associated device ids */
    deviceIds$: Observable<string[]> = from(this.deviceAssociations.getAssociationsAsync()).pipe(
        flatMap(data => data),
        map(associations => {
            return associations.filter(a => a.alarmId === this.alarm?.id)
                ?.map(a => a.deviceId);
        })
    );

    /** Used to get media url from blob */
    fetcher: UrlFetcher;

    /** List of translation token for properties that have been redacted */
    redactedPropertyTokens: string[] = [];

    /** Expose restrict ids to html. */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** List of feature flags from Common Libraries */
    featureFlags: typeof FeatureFlags = FeatureFlags;

    constructor(
        private alarmWithAssetSrv: AlarmWithAssetAdapterService$v1,
        private deviceAssociations: AlarmWithDeviceAdapterService$v1,
        private dataSrv: DataService
    ) { }

    ngOnInit() {
        this.setRedactionTokens();

        this.fetcher = new UrlFetcher(this.dataSrv);
        this.fetcher.alarmTenantMap.set(this.alarm.id, this.alarm.tenantId);
    }

    private setRedactionTokens() {
        if (this.alarm.isRedacted(RestrictIds$v1.primaryContact)) {
            this.redactedPropertyTokens.push(TranslationTokens.primaryContact);
        }

        if (this.alarm.isRedacted(RestrictIds$v1.location)) {
            this.redactedPropertyTokens.push(TranslationTokens.location);
        }

        if (this.alarm.isRedacted(RestrictIds$v1.remarks)) {
            this.redactedPropertyTokens.push(TranslationTokens.remarks);
        }

        if (this.alarm.isRedacted(RestrictIds$v1.keywords)) {
            this.redactedPropertyTokens.push(TranslationTokens.keywords);
        }

        if (this.alarm.isRedacted(RestrictIds$v1.attachments)) {
            this.redactedPropertyTokens.push(TranslationTokens.media);
        }

        if (this.alarm.isRedacted(RestrictIds$v1.type)) {
            this.redactedPropertyTokens.push(TranslationTokens.type);
        }

        if (this.alarm.isRedacted(RestrictIds$v1.priority)) {
            this.redactedPropertyTokens.push(TranslationTokens.priority);
        }

        if (this.alarm.isRedacted(RestrictIds$v1.lastUpdateTime)) {
            this.redactedPropertyTokens.push(TranslationTokens.lastUpdate);
        }
    }
}
