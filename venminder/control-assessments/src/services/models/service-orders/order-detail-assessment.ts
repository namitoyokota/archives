
import { Statuses } from "../assessments/statuses"

import { Constants } from "shared/enums/constants";

export class OrderDetailAssessment {
	constructor (
		public assessmentKey: string = Constants.emptyGuid,
		public name: string = null,
		public assessmentTypeID: number = 0,
		public assessmentDate: Date = null,
		public status: Statuses = <Statuses>1,
		public statusDescription: string = null
	) {
	}
	static create (item: OrderDetailAssessment = null, preserveNull: boolean = false): OrderDetailAssessment {
		return item == null
			? preserveNull ? null : new OrderDetailAssessment()
			: new OrderDetailAssessment(
				item.assessmentKey,
				item.name,
				item.assessmentTypeID,
				item.assessmentDate,
				item.status,
				item.statusDescription
			);
	}
};
