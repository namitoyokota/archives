/* eslint-disable @typescript-eslint/no-namespace */
export namespace EventNames {
    export namespace Zendesk {
        export const OPEN_CHAT: string = "Chat::OpenChat";
    }
    export namespace OpenAPI {
        export const KEYS_LOADED: string = "OpenAPI:KeysLoaded";
    }
    export namespace Navigation {
        export const SHOW_ARGOS: string = "Navigation:ShowArgos";
        export const BUSINESS_UNITS_SETTINGS_UPDATED: string = 'Navigation:BusinessUnitsSettingsUpdated';
        export const ON_BUSINESS_UNITS_UPDATE = 'Navigation:OnBusinessUnitsUpdate';
        export const ON_BUSINESS_UNITS_UPDATE_IS_SUBSCRIBED = 'Navigation:OnBusinessUnitsUpdateIsSubscribed';
        export const TO_VENDOR_DASHBOARD = 'Navigation:ToVendorDashboard';
        export const ON_MAIN_LAYOUT_TEMPLATE_READY = 'Navigation:onMainLayoutTemplateReady';
        export const ON_DC_ADMIN_FAVORITE_CHANGED = 'Navigation:onDCAdminFavoriteChanged';
        export const ON_NAVIGATE_TO_EXCHANGE_ROUTE = 'Navigation:onNavigateToExchangeRoute';
        export const ON_NAVIGATE_TO_CLIENT_EXCHANGE_ROUTE = 'Navigation:onNavigateToClientExchangeRoute';
        export const ON_NAVIGATE_TO_PENDING_REQUESTS = 'Navigation:onNavigationToPendingRequests';
    }
    export namespace SMEView {
        export const DOWNLOAD: string = "SMEView:Download";
        export const DOWNLOADED: string = "SMEView:Downloaded";
        export const ENABLESAVE: string = "SMEView:EnableSave";
        export const SAVE: string = "SMEView:Save";
        export const SAVED: string = "SMEView:Saved";
    }
    export namespace SMEHistory {
        export const REVIEW_SELECTED_FOR_PREFILL: string = 'SMEHistory:ReviewSelectedForPrefill';
        export const REVIEW_SELECTED_FOR_PREFILL_FOR_MODAL: string = 'SMEHistory:ReviewSelectedForPrefillForModal';
        export const FORM_CLEARED: string = 'SMEHistory:FormCleared';
        export const DUPLICATE_SELECTED: string = 'SMEHistory:DuplicateSelected';
    }
    export namespace VendorFilter {
        export const SELECTION_CHANGED: string = 'VendorFilter:SelectionChanged';
        export const SET_VENDOR_SELECTION: string = 'VendorFilter:SetVendorSelection';
        export const VENDOR_SELECTION_SET: string = 'VendorFilter:VendorSelectionSet';
        export const INITIALIZE_FILTER: string = 'VendorFilter:InitializeFilter';
        export const FILTERS_CLEARED: string = 'VendorFilter:FiltersCleared';
        export const DOCUMENTS_ARE_LINKED_TO_VENDOR_FLAG: string = 'VendorFilter:FilterDocumentsAreLinkedToVendorFlag';
        export const SET_FILTER_VENDOR_PRODUCTS: string = 'VendorFilter:SetOnboardingRequestVendorProducts';
    }

    export namespace Filters {
        export const INITIALIZE_FILTER: string = 'Filters:InitializeFilter';
    }

    export namespace VmFeatures {
        export namespace VmMultiSelect {
            export const DROPDOWN_TEXT_UPDATED: string = 'VmMulitSelect:DropdownTextUpdated';
            export const DROPDOWN_BLURRED: string = "VmMultiSelect:DropdownBlurred";
        }
        export namespace VmDropdown {
            export const CLOSE: string = 'VmDropdown:CloseDropdown';
        }
    }

    export namespace DateFilter {
        export const FROM_DATE_CHANGED: string = 'DateFilter:FromDateChanged';
        export const TO_DATE_CHANGED: string = 'DateFilter:ToDateChanged';
        export const DATE_TYPE_CHANGED: string = 'DateFilter:DateTypeChanged';
    }

    export namespace ServiceOrderItemStatusFilter {
        export const SELECTION_CHANGED: string = 'ServiceOrderItemStatusFilter:SelectionChanged';
    }

    export namespace VendorProductRatingFilter {
        export const SELECTION_CHANGED: string = 'VendorProductRatingFilter:SelectionChanged';
    }

    export namespace DocumentStorage {
        export namespace Filters {
            export namespace CategoriesFilter {
                export const SELECTION_CHANGED: string = 'DocumentCategoriesFilter:SelectionChanged';
                export const READ_UNREAD_CHANGED: string = 'DocumentCategoriesFilter:ReadUnreadSelectionChanged';
                export const READ_UNREAD_APPLY: string = 'DocumentCategoriesFilter:ReadUnreadApply';
                export const INITIALIZE_FILTER: string = 'DocumentCategoriesFilter:InitializeFilter';
            }
            export namespace DatesFilter {
                export const SELECTION_CHANGED: string = 'DocumentDatesFilter:SelectionChanged';
                export const INITIALIZE_FILTER: string = 'DocumentDatesFilter:InitializeFilter';
            }
            export namespace TagsFilter {
                export const SELECTION_CHANGED: string = 'DocumentTagsFilter:SelectionChanged';
                export const INITIALIZE_FILTER: string = 'DocumentTagsFilter:InitializeFilter';
            }
            export const FILTERS_CLEARED: string = 'DocumentStorage:Filters:FiltersCleared';
            export const FILTERS_SEARCHBOX_CLEARED_OF_TAGS: string = 'DocumentStorage:Filters:SearchboxClearedOfTags';
        }

