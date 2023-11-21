import { UserStatus$v1 } from './user-status.v1';

export interface User$v1 {
  /** The users id */
  id: string;

  /** The users username */
  userName: string;

  /** The username in uppercase */
  normalizedUserName: string;

  /** The users email */
  email: string;

  /** the email in uppercase */
  normalizedEmail: string;

  /** True if the the users email has been confirmed */
  emailConfirmed: boolean;

  /** The users phone number */
  phoneNumber: string;

  /** Represents if the users phone number has been confirmed */
  phoneNumberConfirmed: boolean;

  /** Represents if two factor authentication is enabled for the user  */
  twoFactorEnabled: boolean;

  /** The end time of the lockout */
  lockoutEnd: string;

  /** Represents if a lockout is currently enabled */
  lockoutEnabled: boolean;

  /** The number of failed access attempts */
  accessFailedCount: number;

  /** The users active tenant */
  activeTenant: string;

  /** The users current locale */
  locale: string;

  /** Map of user status (tenant Id is key, status is value)*/
  status?: Map<string, UserStatus$v1>;
}
