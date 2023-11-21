import { Guid } from '@galileo/platform_common-libraries';
import test from 'ava';

import { CriteriaOperation$v1 } from './criteria-operation.v1';
import { CriteriaType$v1 } from './criteria-type.v1';
import { RestrictionGrouping$v1 } from './restriction-grouping.v1';
import { RestrictionLevels$v1 } from './restriction-levels.v1';
import { SharingCriteria$v1 } from './sharing-criteria.v1';

test('Sharing criteria should have null properties', (t) => {
    // Arrange, Act
    const criteria = new SharingCriteria$v1();

    // Assert
    t.is(criteria.etag, null);
    t.is(criteria.sharingCriteriaId, null);
    t.is(criteria.capabilityId, null);
    t.deepEqual(criteria.capabilityOperations, []);
    t.is(criteria.sharerTenantId, null);
    t.is(criteria.shareeTenantId, null);
    t.is(criteria.currentLevel, RestrictionLevels$v1.low);
    t.deepEqual(criteria.redactionOperations, []);
    t.deepEqual(criteria.filterOperations, []);
    t.is(criteria.groupId, null);
    t.is(criteria.criteriaType, null);
    t.not(criteria.referenceId, Guid.NewGuid());
});

test('Sharing criteria should have values', (t) => {
    // Arrange, Act
    const criteria = new SharingCriteria$v1({
        etag: 'etag',
        sharingCriteriaId: 'sharingCriteriaId',
        capabilityId: 'capabilityId',
        capabilityOperations: [new CriteriaOperation$v1()],
        sharerTenantId: 'sharerTenantId',
        shareeTenantId: 'shareeTenantId',
        currentLevel: RestrictionLevels$v1.high,
        redactionOperations: [new RestrictionGrouping$v1()],
        filterOperations: [new RestrictionGrouping$v1()],
        groupId: 'groupId',
        criteriaType: CriteriaType$v1.internalGroupGlobal
    });

    // Assert
    t.is(criteria.etag, 'etag');
    t.is(criteria.sharingCriteriaId, 'sharingCriteriaId');
    t.is(criteria.capabilityId, 'capabilityId');
    t.deepEqual(criteria.capabilityOperations, [new CriteriaOperation$v1()]);
    t.is(criteria.sharerTenantId, 'sharerTenantId');
    t.is(criteria.shareeTenantId, 'shareeTenantId');
    t.is(criteria.currentLevel, RestrictionLevels$v1.high);
    t.deepEqual(criteria.redactionOperations, [new RestrictionGrouping$v1()]);
    t.deepEqual(criteria.filterOperations, [new RestrictionGrouping$v1()]);
    t.is(criteria.groupId, 'groupId');
    t.is(criteria.criteriaType, CriteriaType$v1.internalGroupGlobal);
    t.not(criteria.referenceId, Guid.NewGuid());
});
