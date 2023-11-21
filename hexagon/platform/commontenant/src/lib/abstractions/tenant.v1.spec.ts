import { ServerEntity$v1 } from '@galileo/platform_commonlicensing';
import test from 'ava';

import { CriteriaType$v1 } from './criteria-type.v1';
import { MapData$v1 } from './map-data.v1';
import { Tenant$v1 } from './tenant.v1';

test('Tenant should have null properties', (t) => {
    // Arrange, Act
    const tenant = new Tenant$v1();

    // Assert
    t.is(tenant.id, null);
    t.is(tenant.culture, null);
    t.is(tenant.enabled, false);
    t.is(tenant.enableJargon, false);
    t.is(tenant.name, null);
    t.is(tenant.abbreviation, null);
    t.is(tenant.city, null);
    t.is(tenant.state, null);
    t.is(tenant.country, null);
    t.is(tenant.tenantIconUrl, null);
    t.is(tenant.optInAsSharee, false);
    t.deepEqual(tenant.industryIds, []);
    t.deepEqual(tenant.mapData, new MapData$v1());
    t.is(tenant.etag, null);
    t.is(tenant.contactAddress, null);
    t.is(tenant.newIconFile, null);
    t.is(tenant.licenseData, null);
    t.deepEqual(tenant.applicationIds, []);
    t.deepEqual(tenant.onboardingConfiguredSteps, []);
    t.is(tenant.invitationAccepted, false);
    t.is(tenant.dataSharingGroup, null);
    t.is(tenant.enforceRateLimiting, false);
    t.is(tenant.optIntoGroupDataSharing, false);
    t.deepEqual(tenant.dataSharingNetworks, []);
    t.deepEqual(tenant.configuredDataSharingTypes, {} as Record<CriteriaType$v1, string[]>);
});

test('Tenant should have values', (t) => {
    // Arrange, Act
    const tenant = new Tenant$v1({
        id: 'id',
        culture: 'culture',
        enabled: true,
        enableJargon: true,
        name: 'name',
        abbreviation: 'abbreviation',
        city: 'city',
        state: 'state',
        country: 'country',
        tenantIconUrl: 'tenantIconUrl',
        optInAsSharee: true,
        industryIds: ['industryId'],
        mapData: new MapData$v1(),
        etag: 'etag',
        contactAddress: 'contactAddress',
        newIconFile: null,
        licenseData: new ServerEntity$v1(),
        applicationIds: ['applicationId'],
        onboardingConfiguredSteps: ['onboardingConfiguredStep'],
        invitationAccepted: true,
        dataSharingGroup: 'dataSharingGroup',
        enforceRateLimiting: true,
        optIntoGroupDataSharing: true,
        dataSharingNetworks: ['dataSharingNetwork'],
        configuredDataSharingTypes: {
            ExternalTenantGlobal: ['capability']
        } as Record<CriteriaType$v1, string[]>
    });

    // Assert
    t.is(tenant.id, 'id');
    t.is(tenant.culture, 'culture');
    t.is(tenant.enabled, true);
    t.is(tenant.enableJargon, true);
    t.is(tenant.name, 'name');
    t.is(tenant.abbreviation, 'abbreviation');
    t.is(tenant.city, 'city');
    t.is(tenant.state, 'state');
    t.is(tenant.country, 'country');
    t.is(tenant.tenantIconUrl, 'tenantIconUrl');
    t.is(tenant.optInAsSharee, true);
    t.deepEqual(tenant.industryIds, ['industryId']);
    t.deepEqual(tenant.mapData, new MapData$v1());
    t.is(tenant.etag, 'etag');
    t.is(tenant.contactAddress, 'contactAddress');
    t.is(tenant.newIconFile, null);
    t.deepEqual(tenant.licenseData, new ServerEntity$v1());
    t.deepEqual(tenant.applicationIds, ['applicationId']);
    t.deepEqual(tenant.onboardingConfiguredSteps, ['onboardingConfiguredStep']);
    t.is(tenant.invitationAccepted, true);
    t.is(tenant.dataSharingGroup, 'dataSharingGroup');
    t.is(tenant.enforceRateLimiting, true);
    t.is(tenant.optIntoGroupDataSharing, true);
    t.deepEqual(tenant.dataSharingNetworks, ['dataSharingNetwork']);
    t.deepEqual(tenant.configuredDataSharingTypes, {
        ExternalTenantGlobal: ['capability'],
    } as Record<CriteriaType$v1, string[]>);
});
