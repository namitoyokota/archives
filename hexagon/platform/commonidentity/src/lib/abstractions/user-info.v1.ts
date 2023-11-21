import { UserStatus$v1 } from './user-status.v1';
import { UserVisibility$v1 } from './visibility.v1';

export class UserInfo$v1 {
  /** The id of the user */
  id: string;

  /** The display name of the user */
  displayName?: string;

  /** The given name of the user */
  givenName?: string;

  /** The family name of the user */
  familyName?: string;

  /** The email of the user */
  email?: string;

  /** The users phone number */
  phone?: string;

  /** The users title */
  title?: string;

  /** The users tenantId */
  tenantId?: string[];

  /** A url to the provided user image */
  profileImage?: string;

  /** The users active tenant */
  activeTenant?: string;

  /** Map of capability id to claims */
  capabilityClaims?: Map<string, string[]>;

  /** Id for the refresh token. A refresh token is the identifer for the user's session */
  refreshTokenId?: string;

  /** Flag that is true if the user is over over the soft limit for core licenses */
  softLimitReached?: boolean;

  /** Flag that is true if the user has hist the max licenses allowed */
  maxLicensesReached?: boolean;

  /** User's specified culture. Takes precedent for localization. */
  culture?: string;

  /** Flag that must be true to have access to product */
  hasCoreAccess?: boolean;

  /** List of group ids the user is part of */
  group?: string[];

  /** The visibility of the user */
  visibility?: UserVisibility$v1;

  /** Gets or sets the user's visibility per tenant. */
  visibilities?: Map<string, UserVisibility$v1>;

  /** The provider the used to log into the app */
  providerScheme?: string;

  /** A flag that is true if the current session is locked */
  sessionLocked?: boolean;

  /** Account name for the user */
  accountUserName?: string;

  /** Flag to indicate that no rules exist for the user */
  noUserRoles?: boolean;

  /** Map of user status (tenant Id is key, status is value)*/
  status?: Record<string, UserStatus$v1>;

  constructor(params: UserInfo$v1 = {} as UserInfo$v1) {
    const {
      id = null,
      displayName = null,
      givenName = null,
      familyName = null,
      email = null,
      phone = null,
      title = null,
      profileImage = null,
      tenantId = [],
      activeTenant = null,
      capabilityClaims = new Map<string, string[]>(),
      refreshTokenId = null,
      softLimitReached = false,
      maxLicensesReached = false,
      culture = null,
      hasCoreAccess = false,
      group = [],
      visibility = UserVisibility$v1.internal,
      visibilities = new Map<string, UserVisibility$v1>(),
      providerScheme = null,
      sessionLocked = false,
      accountUserName = null,
      noUserRoles = false,
      status = null,
    } = params;

    this.id = id;
    this.displayName = displayName;
    this.givenName = givenName;
    this.familyName = familyName;
    this.email = email;
    this.phone = phone;
    this.title = title;
    this.profileImage = profileImage;
    this.tenantId = tenantId;
    this.activeTenant = activeTenant;
    this.capabilityClaims = capabilityClaims;
    this.refreshTokenId = refreshTokenId;
    this.softLimitReached = softLimitReached;
    this.maxLicensesReached = maxLicensesReached;
    this.culture = culture;
    this.hasCoreAccess = hasCoreAccess;
    this.group = group;
    this.visibility = visibility;
    this.visibilities = visibilities;
    this.providerScheme = providerScheme;
    this.sessionLocked = sessionLocked;
    this.accountUserName = accountUserName;
    this.noUserRoles = noUserRoles;
    this.status = status;

    this.displayName = UserInfo$v1.buildDisplayName(this);

    // Create given name if there is not one
    if (!this.givenName && !this.familyName) {
      this.givenName = this.accountUserName;
    }
  }

  /**
   * Returns true if the user has a given claim
   * @param capabilityId Capability Id that controls the claim
   * @param claim The claim to check
   */
  hasClaim?(capabilityId: string, claim: string): boolean {
    if (!this.capabilityClaims.has(capabilityId)) {
      return false;
    }

    const claimList = this.capabilityClaims.get(capabilityId);
    return claimList.some(c => c === claim);

  }

  /**
   * Builds display name based on the user info provided
   */
  private static buildDisplayName?(user: UserInfo$v1): string {
    if (user?.displayName) {
      return user?.displayName;
    }

    if (user?.familyName || user?.givenName) {
      if (user?.familyName && user?.givenName) {
        return `${user?.givenName} ${user?.familyName}`.trim();
      }

      if (user?.familyName) {
        return user.familyName.trim();
      }

      if (user?.givenName) {
        return user.givenName.trim();
      }
    }

    if (user?.accountUserName) {
      return user.accountUserName;
    }

    if (user?.email) {
      return user.email;
    }

    return user.id;
  }
}
