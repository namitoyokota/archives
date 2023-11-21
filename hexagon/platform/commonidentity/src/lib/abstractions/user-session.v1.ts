import { UserInfo$v1 } from './user-info.v1';

export class UserSession$v1 {
  /** The refresh token */
  id: string;

  /** The position in the display table */
  position: number;

  /** The display name of the user */
  displayName: string;

  /** The creation time of the user session */
  creationTime: string;

  /** The browser the user is using */
  browser: string;

  /** The users ip */
  ip: string;

  /** The users region */
  region: string;

  /** Flag to indicate that data is tombstoned */
  tombstoned: boolean;

  /** UserInfo class*/
  userInfo?: UserInfo$v1;

  constructor(params: UserSession$v1 = {} as UserSession$v1) {
    const {
      id = null,
      position = null,
      displayName = null,
      creationTime = null,
      browser = null,
      ip = null,
      region = null,
      tombstoned = null,
      userInfo = new UserInfo$v1(),
    } = params;

    this.id = id;
    this.position = position;
    this.displayName = displayName;
    this.creationTime = creationTime;
    this.browser = browser;
    this.ip = ip;
    this.region = region;
    this.tombstoned = tombstoned;
    this.userInfo = userInfo;
  }
}
