import { PORTAL_DATA } from '@galileo/web_commonlayoutmanager/adapter';

/** Injection token used by layout manager */
export const LAYOUT_MANAGER_SETTINGS = PORTAL_DATA;


/** List of all components that can be injected */
export enum InjectableComponentNames {
    // {componentName} = '@hxgn/commonrecovery/{componentName}/{version}'
    tenantManagementComponent = '@hxgn/commonrecovery/tenantmanagement/v1',
    adminRecoveryManagement = '@hxgn/commonrecovery/admin/recoverymanagement/v1'
}