        export namespace Dialog {
            export const SELECT_DOCUMENTS: string = 'DocumentStorageDialog:SelectDocuments';
        }

        export const VIEW_ADD_SOFTWARE_VENDORS: string = 'DocumentStorage:SelectServices'
        export const START_DOCUMENT_DOWNLOAD: string = 'DocumentStorage:StartDocumentDownload';
        export const PREVIEW_DOCUMENT: string = 'DocumentStorage:PreviewDocument';
        export const VIEW_DOCUMENT: string = 'DocumentStorage:ViewDocument';
        export const DOWNLOAD_DOCUMENT: string = 'DocumentStorage:DownloadDocument';
        export const ARCHIVE_DOCUMENT: string = 'DocumentStorage:ArchiveDocument';
        export const UNARCHIVE_DOCUMENT: string = 'DocumentStorage:UnarchiveDocument';
        export const REPLACE_DOCUMENT: string = 'DocumentStorage:ReplaceDocument';
        export const EDIT_DOCUMENT: string = 'DocumentStorage:EditDocument';
        export const DELETE_DOCUMENT: string = 'DocumentStorage:DeleteDocument';
        export const ALL_ITEMS_SELECTED_CHANGED: string = 'DocumentStorage:AllItemsSelectedChanged';
        export const SELECTED_ITEMS_CHANGED: string = 'DocumentStorage:SelectedItemsChanged';
        export const ATTACHED_ITEMS_CHANGED: string = 'DocumentStorage:AttachedItemsChanged';
        export const ATTACHED_ITEM_DETACHED: string = 'DocumentStorage:AttachedItemDetached';
        export const REFRESH_TAGS: string = 'DocumentStorage:RefreshTags';
        export const REFRESH_DOCUMENTS: string = 'DocumentStorage:RefreshDocuments';
        export const UNIQUE_PRODUCT_NICKNAMES: string = 'DocumentStorage:UniqueProductNicknames';
        export const SEARCH_FOR_DOCUMENTS: string = 'DocumentStorage:SearchForDocuments';
        export const UPLOADED_DOCUMENTS: string = 'DocumentStorage:UploadedDocuments';
        export const VENDOR_LIST: string = 'DocumentStorage:VendorList';
        export const DOCUMENT_TAGS: string = 'DocumentStorage:DocumentTags';
        export const SORT_DOCUMENTS: string = 'DocumentStorage:SortDocuments';
        export const DOCUMENT_UPLOADED: string = 'DocumentStorage:DocumentUploaded';
        export const DOCUMENT_DELETED: string = 'DocumentStorage:DocumentDeleted';
        export const DOCUMENT_EDITED: string = 'DocumentStorage:DocumentEdited';
        export const SWITCH_VIEW: string = 'DocumentStorage:SwitchView';
        export const SERVICE_ORDER_INFO = 'DocumentStorage:ServiceOrderInfo';
        export const PREVIOUS_VIEW: string = 'DocumentStorage:PreviousView';
        export const UPDATE_DOCUMENTS: string = 'DocumentStorage:UpdateDocuments';
    }

    export namespace AdminPanel {
        export const REFRESH_RESPONSIBILITIES: string = 'AdminPanel:RefreshResponsibilities';
        export const RISK_ASSESSMENTS_REASSIGNED: string = "AdminPanel:RiskAssessmentsReassigned";
        export const PRODUCT_MANAGER_REASSIGNED: string = "AdminPanel:ProductManagerReassigned";
        export const OVERSIGHT_TASKS_REASSIGNED: string = "AdminPanel:OversightTasksReassigned";
        export const PENDING_OVERSIGHT_TASKS_FOR_APPROVAL_REASSIGNED: string = "AdminPanel:PendingOversightTasksForApprovalReassigned";
        export const OVERSIGHT_TASKS__AUTO_REASSIGNED: string = "AdminPanel:OversightRequirementsAutoReassigned"
        export const PRIVATE_DOCUMENTS_REASSIGNED: string = "AdminPanel:PrivateDocumentsReassigned";
        export const RISK_ASSESSMENT_APPROVAL_REASSIGNED: string = "AdminPanel:AssessmentApprovalReassigned";
        export const USER_DATA_UPDATED: string = "AdminPanel:UserDataUpdated";
        export const DISMISS_INTERRUPT_MODEL: string = "AdminPanel:DismissInterruptModel";
        export const OVERSIGHT_REQUIREMENT_LIST_UPDATED: string = "AdminPanel:OversightRequirementList";
        export const FORM_DATA_UPDATED: string = "AdminPanel:FormData";
        export const SAVE_OVERSIGHT_AUTOMATION: string = 'OversightAutomation:OversightAutomationData';
        export const SAVE_OVERSIGHT_REQUIREMENT_SETTINGS: string = 'AdminPanel:OversightRequirementSettings';
        export const OVERSIGHT_AUTOMATION_CHANGED: string = 'OversightAutomation:OversightAutomationData';
        export const USER_DEACTIVATED: string = 'AdminPanel:UserDeactivated';
        export const CRITICALITY_ASSESSMENT: string = 'AdminPanel:CriticalityAssessment';
        export namespace CustomRoles {
            export const GET_CUSTOM_ROLES_WITH_MEMBERS: string = "AdminPanelCustomRoles:GetCustomRolesWithMembers";
        }
        export namespace GeneralRoles {
            export const ADMIN_ROLE_CHANGED: string = 'AdminPanel:GeneralRoles:AdminRoleChanged';
        }
    }

    export namespace UserAPIKeys {
        export const ADD_USER_API_KEY: string = "UserAPIKeys:AddUserAPIKey";
        export const REFRESH_USER_API_KEY_LIST: string = "UserAPIKeys:RefreshUserAPIKeyList";
    }

