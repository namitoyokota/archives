import { HTTPCode$v1, TokenManager$v1 } from '@galileo/platform_common-http';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { SharingCriteria$v1 } from '../abstractions/sharing-criteria.v1';

import { SharingCriteriaDataAccessor$v1 } from './sharing-criteria-data-accessor.v1';

test('Create returns error', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .create$(null)
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Create returns criteria', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        etag: 'etag'
                    } as SharingCriteria$v1<string, string>
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .create$(null)
        .toPromise()
        .then(criteriaList => {
            t.is(criteriaList[0].etag, 'etag');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get returns empty list on 404', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .get$()
        .toPromise()
        .then((criteriaList) => {
            t.is(criteriaList.length, 0);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get returns error', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .get$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get returns criteria', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        etag: 'etag'
                    } as SharingCriteria$v1<string, string>
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .get$()
        .toPromise()
        .then(criteriaList => {
            t.is(criteriaList[0].etag, 'etag');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get sharee ids return empty list on 404', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getShareeIds$()
        .toPromise()
        .then((ids) => {
            t.is(ids.length, 0);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get sharee ids return error', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getShareeIds$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get sharee ids return ids', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: ['id']
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getShareeIds$()
        .toPromise()
        .then(ids => {
            t.is(ids[0], 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get map return empty map on 404', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getMap$()
        .toPromise()
        .then((map) => {
            t.deepEqual(map, new Map<string, string[]>());
        })
        .catch(() => {
            t.fail();
        });
});

test('Get map return error', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getMap$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get map returns map', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    shareeTenantId: "1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a",
                    capabilities: {
                        assets: [
                            "e260b5de-bbc6-8f80-1b22-2f2485c817f3",
                            "5cff35a0-31a0-a855-2d3b-5541da46774c",
                            "7f83af76-fd88-d164-723c-ac359c893fee",
                            "62542062-d150-c456-b75b-87391138a148",
                            "2ccb9a07-d85a-be7c-5a8d-0f76afeacbda",
                            "6221d94f-659e-c44b-ea9b-aac2f966a4ee",
                            "de23be0e-5d40-ea52-2a35-85d733d9d34a",
                            "c1878bbb-8173-410a-9a77-d6f4aa23678a"
                        ]
                    }
                }
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getMap$()
        .toPromise()
        .then(map => {
            t.is(map.get('assets').length, 8);
        })
        .catch(() => {
            t.fail();
        });
});

test('Update returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
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
        .then((criteria) => {
            t.is(criteria, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Update returns error', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .update$(null)
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Update returns criteria', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        etag: 'etagAfter'
                    } as SharingCriteria$v1<string, string>
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .update$([
            {
                etag: 'etagBefore'
            } as SharingCriteria$v1<string, string>
        ])
        .toPromise()
        .then(criteriaList => {
            t.is(criteriaList[0].etag, 'etagAfter');
        })
        .catch(() => {
            t.fail();
        });
});

test('Delete returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.NotFound
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .delete$(['id'])
        .toPromise()
        .then((response) => {
            t.is(response, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Delete returns error', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .delete$(['id'])
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Delete returns success', async (t) => {
    // Arrange, Act
    const accessor = new SharingCriteriaDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        etag: 'etagAfter'
                    } as SharingCriteria$v1<string, string>
                ]
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
