
import { AnswerOption } from "shared/models/answer-option";

export class SectionControl {
	constructor (
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
	static create (item: SectionControl = null, preserveNull: boolean = false): SectionControl {
		return item == null
			? preserveNull ? null : new SectionControl()
			: new SectionControl(
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
