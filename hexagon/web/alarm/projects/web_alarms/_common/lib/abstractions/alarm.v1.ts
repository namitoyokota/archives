import { Hyperlink$v1, Location$v1, Media$v1, Person$v1, Remark$v1 } from '@galileo/web_common-libraries';

import { RestrictIds$v1 } from './restrict-ids.v1';

export class Alarm$v1 {

    /** Alarm id */
    id?: string;

    /** Id of the tenant with which the alarm is associated */
    tenantId?: string;

    /** The alarm description */
    title?: string | undefined;

    /** The priority of the alarm */
    priority?: number | undefined;

    /** A flag that is true when the alarm is managed by the system of record */
    isManaged?: boolean;

    /** Reported time of the alarm */
    reportedTime?: Date | undefined;

    /** The time that the alarm was last updated */
    lastUpdateTime?: Date | undefined;

    /** Where the alarm is */
    location?: Location$v1 | undefined;

    /** List of remarks for the alarm */
    remarks?: Remark$v1[] | undefined;

    /** The keyword group of the alarm */
    keywords?: string[] | undefined;

    /** The properties of the alarm */
    properties?: Record<string, string> | undefined;

    /** List of URLs */
    hyperlinks?: Hyperlink$v1[] | undefined;

    /** The media attached to the alarm */
    attachments?: Media$v1[] | undefined;

    /** The industryId with which the alarm is associated (e.g. Police) */
    industryId?: string | undefined;

    /** Alarm type. */
    type?: string | undefined;

    /** The primary contact for the alarm. */
    primaryContact?: Person$v1 | undefined;

    /** A value indicating whether this entity has been tombstoned. */
    tombstoned?: boolean;

    /** The time the entity was tombstoned */
    tombstonedTime?: Date;

    /** List of property groups that are redacted */
    private redactedList?: RestrictIds$v1[];

    constructor(params: Alarm$v1 = {} as Alarm$v1) {
        const {
            id = null,
            tenantId = null,
            title = null,
            priority = null,
            isManaged = false,
            reportedTime = null,
            lastUpdateTime = null,
            location = null,
            remarks = [],
            keywords = [],
            properties = null,
            hyperlinks = [],
            attachments = [],
            industryId = null,
            type = null,
            primaryContact = null,
            tombstoned = false,
            tombstonedTime = null
        } = params;

        if (params?.redactedList) {
            this.redactedList = [...params?.redactedList];
        } else {
            this.markAsRedacted(params);
        }
        
        this.id = id;
        this.tenantId = tenantId;
        this.title = title;
        this.priority = priority;
        this.isManaged = isManaged;
        this.reportedTime = reportedTime ? new Date(reportedTime) : null;
        this.lastUpdateTime = lastUpdateTime ? new Date(lastUpdateTime) : null;
        this.location = location ? new Location$v1(location) : null;
        this.remarks = remarks?.length ? remarks.map(item => new Remark$v1(item)) : [];
        this.keywords = keywords;
        this.attachments = attachments?.length ? attachments.map(item => new Media$v1(item)) : [];
        this.hyperlinks = hyperlinks;
        this.industryId = industryId;
        this.type = type;
        this.primaryContact = primaryContact;
        this.tombstoned = tombstoned;
        this.tombstonedTime = tombstonedTime;

        // Add entity id to attachments
        if (this.attachments) {
            this.attachments.forEach(attachment => {
                attachment.entityId = this.id;
            });
        }

        if (properties && Object.keys(properties).length) {
            this.properties = properties;
        } else {
            this.properties = null;
        }
    }

    /**
     * Checks if the property is redacted
     * @param property The property to check if is redacted
     */
    public isRedacted(property: RestrictIds$v1): boolean {
        return !!this.redactedList.find(item => item === property);
    }

    /**
     * Checks an alarm for any redacted properties
     * @param alarm The alarm to check for redacted properties
     */
    private markAsRedacted(alarm: Alarm$v1) {
        if (!this.redactedList) {
            this.redactedList = [];
        }

        if (alarm.attachments === undefined) {
            this.redactedList.push(RestrictIds$v1.attachments);
        }

        if (alarm.priority === undefined) {
            this.redactedList.push(RestrictIds$v1.priority);
        }

        if (alarm.reportedTime === undefined) {
            this.redactedList.push(RestrictIds$v1.reportedTime);
        }

        if (alarm.lastUpdateTime === undefined) {
            this.redactedList.push(RestrictIds$v1.lastUpdateTime);
        }

        if (alarm.location === undefined) {
            this.redactedList.push(RestrictIds$v1.location);
        }

        if (alarm.remarks === undefined) {
            this.redactedList.push(RestrictIds$v1.remarks);
        }

        if (alarm.keywords === undefined) {
            this.redactedList.push(RestrictIds$v1.keywords);
        }

        if (alarm.properties === undefined) {
            this.redactedList.push(RestrictIds$v1.properties);
        }

        if (alarm.hyperlinks === undefined) {
            this.redactedList.push(RestrictIds$v1.hyperlinks);
        }

        if (alarm.title === undefined) {
            this.redactedList.push(RestrictIds$v1.title);
        }

        if (alarm.type === undefined) {
            this.redactedList.push(RestrictIds$v1.type);
        }

        if (alarm.primaryContact === undefined) {
            this.redactedList.push(RestrictIds$v1.primaryContact);
        }
    }
}
