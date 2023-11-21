// T4 generated file.  Do not manually modify.

export class AnswerOption {
	constructor (
		public id: number = null,
		public name: string = null,
		public calculateScore: boolean = false,
		public score: number = null
	) {
	}
	static create (item: AnswerOption = null, preserveNull: boolean = false): AnswerOption {
		return item == null
			? preserveNull ? null : new AnswerOption()
			: new AnswerOption(
				item.id,
				item.name,
				item.calculateScore,
				item.score
			);
	}
};