    export namespace OrderHistory {
        export const DOWNLOAD_ORDER_ITEM_DOCUMENT: string = 'OrderHistory:DownloadOrderItemDocument';
        export const DOWNLOAD_ORDER_ITEM_DOCUMENTS: string = 'OrderHistory:DownloadOrderItemDocuments';
        export const ITEM_REQUIRES_ATTENTION: string = 'OrderHistory:ItemRequiresAttention';
        export const SERVICE_ITEM_CANCELLED: string = 'OrderHistory:ServiceItemCancelled';
        export const VIEW_CANCELLED_ITEM: string = 'OrderHistory:ViewCancelledItem';
        export const VIEW_SERVICE_ITEM_ANALYSIS: string = 'OrderHistory:ViewServiceItemAnalysis';
        export const SERVICE_ORDERS_BY_TYPE: string = 'OrderHistory:showServiceOrdersByType';
        export const NAVIGATE_TO_ORDER_HISTORY: string = 'OrderHistory:navigateToOrderHistory';
        export const PAGE_REQUEST: string = 'OrderHistory:PageRequest';

    }

    export namespace ManageAccount {
        export const EDIT_SERVICE_ACCOUNT: string = 'ManageAccount:EditServiceAccount';
    }

    export namespace SelectServices {
        export const CONTACT_SALES: string = 'SelectServices:ContactSales';
        export const PLACE_PRODUCT_ORDER: string = 'SelectServices:PlaceProductOrder';
        export const ORDER_SUBMITTED: string = 'SelectServices:OrderSubmitted';
        export const PLACE_VENDOR_ORDER: string = 'SelectServices:PlaceVendorOrder';
        export const REORDER_DOCUMENT_COLLECTION: string = 'SelectServices:ReorderDocumentCollection';
        export const SHOW_CREDIT_FLYOUT: string = 'SelectServices:ShowCreditFlyout';
        export const UPDATE_ORDER_BALANCE: string = 'SelectServices:UpdateOrderBalance';
        export const VIEW_ADD_SOFTWARE_VENDOR: string = 'SelectServices:ViewAddSoftwareVendor';
        export const UPDATE_ORDER_ITEMS: string = 'SelectServices:UpdateOrderItems';
        export const RELOAD_VENDOR_PRODUCTS: string = 'SelectServices:ReloadVendorProducts';
    }

    export namespace ControlAssessments {
        export const REMOVE_ITEM_FROM_CART: string = 'ControlAssessments:RemoveItemFromCart';
        export const CARTED_ITEMS_UPDATED: string = 'ControlAssessments:UpdatedCartedItems';
        export const NAVIGATE_TO_ORDER_HISTORY: string = 'ControlAssessments:NavigateToOrderHistory';
    }

    export namespace BuildOrder {
        export const UPLOAD_CONTRACT_ATTACHMENT: string = 'BuildOrder:UploadContractAttachment';
        export const FILES_TO_ATTACH: string = 'BuildOrder:FilesToAttach';
        export const BUILD_ORDER_VENDOR_SERVICES_DATA: string = 'BuildOrderVendorService:Data';
        export const BUILD_ORDER_PRODUCT_SERVICES_DATA: string = 'BuildOrderProductService:Data';
        export const SERVICE_ORDER_ITEMS_CHANGED: string = 'BuildOrder:ServiceOrderItemsChanged';
    }

    export namespace AddVendorProduct {
        export const VENDOR_PRODUCT_ADDED: string = 'AddVendorProduct:SelectionChanged'
        export const RETRIEVE_VENDOR_PRODUCT: string = 'AddVendorProduct:Data'
    }

    export namespace BuildOrderVendorService {
        export const VENDOR_SERVICES_SELECTION_CHANGED: string = 'BuildOrderVendorService:SelectionChanged';
    }

    export namespace BuildOrderProductService {
        export const PRODUCT_SERVICES_SELECTION_CHANGED: string = 'BuildOrderPRODUCTService:SelectionChanged';
    }

    export namespace OrderVerificationQueue {
        export const FUTURE_END_DATE_CHANGED: string = 'OrderVerificationQueue:FutureEndDateChanged';
        export const FUTURE_START_DATE_CHANGED: string = 'OrderVerificationQueue:FutureStartDateChanged';
        export const SERVICE_ORDER_CLAIMED: string = 'OrderVerificationQueue:ServiceOrderClaimed';
        export const SERVICE_ORDER_REASSIGNED: string = 'OrderVerificationQueue:ServiceOrderReassigned';
        export const SERVICE_ORDER_UNCLAIMED: string = 'OrderVerificationQueue:ServiceOrderUnclaimed';
        export const SERVICE_ORDER_CLAIMREFRESH: string = 'OrderVerificationQueue:ServiceOrdersNeedRefreshing';
    }

    export namespace VerifyOrder {
        export const CLIENT_ID_TO_VERIFY_ORDER_VENDOR_ROW: string = 'VerifyOrder:ClientIDToVerifyOrderVendorRow';
        export const ADD_ORDER_VERIFICATION_COMMENT: string = 'VerifyOrder:AddServiceOrderComment';
        export const DOWNLOAD_DOCUMENT: string = 'VerifyOrder:DownloadDocument';
        export const NAVIGATE_TO_VERIFICATION_QUEUE: string = 'VerifyOrder:NavigateToVerificationQueue';
        export const ON_PARTIAL_LOAD: string = 'VerifyOrder:OnPartialLoad';
        export const REFRESH_INTERNAL_COMMENTS: string = 'VerifyOrder:RefreshInternalComments';
        export const SAVE_SERVICE_ORDER_ITEMS: string = 'VerifyOrder:SaveServiceOrderItems';
        export const SEARCH_FULFILLMENT_PRODUCTS: string = 'VerifyOrder:SearchFulfillmentProducts';
        export const UPDATE_DISPLAY_COMMENTS: string = 'VerifyOrder:UpdateDisplayComments';
        export const UPDATE_FULFILLMENT_INFORMATION: string = 'VerifyOrder:UpdateFulfillmentInformation';
        export const UPDATE_SERVICE_ORDER_ITEMS: string = 'VerifyOrder:UpdateServiceOrderItems';
        export const UPDATE_SERVICE_ORDER_BALANCE: string = 'VerifyOrder:UpdateServiceOrderBalance';
        export const UPDATE_VENDOR_INFORMATION: string = 'VerifyOrder:UpdateVendorInformation';
        export const REFRESH_LAST_SAVED_DATE_TIME: string = 'VerifyOrder:RefreshLastSavedDateTime';
        export const DELETE_COMMENT: string = 'VerifyOrder:DeleteComment';
        export const UPDATE_FLEX_SLOTS: string = 'VerifyOrder:UpdateFlexSlots';
    }

