import { Scope$v1 } from './scope.v1';

export class FlagState$v1 {

    /** Flag identifier */
    flagId?: string;

    /** Whether flag is turned on */
    enabled?: boolean;

    /** Whether flag can be edited */
    tenantOptional?: boolean;

    /** Force changes to levels below current */
    forcePushLevelsBelow?: boolean;

    /** Remove override from level above */
    removeCurrentLevelOverride?: boolean;

    /** Last modified date of the flag state */
    lastModifiedDate?: Date;

    /** Flag set to allow user to edit flag state */
    editable?: boolean;

    /** Level in which the flag can be edited in */
    scope?: Scope$v1;

    constructor(params: FlagState$v1 = [] as FlagState$v1) {
        const {
            flagId = null,
            enabled = false,
            tenantOptional = false,
            forcePushLevelsBelow = false,
            removeCurrentLevelOverride = false,
            lastModifiedDate = null,
            editable = false,
            scope = null
        } = params;

        this.flagId = flagId;
        this.enabled = enabled;
        this.tenantOptional = tenantOptional;
        this.forcePushLevelsBelow = forcePushLevelsBelow;
        this.removeCurrentLevelOverride = removeCurrentLevelOverride;
        this.lastModifiedDate = lastModifiedDate;
        this.editable = editable;
        this.scope = scope;
    }
}
