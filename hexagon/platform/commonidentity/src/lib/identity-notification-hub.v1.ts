import {
  HubManager$v1,
  NotificationHub$v1,
  TokenManager$v1,
  UrlHelper$v1,
  WindowCommunication$v1,
} from '@galileo/platform_common-http';
import { Subject } from 'rxjs';

import { capabilityId } from '..';

import {
  IdentityChangeNotification$v1,
  IdentityChangeNotificationReason$v1,
} from './abstractions/change-notification.v1';

/**
 * Name of events that can happen
 */
enum EventNames {
  tokenDeleted = 'tokenDeleted',
  roleChanged = 'roleChanged',
  refreshLogin = 'refreshLogin',
  refreshLoginMismatch = 'refreshLoginMismatch',
  userChanged = 'userChanged',
}

const apiUrl = '/api/commonIdentities/hub/changeNotification/v1';

/***
 * Handles notification processing from signalR or the window service.
 */
export class IdentityNotificationHub$v1 extends NotificationHub$v1<IdentityChangeNotification$v1> {
  private roleChanged = new Subject<IdentityChangeNotification$v1>();

  private refreshTokenChange = new Subject<IdentityChangeNotification$v1>();

  private refreshLogin = new Subject<IdentityChangeNotification$v1>();

  private refreshLoginFail = new Subject<IdentityChangeNotification$v1>();

  private cultureChange = new Subject<IdentityChangeNotification$v1>();

  private presencesChange = new Subject<IdentityChangeNotification$v1>();

  /** Event that the user's roles have changed */
  readonly roleChanged$ = this.roleChanged.asObservable();

  /** Event that the login has been refresh */
  readonly refreshLogin$ = this.refreshLogin.asObservable();

  /** Event a change to the refresh token has been made */
  readonly refreshTokenChange$ = this.refreshTokenChange.asObservable();

  /** Event that the login fails to be refreshed */
  readonly refreshLoginFail$ = this.refreshLoginFail.asObservable();

  /** User's culture has changed */
  readonly cultureChange$ = this.cultureChange.asObservable();

  /** User's presences has changed */
  readonly presencesChange$ = this.presencesChange.asObservable();

  constructor(
    tokenManager: TokenManager$v1,
    baseUrl: Promise<string> | string = null,
    windowComm: WindowCommunication$v1 = null,
    manager: HubManager$v1 = null
  ) {
    super(
      IdentityNotificationHub$v1.createBaseURL(baseUrl),
      tokenManager,
      capabilityId,
      windowComm,
      manager
    );

    this.hubEventsReady();
  }

  /**
   * Create base url for notification hub
   */
  static async createBaseURL(baseURL: Promise<string> | string) {
    const url = await baseURL;
    return url ? `${url}${apiUrl}` : UrlHelper$v1.mapUrl(apiUrl);
  }

  /**
   * Returns list of event names to listen to
   */
  eventNames() {
    return [
      EventNames.tokenDeleted,
      EventNames.roleChanged,
      EventNames.refreshLogin,
      EventNames.userChanged,
    ];
  }

  /**
   * Process when a notification event happens
   * @param eventName The name of the event
   * @param notification Notification object
   */
  onEvent(eventName: string, notification: IdentityChangeNotification$v1) {
    switch (eventName) {
      case EventNames.roleChanged:
        this.onRoleChanged(notification);
        break;
      case EventNames.tokenDeleted:
        this.onTokenDeleted(notification);
        break;
      case EventNames.refreshLogin:
        if (
          notification.reason ===
          IdentityChangeNotificationReason$v1.refreshLogin
        ) {
          this.refreshLogin.next(notification);
        } else {
          this.refreshLoginFail.next(notification);
        }
        break;
      case EventNames.userChanged:
        if (
          notification.reason === IdentityChangeNotificationReason$v1.culture
        ) {
          this.cultureChange.next(notification);
          break;
        }
        if (
          notification.reason === IdentityChangeNotificationReason$v1.userStatus
        ) {
          this.presencesChange.next(notification);
          break;
        }
        break;
      default:
        console.error(
          'HxGN Connect:: Common Identity: Unknown notification event',
          notification
        );
    }
  }

  private onRoleChanged(notification: IdentityChangeNotification$v1) {
    if (notification.reason === IdentityChangeNotificationReason$v1.userRole) {
      this.roleChanged.next(notification);
    } else {
      console.error(
        'HxGN Connect:: Common Identity: Unknown role change reason',
        notification
      );
    }
  }

  private onTokenDeleted(notification: IdentityChangeNotification$v1) {
    if (
      notification.reason ===
      IdentityChangeNotificationReason$v1.refreshToken ||
      notification.reason ===
      IdentityChangeNotificationReason$v1.userRemovedFromTenant
    ) {
      this.refreshTokenChange.next(notification);
    } else {
      console.error(
        'HxGN Connect:: Common Identity: Unknown refresh token change reason',
        notification
      );
    }
  }
}
