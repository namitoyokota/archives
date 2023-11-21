import { HTTPCode$v1, PageResponse$v1, TokenManager$v1 } from '@galileo/platform_common-http';
import { ChangelogDescriptor$v1 } from '@galileo/platform_commonidentity';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { Application$v1 } from '../abstractions/application.v1';
import { Changelog$v1 } from '../abstractions/changelog.v1';
import { Industries$v1 } from '../abstractions/industries.v1';
import { Tenant$v1 } from '../abstractions/tenant.v1';

import { TenantDataAccessor$v1 } from './tenant-data-accessor.v1';

test('Create returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.post = sinon.stub().returns(
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

test('Create returns tenant', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.post = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Created,
                result: {
                    id: 'id'
                } as Tenant$v1
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .create$(null)
        .toPromise()
        .then(tenant => {
            t.is(tenant.id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .get$('id')
        .toPromise()
        .then((tenant) => {
            t.is(tenant, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .get$('id')
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get returns tenant', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
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
        .get$('id')
        .toPromise()
        .then(tenant => {
            t.is(tenant.id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get from access token returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getFromAccessToken$('baseUrl', 'accessToken')
        .toPromise()
        .then((tenant) => {
            t.is(tenant, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get from access token returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getFromAccessToken$('baseUrl', 'accessToken')
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get from access token returns tenant', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
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
        .getFromAccessToken$('baseUrl', 'accessToken')
        .toPromise()
        .then(tenant => {
            t.is(tenant.id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get user tenants returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getUserTenants$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.status, HTTPCode$v1.InternalServiceError);
        });
});

test('Get user tenants returns tenant list', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        id: 'id'
                    } as Tenant$v1
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getUserTenants$()
        .toPromise()
        .then(tenantList => {
            t.is(tenantList[0].id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get list returns tenant list', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    continuationToken: '',
                    page: [
                        {
                            id: 'id'
                        } as Tenant$v1
                    ]
                } as PageResponse$v1<Tenant$v1[]>
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getList$()
        .toPromise()
        .then(tenantList => {
            t.is(tenantList[0].id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get detailed list returns tenant list', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    continuationToken: '',
                    page: [
                        {
                            id: 'id'
                        } as Tenant$v1
                    ]
                } as PageResponse$v1<Tenant$v1[]>
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getList$()
        .toPromise()
        .then(tenantList => {
            t.is(tenantList[0].id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get applications returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getApplications$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.status, HTTPCode$v1.InternalServiceError);
        });
});

test('Get applications returns applications', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        id: 'id'
                    } as Application$v1
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getApplications$()
        .toPromise()
        .then(applications => {
            t.is(applications[0].id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get industries returns industry list', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    continuationToken: '',
                    page: [
                        {
                            id: 'id'
                        } as Industries$v1
                    ]
                } as PageResponse$v1<Industries$v1[]>
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getIndustries$()
        .toPromise()
        .then(industryList => {
            t.is(industryList[0].id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get networks returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getNetworks$()
        .toPromise()
        .then((networks) => {
            t.is(networks, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get networks returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getNetworks$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get networks returns networks', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: ['network']
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getNetworks$()
        .toPromise()
        .then(networks => {
            t.is(networks[0], 'network');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get timeline returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getTimeline$({} as ChangelogDescriptor$v1)
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.errors[0].statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Get timeline returns changelogs', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getTimeline$({} as ChangelogDescriptor$v1)
        .toPromise()
        .then(timeline => {
            t.is(timeline.get('token')[0].user, 'user');
        })
        .catch(() => {
            t.fail();
        });
});

test('Update returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .then((tenant) => {
            t.is(tenant, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Update returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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

test('Update returns tenant', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
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

test('Update all returns null on 404', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .updateAll$(null)
        .toPromise()
        .then((tenant) => {
            t.is(tenant, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Update all returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.patch = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.InternalServiceError
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .updateAll$(null)
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Update all returns tenant', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .updateAll$(null)
        .toPromise()
        .then(tenant => {
            t.is(tenant.id, 'id');
        })
        .catch(() => {
            t.fail();
        });
});

test('Delete returns error', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.delete = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                status: HTTPCode$v1.InternalServiceError
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .delete$('id')
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Upload icon returns tenant', async (t) => {
    // Arrange, Act
    const accessor = new TenantDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.delete = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .delete$('id')
        .toPromise()
        .then(() => {
            t.pass()
        })
        .catch(() => {
            t.fail();
        });
});
