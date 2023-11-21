export enum AppNotificationTranslationTokens {
    alarmClosedBy = 'alarm-core.notification.alarmClosedBy', // 1 alarm closed
    alarmsClosed = 'alarm-core.notification.alarmsClosed', // 2 alarms closed
    alarmAndMoreClosed = 'alarm-core.notification.alarmAndMoreClosed', // 3 or more alarms closed
    remarkAddedToAlarm = 'alarm-core.notification.remarkAddedToAlarm', // 1 alarm update remark
    mediaAddedToAlarm = 'alarm-core.notification.mediaAddedToAlarm', // 1 alarm update media
    alarmsHaveUpdates = 'alarm-core.notification.alarmsHaveUpdates', // 2 alarm updates
    alarmsAndMoreHaveUpdates = 'alarm-core.notification.alarmsAndMoreHaveUpdates', // 3 or more alarm updates
    alarmFromAssetFrom = 'alarm-core.notification.alarmFromAssetFrom', // New alarm associated with an asset
    alarmFromDeviceFrom = 'alarm-core.notification.alarmFromDeviceFrom', // New alarm associated with a device
    alarmFrom = 'alarm-core.notification.alarmFrom', // New alarm with no known associations
    alarms = 'alarm-core.notification.alarms', // 2 alarms created with no known associations
    alarmsAndMoreAlarms = 'alarm-core.notification.alarmsAndMoreAlarms' // 3 or more alarms created with no known associations
}
