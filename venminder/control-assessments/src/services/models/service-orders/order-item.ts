// T4 generated file.  Do not manually modify.

import { OrderDetail } from "./order-detail"

import { Constants } from "shared/enums/constants";

export class OrderItem {
	constructor (
		public id: string = Constants.emptyGuid,
		public status: string = null,
		public organization: string = null,
		public clientSpecialist: string = null,
		public dueDate: Date = null,
		public orderDetailItems: OrderDetail[] = []
	) {
	}
	static create (item: OrderItem = null, preserveNull: boolean = false): OrderItem {
		return item == null
			? preserveNull ? null : new OrderItem()
			: new OrderItem(
				item.id,
				item.status,
				item.organization,
				item.clientSpecialist,
				item.dueDate,
				(item.orderDetailItems || []).map(_x => OrderDetail.create(_x, preserveNull))
			);
	}
};
