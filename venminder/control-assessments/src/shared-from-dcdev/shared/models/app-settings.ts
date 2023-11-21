
export class PublicAppSettings {
	constructor (
		public hostName: string = null,
		public domainName: string = null,
		public authUrl: string = null,
		public appUrl: string = null,
		public rsdUrl: string = null,
		public argosRootUrl: string = null,
		public supportPhoneNumber: string = null,
		public supportMailUsername: string = null,
		public fiSupportPhoneNumber: string = null,
		public sessionTimeoutCookieName: string = null,
		public releaseMode: boolean = false,
		public trackAnalytics: boolean = false,
		public environment: string = null,
		public dromoFrontEndApiKey: string = null,
		public dromoIsDevelopmentMode: boolean = false,
		public controlAssessmentsUrl: string = null
	) {
	}
	static create (item: PublicAppSettings = null, preserveNull: boolean = false): PublicAppSettings {
		return item == null
			? preserveNull ? null : new PublicAppSettings()
			: new PublicAppSettings(
				item.hostName,
				item.domainName,
				item.authUrl,
				item.appUrl,
				item.rsdUrl,
				item.argosRootUrl,
				item.supportPhoneNumber,
				item.supportMailUsername,
				item.fiSupportPhoneNumber,
				item.sessionTimeoutCookieName,
				item.releaseMode,
				item.trackAnalytics,
				item.environment,
				item.dromoFrontEndApiKey,
				item.dromoIsDevelopmentMode,
				item.controlAssessmentsUrl
			);
	}
// Class left open on purpose

    distFolder: string = null;
};

import { Constants } from "shared-from-dcdev/shared/enums/constants";

export class LineItemTypeInformation {
	constructor (
		public id: string = Constants.emptyGuid,
		public description: string = null,
		public isAdvanced: boolean = false,
		public hasAdvanced: boolean = false
	) {
	}
	static create (item: LineItemTypeInformation = null, preserveNull: boolean = false): LineItemTypeInformation {
		return item == null
			? preserveNull ? null : new LineItemTypeInformation()
			: new LineItemTypeInformation(
				item.id,
				item.description,
				item.isAdvanced,
				item.hasAdvanced
			);
	}
};

