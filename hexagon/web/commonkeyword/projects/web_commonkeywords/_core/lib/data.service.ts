import { Injectable } from '@angular/core';
import { CommonHttpClient } from '@galileo/web_common-http';

import { CompositeIconDataAccess$v2Service } from './composite-icon-data-access.v2';
import { KeywordsDataAccess$v1Service } from './keywords-data-access.v1';
import { PrimitiveIconDataAccess$v2Service } from './primitive-icon-data-access.v2';
import { RulesetDataAccess$v1Service } from './ruleset-data-access.v1';

/**
 * Version 2 of the data service. This service is a way of interacting with
 * the rest api for common keywords.
 */
@Injectable()
export class DataService {

	/** Access v1 of keywords REST API */
	keywords: KeywordsDataAccess$v1Service;

	/** Access v2 of composite icon REST API */
	compositeIcon: CompositeIconDataAccess$v2Service;

	/** Access v2 of primitive icon REST API */
	primitiveIcon: PrimitiveIconDataAccess$v2Service;

	/** Access v1 of ruleset REST API */
	ruleset: RulesetDataAccess$v1Service;

	constructor(http: CommonHttpClient) {
		this.keywords = new KeywordsDataAccess$v1Service(http);
		this.compositeIcon = new CompositeIconDataAccess$v2Service(http);
		this.primitiveIcon = new PrimitiveIconDataAccess$v2Service(http);
		this.ruleset = new RulesetDataAccess$v1Service(http);
	}
}

