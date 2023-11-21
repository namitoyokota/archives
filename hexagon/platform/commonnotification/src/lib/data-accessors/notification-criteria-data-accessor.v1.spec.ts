import { HTTPCode$v1, TokenManager$v1 } from '@galileo/platform_common-http';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { NotificationResponse$v1 } from '../abstractions/notification-criteria-response.v1';
import { NotificationCriteria$v1 } from '../abstractions/notification-criteria.v1';

import { NotificationCriteriaDataAccessor$v1 } from './notification-criteria-data-accessor.v1';

test('Get returns 404', async (t) => {
    // Arrange, Act
    const accessor = new NotificationCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                statusCode: HTTPCode$v1.NotFound
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .get$('capabilityId')
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.errors[0].statusCode, HTTPCode$v1.NotFound);
        });
});

test('Get returns criteria list', async (t) => {
    // Arrange, Act
    const accessor = new NotificationCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        etag: 'etag'
                    } as NotificationCriteria$v1
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .get$('capabilityId')
        .toPromise()
        .then(criteriaList => {
            t.is(criteriaList[0].etag, 'etag');
        })
        .catch(() => {
            t.fail();
        });
});

test('Update returns error', async (t) => {
    // Arrange, Act
    const accessor = new NotificationCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                statusCode: HTTPCode$v1.InternalServiceError
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .update$([])
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.errors[0].statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Update returns criteria list', async (t) => {
    // Arrange, Act
    const accessor = new NotificationCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.MultiStatus,
                result: [
                    {
                        payload: {
                            etag: 'etag'
                        } as NotificationCriteria$v1,
                        statusCode: 0
                    } as NotificationResponse$v1
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .update$([])
        .toPromise()
        .then(criteriaList => {
            t.is(criteriaList[0].etag, 'etag');
        })
        .catch(() => {
            t.fail();
        });
});