export class LayoutInformation {
	constructor (
		public usersFullName: string = null,
		public isVIEnrolled: boolean = false,
		public isHostedVendor: boolean = false,
		public usersEmailAddress: string = null,
		public rsdUrl: string = null,
		public hasFIRole: boolean = false,
		public financialInstitutionID: string = null,
		public isSoftware: boolean = false,
		public hasAvailableContracts: boolean = false,
		public hasAvailableExamPreps: boolean = false,
		public hasAvailableDocumentStorage: boolean = false,
		public documentStorageGBAvailable: number = null,
		public numberOfDocumentsUploaded: number = 0,
		public hasExamPrep: boolean = false,
		public isContractedClient: boolean = false,
		public isContractedVendor: boolean = false,
		public isGuest: boolean = false,
		public isTypeBusiness: boolean = false,
		public isTypeFI: boolean = false,
		public userIsAdmin: boolean = false,
		public userIsVMO: boolean = false,
		public userIsApiKeyManager: boolean = false,
		public userIsExecutive: boolean = false,
		public vendorID: string = null,
		public hasVendorRole: boolean = false,
		public hasDCRole: boolean = false,
		public hasExaminerRole: boolean = false,
		public allowArgosSSO: boolean = false,
		public hasArgosLineItem: boolean = false,
		public hasArgosUser: boolean = false,
		public argosKey1: string = null,
		public argosKey2: string = null,
		public argosIsLoadedInSeparateTab: boolean = false,
		public hasExpertRole: boolean = false,
		public institutionName: string = null,
		public assessmentsIsActive: boolean = false,
		public assessmentsWasActive: boolean = false,
		public assessmentsHasSlots: boolean = false,
		public examPrepIsOn: boolean = false,
		public examPrepWasOn: boolean = false,
		public hasAccessToServicePortal: boolean = false,
		public isServices: boolean = false,
		public isServicesOnly: boolean = false,
		public canManageServiceOrders: boolean = false,
		public onBoardingIsActive: boolean = false,
		public onBoardingWasActive: boolean = false,
		public onBoardingRequestsAvailable: boolean = false,
		public vendorOnboardingIsOn: boolean = false,
		public isGlobalTodoOn: boolean = false,
		public offBoardingIsActive: boolean = false,
		public offBoardingWasActive: boolean = false,
		public offBoardingRequestsAvailable: boolean = false,
		public vendorOffboardingIsOn: boolean = false,
		public clientHasAccessToOffboarding: boolean = false,
		public externalAPI: boolean = false,
		public allowArcherIntegration: boolean = false,
		public hasServiceLevelAgreementAccess: boolean = false,
		public isProductCategoryManagementEnabled: boolean = false,
		public hasAccessToOversightAutomation: boolean = false,
		public hasIssueManagementAccess: boolean = false,
		public hideIssueManagementLink: boolean = false,
		public isIssueManagementEnabled: boolean = false,
		public hasAnyClosedIssue: boolean = false,
		public doesAnyIssueExist: boolean = false,
		public clientHasAccessToWorkflows: boolean = false,
		public clientHasAccessToIssueManagement: boolean = false,
		public clientHasAccessToCustomRoles: boolean = false,
		public hasAccessToExecutiveDashboard: boolean = false,
		public questionnairesIsActive: boolean = false,
		public questionnairesWasActive: boolean = false,
		public questionnairesHasSlots: boolean = false,
		public hasBusinessUnits: boolean = false,
		public businessUnitsEnabled: boolean = false,
		public businessUnitHeaderInfo: BusinessUnitHeaderInfo = null,
		public riskApprovalIsOn: boolean = false,
		public hasEnterpriseLevelAssessments: boolean = false,
		public clientHasAccessToQuickDeliveryLibrary: boolean = false,
		public hasAccessToOversightDashboard: boolean = false,
		public clientHasAccessToVenminderExchange: boolean = false,
		public hasOversightTaskApproverRole: boolean = false,
		public isUserLevelApiKeyFeatureEnabled: boolean = false,
		public lineItemTypes: LineItemTypeInformation[] = [],
		public relationshipManager: string = null,
		public accountManager: string = null,
		public canAccessExchangeVendorProducts: boolean = false,
		public canAccessExchangeVendorQuestionnaires: boolean = false,
		public canAccessExchangeVendorDocuments: boolean = false,
		public canAccessExchangeVendorBulkUpload: boolean = false,
		public canAccessExchangeVendorAnswerLibrary: boolean = false,
		public canAccessExchangeShareHistory: boolean = false,
		public contactHasSharedExchangeContent: boolean = false,
		public canAccessCriticalityAssessment: boolean = false,
		public isLifecycleModuleActive: boolean = false,
		public isLifecycleOngoingActive: boolean = false,
		public hasVendorSnapshot: boolean = false,
		public isVendorLifecycleExperienceActive: boolean = false
	) {
	}
	static create (item: LayoutInformation = null, preserveNull: boolean = false): LayoutInformation {
		return item == null
			? preserveNull ? null : new LayoutInformation()
			: new LayoutInformation(
				item.usersFullName,
				item.isVIEnrolled,
				item.isHostedVendor,
				item.usersEmailAddress,
				item.rsdUrl,
				item.hasFIRole,
				item.financialInstitutionID,
				item.isSoftware,
				item.hasAvailableContracts,
				item.hasAvailableExamPreps,
				item.hasAvailableDocumentStorage,
				item.documentStorageGBAvailable,
				item.numberOfDocumentsUploaded,
				item.hasExamPrep,
				item.isContractedClient,
				item.isContractedVendor,
				item.isGuest,
				item.isTypeBusiness,
				item.isTypeFI,
				item.userIsAdmin,
				item.userIsVMO,
				item.userIsApiKeyManager,
				item.userIsExecutive,
				item.vendorID,
				item.hasVendorRole,
				item.hasDCRole,
				item.hasExaminerRole,
				item.allowArgosSSO,
				item.hasArgosLineItem,
				item.hasArgosUser,
				item.argosKey1,
				item.argosKey2,
				item.argosIsLoadedInSeparateTab,
				item.hasExpertRole,
				item.institutionName,
				item.assessmentsIsActive,
				item.assessmentsWasActive,
				item.assessmentsHasSlots,
				item.examPrepIsOn,
				item.examPrepWasOn,
				item.hasAccessToServicePortal,
				item.isServices,
				item.isServicesOnly,
				item.canManageServiceOrders,
				item.onBoardingIsActive,
				item.onBoardingWasActive,
				item.onBoardingRequestsAvailable,
				item.vendorOnboardingIsOn,
				item.isGlobalTodoOn,
				item.offBoardingIsActive,
				item.offBoardingWasActive,
				item.offBoardingRequestsAvailable,
				item.vendorOffboardingIsOn,
				item.clientHasAccessToOffboarding,
				item.externalAPI,
				item.allowArcherIntegration,
				item.hasServiceLevelAgreementAccess,
				item.isProductCategoryManagementEnabled,
				item.hasAccessToOversightAutomation,
				item.hasIssueManagementAccess,
				item.hideIssueManagementLink,
				item.isIssueManagementEnabled,
				item.hasAnyClosedIssue,
				item.doesAnyIssueExist,
				item.clientHasAccessToWorkflows,
				item.clientHasAccessToIssueManagement,
				item.clientHasAccessToCustomRoles,
				item.hasAccessToExecutiveDashboard,
				item.questionnairesIsActive,
				item.questionnairesWasActive,
				item.questionnairesHasSlots,
				item.hasBusinessUnits,
				item.businessUnitsEnabled,
				BusinessUnitHeaderInfo.create(item.businessUnitHeaderInfo, preserveNull),
				item.riskApprovalIsOn,
				item.hasEnterpriseLevelAssessments,
				item.clientHasAccessToQuickDeliveryLibrary,
				item.hasAccessToOversightDashboard,
				item.clientHasAccessToVenminderExchange,
				item.hasOversightTaskApproverRole,
				item.isUserLevelApiKeyFeatureEnabled,
				(item.lineItemTypes || []).map(_x => LineItemTypeInformation.create(_x, preserveNull)),
				item.relationshipManager,
				item.accountManager,
				item.canAccessExchangeVendorProducts,
				item.canAccessExchangeVendorQuestionnaires,
				item.canAccessExchangeVendorDocuments,
				item.canAccessExchangeVendorBulkUpload,
				item.canAccessExchangeVendorAnswerLibrary,
				item.canAccessExchangeShareHistory,
				item.contactHasSharedExchangeContent,
				item.canAccessCriticalityAssessment,
				item.isLifecycleModuleActive,
				item.isLifecycleOngoingActive,
				item.hasVendorSnapshot,
				item.isVendorLifecycleExperienceActive
			);
	}
};

export class BusinessUnitHeaderInfo {
	constructor (
		public headerMessage: string = null,
		public tooltipMessage: string = null
	) {
	}
	static create (item: BusinessUnitHeaderInfo = null, preserveNull: boolean = false): BusinessUnitHeaderInfo {
		return item == null
			? preserveNull ? null : new BusinessUnitHeaderInfo()
			: new BusinessUnitHeaderInfo(
				item.headerMessage,
				item.tooltipMessage
			);
	}
};


