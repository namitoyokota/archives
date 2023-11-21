export class Role$v1 {
  /** The id */
  id?: string;

  /** The name of the role */
  name?: string;

  /** The name of the role in all caps */
  normalizedName?: string;

  /** The localization token for the name of the role */
  nameToken?: string;

  /** The role's category */
  category?: string;

  /** The localization token for the category name */
  categoryToken?: string;

  /** The localization token for the description */
  descriptionToken?: string;

  /** Id of the application this role is for */
  applicationId?: string;

  /** Flag that is true if role is admin level */
  isAdminLevel?: boolean;

  /** Flag that is true if role is provider level */
  isProviderLevel?: boolean;

  /** List of detail ids that describes this role */
  details?: string[];

  constructor(params: Role$v1 = {} as Role$v1) {
    const {
      id = null,
      name = null,
      normalizedName = null,
      nameToken = null,
      category = null,
      categoryToken = null,
      descriptionToken = null,
      applicationId = null,
      isAdminLevel = false,
      isProviderLevel = false,
      details = [],
    } = params;

    this.id = id;
    this.name = name;
    this.normalizedName = normalizedName;
    this.nameToken = nameToken;
    this.category = category;
    this.categoryToken = categoryToken;
    this.descriptionToken = descriptionToken;
    this.applicationId = applicationId;
    this.isAdminLevel = isAdminLevel;
    this.isProviderLevel = isProviderLevel;
    this.details = details;
  }
}