    export namespace ModifyOrder {
        export const SERVICE_ORDER_DETAILS: string = 'ModifyOrder:ServiceOrderDetails';
        export const FULFILLMENT_VENDOR_DETAILS: string = 'ModifyOrder:FulfillmentVendorDetails';
    }

    export namespace EditOrder {
        export const EDIT_ORDER_SELECTION_VENDOR: string = 'EditOrder:OrderEditing';
        export const UPLOAD_CONTRACT_ATTACHMENT: string = 'EditOrder:UploadContractAttachment';
        export const FILES_TO_ATTACH: string = 'EditOrder:FilesToAttach';
        export const SELECTED_VENDOR: string = 'EditOrder:SelectedVendor';
        export const GETSELECTED_VENDOR: string = 'EditOrder:GetSelectedVendor';

    }

    export namespace EditOrderVendorService {
        export const VENDOR_SERVICES_SELECTION_CHANGED: string = 'EditOrderVendorService:SelectionChanged';
    }

    export namespace EditOrderProductService {
        export const PRODUCT_SERVICES_SELECTION_CHANGED: string = 'EditOrderpRODUCTService:SelectionChanged';
    }

    export namespace ContentFooter {
        export const BACK_TO_TOP: string = 'ContentFooter:BackToTop';
    }

    export namespace UploadDocumentDialog {
        export const UPLOAD_FILES_SUBMITTED: string = 'UploadDocumentDialog:UploadFilesSubmitted';
    }

    export namespace OrderProductServiceDialog {
        export const DOCUMENT_SELECTED: string = 'OrderProductServiceDialog:DocumentSelected';
        export const DOC_VENDOR_PRODUCT_SELECTED: string = 'OrderProductServiceDialog:DocVendorProductSelected';
        export const DOC_PRODUCT_SELECTED: string = 'OrderProductServiceDialog:DocProductSelected';
    }

