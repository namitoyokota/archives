// T4 generated file.  Do not manually modify.

import { OrderDetailAssessment } from "./order-detail-assessment"

import { Constants } from "shared/enums/constants";

export class OrderDetail {
	constructor (
		public orderItemID: string = Constants.emptyGuid,
		public orderType: string = null,
		public orderTypeAbbreviation: string = null,
		public orderLevel: string = null,
		public isVendorLevel: boolean = false,
		public productNames: string[] = [],
		public vendorName: string = null,
		public status: string = null,
		public orderDate: Date = null,
		public slaDays: number = 0,
		public rush: string = null,
		public reportType: string = null,
		public subReportType: string = null,
		public importantInformation: string = null,
		public assessmentKey: string = Constants.emptyGuid,
		public assessment: OrderDetailAssessment = null
	) {
	}
	static create (item: OrderDetail = null, preserveNull: boolean = false): OrderDetail {
		return item == null
			? preserveNull ? null : new OrderDetail()
			: new OrderDetail(
				item.orderItemID,
				item.orderType,
				item.orderTypeAbbreviation,
				item.orderLevel,
				item.isVendorLevel,
				item.productNames,
				item.vendorName,
				item.status,
				item.orderDate,
				item.slaDays,
				item.rush,
				item.reportType,
				item.subReportType,
				item.importantInformation,
				item.assessmentKey,
				OrderDetailAssessment.create(item.assessment, preserveNull)
			);
	}
};
