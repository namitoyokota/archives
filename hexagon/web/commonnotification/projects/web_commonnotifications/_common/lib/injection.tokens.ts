import { PORTAL_DATA } from '@galileo/web_commonlayoutmanager/adapter';

export const LAYOUT_MANAGER_SETTINGS = PORTAL_DATA;

/** List of all components that can be injected */
export enum InjectableComponentNames {
    // {componentName} = '@hxgn/commonnotifications/{componentName}/{version}'
    notificationOverlay = '@hxgn/commonnotifications/overlay/v1',
    notificationBtn = '@hxgn/commonnotifications/btn/v1',
    onboarding = '@hxgn/commonnotifications/onboarding/v1',
    notificationManager = '@hxgn/commonnotifications/admin/notificationmanager/v1'
}
