
import { parseDate } from "shared-from-dcdev/shared/utilities/globals";

export class ProgressBO {
	public statusDate: Date;
	constructor (
		public statusText: string = null,
		public totalWork: number = 0,
		public workCompleted: number = 0,
		public isComplete: boolean = false,
		statusDate: Date = null,
		public additionalData: string = null
	) {
		this.statusDate = parseDate(statusDate, 'statusDate')
	}
	static create (item: ProgressBO = null, preserveNull: boolean = false): ProgressBO {
		return item == null
			? preserveNull ? null : new ProgressBO()
			: new ProgressBO(
				item.statusText,
				item.totalWork,
				item.workCompleted,
				item.isComplete,
				item.statusDate,
				item.additionalData
			);
	}
};



