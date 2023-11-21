/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenManager$v1 } from '@galileo/platform_common-http';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { PersonalizationDataAccessor$v1 } from './personalization-data-accessor.v1';

test('Get should return null', async (t) => {
  // Arrange
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1,
    'url'
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
        result: {},
      });
      subscriber.complete();
    })
  );

  //Act
  const result = await accessor.get$('userid', 'key').toPromise();

  // Assert
  t.truthy(result === null);
});

test('Get should return a single setting', async (t) => {
  // Arrange
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
        result: {
          userId: 'userId',
          capabilityKey: 'key',
          personalizationSettings: 'setting',
        },
      });
      subscriber.complete();
    })
  );

  //Act
  const result = await accessor.get$('userid', 'key').toPromise();

  // Assert
  t.truthy(!Array.isArray(result));

  if (!Array.isArray(result)) {
    t.is(result.userId, 'userId');
    t.is(result.capabilityKey, 'key');
    t.is(result.personalizationSettings, 'setting');
  }
});

test('Get should return a list of settings', async (t) => {
  // Arrange
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
        result: [
          {
            userId: 'userId',
            capabilityKey: 'key',
            personalizationSettings: 'setting',
          },
        ],
      });
      subscriber.complete();
    })
  );

  //Act
  const result = await accessor.get$('userid', 'key').toPromise();

  // Assert
  t.truthy(Array.isArray(result));

  if (Array.isArray(result)) {
    t.is(result[0].userId, 'userId');
    t.is(result[0].capabilityKey, 'key');
    t.is(result[0].personalizationSettings, 'setting');
  }
});

test('Get should throw error when status code is not expected', async (t) => {
  // Arrange
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 500,
      });

      subscriber.complete();
    })
  );

  //Act
  accessor
    .get$(null)
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
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.error({
        status: 500,
      });

      subscriber.complete();
    })
  );

  //Act
  accessor
    .get$(null)
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
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.get = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.error({
        status: 404,
      });
      subscriber.complete();
    })
  );

  //Act
  accessor
    .get$(null)
    .toPromise()
    .then((data) => {
      t.is(data, null);
    })
    .catch(() => {
      t.fail();
    });
});

test('Upsert should not fail', async (t) => {
  // Arrange
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
      });

      subscriber.complete();
    })
  );

  //Act
  await accessor.upsert$(null).toPromise();

  t.pass();
});

test('Upsert should throw error', async (t) => {
  // Arrange
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.put = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 500,
      });

      subscriber.complete();
    })
  );

  //Act
  accessor
    .upsert$(null)
    .toPromise()
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.is(err.errors[0].message, 'Unexpected response - 500');
    });
});

test('Delete should not fail', async (t) => {
  // Arrange
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.delete = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 200,
      });

      subscriber.complete();
    })
  );

  //Act
  await accessor.delete$('userId', 'key').toPromise();

  t.pass();
});

test('Delete should throw error', async (t) => {
  // Arrange
  const accessor = new PersonalizationDataAccessor$v1(
    {} as any as TokenManager$v1
  );
  (accessor as any).http.delete = sinon.stub().returns(
    new Observable((subscriber) => {
      subscriber.next({
        statusCode: 500,
      });

      subscriber.complete();
    })
  );

  //Act
  accessor
    .delete$(null)
    .toPromise()
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.is(err.errors[0].message, 'Unexpected response - 500');
    });
});
