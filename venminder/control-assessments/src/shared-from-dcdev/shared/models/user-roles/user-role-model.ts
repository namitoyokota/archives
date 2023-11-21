import { EmailModel, PhoneNumberModel, UserRolesModel } from '../add-user/add-user-model';
import { FICustomRoleForMember } from './custom-roles-models';
export class UserModel {
    public ArgosUserID: string;
    public IsSystemUser: string;
    public ID: string;
    public FinancialInstitutionID: string;
    public ContactID: string = "00000000-0000-0000-0000-000000000000";
    public FirstName: string = '';
    public LastName: string = '';
    public Email: EmailModel[];
    public PhoneNumbers: PhoneNumberModel[];
    public UserRoles: UserRolesModel[];
    public EnrollmentSteps: string;
    public IsLocked: boolean;
    public Status: string;
    public IsActive: boolean;
    public IsEnrolled: boolean;
    public FullName: string;
    public FirstNameLastInitial: string;
    public HasAccessToRsd: boolean;
    public CustomRoles: FICustomRoleForMember[];
    BusinessUnits: string[];
}

export class ExaminerModel {
    public ID: string;
    public FirstName: string;
    public LastName: string;
    public Email: string;
    public PhoneNumbers: string[];
    public FormattedPhoneNumbers: string[];
    public IsActive: boolean;
    public IsLocked: boolean;
    public IsInvited: boolean;
    public IsEnrolled: boolean;
    public StatusText: string;
}

export class ReportAccess {
    public ExaminerReportID: string = '00000000-0000-0000-0000-000000000000';
    public Vendor: string = null;
    public Product: string = null;
    public Products: string[] = [];
    public IsMultiProduct: boolean = false;
    public ReportDate: Date = null;
    public SharedBy: string = null;
    public ReportID: string = null;
    public DocumentID: string = null;
    public DocumentName: string = null;
    public VersionNumber: number = null;
    public ReportType: string = null;
    public ExaminerID: string = '00000000-0000-0000-0000-000000000000';
    public ToBeRemoved: boolean = false;
}

export class RequestAccessChange {
    public ClientID = null;
    public ExaminerID: string = null;
    public NewIsActive: boolean = false;
    public ReportsToRevokeAccess: string[];
}

export class ResendInvitationRequest {
    public ContactID: string = null;
    public FirstName: string = null;
    public LastName: string = null;
    public EmailAddress: string = null;
}
export class ResendInvitationModel {
    public invitationRequest: ResendInvitationRequest;
    public userType: string;
    public domainList: string[];
    public userList: UserModel[];
    public examinerList: ExaminerModel[];

} 