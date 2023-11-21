// T4 generated file.  Do not manually modify.

import { TemplateTheme } from "../themes/theme";
import { AssessmentScore } from "./assessment-score";
import { AssessmentSection } from "./assessment-section";
import { Statuses } from "./statuses";

import { Constants } from "shared/enums/constants";

export class AssessmentData {
	constructor (
		public assessmentTemplate: string = null,
		public assessmentType: string = null,
		public assessmentLevel: string = null,
		public overallRatingScore: number = null,
		public isCompleted: boolean = false,
		public organization: string = null,
		public vendor: string = null,
		public products: string[] = [],
		public theme: TemplateTheme = null,
		public assessmentSections: AssessmentSection[] = [],
		public assessmentKey: string = Constants.emptyGuid,
		public name: string = null,
		public assessmentTypeID: number = 0,
		public isVendorLevel: boolean = false,
		public score: AssessmentScore = null,
		public assessmentDate: Date = null,
		public price: number = 0,
		public status: Statuses = <Statuses>1,
		public statusDescription: string = null,
		public client: string = null
	) {
	}
	static create (item: AssessmentData = null, preserveNull: boolean = false): AssessmentData {
		return item == null
			? preserveNull ? null : new AssessmentData()
			: new AssessmentData(
				item.assessmentTemplate,
				item.assessmentType,
				item.assessmentLevel,
				item.overallRatingScore,
				item.isCompleted,
				item.organization,
				item.vendor,
				item.products,
				TemplateTheme.create(item.theme, preserveNull),
				(item.assessmentSections || []).map(_x => AssessmentSection.create(_x, preserveNull)),
				item.assessmentKey,
				item.name,
				item.assessmentTypeID,
				item.isVendorLevel,
				AssessmentScore.create(item.score, preserveNull),
				item.assessmentDate,
				item.price,
				item.status,
				item.statusDescription,
				item.client
			);
	}
};

