
import { AnswerOption } from "shared/models/answer-option";

export class DeleteControlRequest {
	constructor (
		public name: string = null,
		public question: string = null,
		public description: string = null,
		public displayType: string = null,
		public tags: string[] = [],
		public answerOptions: AnswerOption[] = []
	) {
	}
	static create (item: DeleteControlRequest = null, preserveNull: boolean = false): DeleteControlRequest {
		return item == null
			? preserveNull ? null : new DeleteControlRequest()
			: new DeleteControlRequest(
				item.name,
				item.question,
				item.description,
				item.displayType,
				item.tags,
				(item.answerOptions || []).map(_x => AnswerOption.create(_x, preserveNull))
			);
	}
};

