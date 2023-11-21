// T4 generated file.  Do not manually modify.

import { AssessmentSectionControl } from "./assessment-section-control";
import { SubHeader } from "../templates/sub-header";

export class AssessmentSection {
	constructor (
		public sectionRatingScore: number = null,
		public subHeaders: SubHeader[] = [],
		public controls: AssessmentSectionControl[] = [],
		public id: number = null,
		public sectionTitle: string = null,
		public hasSectionRating: boolean = false
	) {
	}
	static create (item: AssessmentSection = null, preserveNull: boolean = false): AssessmentSection {
		return item == null
			? preserveNull ? null : new AssessmentSection()
			: new AssessmentSection(
				item.sectionRatingScore,
				(item.subHeaders || []).map(_x => SubHeader.create(_x, preserveNull)),
				(item.controls || []).map(_x => AssessmentSectionControl.create(_x, preserveNull)),
				item.id,
				item.sectionTitle,
				item.hasSectionRating
			);
	}
// Class left open on purpose

    errors: string[] = [];
};
