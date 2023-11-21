export enum RoleNames {
    dc = "DC",
    client = "FI",
    vendor = "Vendor",
    vendorQuestionnaire = "VendorQuestionnaire"
}

export enum FIRoleNames {
    GeneralUser = "User",
    Admin = "Admin",
    UploadPrivate = "Upload private",
    QuestionnaireEditor = "Questionnaire editor",
    RiskApprover = "Risk approver",
    RiskAssessmentEditor = "Risk Assessment Editor",
    ShareWithExaminer = "Share with examiner",
    Billing = "Billing",
    Implementation = "Implementation",
    Sales = "Sales",
    KeyManager = "Key Manager",
    VMO = "VMO",
    ProductManager = 'Product Manager',
    RequiredAssignment = 'Required Assignment',
    Requestor = 'Requestor',
    VMOManager = 'VMO Manager',
    OversightTaskApprover = 'Oversight Task Approver'
}

export enum FIRoleIDs {
    Collaborator = 'd01eb536-e52a-4b20-91a4-72df4519b12c',
    RiskApprover = '81a000ac-7c0b-415e-b97a-8699998d0b57',
    ShareWithExaminer = '7d84bc21-7657-478c-9846-543021c85f94',
    Admin = '82490364-bbb9-4ba2-be95-f5a7074c8d76',
    ProductManager = '7d7fb98f-65eb-4ffe-8912-9c5d88b13c8d',
    KeyManager = 'b27c8e30-664d-4c45-9ae1-4934f06e0e80',
    VMO = '640544BF-2FB1-44DC-9EE1-7853D6817FDA',
    OversightTaskApprover = '68C03ECB-3FBD-455E-A9C8-BA0B60F73671'
}

export enum VendorRoleNames {
    Admin = "Admin",
    DocumentManager = "Document Manager",
    Default = "Default",
}

export enum VendorRoleIDs {
    Admin = '94D00B8A-C3A3-439C-BD76-4DF524D52BD9',
    DocumentManager = '890CC3A0-52C9-4324-BE79-8F5F2583ABB3'
}

export enum VendorContactStatus {
    Active = "Active",
    Inactive = "Inactive",
}