import { UserModel } from "../user-roles/user-role-model";
import { FIRoleIDs } from "shared-from-dcdev/shared/enums/role-name";
import { CountryCode } from "../international-model";

export class AddUserModel {
    ArgosUserID: string;
    IsSystemUser: string;
    FirstName: string;
    LastName: string;
    Email: EmailModel[];
    PhoneNumbers: PhoneNumberModel[];
    Roles: ["FI"];
    CustomRoleIDs :string[] = [];
    FinancialInstitutionContact: FinancialInstitutionContactModel;
    BusinessUnits: string[];
    SendInvitationNow: boolean;
    constructor() {
        this.FirstName = '';
        this.LastName = '';
        this.Email = [];
        this.PhoneNumbers = [];
        this.Roles = ["FI"];
        this.CustomRoleIDs = [];
        this.FinancialInstitutionContact = new FinancialInstitutionContactModel();
        this.BusinessUnits = [];
        this.SendInvitationNow = false;
    }
}

export class AddUserDialogModel {
    userList: UserModel[];
    domains: any[];
    clientID: string;
    roles: FIRoleForDisplayModel[];
    isServiceOnly: boolean = false;
    hasBusinessUnits: boolean = false;
    businessUnitsEnabled: boolean = false;
}

export class EmailModel {
    EmailAddress: string;
    TypeID: number;
    TypeDescription: string;
    constructor() {
        this.EmailAddress = '';
        this.TypeID = 2;
        this.TypeDescription = null;
    }
}

export class PhoneNumberModel {
    ID: string;
    AreaCode: string;
    Prefix: string;
    Suffix: string;
    Extension: string;
    TypeID: number;
    TypeDescription: string;
    Deleted: boolean;
    HasExtension: boolean;
    ModelState: number;
    PhoneDescription: string;
    CountryCode: CountryCode;
    CountryCodeID: string;
    InternationalPhoneNumber: string;
    IsUS: boolean;
    DialingCode: string;
    constructor() {
        this.ID = null;
        this.AreaCode = '';
        this.Prefix = '';
        this.Suffix = '';
        this.Extension = '';
        this.TypeID = 2;
        this.TypeDescription = 'Home';
        this.Deleted = null;
        this.HasExtension = null;
        this.ModelState = 0;
        this.PhoneDescription = null;
        this.CountryCodeID = null;
        this.CountryCode = null;
        this.InternationalPhoneNumber = '';
        this.IsUS = true;
        this.DialingCode = '1';
    }
}

export class FinancialInstitutionContactModel {
    FinancialInstitutionID: string;
    UserRoles: UserRolesModel[];
    constructor() {
        this.FinancialInstitutionID = null;
        this.UserRoles = [];
    }
}

export class UserRolesModel {
    RoleName: string;
    RoleVarName: string;
    ShortDescription: string;
    Description: string;
    FIVendorRelationshipID: string;
    Products = [];

    constructor() {
        this.RoleName = null;
        this.FIVendorRelationshipID = null;
        this.Products = [];
    }
}

export class FIRoleForDisplayModel {
    isSelected: boolean = false;
    id: string = "00000000-0000-0000-0000-000000000000";
    roleName: string;
    shortDescription: string = null;
    description: string = null;
    groupDescription: string = null;
    roleVarName: string = "";
    isInternalOnly: boolean = false;
    isServicesOnly: boolean = false;

    isKeyManager(): boolean { return this.id === FIRoleIDs.KeyManager; }
}

export class PhoneTypeModel {
    Description;
    ID;
    constructor() {
        this.Description = null;
        this.ID = null;
    }
}
