import { PORTAL_DATA } from '@galileo/web_commonlayoutmanager/adapter';

export const LAYOUT_MANAGER_SETTINGS = PORTAL_DATA;

export enum InjectableComponentNames {
    // {componentName} = '@hxgn/{capability}/{componentName}/{version}'
    SampleComponent = '@hxgn/commonkeywords/sample/v1',
    OnboardingComponent = '@hxgn/commonkeywords/onboarding/v1',
    IconComponent = '@hxgn/commonkeywords/icon/v2',
    IconManagerComponent = '@hxgn/commonkeywords/admin/iconmanager/v1'
}
