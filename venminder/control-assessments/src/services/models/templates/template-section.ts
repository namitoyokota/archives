// T4 generated file.  Do not manually modify.

import { SectionControl } from "./section-control";
import { SubHeader } from "./sub-header";

export class TemplateSection {
	constructor (
		public sectionRatingScore: number = 0,
		public subHeaders: SubHeader[] = [],
		public controls: SectionControl[] = [],
		public id: number = null,
		public sectionTitle: string = null,
		public hasSectionRating: boolean = false
	) {
	}
	static create (item: TemplateSection = null, preserveNull: boolean = false): TemplateSection {
		return item == null
			? preserveNull ? null : new TemplateSection()
			: new TemplateSection(
				item.sectionRatingScore,
				(item.subHeaders || []).map(_x => SubHeader.create(_x, preserveNull)),
				(item.controls || []).map(_x => SectionControl.create(_x, preserveNull)),
				item.id,
				item.sectionTitle,
				item.hasSectionRating
			);
	}
};

