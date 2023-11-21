
export class SaveDataLibraryRequest {
	constructor (
		public vendorName: string = null,
		public productName: string = null,
		public name: string = null,
		public question: string = null,
		public displayType: string = null
	) {
	}
	static create (item: SaveDataLibraryRequest = null, preserveNull: boolean = false): SaveDataLibraryRequest {
		return item == null
			? preserveNull ? null : new SaveDataLibraryRequest()
			: new SaveDataLibraryRequest(
				item.vendorName,
				item.productName,
				item.name,
				item.question,
				item.displayType
			);
	}
};

