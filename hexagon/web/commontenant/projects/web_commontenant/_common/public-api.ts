
/*
 * Public API Surface of commontenant-common
 */

export * from './lib/abstractions/change-notification.v1';
export * from './lib/abstractions/data-sharing-capability-options.v1';
export * from './lib/abstractions/network-list-settings.v1';
export * from './lib/abstractions/onboarding-adapter-service.v1';
export * from './lib/abstractions/onboarding-options.v1';
export * from './lib/abstractions/onboarding-step.v1';
export * from './lib/abstractions/onboarding-tab.v1';
export * from './lib/abstractions/organization-list-settings.v1';
export * from './lib/abstractions/organization-select-settings.v1';
export * from './lib/abstractions/organization-select-settings.v2';
export * from './lib/abstractions/sharee-tenant-info.v1';
export * from './lib/abstractions/sharer-tenant-info.v1';
export * from './lib/abstractions/sharing-configuration.v1';
export * from './lib/abstractions/tenant-icon-list-settings.v1';
export * from './lib/abstractions/url-access-token-obj';

export * from './lib/claims.v1';
export * from './lib/commontenant.mailbox';
export * from './lib/feature-flags';
export * from './lib/injection.tokens';
export * from './lib/translation-group';

export const moduleRefId = '@hxgn/commontenant'; // Legacy support

export {
    capabilityId,
    Application$v1,
    CapabilityManifest$v1,
    ChangelogOperation$v1,
    ChangelogPropertyName$v1,
    Changelog$v1,
    CompatibleCapability$v1,
    CompatibleOptions$v1,
    CriteriaOperation$v1,
    CriteriaType$v1,
    defaultDataSharingLevels,
    Industries$v1,
    ManifestOperation$v1,
    MapData$v1,
    OptInResponse$v1,
    RestrictionGrouping$v1,
    RestrictionLevels$v1,
    RestrictionOperation$v1,
    SharingCriteria$v1,
    Tenant$v1
} from '@galileo/platform_commontenant';
