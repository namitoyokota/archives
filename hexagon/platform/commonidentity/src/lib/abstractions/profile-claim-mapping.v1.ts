export class ProfileClaimMapping$v1 {
  /** The givenName equivalent field name for provider */
  givenName?: string;

  /** The familyName equivalent field name for provider */
  familyName?: string;

  /** The email equivalent field name for provider */
  email?: string;

  /** The displayName equivalent field name for provider */
  displayName?: string;

  /** The accountUserName equivalent field name for provider */
  accountUserName?: string;

  /** The profileImage equivalent field name for provider */
  profileImage?: string;

  /** The title equivalent field name for provider */
  title?: string;

  /** The phone equivalent field name for provider */
  phone?: string;

  /** The sub equivalent field name for provider */
  sub?: string;

  constructor(params: ProfileClaimMapping$v1 = {} as ProfileClaimMapping$v1) {
    const {
      givenName = '',
      familyName = '',
      email = '',
      displayName = '',
      accountUserName = '',
      profileImage = '',
      title = '',
      phone = '',
      sub = '',
    } = params;

    this.givenName = givenName;
    this.familyName = familyName;
    this.email = email;
    this.displayName = displayName;
    this.accountUserName = accountUserName;
    this.profileImage = profileImage;
    this.title = title;
    this.phone = phone;
    this.sub = sub;
  }
}
