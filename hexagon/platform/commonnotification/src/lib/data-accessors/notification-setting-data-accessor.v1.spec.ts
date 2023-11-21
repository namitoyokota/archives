/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTTPCode$v1, TokenManager$v1 } from '@galileo/platform_common-http';
import test from 'ava';
import { Observable } from 'rxjs';
import sinon from 'sinon';

import { NotificationResponse$v1 } from '../abstractions/notification-criteria-response.v1';
import { NotificationSettings$v1 } from '../abstractions/notification-settings.v1';

import { NotificationSettingDataAccessor$v1 } from './notification-setting-data-accessor.v1';

test('Create returns error', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.post = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                statusCode: HTTPCode$v1.InternalServiceError
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
            t.is(err.errors[0].statusCode, HTTPCode$v1.InternalServiceError);
        });
});

test('Create returns setting', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.post = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    preset: 'preset'
                } as NotificationSettings$v1
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .create$(null)
        .toPromise()
        .then(setting => {
            t.is(setting.preset, 'preset');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get returns 404', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .get$('preset')
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.errors[0].statusCode, HTTPCode$v1.NotFound);
        });
});

test('Get returns setting list', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        preset: 'preset'
                    } as NotificationSettings$v1
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .get$('preset')
        .toPromise()
        .then(settingList => {
            t.is(settingList[0].preset, 'preset');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get default returns 404', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getDefault$()
        .toPromise()
        .then((setting) => {
            t.is(setting, null);
        })
        .catch(() => {
            t.fail();
        });
});

test('Get default returns setting list', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    preset: 'preset'
                } as NotificationSettings$v1
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getDefault$()
        .toPromise()
        .then(setting => {
            t.is(setting.preset, 'preset');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get system defined returns 404', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getSystemDefined$('preset')
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.errors[0].statusCode, HTTPCode$v1.NotFound);
        });
});

test('Get system defined returns setting list', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: [
                    {
                        preset: 'preset'
                    } as NotificationSettings$v1
                ]
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getSystemDefined$('preset')
        .toPromise()
        .then(settingList => {
            t.is(settingList[0].preset, 'preset');
        })
        .catch(() => {
            t.fail();
        });
});

test('Get system defined default returns 404', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
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
        .getSystemDefinedDefault$()
        .toPromise()
        .then(() => {
            t.fail();
        })
        .catch((err) => {
            t.is(err.errors[0].statusCode, HTTPCode$v1.NotFound);
        });
});

test('Get system defined default returns setting list', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.get = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.Ok,
                result: {
                    preset: 'preset'
                } as NotificationSettings$v1
            });

            subscriber.complete();
        })
    );

    // Act
    await accessor
        .getSystemDefinedDefault$()
        .toPromise()
        .then(setting => {
            t.is(setting.preset, 'preset');
        })
        .catch(() => {
            t.fail();
        });
});

test('Update returns 404', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.error({
                statusCode: HTTPCode$v1.NotFound
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
            t.is(err.errors[0].statusCode, HTTPCode$v1.NotFound);
        });
});

test('Update returns setting list', async (t) => {
    // Arrange, Act
    const accessor = new NotificationSettingDataAccessor$v1({} as any as TokenManager$v1, 'url');
    (accessor as any).http.put = sinon.stub().returns(
        new Observable(subscriber => {
            subscriber.next({
                statusCode: HTTPCode$v1.MultiStatus,
                result: [
                    {
                        payload: {
                            preset: 'preset'
                        } as NotificationSettings$v1,
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
        .then(settingList => {
            t.is(settingList[0].preset, 'preset');
        })
        .catch(() => {
            t.fail();
        });
});
