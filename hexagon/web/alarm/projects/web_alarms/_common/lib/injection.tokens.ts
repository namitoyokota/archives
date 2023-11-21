import { PORTAL_DATA } from '@galileo/web_commonlayoutmanager/adapter';

/** Injection token used by layout manager */
export const LAYOUT_MANAGER_SETTINGS = PORTAL_DATA;

/** List of all components that can be injected */
export enum InjectableComponentNames {
    // {componentName} = '@hxgn/alarms/{componentName}/{version}'
    activeDataSharingComponent = '@hxgn/alarms/activedatafilters/v1',
    alarmClearIcon = '@hxgn/alarms/clearIcon/v1',
    alarmFilter = '@hxgn/alarms/filter/v1',
    alarmStatus = '@hxgn/alarms/status/v1',
    alarmMedia = '@hxgn/alarms/media/v1',
    alarmPriority = '@hxgn/alarms/priority/v1',
    alarmTitleComponent = '@hxgn/alarms/title/v1',
    alarmPanelComponent = '@hxgn/alarms/listpanel/v1',
    cardListComponent = '@hxgn/alarms/cardlist/v1',
    channelAssociationHistoryItem = '@hxgn/alarms/channelassociationhistoryitem/v1',
    createDataSharingComponent = '@hxgn/alarms/createdatasharing/v1',
    alarmList = '@hxgn/alarms/panel/v1',
    alarmListSettings = '@hxgn/alarms/panelsettings/v1',
    historyItemComponent = '@hxgn/alarms/historyitem/v1',
    iconComponent = '@hxgn/alarms/icon/v1',
    mapMarkerComponent = '@hxgn/alarms/mapmarker/v1',
    mapClusterMarkerComponent = '@hxgn/alarms/mapclustermarker/v1',
    mapClusterDetailsComponent = '@hxgn/alarms/mapclusterdetails/v1',
    simpleCardComponent = '@hxgn/alarms/simplecard/v1',
    appNotificationComponent = '@hxgn/alarms/appnotification/v1',
    countComponent = '@hxgn/alarms/count/v1',
    miniCardComponent = '@hxgn/alarms/minicard/v1'
}