    export namespace VendorDashboard {
        export const VENDOR_PRODUCT_NAME_UPDATED = 'VendorDashboard: ProductProfileListInformation';
        export const VENDOR_CONTRACT_INFORMATION_UPDATED = 'VendorDashboard: VendorContractProfileInformation';
        export const STATIC_VENDOR_PROFILE_INFORMATION_UPDATED = 'VendorDashboard: StaticVendorProfileInformation';
        export const DYNAMIC_VENDOR_PROFILE_INFORMATION_UPDATED = 'VendorDashboard: DynamicVendorProfileInformation';
        export const VENDOR_NAME: string = 'VendorDashboard: VendorName';
        export const VENDOR_CHECKLIST_UPDATED: string = 'VendorDashboard: ChecklistUpdated';
        export const TOGGLE_TAB: string = 'VendorDashboard: ToggleTaB';
        export const TOGGLE_WORKFLOW_TAB: string = 'VendorDashboard: ToggleWorkflowTab';
        export const TOGGLE_PRODUCT_TAB: string = 'VendorDashboard: ToggleProductTaB';
        export const TOGGLE_OVERSIGHT_REQUIREMENTS_TAB: string = 'VendorDashboard: ToggleOversightRequirementsTab';
        export const VENDOR_DUETASKS_UPDATED: string = 'VendorDashboard: DueTasksUpdated';
        export const VENDOR_FILTER_TASKS: string = 'VendorDashboard: FilterTasks';
        export const VENDOR_DUE_TASK_TICKER_UPDATED: string = 'VendorDashboard: DueTasksTickerUpdated';
        export const VENDOR_DUETASK_RESCHEDULED: string = 'VendorDashboard: DueTaskRescheduled';
        export const VENDOR_DUETASK_DEFAULTVIEW_CHANGED: string = 'VendorDashboard: DueTaskDefaultViewChanged';
        export const VENDOR_PRODUCT_ID_UPDATED: string = 'VendorDashboard: ProductIDChanged';
        export const VENDOR_PRODUCT_LIST_CHANGED: string = 'VendorDashboard: ProductListChanged';
        export const VENDOR_PRODUCT_UPDATED: string = 'VendorDashboard: ProductUpdated';
        export const RISK_ASSESSMENT_UPDATED: string = 'VendorDashboard: RiskAssesmentUpdated';
        export const PRODUCT_ARCHIVED_WORKFLOWS: string = 'VendorDashboard: ProductArchivedWorkflows';
        export const REDIRECT_TO_OVERSIGHT_REQUIREMENT_TAB = 'VendorDashboard: RedirectToOversightRequirementTab';
        export const REDIRECT_RESPONSE_TO_EDITABLE_PROD_INFO = 'VendorDashboard: RedirectResponseToEditableProdInformation';
        export const UPDATE_ISSUE: string = 'VendorDashboard: UpdateIssue';
        export const VIEW_ISSUE: string = 'VendorDashboard: ViewIssue';
        export const SHOW_ISSUE_LIST: string = 'VendorDashboard: ShowIssueList';
        export const UPDATE_DASHBOARD_ISSUE_LIST: string = 'VendorDashboard: UpdateDashboardIssueList';
        export const REVIEW_PERIOD_UPDATED: string = 'Vendor Dashboard: Review Period Updated';
        export const VENDOR_DASHBOARD_SEND_QUESTIONNAIRE: string = 'VendorDashboard:SendQuestionnaire';
        export const VENDOR_URL_PARAMETERS: string = 'VendorDashboard:VendorUrlParameters';
    }
    export namespace VendorOnboarding {
        export const VENDOR_ONBOARDING_FORM_UPDATED: string = 'VendorOnboarding: FormUpdated';
        export const VENDOR_ONBOARDING_FORM_UPDATE_CANCELED: string = 'VendorOnboarding: FormUpdatedCanceled';
        export const VENDOR_ONBOARDING_SUBMIT_REQUEST: string = 'VendorOnboarding: SubmitRequest';
        export const VENDOR_ONBOARDING_GET_TILES_STATUS: string = 'VendorOnboarding: GetTilesStatus';
        export const VENDOR_ONBOARDING_REFRESH_REQUEST_VIEW_FILTER: string = 'VendorOnboarding: RefreshRequestViewFilter';
        export const VENDOR_ONBOARDING_REQUEST_NEW_VMO_ASSIGNED: string = 'VendorOnboarding: RequestNewVMOAssigned';
        export const VENDOR_ONBOARDING_VIEW_REQUEST: string = 'VendorOnboarding: ViewRequest';
        export const VENDOR_ONBOARDING_UPDATE_VIEW_REQUEST: string = 'VendorOnboarding: UpdateViewRequest';
        export const VENDOR_ONBOARDING_UPDATE_PENDING_VENDORS: string = 'VendorOnboarding: UpdatePendingVendors';
        export const VENDOR_ONBOARDING_REQUEST_BACK_TO_STEP1: string = 'VendorOnboarding: RequsetBackToStep1';
        export const VENDOR_ONBOARDING_CHECK_REQUEST_VALIDATIONS: string = 'VendorOnboarding: RequestValidations';
        export const VENDOR_ONBOARDING_REQUEST_DIRTY_VALIDATIONS: string = 'VendorOnboarding: RequestDirtyValidations';
        export const VENDOR_ONBOARDING_SHOW_COMPARISON_VIEW: string = 'VendorOnboarding: ShowComparisonView';
        export const VENDOR_ONBOARDING_UPDATE_DUPLICATE_MESSAGE: string = 'VendorOnboarding: UpdateDuplicateMsg';
        export const VENDOR_ONBOARDING_REFRESH_REQUESTS: string = 'VendorOnboarding: ReactivateRequest';
        export const VENDOR_ONBOARDING_UPDATE_COMPLEX_RESPONSE_STRING: string = 'VendorOnboarding: UpdateResponseString';
        export const VENDOR_ONBOARDING_COMPLEX_VALIDATIONS: string = 'VendorOnboarding: ComplexValidations';
        export const VENDOR_ONBOARDING_DUE_DILIGENCE_LIST: string = 'VendorOnboarding: DueDiligenceList';
        export const VENDPR_ONBOARDING_UPDATE_DUE_DILIGENCE_TASK: string = 'VendorOnboarding: UpdateDueDiligenceTask';
        export const VENDOR_ONBOARDING_SECTION_ASSIGNMENT: string = 'VendorOnboarding: SectionAssignment';
        export const VENDOR_ONBOARDING_SECTION_DETAIL: string = 'VendorOnboarding: SectionDetail';
        export const VENDOR_ONBOARDING_REFRESH_QUICK_BAR: string = 'VendorOnboarding: RefreshQuickBar';
        export const VENDOR_ONBOARDING_VENDOR_NICKNAME_ID: string = 'VendorOnboarding: VendorNicknameId';

        export const VENDOR_ONBOARDING_REDIRECT_TO_STEP2: string = 'VendorOnboarding: OnboardingRequestRedirectToStep2';
        export const VENDOR_ONBOARDING_REFRESH_REQUIREMENT_SECTION: string = 'VendorOnboarding: RefreshRequirementSection';

        export const VENDOR_ONBOARDING_RESET_QUESTIONNAIRE: string = 'VendorOnboarding:ResetQuestionnaire';
        export const VENDOR_ONBOARDING_SEND_QUESTIONNAIRE: string = 'VendorOnboarding:SendQuestionnaire';

        export const VENDOR_ONBOARDING_REOPEN_SECTION: string = 'VendorOnboarding:ReopenSection';
        export const VENDOR_ONBOARDING_REFERESH_MY_TO_DO_LIST_COUNT: string = 'VendorOnboarding:RefereshMyToDoListCount';
        export const VENDOR_ONBOARDING_REFERESH_BITSIGHT_RISK_VECTORS: string = 'VendorOnboarding:RefereshBitSightRiskVectors';
        export const VENDOR_ONBOARDING_UPDATE_QUICK_VIEW_PDF_SECTION_STATUS: string = 'VendorOnboarding:UpdateQuickViewPDFSectionsStatus';

        export const CONTRACT_VIEWED: string = 'VendorOnboarding:ContractViewed';
        export const VENDOR_ONBOARDING_MARK_SECTION_AS_UPDATED: string = 'VendorOnboarding:MarkSectionAsUpdated';

        export const VENDOR_ONBOARDING_REFRESH_NOTE: string = 'VendorOnboarding:RefreshNote';
    }

	export namespace VendorOffboarding {
		export const VENDOR_OFFBOARDING_REFRESH_TAB_STATUS = 'VendorOffboarding:RefreshTabStatus'
	}

