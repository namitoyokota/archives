import { PORTAL_DATA } from '@galileo/web_commonlayoutmanager/adapter';

/** Injection token used by layout manager */
export const LAYOUT_MANAGER_SETTINGS = PORTAL_DATA;

/** List of all components that can be injected */
export enum InjectableComponentNames {
    // {componentName} = '@hxgn/commonfeatureflags/{componentName}/{version}'
    featureFlagGlobalEditor = '@hxgn/commonfeatureflags/globaleditor/v1',
    featureFlagTenantEditor = '@hxgn/commonfeatureflags/tenanteditor/v1',
    featureFlagGroupsEditor = '@hxgn/commonfeatureflags/groupseditor/v1',
    featureFlagGroupsMenu = '@hxgn/commonfeatureflags/groupsmenu/v1'
}
