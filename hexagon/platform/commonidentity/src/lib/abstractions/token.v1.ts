export class CommonClaim$v1 {
  /** Claim type */
  type?: string;

  /** Claim value */
  value?: string;

  constructor(params: CommonClaim$v1 = {} as CommonClaim$v1) {
    const { type = null, value = null } = params;

    this.type = type;
    this.value = value;
  }
}

export enum TokenStatus {
  valid = 'Valid',
  active = 'Active',
  expired = 'Expired',
  revoked = 'Revoked',
}

export class Token$v1 {
  /** The token's id */
  id?: string;

  /** The name of the token */
  name?: string;

  /** Date at which the token should expire */
  lifetime?: number;

  /** Claims to apply to the token */
  claims?: CommonClaim$v1[];

  /** Organization with which to associate the token */
  organization?: string;

  /** The last time the token was used */
  lastAccessed?: string;

  /** The status of the token */
  status?: TokenStatus;

  /** The ip of the user who generated the token */
  ip?: string;

  /** The creation time of the token */
  creationTime?: string;

  /** The browser of the user who generated the token */
  browser?: string;

  /** User agent with which this token's most recent access token was created */
  userAgent?: string;

  /** The expiration of the token */
  expiration?: string;

  /** List of pat def name tokens */
  patTypeNameTokens?: string[];

  /** List of pat definition ids that was used to create the token */
  patDefinitionIds?: string[];

  /** Flag to indicate the data is tombstoned or not */
  tombstoned?: boolean;

  constructor(params: Token$v1 = {} as Token$v1) {
    const {
      id = null,
      name = null,
      lifetime = null,
      claims = [],
      organization = null,
      lastAccessed = null,
      status = null,
      ip = null,
      creationTime = null,
      browser = null,
      userAgent = null,
      expiration = null,
      patTypeNameTokens = [],
      patDefinitionIds = [],
      tombstoned = null,
    } = params;

    this.id = id;
    this.name = name;
    this.lifetime = lifetime;
    this.claims = claims
      ? claims.map((claim) => new CommonClaim$v1(claim))
      : [];
    this.organization = organization;
    this.lastAccessed = lastAccessed;
    this.status = status;
    this.ip = ip;
    this.creationTime = creationTime;
    this.browser = browser;
    this.userAgent = userAgent;
    this.expiration = expiration;
    this.patTypeNameTokens = patTypeNameTokens;
    this.patDefinitionIds = patDefinitionIds;
    this.tombstoned = tombstoned;
  }
}
