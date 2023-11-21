
import { Constants } from "shared/enums/constants";

export class VendorItem {
	constructor (
		public key: string = Constants.emptyGuid,
		public name: string = null
	) {
	}
	static create (item: VendorItem = null, preserveNull: boolean = false): VendorItem {
		return item == null
			? preserveNull ? null : new VendorItem()
			: new VendorItem(
				item.key,
				item.name
			);
	}
};

