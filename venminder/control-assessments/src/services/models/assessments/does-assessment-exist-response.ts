// T4 generated file.  Do not manually modify.


export class DoesAssessmentExistResponse {
	constructor (
		public doesAssessmentExist: boolean = false
	) {
	}
	static create (item: DoesAssessmentExistResponse = null, preserveNull: boolean = false): DoesAssessmentExistResponse {
		return item == null
			? preserveNull ? null : new DoesAssessmentExistResponse()
			: new DoesAssessmentExistResponse(
				item.doesAssessmentExist
			);
	}
};

