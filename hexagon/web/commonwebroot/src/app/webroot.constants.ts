import { environment } from '../environments/environment';
import { ICommonConstants } from '@galileo/web_common-libraries';

export const WebRootConstants: ICommonConstants = {
    BUILD_NUMBER: environment.buildNumber,
    DEPLOY_URL: environment.deployUrl
};
