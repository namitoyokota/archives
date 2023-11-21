import { HTTPCode$v1, PageResponse$v1, TokenManager$v1 } from '@galileo/platform_common-http';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { CapabilityManifest$v1 } from '../abstractions/capability-manifest.v1';
import { Changelog$v1 } from '../abstractions/changelog.v1';
import { OptInResponse$v1 } from '../abstractions/opt-in-response.v1';

import { DataSharingDataAccessor$v1 } from './data-sharing-data-accessor.v1';

test('Get sharees returns empty on 404', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.NotFound
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getSharees$()
        .toPromise()
        .then((tenantList) => {
            t.is(tenantList.length, 0);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get sharees returns error', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.InternalServiceError
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getSharees$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get sharees return tenant list', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        shareeTenantId: 'id'
                    } as OptInResponse$v1
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getSharees$()
        .toPromise()
        .then(tenantList => {
            t.is(tenantList[0].id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get capability manifest returns empty on 404', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.NotFound
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getCapabilityManifests$()
        .toPromise()
        .then((capabilityList) => {
            t.is(capabilityList.length, 0);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get capability manifest returns error', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.InternalServiceError
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getCapabilityManifests$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get capability manifest return capability list', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        id: 'id'
                    } as CapabilityManifest$v1
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getCapabilityManifests$()
        .toPromise()
        .then(capabilityList => {
            t.is(capabilityList[0].id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get licensed operations returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.NotFound
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getLicensedOperations$()
        .toPromise()
        .then((map) => {
            t.is(map, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get licensed operations returns error', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.InternalServiceError
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getLicensedOperations$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get licensed operations return capability list', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    capabilityOperations: {
                        assets: {
                            apiRead: 'hxgnconnect_asset',
                            apiWrite: 'hxgnconnect_asset',
                            apiDelete: 'hxgnconnect_asset',
                            apiCreate: 'hxgnconnect_asset'
                        }
                    }
                }
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getLicensedOperations$()
        .toPromise()
        .then(map => {
            t.is(map.get('assets')['apiRead'], 'hxgnconnect_asset');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get timeline returns error', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.InternalServiceError
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getTimeline$(null)
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get timeline returns timeline', async (t) => {
    // Arrange, Act
    const accessor = new DataSharingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    continuationToken: 'token',
                    page: [
                        {
                            user: 'user'
                        } as Changelog$v1
                    ]
                } as PageResponse$v1<Changelog$v1[]>
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getTimeline$(null)
        .toPromise()
        .then(timeline => {
            t.is(timeline.get('token')[0].user, 'user');
        })
        .catch(() => {
            t.fail();
        });
});
