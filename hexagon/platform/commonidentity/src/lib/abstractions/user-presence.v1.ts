export enum UserPresence$v1 {
  /** User Online but not available for video/audio call */
  online = 'Online',

  /** User Busy or currently in a call */
  busy = 'Busy',

  /** User Away */
  away = 'Away',

  /** User Offline */
  offline = 'Offline',

  /** User Appear Offline */
  appearOffline = 'AppearOffline',

  /** User Unknown  */
  unknown = 'Unknown',
}
