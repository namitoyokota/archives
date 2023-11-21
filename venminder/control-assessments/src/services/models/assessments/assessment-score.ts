
import { Constants } from "shared/enums/constants";

export class AssessmentScore {
	constructor (
		public elaID: string = Constants.emptyGuid,
		public resultID: string = null,
		public resultDesc: string = null,
		public isMuted: boolean = false,
		public hasRequestedToImproveScore: boolean = false,
		public remainingDays: number = null
	) {
	}
	static create (item: AssessmentScore = null, preserveNull: boolean = false): AssessmentScore {
		return item == null
			? preserveNull ? null : new AssessmentScore()
			: new AssessmentScore(
				item.elaID,
				item.resultID,
				item.resultDesc,
				item.isMuted,
				item.hasRequestedToImproveScore,
				item.remainingDays
			);
	}
};

