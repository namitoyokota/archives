
import { AnswerOption } from "shared/models/answer-option";

export class ControlRequest {
	constructor (
		public name: string = null,
		public question: string = null,
		public description: string = null,
		public displayType: string = null,
		public tags: string[] = [],
		public answerOptions: AnswerOption[] = []
	) {
	}
	static create (item: ControlRequest = null, preserveNull: boolean = false): ControlRequest {
		return item == null
			? preserveNull ? null : new ControlRequest()
			: new ControlRequest(
				item.name,
				item.question,
				item.description,
				item.displayType,
				item.tags,
				(item.answerOptions || []).map(_x => AnswerOption.create(_x, preserveNull))
			);
	}
};

