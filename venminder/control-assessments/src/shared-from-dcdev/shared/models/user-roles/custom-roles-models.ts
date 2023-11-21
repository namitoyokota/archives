
import { Constants } from "shared-from-dcdev/shared/enums/constants";

export class CreateCustomRoleRequestObject {
	constructor (
		public clientID: string = Constants.emptyGuid,
		public roleName: string = null,
		public contactIDs: string[] = []
	) {
	}
};

export class DeleteCustomRoleRequestObject {
	constructor (
		public customRoleID: string = Constants.emptyGuid
	) {
	}
};

export class FICustomRole {
	constructor (
		public id: string = Constants.emptyGuid,
		public roleName: string = null
	) {
	}
};

export class FICustomRoleForMember {
	constructor (
		public customRoleID: string = Constants.emptyGuid,
		public customRoleName: string = null,
		public isSelected: boolean = false,
		public numberOfUsersWithThisRole: number = 0
	) {
	}
};

export class FICustomRoleMember {
	constructor (
		public contactID: string = Constants.emptyGuid,
		public name: string = null,
		public isSelected: boolean = false,
		public isActive: boolean = false
	) {
	}
};

export class FICustomRoleWithMembers {
	constructor (
		public id: string = Constants.emptyGuid,
		public roleName: string = null,
		public members: FICustomRoleMember[] = []
	) {
	}
};

export class GetCustomRolesForClientUserRequestObject {
	constructor (
		public contactID: string = Constants.emptyGuid,
		public financialInstitutionID: string = Constants.emptyGuid
	) {
	}
};

export class UpdateCustomRoleRequestObject {
	constructor (
		public customRoleID: string = Constants.emptyGuid,
		public clientID: string = Constants.emptyGuid,
		public roleName: string = null,
		public contactIDs: string[] = []
	) {
	}
};

export class GetCustomRoleUsageData_Row {
	constructor (
		public name: string = null
	) {
	}
};

export class GetCustomRoleUsageData {
	constructor (
		public usages: GetCustomRoleUsageData_Row[] = []
	) {
	}
};
