import { Scope$v1 } from './scope.v1';

export class FeatureFlag$v2 {

  /** Identifier for a feature flag */
  flagId?: string;

  /** Translation token for a short feature flag name */
  friendlyName?: string;

  /** Translation token that describes the feature flag */
  descriptionToken?: string;

  /** When the feature flag was created */
  createdTime?: Date;

  /** The ID of the capability that defines this flag */
  capabilityId?: string;

  /** A value indicating when the flag was last changed */
  lastModifiedTime?: Date;

  /** A value to indicate the level in which the flag can be edited */
  scope?: Scope$v1;

  constructor(params: FeatureFlag$v2 = {} as FeatureFlag$v2) {
    const {
      flagId = null,
      friendlyName = null,
      descriptionToken = null,
      createdTime = null,
      capabilityId = null,
      lastModifiedTime = null,
      scope = null
    } = params;

    this.flagId = flagId;
    this.friendlyName = friendlyName;
    this.descriptionToken = descriptionToken;
    this.createdTime = createdTime;
    this.capabilityId = capabilityId;
    this.lastModifiedTime = lastModifiedTime;
    this.scope = scope;
  }
}
