import { PORTAL_DATA } from '@galileo/web_commonlayoutmanager/adapter';

/** Injection token used by layout manager */
export const LAYOUT_MANAGER_SETTINGS = PORTAL_DATA;

/** List of all components that can be injected */
export enum InjectableComponentNames {
    // {componentName} = '@hxgn/shapes/{componentName}/{version}'
    adminShapeManager = '@hxgn/shapes/admin/shape-manager/v1',
    list = '@hxgn/shapes/list/v1',
    listSettings = '@hxgn/shapes/list/settings/v1',
    countComponent = '@hxgn/shapes/count/v1',
    createDataSharingComponent = '@hxgn/shapes/createdatasharing/v1',
    activeDataSharingComponent = '@hxgn/shapes/activeDataFilters/v1',
    appNotificationComponent = '@hxgn/shapes/appnotification/v1',
    iconComponent = '@hxgn/shapes/icon/v1',
    simpleCardComponent = '@hxgn/shapes/simplecard/v1',
    cardListComponent = '@hxgn/shapes/cardlist/v1',
    historyItemComponent = "@hxgn/shapes/historyItem/v1",
    channelAssociatedHistoryItem = '@hxgn/shapes/channelassociationhistoryitem/v1',
}
