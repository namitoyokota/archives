import { UserStatus$v1 } from './user-status.v1';
import { UserVisibility$v1 } from './visibility.v1';

/**
 * User data as it comes from identity server.
 * THIS INTERFACE SHOULD NOT BE USED OUTSIDE THE USER DATA ACCESSOR
 */
export interface RawUser$v1 {
  /** Id of user */
  id: string;

  /** Visibility settings */
  visibilities: Record<string, UserVisibility$v1>;

  /** The visibility of the user */
  visibility: UserVisibility$v1;

  /** List of groups the user is part of */
  groups: string[];

  /** Flag to indicate that no rules exist for the user */
  noUserRoles: boolean;

  /** User's status */
  status: Record<string, UserStatus$v1>;

  /** The tenant the user is active in */
  activeTenant: string;

  /** Well known claims */
  claims: {
    /** User display name */
    display_name: string;

    /** User's give name */
    given_name: string;

    /** Email address */
    email: string;

    /** Phone number */
    phone: string;

    /** Job title */
    title: string;

    /** List of tenant id the user is part of */
    tenantId: string[];

    /** Display image url */
    picture: string;

    /** User's family name */
    family_name: string;

    /** User's account user name */
    accountUserName: string;
  };
}
