import test from 'ava';

import { UserPersonalization$v1 } from './user-personalization.v1';

test('Should have null properties', (t) => {
  // Arrange, Act
  const userPersonalization = new UserPersonalization$v1();

  // Assert
  t.truthy(userPersonalization.userId === null);
  t.truthy(userPersonalization.personalizationSettings === null);
  t.truthy(userPersonalization.capabilityKey === null);
});

test('Should have values', (t) => {
  // Arrange, Act
  const userPersonalization = new UserPersonalization$v1({
    userId: 'userId',
    personalizationSettings: 'settings',
    capabilityKey: 'id',
  } as UserPersonalization$v1);

  // Assert
  t.truthy(userPersonalization.userId);
  t.truthy(userPersonalization.personalizationSettings);
  t.truthy(userPersonalization.capabilityKey);
});