    export namespace VenminderAdmin {
        export const DISMISS_DOCUMENT: string = 'VenminderAdmin:DismissDocument';
        export const INTERNAL_DOCUMENTATION_ALL_AUTHORIZED: string = "VenminderAdmin:InternalDocumentationAllAuthorized";
        export const INTERNAL_DOCUMENTATION_SELECTED: string = 'VenminderAdmin:InternalDocumentationSelected';
        export const REFRESH_INTERNAL_DOCUMENTATION: string = 'VenminderAdmin:RefreshInternalDocumentation';
        export const SAVE_ELA_DOCUMENTATION_SELECTION: string = 'VenminderAdmin:SaveElaDocumentationSelection';
        export const SAVE_ELA_DOCUMENTATION_SELECTION_COMPLETED: string = 'VenminderAdmin:SaveElaDocumentationSelectionCompleted';
        export const INTERNAL_DOCUMENTATION_ALL_LOADED: string = "VenminderAdmin:InternalDocumentationAllLoaded";
        export const INTERNAL_DOCUMENTATION_LOADING: string = "VenminderAdmin:InternalDocumentationLoading";

        export namespace ClientSupport {
            export const ON_TOGGLE_EDIT: string = 'CLIENT SUPPORT: TOGGLE EDIT';
            export const ON_CLIENT_UPDATED: string = 'CLIENT SUPPORT: CLIENT UPDATED';
        }
        export const FULFILLMENT_VENDOR_UPDATED: string = 'VenminderAdmin:FulfillmentVendorUpdated';
    }

    export namespace SystemSettings {
        export const BUSINESS_UNIT_SETTINGS_SAVED: string = 'SystemSettings:BusinessUnitSettingsSaved';
        export const DEFAULT_SETTINGS: string = 'Settings:DefaultSetting';
        export const TOGGLE_SETTINGS_TAB: string = 'Settings:ToggleSttingsTab'
    }

    export namespace ProductCategories {
        export const PRODUCT_CATEGORIES: string = 'ProductCategories: ProductCategoryData'
    }

    export namespace OversightRequirements {
        export const OVERSIGHT_REQUIREMENT: string = 'OversightRequirements: OversightRequirementData'
    }

    export namespace OversightAutomation {
        export const TOGGLE_OVERSIGHT_AUTOMATION_TAB: string = 'OversightAutomation: ToggleOversightAutomationTab';
        export const OVERSIGHT_AUTOMATION: string = 'OversightAutomation: OversightAutomationData';
        export const TOGGLE_CATEGORIES_TAB: string = 'OversightAutomation: ToggleCategoriesTab';
    }

    export namespace UserList {
        export const BUSINESS_UNITS_UPDATED: string = 'User:BusinessUnitsUpdated';
        export const EXAMINER_DATA_UPDATED: string = 'ExaminerData:Updated';
        export const EXAMINER_VIEW_UPDATED: string = 'ExaminerView:Updated';
        export const USER_DATA_UPDATED: string = 'UserData:Updated';
    }

    export namespace ServiceLevelAgreement {

        export namespace SETUP_SLA {
            export const INFO_BAR = 'slasetupInfoBar';
            export const VENDOR_RESET = 'slaSetupVendorReset';
            export const EXPORT_SELECTED_PRODUCT_LIST = 'slaExportSelectedProductList';
            export const EXPORT_PRODUCTS_AND_VENDOR_NICKNAME_IDS = 'slaProductAndVendorNickNameIds';
            export const EXPORT_SLA_INFORMATION_MODEL = 'slaInformationModel';
            export const ADD_ANOTHER_SLA = 'addAnotherSla';
            export const RELOAD_CATEGORY = 'reloadCategory';
        }

        export namespace VIEW_SLA {
            export const EDIT_SLA_CLICK_EVENTS = 'editSlaClickEvents';
        }

        export namespace ADD_REMEDIATION_LOGS {
            export const ADD_REMEDIATION_LOGS_EVENTS = 'addRemediationLogsEvents';
        }

        export namespace MANAGE {
            export const FILTER = 'slaManageFilter';
            export const RESET_GRAPH = 'slaResetGraph';
            export const CHARTS_READY = 'onChartsReady';
        }

        export namespace VIEW_VENDOR {
            export const REFRESH_VIEW_VENDOR = 'slaViewVendor';
        }

        export const PAGER = 'pager';
    }

    export namespace RiskAssessment {
        export const CANCEL_VENMINDER_SAMPLES: string = 'RiskAssessment:CancelVenminderSamples';
        export const LOAD_VENMINDER_SAMPLE: string = 'RiskAssessment:LoadVenminderSample';
        export const DELETE_QUESTIONNAIRE_SECTION: string = 'RiskAssessment:DeleteQuestionnaireSection';
        export const DELETE_QUESTIONNAIRE_QUESTION: string = 'RiskAssessment:DeleteQuestionnaireQuestion';
        export const SCORES_CHANGED: string = 'RiskAssessment:ScoresChanged';
        export const RESIDUAL_DOCUMENTS_VISIBLE: string = 'RiskAssessment:ResidualDocumentsVisible';
        export const SAVING_DATA: string = 'RiskAssessment:SavingData';
    }

    export namespace BusinessUnit {
        export namespace Admin {
            export const NAVIGATE_TO_STEP_ONE: string = 'BusinessUnitAdmin: NavigatedToStepOne';
            export const NAVIGATE_TO_STEP_TWO: string = 'BusinessUnitAdmin: NavigatedToStepTwo';
            export const NAVIGATE_TO_STEP_THREE: string = 'BusinessUnitAdmin: NavigatedToStepThree';
            export const NAVIGATE_TO_STEP_FOUR: string = 'BusinessUnitAdmin: NavigatedToStepFour';

