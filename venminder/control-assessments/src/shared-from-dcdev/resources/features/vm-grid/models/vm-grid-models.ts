import { Constants } from "../../../../shared/enums/constants";


export class GridSettings {
	constructor (
		public id: string = Constants.emptyGuid,
		public contactID: string = null,
		public financialInstitutionContactID: string = null,
		public clientID: string = null,
		public gridName: string = null,
		public value: string = null
	) {
	}
};

