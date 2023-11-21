// T4 generated file.  Do not manually modify.

import { AnswerOption } from "shared/models/answer-option";

export class AssessmentSectionControl {
	constructor (
		public narrative: string = null,
		public answers: string[] = [],
		public sortId: number = null,
		public enableGroupControls: boolean = false,
		public groupControls: boolean = false,
		public name: string = null,
		public question: string = null,
		public description: string = null,
		public displayType: string = null,
		public tags: string[] = [],
		public answerOptions: AnswerOption[] = []
	) {
	}
	static create (item: AssessmentSectionControl = null, preserveNull: boolean = false): AssessmentSectionControl {
		return item == null
			? preserveNull ? null : new AssessmentSectionControl()
			: new AssessmentSectionControl(
				item.narrative,
				item.answers,
				item.sortId,
				item.enableGroupControls,
				item.groupControls,
				item.name,
				item.question,
				item.description,
				item.displayType,
				item.tags,
				(item.answerOptions || []).map(_x => AnswerOption.create(_x, preserveNull))
			);
	}
// Class left open on purpose

    isEditable: boolean = false;
    isSingleControlEdit: boolean = false;
    sectionId: number = 0;
};
