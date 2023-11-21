import { FIRoleNames, RoleNames } from "../enums/role-name";
import { isNullOrUndefined, parseDate } from "../utilities/globals";
import { PhoneNumber } from "./international-model";

export class LoggedInUser {
    roles: Role[];
    clientRoles: Role[];
    venminderRoles: Role[];
    vendorRoles: Role[];
    contactID: string;
    entityContactID: string;
    emailAddress: string;
    entityID: string;
    entityName: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isSoftware: boolean;
    isSystemUser: boolean;
    phoneNumbers: PhoneNumber[] = [];
    private roleNames: Set<string> = null;
    private roleIds: Set<string> = null;
    private clientRoleNames: Set<string> = null;
    private clientRoleIds: Set<string> = null;
    enrollmentDate: Date;
    untitledQuestionnairesTemplateId: string;

    constructor(user: LoggedInUser) {
        this.roles = user.roles;
        this.clientRoles = user.clientRoles;
        this.venminderRoles = user.venminderRoles;
        this.vendorRoles = user.vendorRoles;
        this.contactID = user.contactID;
        this.entityContactID = user.entityContactID;
        this.emailAddress = user.emailAddress;
        this.entityID = user.entityID;
        this.entityName = user.entityName;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.fullName = `${user.firstName} ${user.lastName}`;
        this.isSoftware = user.isSoftware;
        this.isSystemUser = user.isSystemUser;
        this.enrollmentDate = parseDate(user.enrollmentDate);
        this.phoneNumbers = (user.phoneNumbers ?? []).map(pn => PhoneNumber.create(pn));
        this.untitledQuestionnairesTemplateId = user.untitledQuestionnairesTemplateId;
    }

    isAdmin(): boolean {
        return this.isInClientRoleByName(FIRoleNames.Admin);
    }

    isVMO(): boolean {
        return this.isInClientRoleByName(FIRoleNames.VMO);
    }

	isAdminOrVMO(): boolean {
		return this.isAdmin() || this.isVMO();
	}

    isKeyManager(): boolean {
        return this.isInClientRoleByName(FIRoleNames.KeyManager);
    }

    public canUploadPrivate(): boolean {
        return this.isInClientRoleByName(FIRoleNames.UploadPrivate);
    }

    isClient(): boolean {
        return this.isInRoleByName(RoleNames.client);
    }
    
    isDcAdmin(): boolean {
        return this.isInRoleByName(RoleNames.dc);
    }

    isVendor(): boolean {
        return this.isInRoleByName(RoleNames.vendor);
    }

    isInClientRoleByName(name: string): boolean {
        if (this.clientRoleNames == null) {
            this.populateClientRoleSets();
        }
        return this.clientRoleNames.has(name.toLowerCase());
    }

    isInClientRoleById(roleId: string): boolean {
        if (this.clientRoleIds == null) {
            this.populateClientRoleSets();
        }
        return this.clientRoleIds.has(roleId.toLowerCase());
    }

    populateClientRoleSets() {
        this.clientRoleNames = new Set<string>();
        this.clientRoleIds = new Set<string>();
        this.clientRoles.forEach(role => {
            let roleNameLower = role.name.toLowerCase();
            if (!this.clientRoleNames.has(roleNameLower)) {
                this.clientRoleNames.add(roleNameLower);
            }
            if (!this.clientRoleIds.has(role.roleID)) {
                this.clientRoleIds.add(role.roleID);
            }
        });
    }

    isInRoleByName(name: string): boolean {
        if (this.roleNames == null) {
            this.populateRoleSets();
        }
        return this.roleNames.has(name.toLowerCase());
    }

    isInRoleById(roleId: string): boolean {
        if (this.roleIds == null) {
            this.populateRoleSets();
        }
        return this.roleIds.has(roleId.toLowerCase());
    }

    populateRoleSets() {
        this.roleNames = new Set<string>();
        this.roleIds = new Set<string>();
        this.roles.forEach(role => {
            let roleNameLower = role.name.toLowerCase();
            if (!this.roleNames.has(roleNameLower)) {
                this.roleNames.add(roleNameLower);
            }
            if (!this.roleIds.has(role.roleID)) {
                this.roleIds.add(role.roleID);
            }
        });
    }

    isInVenminderRoleByName(name: string): boolean {
        return this.venminderRoles.some(role => role.name.toLowerCase() == name.toLowerCase());
    }
}

export class Role {
    roleID: string;
    name: string;
}

export class UserRoleList {
    userRoles: UserRole[];
}

export class UserRole {
    roleID: string;
    name: string;
    actualName: string;
    linkUrl: string;
}