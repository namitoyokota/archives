/**
 * Personalization settings for a user
 */
export class UserPersonalization$v1 {
  /** The users id */
  userId?: string;

  /** The key to the capability */
  capabilityKey?: string;

  /** The users personalization settings */
  personalizationSettings?: string;

  constructor(params: UserPersonalization$v1 = {} as UserPersonalization$v1) {
    const {
      userId = null,
      capabilityKey = null,
      personalizationSettings = null,
    } = params;

    this.userId = userId;
    this.capabilityKey = capabilityKey;
    this.personalizationSettings = personalizationSettings;
  }
}
