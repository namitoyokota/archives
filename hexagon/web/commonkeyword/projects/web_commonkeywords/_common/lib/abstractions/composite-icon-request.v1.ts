import { CompositeIcon$v1 } from './composite-icon.v1';

export class CompositeIconRequest$v1 {

  /** The collection of keywords to be requested */
  keywords?: string[];

  /** Id of the tenant owns the requested icon data */
  tenantId?: string;

  /** The industry to which which the icons belong */
  industryId?: string;

  /** CapabilityId associated with the icons */
  capabilityId?: string;

  /** Composite Icons retrieved */
  icon?: CompositeIcon$v1;

  constructor(params: CompositeIconRequest$v1 = {} as CompositeIconRequest$v1) {
    const {
      keywords = [],
      tenantId = null,
      industryId = null,
      capabilityId = null,
      icon = null
    } = params;

    this.keywords = keywords;
    this.tenantId = tenantId;
    this.industryId = industryId;
    this.capabilityId = capabilityId;

    if (icon) {
      this.icon = new CompositeIcon$v1(icon);
    } else {
      this.icon = icon;
    }
  }
}
