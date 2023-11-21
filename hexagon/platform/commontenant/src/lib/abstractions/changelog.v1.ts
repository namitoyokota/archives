import { ChangelogOperation$v1 } from './changelog-operation.v1';

/**
 * Changelog record object for timelines
 */
export class Changelog$v1 {
    /** User id of the performed user */
    user?: string;

    /** Tenant id in which the operation happened */
    tenant?: string;

    /** The timestamp of when change happened */
    timestamp?: string;

    /** List of performed operations */
    operations?: ChangelogOperation$v1[];

    constructor(params: Changelog$v1 = {} as Changelog$v1) {
        const {
            user = null,
            tenant = null,
            timestamp = null,
            operations = []
        } = params;

        this.user = user;
        this.tenant = tenant;
        this.timestamp = timestamp;
        this.operations = operations;
    }
}