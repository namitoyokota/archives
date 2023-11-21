export class DescriptorList$v1 {
  /** Entity id */
  id?: string;

  /** Id of tenant */
  tenantId?: string;

  /** System correlation id used to get items out of the cache */
  systemCorrelationId?: string;

  constructor(params: DescriptorList$v1 = {} as DescriptorList$v1) {
    const { id = null, tenantId = null, systemCorrelationId = null } = params;

    this.id = id;
    this.tenantId = tenantId;
    this.systemCorrelationId = systemCorrelationId;
  }
}

/**
 * A request to get get entities by descriptor
 */
export interface DescriptorRequest$v1 {
  /** List of descriptors */
  descriptors: DescriptorList$v1[];

  /** How big a page of data should be */
  pageSize: number;

  /** Pick up reading data from a set point */
  continuationToken: string;
}
