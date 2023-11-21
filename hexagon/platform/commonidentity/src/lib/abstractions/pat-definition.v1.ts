export enum LicenseImplementationType {
  unlicensed = 'Unlicensed',
  checkAvailability = 'CheckAvailability',
  checkout = 'Checkout',
}

export class PatDefinition$v1 {
  /** The unique ID of the pat definition */
  id?: string;

  /** Token use to translate the name of the pat */
  nameToken?: string;

  /** Token used to translate the description of the pat */
  descriptionToken?: string;

  /** The type of implementation for the licenses associated with this definition */
  licenseImplementation?: LicenseImplementationType;

  /** The license feature ID for this definition's set of claims */
  licenseFeatureId?: string;

  /** The claims associated with this definition */
  claims?: string[];

  /** The application ids associated with this definition */
  applicationIds?: string[];

  /** The required claims associated with this definition */
  requiredClaims?: string[];

  constructor(params: PatDefinition$v1 = {} as PatDefinition$v1) {
    const {
      id = null,
      nameToken = null,
      descriptionToken = null,
      licenseImplementation = null,
      licenseFeatureId = null,
      claims = [],
      applicationIds = [],
      requiredClaims = [],
    } = params;

    this.id = id;
    this.nameToken = nameToken;
    this.descriptionToken = descriptionToken;
    this.licenseImplementation = licenseImplementation;
    this.licenseFeatureId = licenseFeatureId;
    this.claims = claims;
    this.applicationIds = applicationIds;
    this.requiredClaims = requiredClaims;
  }
}
