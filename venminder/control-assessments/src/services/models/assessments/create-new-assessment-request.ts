// T4 generated file.  Do not manually modify.

import { Constants } from "shared/enums/constants";

export class CreateNewAssessmentRequest {
	constructor (
		public assessmentKey: string = Constants.emptyGuid,
		public assessmentType: string = null,
		public assessmentLevel: string = null,
		public vendorName: string = null,
		public productNames: string[] = [],
		public isVendorLevel: boolean = false,
		public client: string = null,
		public template: string = null
	) {
	}
	static create (item: CreateNewAssessmentRequest = null, preserveNull: boolean = false): CreateNewAssessmentRequest {
		return item == null
			? preserveNull ? null : new CreateNewAssessmentRequest()
			: new CreateNewAssessmentRequest(
				item.assessmentKey,
				item.assessmentType,
				item.assessmentLevel,
				item.vendorName,
				item.productNames,
				item.isVendorLevel,
				item.client,
				item.template
			);
	}
};