            export const OVERVIEW_NAVIGATED: string = 'BusinessUnitAdmin:OverviewNavigated';
            export const SETUP_LOCKED: string = 'BusinessUnitAdmin:SetupLocked';
            export const USER_DROPDOWN_UPDATED: string = 'BusinessUnitAdmin:UserDropdownUpdated';
            export const SETUP_COMPLETED: string = 'BusinessUnitAdmin:SetupCompleted';
        }

        export const ADMIN_PANEL_TAB_ACTIVATED: string = 'BusinessUnit:AdminPanelTabActivated';
        export const ASSESSMENT_APPROVAL_REASSIGNED = 'BusinessUnit:AssessmentApprovalReassigned';
        export const ASSESSMENT_OWNERSHIP_REASSIGNED = 'BusinessUnit:AssessmentOwnershipReassigned';
        export const ASSOCIATED_USER_DELETED: string = 'BusinessUnit:AssociatedUserDeleted';
        export const ASSOCIATED_VENDOR_DELETED: string = 'BusinessUnit:AssociatedVendorDeleted';
        export const BUSINESS_UNIT_DELETED: string = 'BusinessUnit:BusinessUnitDeleted';
        export const BUSINESS_UNIT_DETAILS_RESETTED: string = 'BusinessUnit:BusinessUnitDetailsResetted';
        export const BUSINESS_UNIT_DETAILS_UPDATED: string = 'BusinessUnit:BusinessUnitDetailsUpdated';
        export const COLLABORATION_REMOVED: string = 'BusinessUnit:CollaborationRemoved';
        export const INCOMPLETE_USER_ADDED: string = 'BusinessUnit:IncompleteUserAdded';
        export const INCOMPLETE_USER_COMPLETED: string = 'BusinessUnit:IncompleteUserCompleted';
        export const INCOMPLETE_VENDOR_ADDED: string = 'BusinessUnit:IncompleteVendorAdded';
        export const MY_WORKSPACE_REFRESHED: string = 'BusinessUnit:MyWorkspaceRefreshed';
        export const NEW_BUSINESS_UNIT_REASSIGNED: string = 'BusinessUnit:NewBusinessUnitReassigned';
        export const NEW_USER_ADDED: string = 'BusinessUnit:NewUserAdded';
        export const NEW_VENDOR_ADDED: string = 'BusinessUnit:NewVendorAdded';
        export const OVERSIGHT_MANAGEMENT_REASSIGNED: string = 'BusinessUnit:OversightManagementReassigned';
        export const PRODUCT_MANAGEMENT_REASSIGNED = 'BusinessUnit:ProductManagementReassigned';
        export const SEARCH_RESULTS_REFRESHED: string = 'BusinessUnit:SearchResultsRefreshed'
        export const SERVICE_ORDER_REASSIGNED: string = 'BusinessUnit:ServiceOrderReassigned';
        export const UNASSOCIATED_USER_ADDED: string = 'BusinessUnit:UnassociatedUserAdded';
        export const UNASSOCIATED_VENDOR_ADDED: string = 'BusinessUnit:UnassociatedVendorAdded';
        export const USER_DELETION_CANCELLED: string = 'BusinessUnit:UserDeletionCancelled';
        export const VENDOR_DELETION_CANCELLED: string = 'BusinessUnit:VendorDeletionCancelled';
    }

    export namespace Questionnaire {
        export const ADDED_CONTACT: string = 'Questionnaire:AddedContact';
        export const UPDATE_COVER_PAGE: string = 'Questionnaire:UpdateCoverPage';

        export namespace Responses {
            export const SET_PAGINATION: string = 'Questionnaires.Responses:SetPagination';
            export const GET_PAGE_INFO: string = 'Questionnaires.Responses:GetPageInfo';
        }
    }

    export namespace ComplexQuestion {
        export const DOWNLOAD_DOCUMENT: string = 'ComplexQuestion:DownloadDocument';
    }

    export namespace IssueManagement {
        export const APPROVE_SUCCESS_CLOSED = 'approveIssueSuccessClosed';
        export const NOT_APPROVE_SUCCESS = 'notApproveClose';
        export const REOPEN_SUCCESS_CLOSE = 'reopenSuccessClose';
        export const CLOSE_UPDATE_ISSUE_DIALOG = 'closeUpdateIssueDialog';
        export const INIT_CREATE_ISSUE_TAB = 'initCreateIssueTab';
        export const ISSUE_CLOSED = 'issueClosedIM';
        export const UPDATE_STATUS_FOR_ISSUE_INQUESTIONAIRE = 'updateIssueForQuestionnaire';
        export const UPDATE_STATUS_FOR_IM = 'UpdateStatusForIM';

        export namespace ADD_MANAGE_COMMENTS {
            export const ADD_MANAGE_EVENTS = 'addCommentLogsEvents';
        }

        export namespace CREATE_ISSUE {
            export const ISSUE_CREATED_FROM_MODAL = 'issueCreatedFromModal';
        }

        export namespace ISSUE_TAB {
            export const ISSUE_CREATED_FROM_TAB = 'issueCreatedFromTab';
            export const LOAD_CREATED_ISSUE_IN_GRID = 'loadCreatedIssueInGrid';
            export const UPDATE_ISSUE_GRID_TAB = 'updateIssueGridTab';

        }
    }

    export namespace Workflows {
        export const WORKFLOWS: string = 'Workflows: WorkflowsData'
        export const WORKFLOWS_TAB_SELECTED: string = 'Workflows: WorkflowsData'
        export const WORKFLOWS_MODIFIED: string = 'Workflows: Modified'
        export const PRODUCT_SELECTED: string = 'Workflows: Product Selected'
        export const SHOW_ARCHIVED: string = 'Workflows: Show Archived Workflows'
        export const NEW_WORKFLOW_IS_CREATED_FROM_KICK_OFF_WORKFLOW_ACTION: string = 'Workflows: New Workflow Is Created From Kick Off Workflow Action'
        export const WORKFLOW_MARKED_COMPLETE_OR_CANCELLED: string = 'Workflows: Marked Complete Or Cancelled'
        export const CREATE_SNAPSHOT: string = 'Workflows: Create Snapshot'
    }

