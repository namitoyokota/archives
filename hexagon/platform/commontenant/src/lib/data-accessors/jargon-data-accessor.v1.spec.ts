import { HTTPCode$v1, TokenManager$v1 } from '@galileo/platform_common-http';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { Tenant$v1 } from '../abstractions/tenant.v1';

import { JargonDataAccessor$v1 } from './jargon-data-accessor.v1';

test('Update returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new JargonDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.patch = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.NotFound
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .update$(null)
        .toPromise()
        .then((tenant) => {
            t.is(tenant, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Update returns tenant', async (t) => {
    // Arrange, Act
    const accessor = new JargonDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.patch = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    id: 'id'
                } as Tenant$v1
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .update$(null)
        .toPromise()
        .then(tenant => {
            t.is(tenant.id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});
