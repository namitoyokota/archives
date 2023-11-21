import { FeatureFlag$v2 } from '@galileo/web_commonfeatureflags/_common';

export class FlagStateRequest$v2 {

    /** Feature flag to update */
    featureFlag?: FeatureFlag$v2;

    /** Flag that is true if the feature flag is enabled */
    enabled?: boolean;

    /** Flag that is true if the feature flag is optional for tenants */
    tenantOptional?: boolean;

    /** Flag that is true if the flag is to be forced to lower levels */
    forcePushLevelsBelow?: boolean;

    /** Flag that is true if the flag record is to be removed from current level  */
    removeCurrentLevelOverride?: boolean;

    constructor(params: FlagStateRequest$v2 = {} as FlagStateRequest$v2) {
        const {
            featureFlag = null,
            enabled = false,
            tenantOptional = false,
            forcePushLevelsBelow = false,
            removeCurrentLevelOverride = false,
        } = params;

        this.featureFlag = (featureFlag) ? new FeatureFlag$v2(featureFlag) : featureFlag;
        this.enabled = enabled;
        this.tenantOptional = tenantOptional;
        this.forcePushLevelsBelow = forcePushLevelsBelow;
        this.removeCurrentLevelOverride = removeCurrentLevelOverride;
    }
}
