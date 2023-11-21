import { PORTAL_DATA } from '@galileo/web_commonlayoutmanager/adapter';

export const LAYOUT_MANAGER_SETTINGS = PORTAL_DATA;

export enum InjectableComponentNames {
    // {componentName} = '@hxgn/{capability}/{componentName}/{version}'
    SetFilterCriteriaTemplateComponent = '@hxgn/commontenant/setfiltercriteriatemplate/v1',
    TenantOnboardingComponent = '@hxgn/commontenant/onboarding/v1',
    LocationMarkerComponent = '@hxgn/commontenant/locationMarker/v1',
    OrganizationSelectComponent$v2 = '@hxgn/commontenant/organizationSelect/v2',
    TenantIconListComponent = '@hxgn/commontenant/tenantIconList/v1',
    OrganizationListComponent = '@hxgn/commontenant/organizationList/v1',
    DataSharingComponent = '@hxgn/commontenant/admin/datasharing/v1',
    ActivityMonitoringComponent = '@hxgn/commontenant/admin/activitymonitoring/v1',
    TenantConfigurationComponent = '@hxgn/commontenant/admin/tenantconfiguration/v1',
    TenantManagementComponent = '@hxgn/commontenant/admin/tenantmanagement/v1',
    OnboardingComponent = '@hxgn/commontenant/admin/onboarding/v1',
    NetworkListComponent = '@hxgn/commontenant/networklist/v1',
}
