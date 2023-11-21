import { ServerEntity$v1 } from '@galileo/platform_commonlicensing';

import { CriteriaType$v1 } from './criteria-type.v1';
import { MapData$v1 } from './map-data.v1';

/**
 * Represents a Tenant
 */
export class Tenant$v1 {
    /** Handles concurrency */
    etag: string;

    /**  ID of the tenant (i.e. the tenant id claim) */
    id: string;

    /** The default culture of the tenant. */
    culture?: string;

    /** Indicating whether the tenant is enabled */
    enabled?: boolean;

    /** Indicating whether the tenant has the use of jargon (for localization) enabled */
    enableJargon: boolean;

    /** The tenant's name */
    name: string;

    /** 4 letter long abbreviation of the tenant name */
    abbreviation: string;

    /** The city where the tenant is located. */
    city?: string;

    /** The state where the tenant is located. */
    state?: string;

    /** The country where the tenant is located. */
    country?: string;

    /** The icon used to represent a tenant */
    tenantIconUrl?: string;

    /** A value indicating whether the tenant appears in the list of tenants that can be shared with */
    optInAsSharee?: boolean;

    /** A flag that is true when the tenant has opted into group based data sharing */
    optIntoGroupDataSharing?: boolean;

    /** String array containing industry IDs associated with the tenant. */
    industryIds: string[];

    /** Associated map data with central location of tenant. */
    mapData?: MapData$v1;

    /** The e-mail address of the point-of-contact (a customer's site admin) for the tenant */
    contactAddress?: string;

    /** Icon file that has not yet been save */
    newIconFile?: File;

    /** License data associated with the tenant */
    licenseData?: ServerEntity$v1;

    /** A list of applications to which the tenant has access to */
    applicationIds?: string[];

    /** List of onboarding steps that have been completed */
    onboardingConfiguredSteps?: string[];

    /** A flag that is true if the tenant has accepted the invitation */
    invitationAccepted?: boolean;

    /** Name of data sharing group. */
    dataSharingGroup?: string;

    /** The networks of tenants this tenant is allowed to participate in. */
    dataSharingNetworks?: string[];

    /** Whether or not to enforce rate limiting. */
    enforceRateLimiting?: boolean;

    /** List of capability ids that have been enabled for data sharing */
    configuredDataSharingTypes?: Record<CriteriaType$v1, string[]>;

    constructor(params: Tenant$v1 = {} as Tenant$v1) {
        const {
            id = null,
            culture = null,
            enabled = false,
            enableJargon = false,
            name = null,
            abbreviation = null,
            city = null,
            state = null,
            country = null,
            tenantIconUrl = null,
            optInAsSharee = false,
            industryIds = [],
            mapData = new MapData$v1(),
            etag = null,
            contactAddress = null,
            newIconFile = null,
            licenseData = null,
            applicationIds = [],
            onboardingConfiguredSteps = [],
            invitationAccepted = false,
            dataSharingGroup = null,
            enforceRateLimiting = false,
            optIntoGroupDataSharing = false,
            dataSharingNetworks = [],
            configuredDataSharingTypes = {} as Record<CriteriaType$v1, string[]>
        } = params;

        this.id = id;
        this.culture = culture;
        this.enabled = enabled;
        this.enableJargon = enableJargon;
        this.name = name;
        this.abbreviation = abbreviation;
        this.city = city;
        this.state = state;
        this.country = country;
        this.tenantIconUrl = tenantIconUrl;
        this.optInAsSharee = optInAsSharee;
        this.industryIds = industryIds;
        this.mapData = new MapData$v1(mapData);
        this.etag = etag;
        this.contactAddress = contactAddress;
        this.newIconFile = newIconFile;
        this.licenseData = licenseData;
        this.applicationIds = applicationIds ? applicationIds : [];
        this.onboardingConfiguredSteps = onboardingConfiguredSteps;
        this.invitationAccepted = invitationAccepted;
        this.dataSharingGroup = dataSharingGroup;
        this.enforceRateLimiting = enforceRateLimiting;
        this.optIntoGroupDataSharing = optIntoGroupDataSharing;
        this.dataSharingNetworks = dataSharingNetworks;

        this.configuredDataSharingTypes = {} as Record<CriteriaType$v1, string[]>;
        for (const key in configuredDataSharingTypes) {
            this.configuredDataSharingTypes[key] = configuredDataSharingTypes[key]
        }
    }
}
