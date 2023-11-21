import test from 'ava';

import { Group$v1 } from './group.v1';
import { GroupVisibility$v1 } from './visibility.v1';

test('Group should have null properties', (t) => {
  // Arrange, Act
  const group = new Group$v1();

  // Assert
  t.is(group.id, null);
  t.is(group.name, null);
  t.is(group.tenantId, null);
  t.is(group.description, null);
  t.is(group.groupIconUrl, null);
  t.is(group.priorityIndex, null);
  t.is(group.visibility, GroupVisibility$v1.internal);
  t.is(group.tombstoned, false);
});

test('Group should have values', (t) => {
  // Arrange, Act
  const group = new Group$v1({
    id: 'id',
    name: 'name',
    tenantId: 'tenantId',
    description: 'description',
    groupIconUrl: 'url',
    priorityIndex: 3,
    visibility: GroupVisibility$v1.private,
    tombstoned: true,
  } as Group$v1);

  // Assert
  t.is(group.id, 'id');
  t.is(group.name, 'name');
  t.is(group.tenantId, 'tenantId');
  t.is(group.description, 'description');
  t.is(group.groupIconUrl, 'url');
  t.is(group.priorityIndex, 3);
  t.is(group.visibility, GroupVisibility$v1.private);
  t.is(group.tombstoned, true);
});
