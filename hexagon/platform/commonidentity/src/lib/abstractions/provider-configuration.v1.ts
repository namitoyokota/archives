import { ProfileClaimMapping$v1 } from './profile-claim-mapping.v1';

export class ProviderConfiguration$v1 {
  /** The id of the provider. */
  id: string;

  /** The client id of the provider. */
  clientId: string;

  /** The client secret of the provider. */
  clientSecret: string;

  /** The name of the provider. */
  name: string;

  /** The URL of the API endpoint that will process the authentication response from the identity provider. */
  callbackUrl?: string;

  /** The URL of the user provided icon. */
  iconUrl?: string;

  /** The URL that directs to the endpoint intended to discovery provider metadata. */
  discoveryUrl: string;

  /** Flag that will cause a login prompt to access the product. */
  enablePromptLogin?: boolean;

  /** Flag that will indicate whether to enable maxAge=0 for this configuration. */
  enableMaxAgeZero?: boolean;

  /** The profile claims that may need to be mapped to our claims. */
  profileClaimMapping: ProfileClaimMapping$v1;

  /** The scope(s) for the provider claims. */
  scopes?: string[];

  /** The expected response type of the provider. */
  responseType?: string;

  /** The URL for the issuing authority for the provider. */
  issuerUrl: string;

  /** The URL(s) that direct to the endpoints intended to collect userInfo. */
  userInfoUrls: string[];

  /** Flag that will cause the discovery endpoint to be ignored and the userInfoUrl to be used. */
  overrideDiscoveryUrl?: boolean;

  /** Flag that will be true if provider is the primary way to authenticate for a tenant. */
  primaryProvider?: boolean;

  /** Flag that is used to enable or disable the "ValidateIssuer" token validation parameter on OIDC configuration. */
  validateIssuer?: boolean;

  /** Icon file that has not yet been saved (used in the browser only) */
  newIconFile?: File;

  constructor(
    params: ProviderConfiguration$v1 = {} as ProviderConfiguration$v1
  ) {
    const {
      id = null,
      clientId = null,
      clientSecret = null,
      name = null,
      discoveryUrl = null,
      callbackUrl = null,
      userInfoUrls = [],
      issuerUrl = null,
      iconUrl = null,
      enablePromptLogin = true,
      enableMaxAgeZero = true,
      validateIssuer = true,
      overrideDiscoveryUrl = false,
      primaryProvider = false,
      responseType = null,
      scopes = [],
      newIconFile = null,
      profileClaimMapping = new ProfileClaimMapping$v1(),
    } = params;

    this.id = id;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.name = name;
    this.discoveryUrl = discoveryUrl;
    this.callbackUrl = callbackUrl;
    this.userInfoUrls = userInfoUrls ?? [];
    this.issuerUrl = issuerUrl ?? '';
    this.iconUrl = iconUrl;
    this.enablePromptLogin = enablePromptLogin;
    this.enableMaxAgeZero = enableMaxAgeZero;
    this.validateIssuer = validateIssuer;
    this.overrideDiscoveryUrl = overrideDiscoveryUrl;
    this.primaryProvider = primaryProvider;
    this.responseType = responseType;
    this.scopes = scopes;
    this.newIconFile = newIconFile;
    this.profileClaimMapping = new ProfileClaimMapping$v1(profileClaimMapping);
  }

  /**
   * Returns true if the URL is valid
   * @param url: string
   */
  validateUrl(url: string): boolean {
    const urlRegex = new RegExp(
      // eslint-disable-next-line no-useless-escape
      /https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    );
    return urlRegex.test(url);
  }

  /**
   * Returns true if discoveryUrl URL is valid
   */
  validateDiscoveryUrl(): boolean {
    return (
      !!this.discoveryUrl &&
      this.discoveryUrl.toLowerCase().indexOf('.well-known') > -1 &&
      this.validateUrl(this.discoveryUrl)
    );
  }

  /**
   * Returns true if the issuerUrl is present and a proper URL
   */
  validateIssuerUrl(): boolean {
    if (this.overrideDiscoveryUrl) {
      return !!this.issuerUrl && this.validateUrl(this.issuerUrl);
    }
    return true;
  }

  /**
   * Returns true if the userInfoUrls are present and have proper URLs
   */
  validateUserInfoUrls(): boolean {
    let valid = true;
    if (this.overrideDiscoveryUrl) {
      if (!this.userInfoUrls || this.userInfoUrls.length === 0) {
        valid = false;
      }
      this.userInfoUrls.forEach((url) => {
        if (!this.validateUrl(url)) {
          valid = false;
        }
      });
    }
    return valid;
  }

  /**
   * Returns true if provider is valid
   */
  isValid(): boolean {
    return (
      !!this.name &&
      !!this.clientId &&
      !!this.clientSecret &&
      this.validateDiscoveryUrl() &&
      this.validateIssuerUrl() &&
      this.validateUserInfoUrls()
    );
  }
}
