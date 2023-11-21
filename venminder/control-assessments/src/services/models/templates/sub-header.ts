
export class SubHeader {
	constructor (
		public sortId: number = null,
		public value: string = null
	) {
	}
	static create (item: SubHeader = null, preserveNull: boolean = false): SubHeader {
		return item == null
			? preserveNull ? null : new SubHeader()
			: new SubHeader(
				item.sortId,
				item.value
			);
	}
};

