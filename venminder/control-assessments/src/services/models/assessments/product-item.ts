
import { Constants } from "shared/enums/constants";

export class ProductItem {
	constructor (
		public key: string = Constants.emptyGuid,
		public name: string = null
	) {
	}
	static create (item: ProductItem = null, preserveNull: boolean = false): ProductItem {
		return item == null
			? preserveNull ? null : new ProductItem()
			: new ProductItem(
				item.key,
				item.name
			);
	}
};

