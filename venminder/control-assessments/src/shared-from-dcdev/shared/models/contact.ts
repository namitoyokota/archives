
export class FIContact {
	constructor (
		public id: string = null,
		public contactID: string = null,
		public firstName: string = null,
		public lastName: string = null,
		public fullName: string = null,
		public isAdminOrInAllBusinessUnits: boolean = false,
		public isAdminOrVMO: boolean = false
	) {
	}
};

