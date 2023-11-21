import { UserVisibility$v1 } from './visibility.v1';

/**
 * Data that comes back for user info from identity server.
 * THIS INTERFACE SHOULD NOT BE USED OUTSIDE THE USER DATA ACCESSOR
 */
export interface RawUserInfo$v1 {
  /** Ids the User is part of */
  tenantId: string | string[];

  /** Groups the user is part of */
  group: string[];

  /** User id */
  userId: string;

  /** Display name */
  display_name: string;

  /** Family name */
  family_name: string;

  /** Given name */
  given_name: string;

  /** Email address */
  email: string;

  /** Phone number */
  phone: string;

  /** Title */
  title: string;

  /** Profile picture */
  picture: string;

  /** Id of the active tenant */
  activeTenantId: string;

  /** Id of the active tenant */
  activeTenant: string;

  /** Reference token id */
  refreshTokenId: string;

  /** Has the soft limit been reached */
  softLimitReached: boolean;

  /** Has the max license limit been reached */
  maxLicensesReached: boolean;

  /** Does the user have core access */
  uiCoreAccess: boolean;

  /** The active culture */
  culture: string;

  /** Visibility settings */
  visibilities: Map<string, UserVisibility$v1>;

  /** The user's visibility */
  visibility: UserVisibility$v1;

  /** Provider scheme being used */
  providerScheme: string;

  /** Is the session locked */
  sessionLocked: boolean;

  /** Name of the account */
  accountUserName: string;

  /** True if there are not user roles */
  noUserRoles: boolean;
}
