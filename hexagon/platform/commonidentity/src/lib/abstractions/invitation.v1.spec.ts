import test from 'ava';

import { Invitation$v1 } from './invitation.v1';

test('Should have null properties', (t) => {
  // Arrange, Act
  const invitation = new Invitation$v1();

  // Assert
  t.truthy(invitation.id === null);
  t.truthy(invitation.userId === null);
  t.truthy(invitation.userName === null);
  t.truthy(invitation.email === null);
  t.truthy(invitation.tenantId === null);
  t.truthy(JSON.stringify(invitation.roles) === '{}');
  t.truthy(invitation.creationTime === null);
  t.truthy(invitation.expiration === null);
});

test('Expiration should be null', (t) => {
  // Arrange
  const testDate = new Date('9999-12-31T23:59:59.9999999+00:00');

  // Act
  const invitation = new Invitation$v1({ expiration: testDate });

  // Assert
  t.truthy(invitation.expiration === null);
});

test('Expiration should not be null', (t) => {
  // Arrange
  const testDate = new Date('2021-12-08T14:43:42.6094827+00:00');

  // Act
  const invitation = new Invitation$v1({ expiration: testDate });

  // Assert
  t.truthy(invitation.expiration);
});

test('Role date should be null', (t) => {
  // Arrange
  const testDate = new Date('9999-12-31T23:59:59.9999999+00:00');
  const role = {
    'liveShare:Operator': testDate,
  };

  // Act
  const invitation = new Invitation$v1({ roles: role });

  // Assert
  t.truthy(invitation.roles['liveShare:Operator'] === null);
});

test('Role date should not be null', (t) => {
  // Arrange
  const testDate = new Date('2021-12-08T14:43:42.6094827+00:00');
  const role = {
    'liveShare:Operator': testDate,
  };

  // Act
  const invitation = new Invitation$v1({ roles: role });

  // Assert
  t.truthy(invitation.roles['liveShare:Operator']);
});
