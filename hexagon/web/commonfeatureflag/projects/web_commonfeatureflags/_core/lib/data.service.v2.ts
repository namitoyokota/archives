import { Injectable } from '@angular/core';
import { CommonHttpClient } from '@galileo/web_common-http';

import { FeatureFlagDataAccess$v2 } from './feature-flag-data-access.v2';
import { FeedbackDataAccess$v1 } from './feedback-data-access.v1';

/**
 * Vreion 2 of the data service. This service is a way of interacting
 * with the rest api for feature flags. This service will make calls
 * to the v2 of the REST api. This includes the CommonFeatureFlagV2
 * calls and the FeedbackMessageControllerV1.
 */
@Injectable({ providedIn: 'root'})
export class DataService$v2 {

    /** Access v2 of the feature flags REST API */
    featureFlag: FeatureFlagDataAccess$v2;

    /** Access v1 of the feedback messages REST API */
    feedbackMessage: FeedbackDataAccess$v1;

    constructor(http: CommonHttpClient) {
        this.featureFlag = new FeatureFlagDataAccess$v2(http);
        this.feedbackMessage = new FeedbackDataAccess$v1(http);
    }
}
