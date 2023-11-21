import { InjectionToken } from '@angular/core';
import { ICommonConstants } from './common-constants.interfaces';

export let CommonConstants = new InjectionToken<ICommonConstants>('A collection of constants common to the Galileo framework', {
    factory: () => <ICommonConstants>{ BUILD_NUMBER: '', DEPLOY_URL: ''}
});
