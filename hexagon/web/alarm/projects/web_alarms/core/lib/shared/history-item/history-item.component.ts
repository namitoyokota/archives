import { Component, Input, OnInit } from '@angular/core';
import { Alarm$v1, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { Asset$v1, AssetsAdapterService$v1 } from '@galileo/web_assets/adapter';
import { ChangeOperation$v1, ChangeOperator$v1, Media$v1, Utils } from '@galileo/web_common-libraries';
import { Device$v1, DevicesAdapterService$v1 } from '@galileo/web_devices/adapter';

import { DataService } from '../../data.service';
import { UrlFetcher } from '../../injectable-components/alarm-media/alarm-media.component';
import { HistoryItemTranslationTokens } from './history-item.translation';

enum OperationProperties {
    attachments = 'Attachments',
    industryId = 'IndustryId',
    isManaged = 'IsManaged',
    keywords = 'Keywords',
    location = 'Location',
    primaryContact = 'PrimaryContact',
    priority = 'Priority',
    properties = 'Properties',
    remarks = 'Remarks',
    reportedTime = 'ReportedTime',
    title = 'Title',
    type = 'Type',
    hyperlinks = 'Hyperlinks'
}

@Component({
    selector: 'hxgn-alarms-history-item',
    templateUrl: 'history-item.component.html',
    styleUrls: ['history-item.component.scss']
})
export class HistoryItemComponent implements OnInit {

    /** The alarm to display history for. Needed for displaying attachments. */
    @Input() alarm: Alarm$v1;

    /** Whether or not to show the concise history item view. */
    @Input() concise = false;

    /** Operations to display. */
    @Input() operations: ChangeOperation$v1[];

    /** Title of the associated asset. */
    assetTitle: string = '';

    /** Tracks the association operation. */
    association: ChangeOperation$v1 = null;

    /** Expose change operator to html. */
    changeOperator: typeof ChangeOperator$v1 = ChangeOperator$v1;

    /** Created alarm object. */
    createdAlarm: Alarm$v1;

    /** Tracks the attachments that have been deleted. */
    deletedMediaList: Media$v1[] = [];

    /** Title of the associated device. */
    deviceTitle: string = '';

    /** Used to get file URLS */
    fetcher: UrlFetcher;

    /** Determines whether or not the association operations are for the creation of an association. */
    isAssociationCreation = false;

    /** Determines whether or not these operations are for the creation of an alarm. */
    isCreation = false;

    /** Determines whether or not these operations are for reopening an alarm. */
    isReopen = false;

    /** Media objects to display on attachments update. */
    mediaList: Media$v1[] = [];

    /** Expose operation properties to html. */
    operationProperties: typeof OperationProperties = OperationProperties;

    /** Expose restrict ids to html. */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Expose translation tokens to html. */
    tokens: typeof HistoryItemTranslationTokens = HistoryItemTranslationTokens;

    constructor(
        private assetSrv: AssetsAdapterService$v1,
        private dataSrv: DataService,
        private deviceSrv: DevicesAdapterService$v1
    ) { }

    async ngOnInit() {

        if (this.operations.some(x => x.propertyName === OperationProperties.attachments)
            && !this.operations.some(x => x.operator === ChangeOperator$v1.addition)) {
            this.setAttachments();
            this.fetcher = new UrlFetcher(this.dataSrv);
            this.fetcher.alarmTenantMap.set(this.alarm.id, this.alarm.tenantId);
        }

        this.association = this.operations.find(x => x.propertyName === 'AssociatedCapability2');
        if (this.operations[0]?.operator === ChangeOperator$v1.addition) {
            this.isAssociationCreation = !!this.association;
            this.isCreation = !this.association;
        }

        if (this.operations[0]?.operator === ChangeOperator$v1.reopen) {
            this.isAssociationCreation = !!this.association;
            this.isReopen = !this.association;
        }

        if (this.association) {
            const id: string = this.association.value.id;
            await this.setDeviceTitleAsync(id);

            if (!this.deviceTitle) {
                await this.setAssetTitleAsync(id);
            }
        }

        if (this.isCreation || this.isReopen) {
            this.setAlarmProperties();
        }
    }

    /** Whether or not to show the connector between icons. */
    showConnector(index: number): boolean {
        let show = false;
        if (this.operations.length === 1) {
            return show;
        }

        const operations = Utils.deepCopy(this.operations);
        operations.splice(0, index);
        if (operations.length) {
            operations.forEach(operation => {
                if (this.operations[index].propertyName !== operation.propertyName) {
                    show = true;
                }
            });
        }

        return show;
    }

    /**
     * Sets the attachments for when an attachment update occurs.
     */
    private setAttachments() {
        const attachmentOperator: ChangeOperation$v1 = this.operations.find(x => x.propertyName === OperationProperties.attachments);
        attachmentOperator.value.forEach((attachment: Media$v1) => {
            const incidentAttachment = this.alarm.attachments.find(x => x.externalId === attachment.externalId);
            if (incidentAttachment) {
                this.mediaList = [...this.mediaList, incidentAttachment];
            } else {
                this.deletedMediaList = [...this.deletedMediaList, incidentAttachment];
            }
        });
    }

    /**
     * Sets the required properties for the created alarm card
     */
    private setAlarmProperties(): void {
        const alarm = {} as Alarm$v1;

        const propertiesOperation = this.operations.find(x => x.propertyName === OperationProperties.properties);
        if (propertiesOperation) {
            alarm.properties = propertiesOperation.value;
        }

        const titleOperation = this.operations.find(x => x.propertyName === OperationProperties.title);
        if (titleOperation) {
            alarm.title = titleOperation.value;
        }

        const industryIdOperation = this.operations.find(x => x.propertyName === OperationProperties.industryId);
        if (industryIdOperation) {
            alarm.industryId = industryIdOperation.redact ? undefined : industryIdOperation.value;
        }

        const keywordsOperation = this.operations.find(x => x.propertyName === OperationProperties.keywords);
        if (keywordsOperation) {
            alarm.keywords = keywordsOperation.redact ? undefined : keywordsOperation.value;
        }

        const locationOperation = this.operations.find(x => x.propertyName === OperationProperties.location);
        if (locationOperation) {
            alarm.location = locationOperation.redact ? undefined : locationOperation.value;
        }

        const primaryContactOperation = this.operations.find(x => x.propertyName === OperationProperties.primaryContact);
        if (primaryContactOperation) {
            alarm.primaryContact = primaryContactOperation.redact ? undefined : primaryContactOperation.value;
        }

        const priorityOperation = this.operations.find(x => x.propertyName === OperationProperties.priority);
        if (priorityOperation) {
            alarm.priority = priorityOperation.redact ? undefined : priorityOperation.value;
        }

        const hyperlinksOperation = this.operations.find(x => x.propertyName === OperationProperties.hyperlinks);
        if (hyperlinksOperation) {
            alarm.hyperlinks = hyperlinksOperation.redact ? undefined : hyperlinksOperation.value;
        }

        this.createdAlarm = new Alarm$v1(alarm);
    }

    /**
     * Gets asset title
     * @param assetId Asset id
     */
    private async setAssetTitleAsync(assetId: string): Promise<void> {
        const asset: Asset$v1 = await this.assetSrv.getAssetAsync(assetId);
        if (asset) {
            this.assetTitle = asset?.title ?? '';
        }
    }

    /**
     * Gets device title
     * @param deviceId Device id
     */
    private async setDeviceTitleAsync(deviceId: string): Promise<void> {
        const device: Device$v1 = await this.deviceSrv.getDeviceAsync(deviceId);
        if (device) {
            this.deviceTitle = device?.title ?? '';
        }
    }
}