    export namespace WorkflowTemplate {
        export const ADD_OR_EDIT_STEP: string = 'WorkflowTemplate.AddOrEditStep'
        export const ISACTIVE_CHANGED: string = 'WorkflowTemplate.IsActive'
        export const REFRESH_SELECTED_TEMPLATE: string = 'WorkflowTemplate.Refresh'
        export const BEGIN_STEP_DRAG: string = 'WorkflowTemplate.BeginStepDrag'
        export const REGISTER_STEP_DRAG_OVER: string = 'WorkflowTemplate.RegisterStepDragOver'
        export const REGISTER_STEP_DRAG_OVER_CHILD: string = 'WorkflowTemplate.RegisterStepDragOverChild'
        export const END_STEP_DRAG: string = 'WorkflowTemplate.EndStepDrag'
        export const SELECT_TEMPLATE_ID: string = 'WorkflowTemplate.SelectedTemplateId'
        export const SEND_QUESTIONNAIRE_STEP_ERROR_MESSAGE: string = 'WorkflowTemplate.SendQuestionnaireStepError'
        export const USE_THIS_TEMPLATE_COMPLETED: string = 'WorkflowTemplate.UseThisTemplateCompleted'
        export const MOVE_STEP: string = 'WorkflowTemplate.MoveStep'

    }

    export namespace VendorAssessment {
        export const UPDATE_CHART_DATA: string = 'VendorAssessment: UpdateChartData';
        export const TAB_SWITCH: string = 'VendorAssessment : TabSwitch';
        export const LOAD_SELECTED_ASSESSMENT: string = 'VendorAssessment:LoadSelectedAssessment';
        export const REQUEST_SELECTED_ASSESSMENT: string = 'VendorAssessment:RequestSelectedAssessment';
        export const NAVIGATE_TO_LIBRARY: string = 'VendorAssessment:NavigateToLibrary';
    }

    export namespace Payment {
        export const PAYMENT_PROCESSED: string = 'Payment:PaymentProcessed';
    }

    export namespace ClientAssessment {
        export const UPDATE_CART_DATA: string = "ClientAssessment: UpdateCartData";
        export const UPDATE_CART_COUNT: string = "ClientAssessment: UpdateCartCount";
        export const VIEW_ASSESSMENTS: string = 'ClientAssessment:ViewAssessments';
    }

    export namespace ControlAssessment {
        export const ASSESSMENT_DATA_LOADED: string = 'ControlAssessment: AssessmentLoaded';
        export const ASSESSMENT_URL_GENERATED: string = "ControlAssessment: UrlGenerated";
        export const ASSESSMENT_URL_REQUESTED: string = 'ControlAssessment:UrlRequested';
        export const ASSESSMENT_URL_SENT: string = 'ControlAssessment:UrlSent';
    }

    export namespace OversightDashboard {
        export const DOWLOAD_EXCEL: string = 'OversightDashboard: DownloadExcelFile'
    }

    export namespace VenminderExchange {
        export namespace Vendors {
            export const NEW_QUESTIONNAIRE_STARTED: string = 'VenminderExchange:NewVendorQuestionnaireStarted';
            export const VENDOR_QUESTIONNAIRE_EDITED: string = 'VenminderExchange:VendorQuestionnaireEdited';
            export const QUESTIONNAIRE_LIBRARY_NAVIGATED: string = 'VenminderExchange:QuestionnaireLibraryNavigated';
            export const DRAFT_TEMPLATE_QUESTIONNAIRE_DOWNLOADED: string = 'VenminderExchange:TemplateQuestionnaireDownloaded';
            export const HISTORY_LIST_REFRESHED: string = 'VenminderExchange:Vendors:HistoryListRefreshed';
        }
        export namespace Clients {
            export const SELECTED_ASSESSMENT_LOADED: string = 'VenminderExchange:Clients:SelectedAssessmentLoaded';
            export const SELECTED_VENDOR_REQUESTED: string = 'VenminderExchange:Clients:SelectedVendorRequested';
            export const SELECTED_ASSESSMENT_REQUESTED: string = 'VenminderExchange:Clients:SelectedAssessmentRequested';
        }
    }

    export namespace ContractUpload {
        export const CONTRACT_SUBMIT_BUTTON_AVAILABLE: string = 'ContractUpload:ContractSubmitButtonAvailable';
        export const CONTRACT_UPLOAD_SUBMIT: string = 'ContractUpload:ContractUploadSubmit';
        export const CONTRACT_UPLOAD_COMPLETE: string = 'ContractUpload:ContractUploadComplete';
    }

    export namespace WizardDialog {
        export const CURRENT_STEP_CHANGED: string = 'WizardDialog:CurrentStepChanged';
        export const CLOSE_DIALOG: string = 'WizardDialog:CloseDialog';
        export const COMPLETED: string = 'WizardDialog:Completed';
    }

    export namespace ExecutiveLevelAnalysis {
        export const QUEUE_APPLY_FILTERS: string = 'ExecutiveLevelAnalysisQueue:ApplyFilters';
        export const QUEUE_FILTERS_APPLIED: string = 'ExecutiveLevelAnalysisQueue:FiltersApplied';
    }

	export namespace Shared {
		export const SHARED_DISABLE_MARK_COMPLETED: string = 'Shared: DisableMarkCompleted';
    }
}
/* eslint-enable @typescript-eslint/no-namespace */