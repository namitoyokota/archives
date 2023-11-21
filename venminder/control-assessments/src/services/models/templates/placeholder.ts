// T4 generated file.  Do not manually modify.

export class Placeholder {
	constructor (
		public placeholderID: string = null,
		public description: string = null,
		public type: string = null
	) {
	}
	static create (item: Placeholder = null, preserveNull: boolean = false): Placeholder {
		return item == null
			? preserveNull ? null : new Placeholder()
			: new Placeholder(
				item.placeholderID,
				item.description,
				item.type
			);
	}
};

