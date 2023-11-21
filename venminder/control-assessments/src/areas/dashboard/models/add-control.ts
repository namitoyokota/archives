// T4 generated file.  Do not manually modify.

import { AnswerOption } from "shared/models/answer-option";

export class Control {
	constructor (
		public name: string = null,
		public question: string = null,
		public description: string = null,
		public displayType: string = null,
		public tags: string[] = [],
		public answerOptions: AnswerOption[] = []
	) {
	}
	static create (item: Control = null, preserveNull: boolean = false): Control {
		return item == null
			? preserveNull ? null : new Control()
			: new Control(
				item.name,
				item.question,
				item.description,
				item.displayType,
				item.tags,
				(item.answerOptions || []).map(_x => AnswerOption.create(_x, preserveNull))
			);
	}
// Class left open on purpose

    isSelected: boolean = false;
    controlListTitle: string = "";
};