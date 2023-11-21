/**
 * The different types a sharing criteria can be.
 * The type is for being able to quickly determine the type of the criteria. The internal data
 * of the criteria should still match the criteria type requirements.
 */
export enum CriteriaType$v1 {
    externalTenantGlobal = 'ExternalTenantGlobal', // sharerTenantId === shareeTenantId && !groupId
    internalGroupGlobal = 'InternalGroupGlobal', // sharerTenantId === shareeTenantId === groupId
    externalTenantOverride = 'ExternalTenantOverride', // sharerTenantId !== shareeTenantId && !groupId
    internalGroupOverride = 'InternalGroupOverride'    // sharerTenantId === shareeTenantId && groupId && groupId !== sharerTenantId
}
