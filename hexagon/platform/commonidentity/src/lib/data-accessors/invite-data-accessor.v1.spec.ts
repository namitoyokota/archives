/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenManager$v1 } from '@galileo/platform_common-http';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { Invitation$v1 } from '../abstractions/invitation.v1';

import { InviteDataAccessor$v1 } from './invite-data-accessor.v1';

test('Get should return empty list', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
        result: {
          page: [],
          continuationToken: null,
        },
      });

      subscriber.complete();
    })
  );

  // Act
  const result = await accessor.get$().toPromise();

  // Assert
  t.deepEqual(result, []);
});

test('Get should return items', async (t) => {
  // Arrange
  let token = 'abc';
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      const hasToken = !!token;
      token = null;

      subscriber.next({
        statusCode: 200,
        result: {
          page: [
            {
              id: 'abc',
            } as Invitation$v1,
          ],
          continuationToken: hasToken ? 'token' : null,
        },
      });
      subscriber.complete();
    })
  );

  // Act
  const result = await accessor.get$().toPromise();

  // Assert
  t.is(result.length, 2);
  t.is(result[0].id, 'abc');
});

test('Get should throw error when status code is not expected', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
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

test('Get should throw error when rest call fails', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        status: 500,
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
    .catch(() => {
      t.pass();
    });
});

test('Get should return null on not found', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
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
    .then((result) => {
      t.deepEqual(result, []);
    })
    .catch(() => {
      t.fail();
    });
});

test('Create should create', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .create$([])
    .toPromise()
    .then(() => {
      t.pass();
    })
    .catch(() => {
      t.fail();
    });
});

test('Create should throw error when status code is not expected', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 500,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .create$([])
    .toPromise()
    .then(() => {
      t.fail();
    })
    .catch(() => {
      t.pass();
    });
});

test('Create should throw error when rest call fails', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.error({
        status: 500,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .create$([])
    .toPromise()
    .then(() => {
      t.fail();
    })
    .catch(() => {
      t.pass();
    });
});

test('Delete should not fail', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.delete = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 207,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .delete$(['id'])
    .toPromise()
    .then(() => {
      t.pass();
    })
    .catch(() => {
      t.fail();
    });
});

test('Delete should throw error', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.delete = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 500,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .delete$(['id'])
    .toPromise()
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.is(err.errors[0].message, 'Unexpected response - 500');
    });
});

test('Create admin should create', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .createAdmin$('abc')
    .toPromise()
    .then(() => {
      t.pass();
    })
    .catch(() => {
      t.fail();
    });
});

test('Create admin should throw error when status code is not expected', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 500,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .createAdmin$('id')
    .toPromise()
    .then(() => {
      t.fail();
    })
    .catch(() => {
      t.pass();
    });
});

test('Create admin should throw error when rest call fails', async (t) => {
  // Arrange
  const accessor = new InviteDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.error({
        status: 500,
      });

      subscriber.complete();
    })
  );

  // Act
  await accessor
    .createAdmin$('id')
    .toPromise()
    .then(() => {
      t.fail();
    })
    .catch(() => {
      t.pass();
    });
});
