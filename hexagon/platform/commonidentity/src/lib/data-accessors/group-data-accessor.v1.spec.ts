/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenManager$v1 } from '@galileo/platform_common-http';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { Group$v1 } from '../abstractions/group.v1';

import { GroupDataAccessor$v1 } from './group-data-accessor.v1';

test('Get should return an empty list on 404', async (t) => {
  // Arrange
  const accessor = new GroupDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.error({
        status: 404,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .get$()
    .toPromise()
    .then((list) => {
      t.deepEqual(list, []);
    })
    .catch(() => {
      t.fail();
    });
});

test('Get should return an list ', async (t) => {
  // Arrange
  const accessor = new GroupDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        result: [
          {
            id: '72a8f6fe-caca-4a90-8a5e-23fd29d5c44d',
            name: 'test',
            tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
            description: 'test',
            groupIconUrl: null,
            priorityIndex: 1,
            visibility: 'Internal',
            timeline: { changeRecords: {} },
            tombstoned: false,
            tombstonedTime: '0001-01-01T00:00:00.0000000+00:00',
          },
          {
            id: '2E710735-F13B-43C9-8F3B-AF8B4F36CA72',
            name: 'Group1',
            tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
            description: 'Test group for Hexagon tenant',
            groupIconUrl:
              'https://galileolocalcommonstore.blob.core.windows.net/public-jleshko/groupIcons/1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a/2E710735-F13B-43C9-8F3B-AF8B4F36CA72',
            priorityIndex: 0,
            visibility: 'Internal',
            timeline: { changeRecords: {} },
            tombstoned: false,
            tombstonedTime: '0001-01-01T00:00:00.0000000+00:00',
          },
        ],
        messages: [''],
        statusCode: 200,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .get$(['id', 'id2'], true)
    .toPromise()
    .then((list) => {
      t.is(list.length, 2);
    })
    .catch(() => {
      t.fail();
    });
});

test('Get should throw error', async (t) => {
  // Arrange
  const accessor = new GroupDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 500,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .get$()
    .toPromise()
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.is(err.errors[0].message, 'Unexpected response - 500');
    });
});

test('Update single should return single item', async (t) => {
  // Arrange
  const accessor = new GroupDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
        result: [new Group$v1()],
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .update$(new Group$v1())
    .toPromise()
    .then((g) => {
      t.truthy(!Array.isArray(g));
    })
    .catch(() => {
      t.fail();
    });
});

test('Update array should return array', async (t) => {
  // Arrange
  const accessor = new GroupDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
        result: [new Group$v1(), new Group$v1()],
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .update$([new Group$v1(), new Group$v1()])
    .toPromise()
    .then((g: []) => {
      t.is(g.length, 2);
    })
    .catch(() => {
      t.fail();
    });
});
