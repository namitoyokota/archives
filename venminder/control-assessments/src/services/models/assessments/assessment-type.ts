// T4 generated file.  Do not manually modify.

import { Constants } from "shared/enums/constants";

export class AssessmentTypeWithIDs {
	constructor (
		public templateID: string = Constants.emptyGuid,
		public lineItemTypeID: string = Constants.emptyGuid,
		public showForPublic: boolean = false,
		public showForInternal: boolean = false,
		public id: number = 0,
		public name: string = null,
		public abbreviation: string = null
	) {
	}
	static create (item: AssessmentTypeWithIDs = null, preserveNull: boolean = false): AssessmentTypeWithIDs {
		return item == null
			? preserveNull ? null : new AssessmentTypeWithIDs()
			: new AssessmentTypeWithIDs(
				item.templateID,
				item.lineItemTypeID,
				item.showForPublic,
				item.showForInternal,
				item.id,
				item.name,
				item.abbreviation
			);
	}
};
