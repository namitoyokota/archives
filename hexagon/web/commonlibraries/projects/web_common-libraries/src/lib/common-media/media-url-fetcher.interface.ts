import { Media$v1 } from '@galileo/platform_common-libraries';

/**
 * A object that knows how to trade an attachment id in for a
 * url to the media so that it can be downloaded.
 */
export interface MediaURLFetcher {
    /**
     * Returns list of attachments for the entity
     * @param entityId Entity id
     * @param tenantId Tenant id
     * Optional at the moment to avoid breaking existing implementations
     */
    getEntityAttachments?(entityId: string, tenantId?: string): Promise<Media$v1[]>;

    /**
     * Returns an updated attachment. Used to keep the saas token and expiration date updated
     * @param entityId Entity id
     * @param attachmentId Attachment id
     * Optional at the moment to avoid breaking existing implementations
     */
    refreshAttachment?(entityId: string, attachmentId: string): Promise<Media$v1>;
}
