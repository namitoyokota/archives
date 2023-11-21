/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-namespace */
import { hasValue, isNullOrUndefined, stringsEqual } from './utilities/globals';
import appsettings from '../../../config/appsettings.json';
import { EndpointBase, QueryStringParameter, QueryStringParameterReplacementRule, QueryStringParameterRule } from './endpoint-base';


export class Endpoint extends EndpointBase {
    constructor(public name: string, protected rootPath: string, public isRemote: boolean = false, public parameterReplacementRule: QueryStringParameterReplacementRule = QueryStringParameterReplacementRule.valueOnlyWithSlashes, public parameterRules: QueryStringParameterRule[] = []) {
        super(name, rootPath, isRemote, parameterReplacementRule, parameterRules);
    }

    override getPath(params: QueryStringParameter[] = []): string {
        const requiredQueryStringParameters = this.parameterRules.filter((pr) => pr.isRequired);
        const missingParameters = requiredQueryStringParameters.filter((rpr) => !hasValue(params.find((p) => stringsEqual(p.name, rpr.name, false, true))));

        if (missingParameters.length) {
            throw new Error(`The following required query string parameters are missing: ${missingParameters.join(', ')}.`);
        }

        let path = this.isRemote ? appsettings.AppUrl + this.rootPath : appsettings.RsdUrl + this.rootPath;

        if (this.parameterRules.length) {
            let separatorToken = this.parameterReplacementRule === QueryStringParameterReplacementRule.nameEqualsValue ? '?' : '/';

            this.parameterRules.forEach((pr: QueryStringParameterRule) => {
                const param: QueryStringParameter = params.find((p) => stringsEqual(p.name, pr.name, false, true));

                if (!isNullOrUndefined(param)) {
                    const paramString = param.getParameter(this.parameterReplacementRule);
                    path = `${path}${separatorToken}${paramString}`;

                    if (this.parameterReplacementRule === QueryStringParameterReplacementRule.nameEqualsValue) {
                        separatorToken = '&';
                    }
                }
            });
        }

        return path;
    }
}

export namespace Endpoints {
    export namespace Api {
        export namespace AWS {
            export const GET_CUSTOMER_INFORMATION = new Endpoint('getCustomerInformation', '/api/aws/GetCustomerInformation', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('token', true, 1)]);
        }

        export namespace Global {
            export const GET_LOGS = new Endpoint('getLogs', '/api/Log/GetLogs');
            export const GET_ERROR_IDENTIFIERS = new Endpoint('getLocalizedErrorMessagesMetaData', '/api/Developers/GetLocalizedErrorMessagesMetaData');
            export const LOG = new Endpoint('log', '/api/Log/WriteLog');
            export const GET_PHONE_NUMBER_TYPES = new Endpoint('getPhoneType', '/api/CodeTables/GetPhoneNumberTypes', true);
            export const GET_APP_SETTINGS = new Endpoint('getStandardConfiguration', '/api/App/GetAppSettings');
            export const GET_LAYOUT_INFORMATION = new Endpoint('getLayoutInformation', '/api/App/GetLayoutInformation');
            export const HAS_ACCESS_TO_CONTROL_ASSESSMENTS = new Endpoint('getLayoutInformation', '/api/App/HasAccessToControlAssessments');
            export const LAYOUT_SEND_EMAIL = new Endpoint('layoutSendEmail', '/api/Layout/Send', true);
            export const RESEND_INVITATION = new Endpoint('resendInvitation', '/api/Invitation/ResendInvitation', true);
            export const SEND_SALES_INQUIRY = new Endpoint('sendSalesInquiry', '/api/FI/FILayout/SendSalesInquiry', true);
            export const ADD_PRODUCT_CATEGORY = new Endpoint('addProductCategoryGlobal', '/api/ProductCategory/CreateProductCategory');
            export const UPDATE_PRODUCT_CATEGORY = new Endpoint('updateProductCategory', '/api/ProductCategory/UpdateProductCategory');
            export const GET_PROGRESS = new Endpoint('getProgress', '/api/Progress/GetProgress', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('id', true, 1), new QueryStringParameterRule('lastStatusDate', true, 2)]);
            export const GET_GUID = new Endpoint('getGuid', '/api/Guid/Get');
            export const GET_PRODUCT_LIST = new Endpoint('addProductList', '/api/ProductCategory/GetProductListByCategory');
            export const USE_LITE_WIDGETS = new Endpoint('useLiteWidgets', '/api/App/UseLiteWidgets');

            export namespace Users {
                export const CREATE_USER = new Endpoint('createUser', '/api/Contact/Create', true);
                export const DOWNLOAD_USERS: Endpoint = new Endpoint('exportUsersList', '/api/User/ExportUsersList');
                export const GET_ALL_PENDING_INVITATIONS: Endpoint = new Endpoint('getAllPendingInvitations', '/api/User/GetAllPendingInvitations');
                export const GET_INBOX_MESSAGE_COUNT = new Endpoint('getUnreadInboxMessageCount', '/api/InboxMessage/GetInboxMessageCount', true);
                export const GET_USER_INFO = new Endpoint('getUserInfo', '/api/User/GetUserInfo');
                export const GET_USER_ROLES_INFO = new Endpoint('getUserRolesInfo', '/api/User/GetUserRolesInfo');
                export const HAS_EVENT = new Endpoint('doesLoggedInUserHaveEvent', '/api/EventLog/DoesLoggedInUserHaveEvent', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('eventTypeName')]);
                export const IS_FEATURE_ON_FOR_USER = new Endpoint('isFeatureOnForUser', '/api/User/IsFeatureOnForUser');
                export const ARE_FEATURES_ON_FOR_USER = new Endpoint('areFeaturesOnForUser', '/api/User/AreFeaturesOnForUser');
                export const IS_USER_AUTHENTICATED = new Endpoint('isUserAuthenticated', '/api/User/IsUserAuthenticated');
                export const LOG_EVENT = new Endpoint('logEventForLoggedInUser', '/api/EventLog/LogEventForLoggedInUser');
                export const SEND_ALL_PENDING_INVITATIONS: Endpoint = new Endpoint('sendAllPendingInvitations', '/api/User/SendAllPendingInvitations');
                export const GET_ZENDESK_CHAT_TOKEN = new Endpoint('getZendeskChatToken', '/api/User/GetZendeskChatToken');
                export const GET_EXISTING_TEMP_PASSWORD = new Endpoint('getExistingTempPassword', '/api/PasswordAdmin/GetExistingTemporaryPassword');
                export const ISSUE_TEMPORARY_PASSWORD = new Endpoint('issueTemporaryPassword', '/api/PasswordAdmin/IssueTemporaryPassword');
                export const GET_USER_INFO_BY_CONTACT_ID = new Endpoint('getUserInfoByContactID', '/api/User/GetUserInfoByContactID');
            }

            export namespace PageState {
                export const DELETE = new Endpoint('pageState-delete', '/api/PageState/Delete');
                export const GET = new Endpoint('pageState-get', '/api/PageState/Get');
                export const GET_BY_ID = new Endpoint('pageStateGetById', '/api/PageState/GetById');
                export const STORE = new Endpoint('pageState-store', '/api/PageState/Store');
                export const STORE_PERMANENTLY = new Endpoint('pageState-storePermanently', '/api/PageState/StorePermanently');
            }

            export namespace International {
                export const GET_INTERNATIONAL_CODES = new Endpoint('getInternationalCodes', '/api/International/GetInternationalCodes');
                export const GET_US_STATES = new Endpoint('getUSStates', '/api/International/GetUSStates');
                export const GET_ALL_VENDOR_INDUSTRY_TYPES = new Endpoint('getAllVendorIndustryTypes', '/api/International/GetAllVendorIndustryTypes');
            }
        }

        export namespace Contact {
            export const IS_EMAIL_BLACKLISTED = new Endpoint('isEmailBlacklisted', '/api/Contact/IsEmailBlacklisted');
        }

        export namespace VenminderAdmin {
            export const ADD_TEMPORARY_DOCUMENTS = new Endpoint('addTemporaryDocuments', '/api/DCAdmin/AddTemporaryDocuments');
            export const DISMISS_CLIENT_PRODUCT = new Endpoint('dismissClientProduct', '/api/DCAdmin/DismissClientProduct');
            export const DISMISS_INTERNAL_DOCUMENTATION_FROM_ELA = new Endpoint('dismissInternalDocumentationFromEla', '/api/DCAdmin/DismissInternalDocumentationFromELA');
            export const DISMISS_MULTIPLE_INTERNAL_DOCUMENTATION_FROM_ELA = new Endpoint('dismissMultipleInternalDocumentationFromEla', '/api/DCAdmin/DismissMultipleInternalDocumentationFromELA');
            export const DISMISS_INTERNAL_DOCUMENTATION_FROM_SERVICE_ORDER_ITEM = new Endpoint('dismissInternalDocumentationFromServiceOrderItem', '/api/DCAdmin/DismissInternalDocumentationFromServiceOrderItem');
            export const DISMISS_MULTIPLE_INTERNAL_DOCUMENTATION_FROM_SERVICE_ORDER_ITEM = new Endpoint('dismissMultipleInternalDocumentationFromServiceOrderItem', '/api/DCAdmin/DismissMultipleInternalDocumentationFromServiceOrderItem');
            export const GET_ARGOS_USERS_FOR_FI = new Endpoint('getArgosUsers', '/api/DCAdmin/FIAdmin/GetArgosUsersForFI', true);
            export const GET_DOCUMENT_TYPES = new Endpoint('getDocumentTypes', '/api/DCAdmin/GetDocumentTypes');
            export const GET_FULFILLMENT_CATEGORIES = new Endpoint('getFulfillmentCategories', '/api/DCAdmin/GetFulfillmentCategories');
            export const GET_FULFILLMENT_DOCUMENT_INFORMATION = new Endpoint('getFulfillmentDocumentInformation', '/api/DCAdmin/GetFulfillmentDocumentInformation');
            export const GET_POSSIBLE_DUPLICATE_DOCUMENTS_FOR_ELA = new Endpoint('getPossibleDuplicateDocumentsForELA', '/api/DCAdmin/GetPossibleDuplicateDocumentsForELA');
            export const GET_PRIVATE_DOCUMENT_IDS_FOR_CONTACT = new Endpoint('getPrivateDocuments', '/api/DCAdmin/FIContact/GetPrivateDocumentIDsForContact', true);
            export const REASSIGN_PRIVATE_DOCUMENTS = new Endpoint('reassignPrivateDocument', '/api/DCAdmin/FIContact/ReassignPrivateDocuments', true);
            export const SAVE_FULFILLMENT_DOCUMENT_DATA = new Endpoint('saveFulfillmentDocumentData', '/api/DCAdmin/SaveFulfillmentDocumentData');
            export const UNLOCK_USER = new Endpoint('unlockUser', '/api/PasswordResetRequests/Create', true);
            export const AUTHORIZE_CLIENT_TO_ACCESS_FULFILLMENT_DOCUMENT = new Endpoint('saveFulfillmentDocumentData', '/api/DCAdmin/AuthorizeClientToAccessFulfillmentDocument');
            export const GET_CLIENT_PRODUCTS_WITHOUT_FULFILLMENT_VENDOR = new Endpoint('getClientProductsWithoutFulfillmentVendor', '/api/DCAdmin/GetClientProductsWithoutFulfillmentVendor');
            export const UPDATE_CLIENT_PRODUCTS_WITHOUT_FULFILLMENT_VENDOR = new Endpoint('updateClientProductsWithoutFulfillmentVendor', '/api/DCAdmin/UpdateClientProductsWithoutFulfillmentVendor');
            export const GET_WHITELISTED_CLIENTS = new Endpoint('getWhitelistedClients', '/api/DCAdmin/GetWhitelistedClients');
            export const APPROVE_OR_DENY_USERS = new Endpoint('approveOrDenyUsers', '/api/DCAdmin/ApproveOrDenyUsers');
            export const GET_FEATURES = new Endpoint('getFeatures', '/api/Feature/GetAllFeatures');
            export const IS_FEATURE_ON_FOR_ANYONE = new Endpoint('isFeatureOnForAnyone', '/api/VendorFeature/IsFeatureOnForAnyone');
            export const SEARCH_FI = new Endpoint('searchFinancialInstitution', '/api/Client/GetClientDetails');
            export const SEARCH_VENDOR = new Endpoint('searchVendor', '/api/VendorProducts/GetVendorDetails');
            export const UPDATE_ENTITY_FEATURE = new Endpoint('updateEntityFeatures', '/api/Feature/UpdateEntityFeatures');

            export namespace Sales {
                export const GET_ALL_CONTRACTED_CLIENTS = new Endpoint('getAllContractedClients', '/api/CustomerOrderInformation/GetAllContractedClients', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('requestedDate', true, 1)]);
                export const GET_CUSTOMER_ORDER_INFORMATION = new Endpoint('getCustomerOrderInformation', '/api/CustomerOrderInformation/GetCustomerOrderInformation', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('requestedDate', true, 2)]);
                export const GET_ALL_LINE_ITEM_TYPES = new Endpoint('getAllLineItemTypes', '/api/Sales/GetAllLineItemTypes');
                export const GET_ALL_CUSTOMER_ORDERS_FILE = new Endpoint('getAllCustomerOrdersFile', '/api/CustomerOrderInformation/GetAllCustomerOrdersFile', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('progressId', true, 1), new QueryStringParameterRule('requestedDate', true, 2)]);
                export const SAVE_NEW_VENDOR_SALE = new Endpoint('saveNewVendorSale', '/api/VendorSale/SaveNewVendorSale');
                export const MODIFY_VENDOR_CUSTOMER_ORDER = new Endpoint('modifyVendorCustomerOrder', '/api/VendorSale/ModifyVendorCustomerOrder');
                export const UPLOAD_INITIAL_SALE_DOCUMENT = new Endpoint('uploadInitialSaleDocument', '/api/VendorSale/UploadInitialSaleDocument');
                export const GET_ALL_SALES_TEAM_MEMBERS = new Endpoint('getAllSalesTeamMembers', '/api/Sales/GetAllSalesTeamMembers');
                export const GET_CUSTOMER_ORDER_DETAILS = new Endpoint('GetCustomerOrderDetails', '/api/Sales/GetCustomerOrderDetails');
                export const UPDATE_LINE_ITEM_VALUES = new Endpoint('UpdateLineItemValues', '/api/Sales/UpdateLineItemValues');
                export const UPDATE_MONTHLY_AMOUNT = new Endpoint('UpdateMonthlyAmount', '/api/Sales/UpdateMonthlyAmount');
                export const UPDATE_ANNUAL_AMOUNT = new Endpoint('UpdateAnnualAmount', '/api/Sales/UpdateAnnualAmount');

                export namespace Vendor {
                    export const GET_EXCHANGE_VENDOR_CUSTOMER_ORDER = new Endpoint('getExchangeVendorCustomerOrder', '/api/VendorSale/GetExchangeVendorCustomerOrder');
                }
            }

            export namespace Dashboard {
                export const GET_DASHBOARD_BUTTONS = new Endpoint('GetDashboardButtons', '/api/DCAdmin/Dashboard/GetDashboardButtons');
                export const TOGGLE_FAVORITE_BUTTON = new Endpoint('ToggleFavoriteButton', '/api/DCAdmin/Dashboard/ToggleFavoriteButton');
            }

            export namespace Developers {
                export const GET_DATA_IMPORT_EXCEL = new Endpoint('getDataImportExcel', '/api/Developers/GetDataImportExcel');
                export const GET_ASSESSMENT_TEMPLATES = new Endpoint('getAllAssessmentTemplates', '/api/Developers/GetAllAssessmentTemplates');
                export const UPDATE_ASSESSMENT_TEMPLATE = new Endpoint('updateAssessmentTemplate', '/api/Developers/UpdateAssessmentTemplate');
                export const GET_EMAIL_TEMPLATES = new Endpoint('getAllEmailTemplates', '/api/Developers/GetAllEmailTemplates');
                export const ACTIVATE_EMAIL_TEMPLATE = new Endpoint('activateEmailTemplate', '/api/Developers/ActivateEmailTemplate');
                export const DEACTIVATE_EMAIL_TEMPLATE = new Endpoint('deactivateEmailTemplate', '/api/Developers/DeactivateEmailTemplate');
                export const REFRESH_LOCALIZED_MESSAGE_CACHE = new Endpoint('refreshLocalizedMessageCache', '/api/Developers/RefreshLocalizedMessageCache');
                export const FETCH_ALL_LOCALIZED_MESSAGES = new Endpoint('getAllLocalizedMessages', '/api/Developers/GetAllLocalizedMessages');
            }

            export namespace VmUsers {
                export const GET_VM_USERS = new Endpoint('getVmUsers', '/api/VmUsers/GetUsers');
                export const GET_VM_USER = new Endpoint('getVmUser', '/api/VmUsers/GetUser', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('id', true, 1)]);
                export const SET_USER_ACTIVE_STATUS = new Endpoint('setUserActiveStatus', '/api/VmUsers/SetUserActiveStatus');
                export const GET_VM_ROLES = new Endpoint('getVmRoles', '/api/VmUsers/GetRoles');
                export const UPDATE_VM_USER = new Endpoint('updateVmUser', '/api/VmUsers/UpdateUser');
                export const CREATE_VM_USER = new Endpoint('createVmUser', '/api/VmUsers/CreateUser');
                export const GET_VM_SYSTEM_USERS = new Endpoint('getVmSystemUser', '/api/VmUsers/GetAllSystemUsers');
                export const IS_USER_VENMINDER_ADMIN = new Endpoint('isUserVenminderAdmin', '/api/VmUsers/IsUserVenminderAdmin');
            }

            export namespace GlobalVariables {
                export const GET_GLOBAL_VARIABLES = new Endpoint('getGlobalVariables', '/api/GlobalVariables/GetGlobalVariables');
                export const SAVE_GLOBAL_VARIABLE = new Endpoint('saveGlobalVariables', '/api/GlobalVariables/SaveGlobalVariable');
                export const DELETE_GLOBAL_VARIABLE = new Endpoint('deleteGlobalVariables', '/api/GlobalVariables/DeleteGlobalVariable', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('name', true, 1)]);
            }

            export namespace ClientSupport {
                export const GET_CLIENT_TYPES = new Endpoint('getClientTypes', '/api/ClientSupport/GetClientTypes');
                export const UPDATE_CLIENT = new Endpoint('updateClient', '/api/ClientSupport/UpdateClient');

                export namespace Ela {
                    export const GET_TEMPLATES_FOR_CLIENT = new Endpoint('getTemplatesForClient', '/api/ClientSupportEla/GetTemplatesForClient', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1)]);
                    export const GET_UPLOAD_HISTORY = new Endpoint('getUploadHistory', '/api/ClientSupportEla/GetUploadHistory', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('templateId', true, 2), new QueryStringParameterRule('isEnterprise', true, 3)]);
                    export const GET_BILLING_FOR_TEMPLATE = new Endpoint('getBillingForTemplate', '/api/ClientSupportEla/GetbillingForTemplate', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('templateId', true, 2), new QueryStringParameterRule('isEnterprise', true, 3)]);
                    export const GET_COMPLETED_ORDER_COMMENTS = new Endpoint('getCompletedOrderComments', '/api/ClientSupportEla/GetCompletedOrderComments', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('orderId', true, 1)]);
                }
            }
        }

        export namespace ELA {
            export const ADD_ELA_ATTACHMENT = new Endpoint('AddElaAttachment', '/api/ELA/AddElaAttachment');
            export const ADD_SERVICE_ORDER_COMMENT_FOR_ELA = new Endpoint('addServiceOrderCommentForELA', '/api/ELA/AddServiceOrderComment');
            export const ADD_FULFILLMENT_VENDOR_NOTE = new Endpoint('addFulfillmentVendorNote', '/api/VendorNotes/AddFulfillmentVendorNote');
            export const GET_ELA_REVIEWERS_AND_USERS = new Endpoint('getELAReviewersAndUsers', '/api/ELA/GetELAReviewersAndUsers');
            export const GET_ORDER_DETAILS_FOR_MODIFICATION = new Endpoint('getOrderDetailsForModification', '/api/ELA/GetOrderDetailsForModification');
            export const GET_DEADLINE_WITH_BUSINESS_DAYS = new Endpoint('getDeadlineWithBusinessDays', '/api/ELA/GetDeadlineWithBusinessDays', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('submitDate'), new QueryStringParameterRule('deadLineDays')]);
            export const GET_SOC_SUB_TYPES = new Endpoint('getSOCSubTypes', '/api/ELA/GetSOCSubTypes');
            export const REMOVE_FILE_FOR_ELA = new Endpoint('RemoveFileForELA', '/api/ELA/RemoveFileForELA');
            export const REMOVE_SERVICE_ORDER_DOCUMENT = new Endpoint('removeServiceOrderDocument', '/api/ELA/RemoveServiceOrderDocument');
            export const UPDATE_ELA = new Endpoint('updateELA', '/api/ELA/UpdateELA');
            export const UPDATE_REPORT_TYPES = new Endpoint('updateReportTypes', '/api/ELA/UpdateReportTypes');
            export const UPDATE_RUSH_ORDER_STATUS = new Endpoint('updateRushOrderStatus', '/api/ELA/UpdateRushOrderStatus');
            export const GET_MODIFY_SERVICEORDERITEMDETAILS_BY_SERVICEORDERITEMID = new Endpoint('getModifySeviceOrderItemDetailsByServiceOrderItemID', '/api/ELA/GetModifySeviceOrderItemDetailsByServiceOrderItemID');
            export const GET_ELA_FULFILLMENT_DETAILS = new Endpoint('getElaFulfillmentDetails', '/api/ELA/GetELAFulfillmentDetails');
            export const UPDATE_ELA_FULFILLMENT_VENDOR = new Endpoint('updateElaFulfillmentVendor', '/api/ELA/UpdateELAFulfillmentVendor');
            export const UPDATE_ELA_FULFILLMENT_PRODUCT = new Endpoint('updateElaFulfillmentProduct', '/api/ELA/UpdateELAFulfillmentProduct');
            export const GET_FI_VENDOR_RELATIONSHIP_ID = new Endpoint('getFIVendorRelationshipID', '/api/ELA/GetELAFIVendorRelationshipID');
            export const SAVE_ELA_DOCUMENTATION_SELECTION = new Endpoint('saveElaDocumentationSelection', '/api/ELA/SaveELADocumentationSelection');
            export const CHECK_FOR_PREVIOUS_EMAIL_SENT = new Endpoint('checkForPreviousEmailSent', '/api/ELA/CheckForPreviousEmailSent');
            export const GET_RELATED_RSO_RELATIONSHIPS_WITH_OPEN_ELAS = new Endpoint('getRelatedRSORelationshipsWithOpenELAs', '/api/ELA/GetRelatedRSORelationshipsWithOpenELAs', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId'), new QueryStringParameterRule('vendorNicknameId')]);
            export const GET_DOCUMENTATION_UTILIZED_FOR_ELA = new Endpoint('getDocumentationUtilizedForELA', '/api/ELA/GetDocumentationUtilizedForELA');
            export const GET_DOCUMENTATION_UTILIZED_FOR_ONLINE_REVIEW = new Endpoint('getDocumentationUtilizedForOnlineReview', '/api/ELA/GetDocumentationUtilizedForOnlineReview');
            export const GET_ELA_TEMPLATE_DETAILS = new Endpoint('GetELATemplateDetails', '/api/ELA/GetELATemplateDetails');
            export const GET_ELA_DUPLICATE_LIBRARY = new Endpoint('GetELADuplicateLibrary', '/api/ELA/GetELADuplicateLibrary');
            export const CREATE_ELA_DUPLICATE = new Endpoint('CreateELADuplicate', '/api/ELA/CreateELADuplicate');
            export const DELETE_DUPLICATE_INFORMATION = new Endpoint('DeleteDuplicateInformation', '/api/ELA/DeleteDuplicateInformation');
            export const GET_OPEN_CLIENT_VENDOR_ORDERS = new Endpoint('GetOpenOrdersForClientAndVendor', '/api/ELA/GetOpenOrdersForClientAndVendor', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId'), new QueryStringParameterRule('vendorId'), new QueryStringParameterRule('elaId')]);
            export const GET_ATTENTION_REQUIRED_DOCUMENTS = new Endpoint('GetAttentionRequiredDocuments', '/api/ELA/GetAttentionRequiredDocuments');

            export namespace QueueFilters {
                export const GET_CLIENT_FILTERS = new Endpoint('getClientFilters', '/api/ela/Filter/GetClientFilters');
                export const GET_CLIENT_RELATIONSHIP_MANAGER_FILTERS = new Endpoint('getClientRelationshipManagerFilters', '/api/ela/Filter/GetClientRelationshipManagerFilters');
                export const GET_SERVICE_FILTERS = new Endpoint('getServiceFilters', '/api/ela/Filter/GetServiceFilters');
                export const GET_STATUS_FILTERS = new Endpoint('getStatusFilters', '/api/ela/Filter/GetStatusFilters');
                export const GET_VENDOR_FILTERS = new Endpoint('getVendorFilters', '/api/ela/Filter/GetVendorFilters');
                export const GET_VENDOR_RELATIONSHIP_MANAGER_FILTERS = new Endpoint('getVendorRelationshipManagerFilters', '/api/ela/Filter/GetVendorRelationshipManagerFilters');
            }

            export namespace Queue {
                export const GET_ANALYSES_BY_FILTER = new Endpoint('getAnalysesByFilter', '/api/ela/Queue/GetAnalysesByFilter');
                export const GET_QUEUE_DATA_BY_IDS = new Endpoint('getQueueDataByIDs', '/api/ela/Queue/GetQueueDataByIDs');
            }

            export namespace OnlineReview {
                export const COMPLETE_REVIEW = new Endpoint('completeReview', '/api/OnlineReview/CompleteReview');
                export const CREATE_OR_GET_ONLINE_REVIEW_SUMMARY = new Endpoint('createOrGetOnlineReviewSummary', '/api/OnlineReview/CreateOrGetOnlineReviewSummary');
                export const GET_ATTACHED_FILES = new Endpoint('getAttachedFiles', '/api/OnlineReview/GetAttachedFiles');
                export const GET_CISSP_SIGNATURE = new Endpoint('getCISSPSignature', '/api/OnlineReview/GetCISSPSignature');
                export const GET_ELA_CLIENT_INFO = new Endpoint('getELAClientInfo', '/api/OnlineReview/GetELAClientInfo');
                export const GET_ELA_CLIENT_ID = new Endpoint('getELAClientID', '/api/OnlineReview/GetELAClientID');
                export const GET_ELA_TEMPLATE_NAME = new Endpoint('getELATemplateName', '/api/OnlineReview/GetELATemplateName');
                export const GET_REVIEW_HISTORY = new Endpoint('getReviewHistory', '/api/OnlineReview/GetReviewHistory');
                export const GET_REVIEW_HISTORY_RESPONSE = new Endpoint('getReviewHistoryResponse', '/api/OnlineReview/GetReviewHistoryResponse');
                export const GET_SAVED_TEMPLATE = new Endpoint('getSavedTemplate', '/api/OnlineReview/GetSavedTemplate');
                export const GET_SOC_FIELD_INFO_RESPONSE = new Endpoint('getSOCFieldInfoResponse', '/api/OnlineReview/GetSOCFieldInfoResponse');
                export const GET_SOC_INFO = new Endpoint('getSOCInfo', '/api/OnlineReview/GetSOCInfo');
                export const SAVE_CLIENT_FIELDS = new Endpoint('saveClientFields', '/api/OnlineReview/SaveClientFields');
                export const SAVE_FIELDS = new Endpoint('saveFields', '/api/OnlineReview/SaveFields');
                export const SAVE_SOC_INFO = new Endpoint('saveSOCInfo', '/api/OnlineReview/SaveSOCInfo');
                export const UPDATE_PDFID = new Endpoint('updatePDFID', '/api/OnlineReview/UpdatePDFID');
                export const UPDATE_SELECTED_FILES = new Endpoint('updateSelectedFiles', '/api/OnlineReview/UpdateSelectedFiles');
                export const GET_FINANCIAL_ABOUT_INFO = new Endpoint('getFinancialAboutInfo', '/api/OnlineReview/GetFinancialAboutInfo');
                export const GET_WORD_DOWNLOADABLE_DOCUMENT_BY_ONLINE_REVIEW_ID = new Endpoint('getWordDownloadableDocument', '/api/OnlineReview/GetWordDownloadableDocument');
                export const GET_EXCEL_DOWNLOADABLE_DOCUMENT_BY_ONLINE_REVIEW_ID = new Endpoint('getExcelDownloadableDocument', '/api/OnlineReview/GetExcelDownloadableDocument');
            }
        }

        export namespace OnlineOrders {
            export namespace OrderHistory {
                export const ADD_ORDER_ITEM_DOCUMENTS = new Endpoint('addOrderItemDocuments', '/api/OrderHistory/AddOrderItemDocuments');
                export const CANCEL_ORDER_ITEM = new Endpoint('cancelOrderItem', '/api/OrderHistory/CancelOrderItem');
                export const GET_CLOSED_XML_FOR_ORDER_HISTORY_DOWNLOAD_ITEM = new Endpoint('getClosedXMLforOrderHistoryDownloadItem', '/api/OrderHistory/getClosedXMLforOrderHistoryDownloadItem');
                export const GET_COMPLETED_SERVICE_ITEM_DETAILS = new Endpoint('getCompletedServiceItemDetails', '/api/OrderHistory/GetCompletedServiceItemDetails');
                export const GET_CONTENT_REFERENCE_GUIDE_INFO = new Endpoint('getContentReferenceGuideInfo', '/api/OrderHistory/GetContentReferenceGuideInfo');
                export const GET_DOCUMENT_BY_SERVICE_ORDER_ITEM_ID = new Endpoint('getDocumentByServiceOrderItemId', '/api/OrderHistory/GetDocumentByServiceOrderItemId');
                export const GET_ONLINE_REVIEW_INFO_BY_SERVICE_ORDER_ITEM = new Endpoint('getOnlineReviewInfoByServiceOrderItem', '/api/OrderHistory/GetOnlineReviewInfoByServiceOrderItem');
                export const GET_ORDER_DETAILS = new Endpoint('getOrderDetails', '/api/OrderHistory/GetOrderDetails');
                export const GET_ORDER_HISTORY_SAVED_FILTERS = new Endpoint('getOrderHistorySavedFilters', '/api/OrderHistory/GetOrderHistorySavedFilters');
                export const GET_ORDER_ID = new Endpoint('getOrderId', '/api/OrderHistory/GetOrderID');
                export const GET_SERVICE_ORDER_HISTORY_DOWNLOAD = new Endpoint('getServiceOrderHistoryDownload', '/api/CSV/SaveToTemp', true);
                export const GET_SERVICE_ORDER_ITEM_STATUSES = new Endpoint('getServiceOrderItemStatuses', '/api/OrderHistory/GetServiceOrderItemStatuses');
                export const GET_SERVICE_ORDERS_BY_ITEM = new Endpoint('getServiceOrdersByItem', '/api/OrderHistory/GetServiceOrdersByItem');
                export const UPDATE_SERVICE_ORDER_ITEM_STATUS = new Endpoint('updateServiceOrderItemStatus', '/api/OrderHistory/updateServiceOrderItemStatus');
            }

            export namespace OrderVerification {
                export const ADD_NEW_SERVICE_ORDER_ITEM = new Endpoint('addNewServiceOrderItem', '/api/OrderVerification/AddNewServiceOrderItem');
                export const ADD_NEW_VENDOR_PRODUCT = new Endpoint('addNewVendorProduct', '/api/OrderVerification/AddNewVendorProduct');
                export const ADD_SERVICE_ORDER_COMMENT = new Endpoint('addServiceOrderComment', '/api/OrderVerification/AddServiceOrderComment');
                export const ADD_NEW_VENDOR_CONTACT = new Endpoint('addNewVendorContact', '/api/OrderVerification/AddNewVendorContact');
                export const ALL_USERS = new Endpoint('allUsers', '/api/OrderVerification/AllUsers');
                export const CANCEL_SERVICE_ORDER_ITEMS = new Endpoint('cancelServiceOrderItems', '/api/OrderVerification/CancelServiceOrderItems');
                export const CLAIM_ORDER = new Endpoint('claimOrder', '/api/OrderVerification/ClaimOrder');
                export const DELETE_SERVICE_ORDER_COMMENT = new Endpoint('deleteServiceOrderComment', '/api/OrderVerification/DeleteServiceOrderComment');
                export const EXPORT_VENDOR_CONTACT = new Endpoint('exportVendorContact', '/api/OrderVerification/ExportVendorContact');
                export const GET_FUTURE_DATED_ORDER_ITEMS = new Endpoint('getFutureDatedOrderItems', '/api/OrderVerification/GetFutureDatedOrderItems');
                export const GET_ORDER_DETAILS_FOR_VERIFICATION = new Endpoint('getOrderDetailsForVerification', '/api/OrderVerification/GetOrderDetailsForVerification');
                export const GET_OVERFULFILLED_ORDERS_DETAILS = new Endpoint('getOverfulfilledOrdersDetails', '/api/OrderVerification/GetOverfulfilledOrdersDetails');
                export const GET_SERVICES_PENDING_VERIFICATION_BY_ORDER_ID = new Endpoint('getServicesPendingVerificationByOrderID', '/api/OrderVerification/GetServicesPendingVerificationByOrderID');
                export const GET_VERIFY_ORDER_INTERNAL_COMMENTS = new Endpoint('getVerifyOrderInternalComments', '/api/OrderVerification/GetVerifyOrderInternalComments');
                export const GET_VERIFY_ORDER_ORDER_CLIENT_INFORMATION = new Endpoint('getVerifyOrderOrderClientInformation', '/api/OrderVerification/GetVerifyOrderOrderClientInformation');
                export const GET_VERIFY_ORDER_VENDOR_DETAILS = new Endpoint('getVerifyOrderVendorDetails', '/api/OrderVerification/GetVerifyOrderVendorDetails');
                export const GET_VERIFY_ORDER_VENDORS_LIST = new Endpoint('getVerifyOrderVendorsList', '/api/OrderVerification/GetVerifyOrderVendorsList');
                export const REASSIGN_ORDER = new Endpoint('reassignOrder', '/api/OrderVerification/ReassignOrder');
                export const SAVE_SERVICE_ORDER_ITEM = new Endpoint('saveServiceOrderItem', '/api/OrderVerification/SaveServiceOrderItem');
                export const SEARCH_FULFILLMENT_PRODUCTS = new Endpoint('searchFulfillmentProducts', '/api/OrderVerification/SearchFulfillmentProducts');
                export const SEARCH_FULFILLMENT_VENDORS = new Endpoint('searchFulfillmentVendors', '/api/OrderVerification/SearchFulfillmentVendors');
                export const UNCLAIM_ORDER = new Endpoint('unclaimOrder', '/api/OrderVerification/UnclaimOrder');
                export const UPDATE_FULFILLMENT_PRODUCT = new Endpoint('updateFulfillmentProduct', '/api/OrderVerification/UpdateFulfillmentProduct');
                export const UPDATE_FULFILLMENT_VENDOR = new Endpoint('updateFulfillmentVendor', '/api/OrderVerification/UpdateFulfillmentVendor');
                export const UPDATE_FULFILLMENT_SUBSERVICE_VENDOR = new Endpoint('updateFulfillmentSubserviceVendor', '/api/OrderVerification/UpdateFulfillmentSubserviceVendor');
                export const VERIFY_SERVICE_ORDER_ITEM = new Endpoint('verifyServiceOrderItem', '/api/OrderVerification/VerifyServiceOrderItem');
                export const GET_VERIFY_ORDER_FIFULFILLMENT_VENDOR = new Endpoint('getVerifyOrderFIFulfillmentVendor', '/api/OrderVerification/GetVerifyOrderFIFulfillmentVendor');
                export const GET_DOCUMENTATION_UTILIZED_FOR_SERVICE_ORDER_ITEM = new Endpoint('getDocumentationUtilizedForServiceOrderItem', '/api/OrderVerification/GetDocumentationUtilizedForServiceOrderItem');
                export const REPLACE_SERVICE_ORDER_ITEMS = new Endpoint('replaceServiceOrderItems', '/api/OrderVerification/ReplaceServiceOrderItems');
                export const GET_VENDOR_SNAPSHOT_VERIFICATION_DATA = new Endpoint('getVendorSnapshotVerificationData', '/api/OrderVerification/GetVendorSnapshotVerificationData');
                export const GET_VENDOR_SNAPSHOT_DATA_PARTNER_PORTFOLIO_STATUS = new Endpoint('getVendorSnapshotDataPartnerPortfolioStatus', '/api/OrderVerification/GetVendorSnapshotDataPartnerPortfolioStatus');
            }

            export namespace ReviewOrder {
                export const DELETE_ORDER = new Endpoint('deleteOrder', '/api/ReviewOrder/DeleteOrder');
                export const DELETE_VENDOR_AND_SERVICES = new Endpoint('deleteVendorAndServices', '/api/ReviewOrder/DeleteVendorAndServices');
                export const GET_CART_DETAILS_FOR_ORDER = new Endpoint('getCartDetailsForOrder', '/api/ReviewOrder/GetCartDetailsForOrder');
                export const GET_REORDER_BALANCE_DETAILS = new Endpoint('getReorderBalanceDetails', '/api/ReviewOrder/GetReorderBalanceDetails');
                export const GET_SUBMITTED_ORDER_DETAILS_FOR_DOC_COLLECTION = new Endpoint('getSubmittedOrderDetailsForDocCollection', '/api/ReviewOrder/GetSubmittedOrderDetailsForDocCollection');
                export const GET_WAITING_ORDER_BALANCE_DETAILS = new Endpoint('getWaitingOrderBalanceDetails', '/api/ReviewOrder/GetWaitingOrderBalanceDetails');
                export const GET_WAITING_ORDER_DETAILS = new Endpoint('getWaitingOrderDetails', '/api/ReviewOrder/GetWaitingOrderDetails');
                export const SUBMIT_DOCUMENT_COLLECTION_ORDER = new Endpoint('submitDocumentCollectionOrder', '/api/ReviewOrder/SubmitDocumentCollectionOrder');
                export const SUBMIT_ORDER = new Endpoint('submitOrder', '/api/ReviewOrder/SubmitOrder');
                export const REMOVE_SERVICE_ORDER_ITEM_FROM_CART = new Endpoint('removeServiceOrderItemFromCart', '/api/ReviewOrder/RemoveServiceOrderItemFromCart');
            }

            export namespace ServiceOrders {
                export const ADD_TO_ORDER = new Endpoint('addToOrder', '/api/RSD/AddToOrder');
                export const ADD_VENDOR_CONTACT = new Endpoint('addVendorContact', '/api/RSD/AddVendorContact');
                export const GET_ALL_SERVICES = new Endpoint('getAllServices', '/api/RSD/GetAllServices');
                export const GET_CANCELLED_ORDER_ITEM_DETAILS = new Endpoint('getCancelledOrderItemDetails', '/api/RSD/GetCancelledOrderItemDetails');
                export const GET_CURRENT_BUILD_ORDER_BALANCE = new Endpoint('getCurrentBuildOrderBalance', '/api/RSD/GetCurrentBuildOrderBalance');
                export const GET_CURRENT_VENDOR_INFO_FOR_CLIENT = new Endpoint('getCurrentVendorInfoForClient', '/api/RSD/GetCurrentVendorInfoForClient');
                export const GET_OPEN_SERVICE_ORDERS_FOR_REASSIGN = new Endpoint('getOpenServiceOrdersForReassign', '/api/RSD/GetOpenServiceOrdersForReassign');
                export const GET_PRODUCT_SERVICES = new Endpoint('getProductServices', '/api/RSD/GetProductServices');
                export const GET_PRODUCT_SERVICES_RUSH_TYPES = new Endpoint('getProductServicesRushTypes', '/api/RSD/GetProductServicesRushTypes');
                export const GET_PRODUCTS_FOR_VENDOR = new Endpoint('getProductsForVendor', '/api/RSD/GetProductsForVendor');
                export const GET_SERVICE_ORDER_BALANCE = new Endpoint('getServiceOrderBalance', '/api/RSD/GetServiceOrderBalance');
                export const GET_VENDOR_SERVICES = new Endpoint('getVendorServices', '/api/RSD/GetVendorServices');
                export const REASSIGN_OPEN_SERVICE_ORDERS = new Endpoint('reassignOpenServiceOrders', '/api/RSD/ReassignOpenServiceOrders');
                export const UPDATE_ORDER = new Endpoint('updateOrder', '/api/RSD/UpdateOrder');

                export const ADD_CONTRACT_SUMMARY_ORDER_CONTRACT_DCADMIN = new Endpoint('addContractSummaryOrderContractDcAdmin', '/api/ServiceOrders/AddContractSummaryOrderContractAdmin');
                export const ADD_DOCUMENT_STORAGE_DOCUMENTS_TO_SERVICE_ORDER_ITEM = new Endpoint('addDocumentStorageDocumentsToServiceOrderItem', '/api/ServiceOrders/AddDocumentStorageDocumentsToServiceOrderItem');
                export const ADD_DOCUMENTS_TO_SERVICE_ORDER_ITEM = new Endpoint('addDocumentsToServiceOrderItem', '/api/ServiceOrders/AddDocumentsToServiceOrderItem');
                export const ADD_ITEM_TO_SERVICE_ORDER = new Endpoint('addItemToServiceOrder', '/api/ServiceOrders/AddItemToServiceOrder');
                export const CANCEL_SERVICE_ORDER_BY_ORDER_ID = new Endpoint('cancelServiceOrderByOrderId', '/api/ServiceOrders/CancelServiceOrderByOrderID');
                export const GET_ADD_A_VENDOR_LISTS = new Endpoint('getAddAVendorLists', '/api/ServiceOrders/GetAddAVendorLists');
                export const GET_CONTRACT_INFO = new Endpoint('getContractInfo', '/api/ServiceOrders/GetContractInfo');
                export const GET_CONTRACT_INFO_ON_ADMIN_SIDE = new Endpoint('GetContractInfoOnAdminSide', '/api/ServiceOrders/GetContractInfoOnAdminSide');
                export const GET_FUTURE_SERVICE_ORDER_BALANCE = new Endpoint('getFutureServiceOrderBalance', '/api/ServiceOrders/GetFutureServiceOrderBalance');
                export const GET_OPEN_ORDERS_INFO = new Endpoint('getOpenOrdersInfo', '/api/ServiceOrders/GetOpenOrdersInfo');
                export const GET_SERVICE_ORDERS_BY_ORDER = new Endpoint('getServiceOrdersByOrder', '/api/ServiceOrders/GetServiceOrdersByOrder');
                export const GET_SERVICE_ORDERS_BY_VENDOR = new Endpoint('getServiceOrdersByVendor', '/api/ServiceOrders/GetServiceOrdersByVendor');
                export const GET_VENDOR_CONTACTS = new Endpoint('getVendorContacts', '/api/ServiceOrders/GetVendorContacts');
                export const GET_FLEX_ACCOUNTS = new Endpoint('getFlexAccounts', '/api/ServiceOrders/GetFlexAccounts', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', false, 1)]);
                export const SAVE_SERVICE_ORDER_CONTRACT_DOCUMENT = new Endpoint('saveServiceOrderContractDocument', '/api/ServiceOrders/SaveServiceOrderContractDocument');
                export const UPDATE_SERVICE_ORDER_ITEM = new Endpoint('updateServiceOrder', '/api/ServiceOrders/UpdateServiceOrderItem');
                export const UPDATE_SERVICE_ORDERS_SUBMITTERS = new Endpoint('updateServiceOrdersSubmitters', '/api/ServiceOrders/UpdateServiceOrdersSubmitters');
                export const GET_RUSH_TYPES_BY_LINE_ITEM_TYPE = new Endpoint('getServicesRushTypesByLineItemType', '/api/ServiceOrders/GetServicesRushTypesByLineItemType');
            }

            export namespace QuickDeliveryLibrary {
                export const GET_AVAILABLE_CONTROL_ASSESSMENTS = new Endpoint('getAvailableControlAssessments', '/api/QuickDeliveryLibrary/GetAvailableControlAssessments');
                export const GET_CARTED_SERVICE_ORDERS = new Endpoint('getCartedServiceOrderItems', '/api/QuickDeliveryLibrary/GetCartedServiceOrderItems');
                export const ADD_CONTROL_ASSESSMENT_TO_CART = new Endpoint('addControlAssessmentToCart', '/api/QuickDeliveryLibrary/AddControlAssessmentToCart');
                export const REMOVE_CONTROL_ASSESSMENT_FROM_CART = new Endpoint('removeItemFromCart', '/api/QuickDeliveryLibrary/RemoveServiceOrderItemFromCart');
                export const SUBMIT_CONTROL_ASSESSMENT_ORDER = new Endpoint('submitControlAssessmentOrder', '/api/QuickDeliveryLibrary/SubmitControlAssessmentOrder');
                export const SEND_SUPPORT_REQUEST = new Endpoint('sendSupportRequest', '/api/QuickDeliveryLibrary/SendSupportRequest');
                export const SEARCH_CONTROL_ASSESSMENTS_OUTSIDE_CLIENT = new Endpoint('searchControlAssessmentsOutsideClient', '/api/QuickDeliveryLibrary/SearchControlAssessmentsOutsideClient');
                export const DISMISS_SELECTED_CONTROL_ASSESSMENT = new Endpoint('dismissSelectedAssessment', '/api/QuickDeliveryLibrary/DismissSelectedControlAssessment');
                export const DISMISS_ALL_ASSESSMENTS = new Endpoint('dismissAllAssessments', '/api/QuickDeliveryLibrary/DismissAllControlAssessments');
                export const RESTORE_ALL_ASSESSMENTS = new Endpoint('restoreAllAssessments', '/api/QuickDeliveryLibrary/DeleteAllFromControlAssessmentDismissalsTableByUserID');
                export const GET_AUTO_COMPLETE_RESULTS = new Endpoint('getAutoCompleteResults', '/api/QuickDeliveryLibrary/GetAutocompleteResults');
                export const GET_AVAILABLE_CONTROL_ASSESSMENTS_PAGED = new Endpoint('getAvailableControlAssessmentsPaged', '/api/QuickDeliveryLibrary/GetAvailableControlAssessmentsPaged');
            }
        }

        export namespace GlobalSearch {
            export const GET_VENDOR_PRODUCTS_FOR_GLOBAL_SEARCH = new Endpoint('getVendorProductsForGlobalSearch', '/api/GlobalSearch/GetVendorProductsForGlobalSearch', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('searchString', true, 3), new QueryStringParameterRule('searchOption', true, 4)]);
        }

        export namespace Grid {
            export const GET_GRID_SETTINGS_FOR_USER = new Endpoint('getGridSettingsForUser', '/api/Grid/GetGridSettingsForUser', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientID', true, 1), new QueryStringParameterRule('gridName', true, 2)]);
            export const SAVE_GRID_SETTINGS_FOR_USER = new Endpoint('saveGridSettingsForUser', '/api/Grid/SaveGridSettingsForUser');
            export const DELETE_GRID_SETTINGS_FOR_USER = new Endpoint('deleteGridSettingsForUser', '/api/Grid/DeleteGridSettingsForUser');
            //new Endpoint('deleteGridSettingsForUser', '/api/Grid/DeleteGridSettingsForUser', false, QueryStringParameterReplacementRule.valueOnlyWithSlashes, [new QueryStringParameterRule("financialInstitutionID", true, 1), new QueryStringParameterRule("gridID", true, 2)]);
        }

        export namespace VendorLifecycle {
            export const GET_ALL_VENDOR_PRODUCTS_FOR_VENDOR_LIFECYCLE = new Endpoint('getAllVendorProducts', '/api/VendorLifecycle/GetAllVendorProducts', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2)]);
            export const GET_ALL_VENDOR_PRODUCTS_FOR_VENDOR_LIFECYCLE_DYNAMIC_COLUMNS = new Endpoint('getAllVendorProductsDynamicColumns', '/api/VendorLifecycle/GetAllVendorProductsDynamicColumns', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2)]);
            export const GET_VENDOR_LIFE_CYCLE_ONGOING_VENDOR_PRODUCT_INFLIGHT = new Endpoint('getVendorLifecycleOngoingVendorProductInFlight', '/api/VendorLifecycle/GetOngoingVendorProductsInFlight', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2)]);
            export const GET_QUESTIONNAIRE_DETAILS = new Endpoint('getQuestionnaireDetails', '/api/VendorLifecycle/GetQuestionnaireDetails', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('relationshipId', true, 3), new QueryStringParameterRule('isOngoing', true, 4)]);
            export const GET_CONTRACT_DETAILS = new Endpoint('getContractDetails', '/api/VendorLifecycle/Ongoing/GetContractDetails', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('relationshipId', true, 3)]);
            export const GET_OVERSIGHT_DETAILS = new Endpoint('getOversightDetails', '/api/VendorLifecycle/Ongoing/GetOversightDetails', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('vendorNicknameId', true, 3), new QueryStringParameterRule('relationshipId', true, 4)]);
            export const GET_SLA_DETAILS = new Endpoint('getSLADetails', '/api/VendorLifecycle/Ongoing/GetSLADetails', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('relationshipId', true, 3)]);
            export const GET_REVIEW_PERIOD_DETAILS = new Endpoint('getReviewPeriodDetail', '/api/VendorLifecycle/Ongoing/GetReviewPeriodDetail', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('vendorNicknameId', true, 3)]);
            export const GET_ASSESSMENT_DETAILS = new Endpoint('getAssessmentDetails', '/api/VendorLifecycle/Ongoing/GetAssessmentDetails', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('relationshipId', true, 3)]);
            export const GET_ISSUE_DETAILS = new Endpoint('getIssueDetails', '/api/VendorLifecycle/Ongoing/GetIssueDetails', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('relationshipId', true, 3)]);
            export const GET_PROFILESYNC_DETAILS = new Endpoint('getProfileSyncDetails', '/api/VendorLifecycle/Ongoing/GetProfileSyncDetails', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('vendorNicknameId', true, 3)]);
            export const GET_WORKFLOW_DETAILS = new Endpoint('getWorkflowDetails', '/api/VendorLifecycle/Ongoing/GetWorkflowDetails', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('userId', true, 2), new QueryStringParameterRule('relationshipId', true, 3)]);
        }

        export namespace ProfileSync {
            export const GET_PROFILE_SYNC_INFORMATION_DATA_FOR_CLIENT = new Endpoint('getProfileSyncInformationDataForClient', '/api/ProfileSync/GetProfileSyncInformationDataForClient');
            export const GET_PROFILE_SYNC_INFORMATION_DATA = new Endpoint('getProfileSyncInformationData', '/api/ProfileSync/GetProfileSyncInformationData');
            export const GET_SENT_TO_RECIPIENT_PROFILE_SYNC_REQUEST_BY_VENDORNICKNAMEID = new Endpoint('getSentToRecipientProfileSyncRequestByVendorNicknameID', '/api/ProfileSync/GetSentToRecipientProfileSyncRequestByVendorNicknameID');
            export const GET_WAITING_FOR_APPROVAL_PROFILE_SYNC_REQUEST_BY_VENDORNICKNAMEID = new Endpoint('getWaitingForApprovalProfileSyncRequestByVendorNicknameID', '/api/ProfileSync/GetWaitingForApprovalProfileSyncRequestByVendorNicknameID');
            export const CANCEL_PROFILE_SYNC_REQUEST = new Endpoint('cancelProfileSyncRequest', '/api/ProfileSync/CancelProfileSyncRequest');
            export const SEND_PROFILE_SYNC_REQUEST_EMAIL = new Endpoint('sendProfileSyncRequestEmail', '/api/ProfileSync/SendProfileSyncRequestEmail');
            export const SEND_INTERNAL_PROFILE_SYNC_REQUEST_EMAIL = new Endpoint('sendInternalProfileSyncRequestEmail', '/api/ProfileSync/SendInternalProfileSyncRequestEmail');
            export const SEND_PROFILE_SYNC_REQUEST_SUBMITTED_EMAIL = new Endpoint('sendProfileSyncRequestSubmittedEmail', '/api/ProfileSync/SendProfileSyncRequestSubmittedEmail');
            export const SEND_PROFILE_SYNC_REQUEST = new Endpoint('sendProfileSyncRequest', '/api/ProfileSync/SendProfileSyncRequest');
            export const GET_PRODUCTS_BY_PROFILESYNCREQUESTID = new Endpoint('getProductsByProfileSyncRequestID', '/api/ProfileSync/GetProductsByProfileSyncRequestID');
            export const SAVE_RECIPIENT_PROFILESYNC_INFORMATION_DATA = new Endpoint('saveRecipientProfileSyncInformationData', '/api/ProfileSync/SaveRecipientProfileSyncInformationData');
            export const SUBMIT_AND_COMPLETE_RECIPIENT_PROFILESYNC = new Endpoint('submitAndCompleteRecipientProfileSync', '/api/ProfileSync/SubmitAndCompleteRecipientProfileSync');
            export const GET_PROFILE_SYNC_REQUEST_BY_REQUEST_ID = new Endpoint('getProfileSyncRequestByRequestID', '/api/ProfileSync/GetProfileSyncRequestByRequestID');
            export const SAVE_CLIENT_PROFILESYNC_INFORMATION_DATA = new Endpoint('saveClientProfileSyncInformationData', '/api/ProfileSync/SaveClientProfileSyncInformationData');

            export const GET_EXTERNAL_VENDOR_CONTACT_CANDIDATES_FOR_PROFILE_SYNC = new Endpoint('getExternalVendorContactCandidatesForProfileSync', '/api/ProfileSync/GetExternalVendorContactCandidatesForProfileSync');
            export const GET_INTERNAL_CONTACT_CANDIDATES_FOR_PROFILE_SYNC = new Endpoint('getInternalContactCandidatesForProfileSync', '/api/ProfileSync/GetInternalContactCandidatesForProfileSync');
        }

        export namespace Clients {
            export namespace Contracts {
                export const UPLOAD_SELF_PROCESSED_CONTRACT = new Endpoint('uploadSelfProcessedContract', '/api/UploadContract/UploadSelfProcessedContract');
            }

            export namespace GlobalTodo {
                export const GET_OVERSIGHT_TASKS = new Endpoint('getOversightTasks', '/api/GlobalTodo/GetOversightTasks');
                export const GET_PROFILE_SYNC_TASKS = new Endpoint('getProfileSyncTasks', '/api/GlobalTodo/GetProfileSyncTasks');
                export const GET_VENDOR_ONBOARDING_TASKS = new Endpoint('getVendorOnboardingTasks', '/api/GlobalTodo/GetVendorOnboardingTasks');
                export const GET_ASSESSMENT_TASKS = new Endpoint('getAssessmentTasks', '/api/GlobalTodo/GetAssessmentTasks');
                export const GET_QUESTIONNAIRE_TASKS = new Endpoint('getQuestionnaireTasks', '/api/GlobalTodo/GetQuestionnaireTasks');
                export const GET_WORKFLOW_TASKS = new Endpoint('getWorkflowTasks', '/api/GlobalTodo/GetWorkflowTasks');
                export const GET_ISSUEMANAGEMENT_TASKS = new Endpoint('getIssueManagementTasks', '/api/GlobalTodo/GetIssueManagementTasks');
                export const GET_SLA_TASKS = new Endpoint('getSLATasks', '/api/GlobalTodo/GetSLATasks');
            }

            export namespace VendorContacts {
                export const ADD_VENDOR_CONTACT = new Endpoint('addVendorContact', '/api/VendorContact/AddVendorContact');
                export const ADD_VENDOR_CONTACT_WITH_PRODUCT_IDS = new Endpoint('addVendorContactWithProductIDs', '/api/VendorContact/AddVendorContactWithProductIDs');
                export const GET_ALL_VENDOR_CONTACTS = new Endpoint('getAllVendorContactsForCurrentUser', '/api/VendorContact/GetAllVendorContactsForCurrentUser');
                export const UPDATE_VENDOR_CONTACT_PRIMARIES = new Endpoint('updateVendorContactPrimaries', '/api/VendorContact/UpdateVendorContactPrimaries');
            }

            export namespace Admin {
                export const GET_RISK_LEVELS = new Endpoint('getRiskLevels', '/api/RiskAssessmentTemplate/GetRiskLevels');
                export const GET_ASSOCIATED_PRODUCT_COUNT = new Endpoint('getAssociatedProductCount', '/api/ProductCategory/GetProductCountByCategory');
                export const GET_ASSOCIATED_FORM_COUNT = new Endpoint('getAssociatedFormCount', '/api/ProductCategory/GetFormCountByCategory');
                export const GET_PRODUCT_CATEGORIES = new Endpoint('getProductCategories', '/api/ProductCategory/GetProductCategoriesAdminPanel');
                export const GET_PRODUCT_LIST = new Endpoint('getProductCategories', '/api/ProductCategory/GetCategoryListByProduct');
                export const GET_PRODUCT_PROFILE_ITEMS_WITH_CATEGORIES = new Endpoint('getProductProfileItemsWithCategories', '/api/ProductCategory/GetProductProfileItemsWithCategories', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('fiid', true)]);
                export const SAVE_CATEGORIES_FOR_PROFILE_ITEM = new Endpoint('saveCategoriesForProfileItem', '/api/ProductCategory/SaveCategoriesForProfileItem');
                export const SAVE_PRODUCT_PROFILE_ITEMS_FOR_CATEGORY = new Endpoint('saveProductProfileItemsForCategory', '/api/ProductCategory/SaveProductProfileItemsForCategory');
                export const GET_OVERSIGHT_REQUIREMENTS = new Endpoint('getApiKey', '/api/OversightRequirement/GetOversightRequirementsAdminPanel');
                export const GET_SHOW_INTERRUPT_MODAL_DETAILS = new Endpoint('getShowInterruptModalDetails', '/api/IntroductionModal/GetModalStatusForContact');
                export const DELETE_PRODUCT_CATEGORY = new Endpoint('deleteProductCategory', '/api/ProductCategory/DeleteProductCategory');
                export const DISMISS_INTERRUPT_MODAL = new Endpoint('dismissInterruptModal', '/api/IntroductionModal/DismissModalForContact');
                export const ADD_API_KEY: Endpoint = new Endpoint('addApiKey', '/api/FI/EnterpriseAdmin/AddApiKey', true);
                export const GET_API_KEYS = new Endpoint('getAPIKeys', '/api/FI/EnterpriseAdmin/GetApiKeys', true);
                export const GET_USER_LEVEL_API_KEYS = new Endpoint('getAPIKeys', '/api/AdminPanel/GetUserLevelApiKeys');
                export const ADD_API_USER = new Endpoint('getAPIKeys', '/api/AdminPanel/AddUserLevelApiKey');
                export const MANAGE_USER_ADD_API_KEY = new Endpoint('getAPIKeys', '/api/AdminPanel/ManageUserAddApiKey');
                export const UPDATE_API_USER_INFO = new Endpoint('updateApiUserInfo', '/api/AdminPanel/ManageUserEditUserName');
                export const REVOKE_API_KEY = new Endpoint('revokeApiKey', '/api/FI/EnterpriseAdmin/RevokeApiKey', true);
                export const UPDATE_ALL_USERS_RISK_APPROVAL = new Endpoint('updateAllUsersRiskApproval', '/api/FI/EnterpriseAdmin/UpdateAllUsersRiskApproval', true);
                export const UPDATE_DOCUMENT_STORAGE_PERMISSIONS = new Endpoint('updateDocumentStoragePermissions', '/api/FI/EnterpriseAdmin/UpdateDocumentStoragePermissions', true);
                export const UPDATE_VENDOR_PROFILE_PERMISSIONS = new Endpoint('updateVendorProfilePermissions', '/api/FI/EnterpriseAdmin/UpdateVendorProfilePermissions', true);
                export const UPDATE_CONTRACT_PERMISSIONS = new Endpoint('updateContractPermissions', '/api/FI/EnterpriseAdmin/UpdateContractPermissions', true);
                export const UPDATE_RISK_APPROVAL = new Endpoint('updateRiskApproval', '/api/FI/EnterpriseAdmin/UpdateRiskApproval', true);
                export const GET_OVERSIGHT_ITEM_SETTINGS = new Endpoint('getOversightRequirementSetting', '/api/OversightRequirement/GetOversightRequirementSetting');
                export const GET_OVERSIGHT_REQUIREMENT_FOR_CONTACT = new Endpoint('getOversightRequirementForUser', '/api/OversightRequirement/GetOversightRequirementsAssociatedWithUser');
                export const GET_ALL_FOR_FI_SLIM = new Endpoint('getAllForFISlim', '/api/FIContact/GetAllForFISlim', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('fiid', true)]);
                export const GET_CONTACT_FOR_FI = new Endpoint('getContactForFI', '/api/FI/FIContact/GetContactForFI', true);
                export const GET_DOCUMENT_STORAGE_PERMISSIONS = new Endpoint('getDocumentStoragePermissions', '/api/FI/FI/GetDocumentStoragePermissions', true);
                export const GET_VENDOR_PROFILE_PERMISSIONS = new Endpoint('getVendorProfilePermissions', '/api/FI/FI/GetVendorProfilePermissions', true);
                export const GET_DOMAINS = new Endpoint('getDomains', '/api/FI/FI/GetDomains', true);
                export const GET_FI_ROLES_FOR_USER = new Endpoint('getFIRolesForUser', '/api/FI/Role/GetFIRolesForUser');
                export const GET_OVERSIGHT_MANAGEMENTS_FOR_CONTACT = new Endpoint('getOversighttask', '/api/FI/OversightManagement/GetOversightManagementsForContact', true);
                export const GET_RISK_APPROVAL_SETTING = new Endpoint('getRiskApprovalSetting', '/api/FI/FI/GetRiskApprovalSetting', true);

                export const UPDATE_OVERSIGHT_REQUIREMENT_SETTINGS = new Endpoint('getOversightRequirementSetting', '/api/OversightRequirement/ManageOversightRequirementPermissions');
                export const UPDATE_OVERSIGHT_AUTOMATION_SETTINGS = new Endpoint('getOversightRequirementSetting', '/api/OversightAutomation/ManageOversightAutomationPermissions');

                export const GET_MANAGE_ORDERS_SERVICE_PERMISSIONS = new Endpoint('getServicePermissions', '/api/FI/FI/GetManageOrdersRSDServicePermissions', true);
                export const GET_CONTRACT_MANAGEMENT_PERMISSIONS = new Endpoint('getContractPermissions', '/api/FI/FI/GetContractPermissions', true);
                export const REASSIGN_OVERSIGHT_MANAGEMENT_TO_CONTACT = new Endpoint('reassignOversightTasks', '/api/OversightManagement/ReassignOversightManagementToContact');
                export const REASSIGN_OVERSIGHT_REQUIREMENT_TO_CONTACT = new Endpoint('reassignOversightRequirements', '/api/OversightManagement/ReassignOversightRequirementToContact', true);
                export const UPDATE_FI_ROLES_FOR_USER = new Endpoint('updateFIRolesForUser', '/api/FI/Role/UpdateFIRolesForUser');
                export const UPDATE_MANAGE_ORDERS_SERVICE_PERMISSIONS = new Endpoint('updateServicePermissions', '/api/FI/FI/UpdateManageOrdersRSDServicePermissions', true);
                export const GET_CATEGORY_MANAGEMENT_SETTINGS = new Endpoint('categoryManagementSettings', '/api/ProductCategory/GetProductCategorySetting');
                export const UPDATE_CATEGORY_MANAGEMENT_SETTINGS = new Endpoint('updateCategoryManagementSettings', '/api/ProductCategory/UpdateCategoryManagementSettings');

                export const GET_ALL_FI_CONTACTS = new Endpoint('getAllFiContacts', '/api/FIContact/GetAllFiContacts');
                export const LOGGED_INUSER_HAS_DC_ROLE = new Endpoint('hasDCRole', '/api/FI/FIContact/LoggedInuserHasDCRole', true);
                export const MOVE_PRODUCT_MANAGER_ROLE = new Endpoint('reassignProductManagement', '/api/FIContact/MoveProductManagerRole', true);
                export const UPDATE_USER = new Endpoint('updateUser', '/api/FIContact/UpdateUser', true);
                export const REQUEST_EXECUTIVE_DASHBOARD_ACCESS = new Endpoint('requestExecutiveDashboardAccess', '/api/VendorProducts/RequestExecutiveDashboardAccess');
                export const GET_SLAS_BY_CONTACT = new Endpoint('updateUser', '/api/ReassignSla/GetSLAsByContact');
                export const REASSIGN_SLA = new Endpoint('updateUser', '/api/ReassignSla/ReassignSla');
                export const GET_ISSUES_BY_USER_ID = new Endpoint('getIssuesByUserID', '/api/ReassignIssues/GetIssuesByUserID');
                export const REASSIGN_CATEGORY = new Endpoint('reassignCategory', '/api/ProductCategory/ReassignCategoryForProducts');
                export const GET_ALL_FI_FOR_SEARCH = new Endpoint('getAllFinancialInstitutionsForSearch', '/api/Client/GetAllFinancialInstitutions');
                export const GET_REVIEW_PERIOD_CONFIGUARTIONS = new Endpoint('getReviewPeriodConfiguration', '/api/ReviewPeriod/GetReviewPeriodConfiguration');
                export const UPDATE_OVERSIGHT_REVIEW_PERIOD_SETTINGS = new Endpoint('mannageOversightReviewPeriodSettings', '/api/ReviewPeriod/ManageReviewPeriodConfiguration');
                export const GET_COUNT_OF_VENDOR_WHOSE_RP_NOT_SET = new Endpoint('getCountOfVendorsWhoseReviewPeriodIsNotSet', '/api/ReviewPeriod/GetCountOfVendorsWhoseReviewPeriodIsNotSet');
                export const REASSIGN_ISSUE_OWNER = new Endpoint('reassignIssueOwner', '/api/ReassignIssues/ReassignIssueOwner');
                export const GET_ADMIN_PANEL_USERS = new Endpoint('getBUUsersLinkedWithProduct', '/api/ReassignIssues/GetBUUsersLinkedWithProduct');

                export const GET_SETTINGS = new Endpoint('getSettings', '/api/Client/GetSettings', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('typeId', false, 2)]);
                export const SAVE_SETTINGS = new Endpoint('saveSettings', '/api/Client/SaveSettings');
                export const IS_FEATURE_ON_FOR_CLIENT = new Endpoint('isFeatureOnForClient', '/api/Client/IsFeatureOnForClient', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('featureId', true, 0), new QueryStringParameterRule('clientId', true, 1)]);
                export const CLIENT_HAS_LINE_ITEM = new Endpoint('clientHasLineItem', '/api/Client/ClientHasLineItem', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 0), new QueryStringParameterRule('lineItemTypeId', true, 1), new QueryStringParameterRule('isAdvanced', false, 2)]);
                export const GET_PENDING_OVERSIGHT_REQUIREMENT_FOR_CONTACT = new Endpoint('getPendingOversighttask', '/api/OversightRequirement/GetPendingOversightTasksForApprovalAssociatedWithUser');
                export const REASSIGN_APPROVER = new Endpoint('reassignOversightTasksApprover', '/api/OversightManagement/ReassignOversightManagementToApprover');

                export const UPLOAD_LOGOS_TO_USER_TEMPORARY_STORAGE = new Endpoint('uploadLogosToUserTemporaryStorage', '/api/Clients/Logos/UploadLogosToUserTemporaryStorage');
                export const SAVE_LOGOS = new Endpoint('saveLogos', '/api/Clients/Logos/SaveLogos');
                export const GET_LOGOS = new Endpoint('getLogos', '/api/Clients/Logos/GetLogos', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 0)]);
                export const GET_LOGOS_FOR_USAGE = new Endpoint('getLogosGorUsate', '/api/Clients/Logos/GetLogosForUsage', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 0), new QueryStringParameterRule('usageType', true, 1)]);
                export const DELETE_LOGO = new Endpoint('deleteLogo', '/api/Clients/Logos/DeleteLogo', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 0), new QueryStringParameterRule('logoId', true, 1)]);
                export const REPLACE_LOGO = new Endpoint('replaceLogo', '/api/Clients/Logos/ReplaceLogo');
            }

            export namespace CustomRoles {
                export const CREATE_CUSTOM_ROLE = new Endpoint('createCustomRole', '/api/CustomRoles/CreateCustomRole');
                export const DELETE_CUSTOM_ROLE = new Endpoint('createCustomRole', '/api/CustomRoles/DeleteCustomRole');
                export const GET_AVAILABLE_CUSTOM_ROLE_MEMBERS = new Endpoint('getAvailableCustomRoleMembers', '/api/CustomRoles/getAvailableCustomRoleMembers');
                export const GET_CUSTOM_ROLES_FOR_CLIENT = new Endpoint('getCustomRolesForClient', '/api/CustomRoles/GetCustomRolesForClient');
                export const GET_CUSTOM_ROLES_FOR_CLIENT_USER = new Endpoint('getCustomRolesForClientUser', '/api/CustomRoles/GetCustomRolesForClientUser');
                export const GET_CUSTOM_ROLES_WITH_MEMBERS = new Endpoint('getCustomRolesWithMembers', '/api/CustomRoles/GetCustomRolesWithMembers');
                export const UPDATE_CUSTOM_ROLE = new Endpoint('updateCustomRole', '/api/CustomRoles/UpdateCustomRole');
                export const GET_ASSOCIATED_OVERSIGHTS_FOR_CUSTOMROLES = new Endpoint('getOversightsAssociatedWithCustomRoles', '/api/CustomRoles/GetOversightsAssociatedWithCustomRoles');
                export const GET_CUSTOM_ROLE_USAGES = new Endpoint('getCustomRoleUsages', '/api/CustomRoles/GetCustomRoleUsages');
            }

            export namespace DocumentStorage {
                export const ARCHIVE_DOCUMENT = new Endpoint('archiveDocuments', '/api/Documents/ArchiveDocument');
                export const DELETE_ALL_DOCUMENTS = new Endpoint('deleteAllDocuments', '/api/Documents/DeleteAllDocuments');
                export const DELETE_DOCUMENTS = new Endpoint('deleteDocuments', '/api/Documents/DeleteDocument');
                export const DOWNLOAD_ARCHIVED_DOCUMENTS = new Endpoint('downloadArchivedDocuments', '/api/Documents/DownloadArchivedDocuments');
                export const DOWNLOAD_DOCUMENTS = new Endpoint('downloadDocuments', '/api/Documents/DownloadDocuments');
                export const GET_ALL_DOCUMENT_TAGS = new Endpoint('getAllDocumentTags', '/api/DocumentTags/GetAllDocumentTags');
                export const GET_ALL_DOCUMENT_TAGS_FOR_UPLOAD = new Endpoint('getAllDocumentTagsForUpload', '/api/DocumentTags/GetAllDocumentTagsForUpload');
                export const GET_ALL_DOCUMENT_TAGS_BY_SERVICEORDER_CLIENTID = new Endpoint('getAllDocumentTagsByServiceOrderClientID', '/api/DocumentTags/GetAllDocumentTagsByServiceOrderClientID');
                export const GET_ALL_DOCUMENT_TAGS_FOR_VENDORS = new Endpoint('getAllDocumentTagsForVendors', '/api/DocumentTags/GetAllDocumentTagsForVendors');
                export const GET_ALL_DOCUMENT_TAGS_FOR_VENDORS_BY_SERVICEORDER_CLIENTID = new Endpoint('getAllDocumentTagsForVendorsByServiceOrderClientID', '/api/DocumentTags/GetAllDocumentTagsForVendorsByServiceOrderClientID');
                export const GET_ASSOCIATED_DOCUMENTS = new Endpoint('getAssociatedDocuments', '/api/Documents/GetAssociatedDocuments');
                export const GET_CLIENT_DOCUMENT_VERSION = new Endpoint('getClientDocumentVersion', '/api/Documents/GetClientDocumentVersion');
                export const GET_DELETE_CONFIRMATION_INFO = new Endpoint('getDeleteConfirmationInfo', '/api/DocumentTags/GetDeleteConfirmationInfo');
                export const GET_DOCUMENT_NOTES = new Endpoint('getDocumentNotes', '/api/Documents/GetDocumentNotes');
                export const GET_DOCUMENTS = new Endpoint('getDocuments', '/api/Documents/GetDocuments');
                export const GET_DOCUMENTS_BY_SERVICEORDER_CLIENTID = new Endpoint('getDocumentsByServiceOrderClientID', '/api/Documents/GetDocumentsByServiceOrderClientID');
                export const GET_USER_CONFIGURATION = new Endpoint('getDocumentStorageUserPageConfiguration', '/api/DocumentStoragePage/GetUserConfiguration');
                export const GET_DOCUMENT_TAGS_BY_DOCUMENT_ID = new Endpoint('getDocumentTagsByDocumentId', '/api/DocumentTags/GetDocumentTagsByDocumentId');
                export const GET_DOCUMENT_TAGS_BY_DOCUMENT_ID_CLIENTID = new Endpoint('getDocumentTagsByDocumentIdAndServiceOrderClientID', '/api/DocumentTags/GetDocumentTagsByDocumentIdAndServiceOrderClientID');
                export const GET_ONLINE_REVIEW_INFO_BY_DOCUMENT_ID = new Endpoint('getOnlineReviewInfoByDocumentID', '/api/Documents/GetOnlineReviewInfoByDocumentID');
                export const GET_SEARCH_REQUEST = new Endpoint('getSearchRequest', '/api/Documents/GetSearchRequest');
                export const GET_SHARED_CONTACTS = new Endpoint('getSharedContacts', '/api/Documents/GetSharedContacts');
                export const GET_UNIQUE_PRODUCT_NICKNAMES = new Endpoint('getUniqueProductNicknames', '/api/DocumentStorageFilter/GetUniqueProductNicknames');
                export const GET_UNIQUE_PRODUCT_NICKNAMES_BY_SERVICEORDER_CLIENTID = new Endpoint('getUniqueProductNicknamesByServiceOrderClientID', '/api/DocumentStorageFilter/GetUniqueProductNicknamesByServiceOrderClientID');
                export const MARK_DOCUMENT_DETAILS_AS_VIEWED = new Endpoint('markDocumentDetailsAsViewed', '/api/Documents/MarkDocumentDetailsAsViewed');
                export const REPLACE_DOCUMENT = new Endpoint('replaceDocument', '/api/Documents/ReplaceDocument');
                export const UNARCHIVE_DOCUMENTS = new Endpoint('unarchiveDocuments', '/api/Documents/UnarchiveDocuments');
                export const UPDATE_DOCUMENT = new Endpoint('updateDocument', '/api/Documents/UpdateDocument');
                export const UPDATE_DOCUMENT_DOCUMENT_TAGS = new Endpoint('updateDocumentDocumentTags', '/api/Documents/UpdateDocumentTags');
                export const UPDATE_DOCUMENT_TAGS = new Endpoint('updateDocumentTags', '/api/DocumentTags/UpdateDocumentTags');
                export const UPLOAD_DOCUMENT = new Endpoint('uploadDocument', '/api/Documents/UploadDocument');
                export const GET_DOCUMENT_DETAILS_BY_ID = new Endpoint('getDocumentDetailsById', '/api/Documents/getDocumentDetailsById');
                export const GET_ONBOARDING_DOCUMENTS = new Endpoint('getOnboardingDocuments', '/api/Documents/GetOnboardingDocuments');
                export const DOWNLOAD_MULTIPLE_DOCUMENTS = new Endpoint('downloadMultipleDocuments', '/api/Documents/DownloadMultiple');
            }

            export namespace Examiners {
                export const CHANGE_ACCESS = new Endpoint('changeReportAccessForExaminer', '/api/FI/Examiner/ChangeAccess', true);
                export const GET_ALL_EXAMINERS_WITH_CONTACT_DETAILS = new Endpoint('getExaminers', '/api/FI/Examiner/GetAllExaminersWithContactDetails', true);
                export const GET_REPORT_ACCESS_FOR_EXAMINER = new Endpoint('getReportAccessForExaminer', '/api/FI/Examiner/GetReportAccessForExaminer', true);
                export const REQUEST_ROLE_SHARE_WITH_EXAMINER_EXISTS_FOR_USER = new Endpoint('requestRoleShareWithExaminerExistsForUser', '/api/Examiner/RequestRoleShareWithExaminerExistsForUser');
                export const REQUEST_ROLE_SHARE_WITH_EXAMINER = new Endpoint('requestRoleShareWithExaminer', '/api/Examiner/RequestRoleShareWithExaminer');
                export const GET_SHARE_DETAILS_FOR_REPORT = new Endpoint('getShareDetailsForReport', '/api/Examiner/GetShareDetailsForReport', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('entityID'), new QueryStringParameterRule('reportTypeID')]);
                export const GET_ALL_EXAMINERS = new Endpoint('getAllExaminers', '/api/Examiner/GetAllExaminers', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('searchEmail', false)]);
                export const SHARE_WITH_EXAMINERS = new Endpoint('shareWithExaminers', '/api/Examiner/ShareWithExaminers');
            }

            export namespace ExamPrep {
                export const CREATE_EXAM_PREP_REPORT = new Endpoint('createExamPrepReport', '/api/ExamPrep/ExamPrepReport/SimpleGet', true);
                export const GET_EXAM_FOR_TABLE_OF_CONTENTS = new Endpoint('getExamPrepReport', '/api/ExamPrep/View/GetExamForTableOfContents', true);
                export const DOWNLOAD_REPORT = new Endpoint('downloadExamPrepReport', '/ExamPrep/ExamPrepDownload/SimpleDownloadReport', true);
            }

            export namespace Exchange {
                export namespace Questionnaires {
                    export const GET_VENDOR_IDS_WHICH_SHARE_QUESTIONNAIRES_WITH_NC_CLIENT_USER = new Endpoint('getVendorIdsWhichShareQuestionnairesWithNonContractedClientUser', '/api/ExchangeClientQuestionnaires/GetVendorIdsWhichShareQuestionnairesWithNonContractedClientUser');
                    export const CHECK_NC_CLIENT_FOR_SHARED_QUESTIONNAIRES = new Endpoint('checkNonContractedClientUserForSharedQuestionnaires', '/api/ExchangeClientQuestionnaires/CheckNonContractedClientUserForSharedQuestionnaires');
                    export const GET_QUESTIONNAIRES_FOR_NON_CONTRACTED_CLIENT_CONTACT = new Endpoint('getQuestionnairesForNonContractedClientContact', '/api/ExchangeClientQuestionnaires/GetQuestionnairesForNonContractedClientContact');
                    export const GET_QUESTIONNAIRES_FOR_EXCHANGE_LIBRARY = new Endpoint('getQuestionnairesForExchangeLibrary', '/api/ExchangeClientQuestionnaires/GetQuestionnairesForExchangeLibrary');
                }

                export namespace Documents {
                    export const CHECK_NC_CLIENT_FOR_SHARED_DOCUMENTS = new Endpoint('checkNonContractedClientUserForSharedDocuments', '/api/ExchangeClientDocuments/CheckNonContractedClientUserForSharedDocuments');
                    export const GET_DOCUMENTS_FOR_EXCHANGE_LIBRARY = new Endpoint('getDocumentsForNonContractedClientContact', '/api/ExchangeClientDocuments/GetDocumentsForNonContractedClientContact');
                }

                export namespace RequestAccess {
                    export const GET_ALL_VENDOR_PRODUCTS = new Endpoint('getAllVendorProducts', '/api/RequestForExchangeAccess/GetAllVendorProducts');
                    export const GET_ALL_SHARED_VENDOR_PRODUCTS_BY_CONTACT = new Endpoint('getAllSharedVendorProductsByContact', '/api/RequestForExchangeAccess/GetAllSharedVendorProductsByContact');
                    export const REQUEST_VENDOR_PRODUCTS_ACCESS = new Endpoint('requestVendorProductsAccess', '/api/RequestForExchangeAccess/RequestVendorProductsAccessForClient');
                }
            }

            export namespace OversightManagement {
                export const GET_DUE_TASK_INFORMATION: Endpoint = new Endpoint('getDueTaskInformation', '/api/FI/MainDashboard/GetDueTasks', true);
                export const SNOOZE_TASKS: Endpoint = new Endpoint('snoozeTasks', '/api/FI/MainDashboard/SnoozeTasks', true);
                export const DOWNLOAD_TASKS: Endpoint = new Endpoint('downloadTasks', '/api/TasksAndNotifications/ExportTasksList');
                export const ENABLE_OVERSIGHT_REQUIREMENT_TASK = new Endpoint('enableOversightTask', '/api/OversightRequirement/EnableOversightRequirement');
                export const DISABLE_OVERSIGHT_REQUIREMENT_TASK = new Endpoint('disableOversightTask', '/api/OversightRequirement/DisableOversightRequirement');

                export const GET_PENDING_TASK_DETAILS = new Endpoint('getPendingTaskDetail', '/api/OversightRequirement/GetOversightTaskDetails');
                export const GET_PRODUCT_INFORMATION_OVERSIGHT = new Endpoint('getProductInformation', '/api/OversightRequirement/GetProductInformationTable');
                export const GET_OVERSIGHT_REQUIREMENT = new Endpoint('getOversightRequirementData', '/api/OversightRequirement/GetOversightRequirements');
                export const GET_VENDOR_REVIEW_PERIOD = new Endpoint('getVendorReviewPeriod', '/api/OversightRequirement/GetVendorReviewPeriod');
                export const GET_OVERSIGHT_MANAGEMENT_CATEGORIES = new Endpoint('getOversightManagementCategories', '/api/FI/OversightManagement/GetOversightManagementCategoriesForDisplay', true);
                export const DOWNLOAD_OVERSIGHT_REQUIREMENT = new Endpoint('downloadOversightRequirements', '/api/OversightRequirement/GetOversightRequirementExcel');
                export const DELETE_OVERSIGHT_REQUIREMENT_TASK = new Endpoint('deleteOversightRequirementTask', '/api/OversightRequirement/DeleteOversightManagement');
                export const SUBMIT_OVERSIGHT_REQUIREMENT_TASK = new Endpoint('manageOversightRequirementTask', '/api/OversightRequirement/CreateOrUpdateOversightManagement');
                export const MANAGE_OVERSIGHT_REQUIREMENT_TASK = new Endpoint('manageOversightRequirementTask', '/api/OversightManagement/UpdateOversightManagementTask');
                export const GET_PRODUCT_LIST_FOR_MANAGE = new Endpoint('getProductsListForManageOversight', '/api/OversightRequirement/GetProductsListForManageOversight');

                export const UPDATE_ANNUAL_REVIEW_DATE = new Endpoint('UpdateAnnualReviewDate', '/api/FI/VendorProfile/UpdateAnnualReviewDate', true);
                export const UPDATE_BULK_TASK_DATE = new Endpoint('UpdateBulkTaskDate', '/api/FI/VendorProfile/UpdateBulkTaskDate', true);
                export const UPDATE_BULK_TASK_OWNER = new Endpoint('UpdateBulkTaskOwner', '/api/FI/VendorProfile/UpdateBulkTaskOwner', true);
                export const UPDATE_OVERSIGHT_REQUIREMENTS = new Endpoint('UpdateOversightRequirements', '/api/FI/VendorProfile/Update', true);
                export const ADD_CUSTOM_OVERSIGHT_REQUIREMENT = new Endpoint('addCustomOversightRequirement', '/api/VendorProfile/CreateQuestionOversightManagement');
                export const GET_ACTIVE_USERS = new Endpoint('getActiveUsers', '/api/OversightRequirement/GetActiveUsersForClient');
                export const GET_USERS_THAT_HAVE_TASK = new Endpoint('getUsersThatHaveTasks', '/api/OversightRequirement/GetOversightOwners');
                export const GET_LIST_OF_OVERSIGHT_AND_PRODUCTS = new Endpoint('getActiveEnrolledUsers', '/api/OversightRequirement/GetOversightRequirementsAndProductsList');

                export const ADD_ADMIN_CUSTOM_OVERSIGHT_REQUIREMENT = new Endpoint('addCustomOversightRequirement', '/api/OversightRequirement/CreateQuestionOversightManagement');
                export const EDIT_ADMIN_CUSTOM_OVERSIGHT_REQUIREMENT = new Endpoint('addCustomOversightRequirement', '/api/OversightRequirement/UpdateQuestionOversightManagement');

                export const EDIT_CUSTOM_OVERSIGHT_REQUIREMENT = new Endpoint('editCustomOversightRequirement', '/api/FI/VendorProfile/EditCustomQuestion', true);
                export const DELETE_CUSTOM_OVERSIGHT_REQUIREMENT = new Endpoint('deleteCustomOversightRequirement', '/api/OversightRequirement/DeleteOversightRequirement');
                export const GET_COMPLETE_TASK_DETAILS = new Endpoint('getCompleteOversightTaskDetail', '/api/OversightRequirement/GetCompleteOversightTaskDetail');
                export const GET_OVERSIGHT_DOCUMENTS_AND_COMMENTS = new Endpoint('getOversightTaskDocumentsAndComments', '/api/OversightRequirement/GetOversightTaskDocumentsAndComments');
                export const GET_REVIEW_PERIOD_HISTORY = new Endpoint('getReviewPeriodHistory', '/api/ReviewPeriod/GetReviewPeriodHistory');
                export const GET_DISABLED_OVERSIGHT_REQUIREMENTS = new Endpoint('getReviewPeriodHistory', '/api/OversightRequirement/GetDisabledOversightsForVendor');
                export const GET_OVERSIGHT_OWNER_LIST = new Endpoint('getOversightOwnerList', '/api/OversightRequirement/GetOversightOwnerList');
                export const GET_DISMISSED_MODAL_STATUS_FOR_ENTITY = new Endpoint('getDismissedModalStatusForEntity', '/api/IntroductionModal/GetDismissedModalStatusForEntity');
                export const POST_DISMISS_MODAL_BY_ENTITY = new Endpoint('postDismissModalByEntity', '/api/IntroductionModal/DismissModalByEntity');
                export const GET_DISTINCT_OVERSIGHT_REQUIREMENTS_BY_RELATIONSHIP_AND_DATE = new Endpoint('getDistinctOversightRequirementsByRelationshipAndDate', '/api/OversightRequirement/GetDistinctOversightRequirementsByRelationshipAndDate');
                export const GET_OVERSIGHT_DASHBOARD = new Endpoint('getOversightDashboard', '/api/OversightDashboard/GetOversightDashboard');
                export const GET_TASK_OWNERS = new Endpoint('getOversightDashboard', '/api/OversightDashboard/GetOversightOwnersForClient');
                export const GET_ALL_OVERSIGHT_REQUIREMENTS = new Endpoint('getAllOversightRequirements', '/api/OversightDashboard/GetAllOversightRequirements');
                export const GET_DEFAULT_VIEW = new Endpoint('getDefaultView', '/api/OversightDashboard/GetDefaultView');
                export const GET_OVERSIGHT_CONFLICTS = new Endpoint('getOversightConflicts', '/api/OversightAutomation/GetOAConflicts');
                export const UPDATE_OVERSIGHT_CONFLICTS = new Endpoint('udpateOversightConflicts', '/api/OversightAutomation/UpdateOversightConflicts');
                export const GET_OVERSIGHT_DASHBOARD_TASKS = new Endpoint('GetOversightDashboardTasks', '/api/OversightDashboard/GetOversightDashboardTasks');
                export const DOWNLOAD_OVERSIGHT_DASHBOARD_EXCEL = new Endpoint('DownloadOversightDashboardExcel', '/api/OversightDashboard/DownloadOversightDashboardExcel');
                export const GET_PENDING_TASK_COUNT = new Endpoint('NonCompletedTasksCount', '/api/OversightRequirement/GetNonCompletedOversightTasksCount');
                export const GET_TASK_AFFECTED_COUNT_FOR_APPROVER_CHANGE = new Endpoint('getNonCompletedTasksApprovalCount', '/api/OversightRequirement/GetNonCompletedTasksApprovalCount');
                export const GET_APPROVER_IDS = new Endpoint('getApproverIds', '/api/OversightRequirement/GetOversightApproverIds');
            }

            export namespace Questionnaires {
                export namespace Admin {
                    export const GET_QUESTIONNAIRE_PERMISSIONS_FOR_CLIENT = new Endpoint('getQuestionnairePermissionsForClient', '/api/QuestionnairesAdmin/GetQuestionnairePermissionsForClient');
                    export const UPDATE_QUESTIONNAIRE_PERMISSIONS_FOR_CLIENT = new Endpoint('updateQuestionnairePermissionsForClient', '/api/QuestionnairesAdmin/UpdateQuestionnairePermissionsForClient');
                }

                export const GET_QUESTIONNAIRE = new Endpoint('getQuestionnaire', '/api/Questionnaires/GetQuestionnaire');
                export const GET_QUESTIONNAIRES_REQUEST = new Endpoint('getQuestionnaireRequest', '/api/Questionnaires/GetQuestionnairesRequests');
                export const GET_QUESTIONNAIRE_TEMPLATE_FOR_FI = new Endpoint('getQuestionnaireTemplateForFI', '/api/Questionnaires/GetQuestionnaireTemplateForFI');
                export const SAVE_DRAFT = new Endpoint('saveQuestionnaire', '/api/Questionnaires/SaveQuestionnaire');
                export const SAVE_QUESTION = new Endpoint('saveQuestion', '/api/Questionnaires/SaveQuestion');
                export const SAVE_SECTION = new Endpoint('saveSection', '/api/Questionnaires/SaveSection');
                export const DELETE_QUESTION = new Endpoint('deleteQuestion', '/api/Questionnaires/DeleteQuestion');
                export const DELETE_SECTION = new Endpoint('deleteSection', '/api/Questionnaires/DeleteSection');
                export const SET_AUTOSAVE_STATUS = new Endpoint('setAutoSaveStatus', '/api/Questionnaires/SetAutoSaveStatus');
                export const SAVE_QUESTIONNAIRE_INSTRUCTIONS = new Endpoint('saveInstructions', '/api/Questionnaires/SaveInstructions');
                export const SAVE_QUESTIONNAIRE_SETTINGS = new Endpoint('saveSettings', '/api/Questionnaires/SaveSettings');
                export const IMPORT_SIG_QUESTIONNAIRE = new Endpoint('importSigQuestionnaire', '/api/Questionnaires/ImportSigQuestionnaire');
                export const PUBLISH_QUESTIONNAIRE = new Endpoint('sublishQuestionnaire', '/api/Questionnaires/PublishQuestionnaire');
                export const GET_QUESTIONNAIRES_FOR_DASHBOARD = new Endpoint('getQuestionnairesForDashboard', '/api/Questionnaires/GetQuestionnairesForDashboard');
                export const UPLOAD_ATTACHMENTS = new Endpoint('uploadAttachments', '/api/Questionnaires/UploadAttachments');
                export const UPLOAD_VENDOR_ATTACHMENTS = new Endpoint('uploadVendorDocument', '/api/QuestionnaireRequestAttachment/UploadVendorAttachment');
                export const UPLOAD_CLIENT_ATTACHMENTS = new Endpoint('uploadClientAttachment', '/api/QuestionnaireRequestAttachment/UploadClientAttachment');
                export const GET_QUESTIONNAIRES_FOR_VENDOR = new Endpoint('GetQuestionnairesForVendor', '/api/Questionnaires/GetQuestionnairesForVendor');
                export const IS_QUESTIONNAIRE_NAME_AVAILABLE = new Endpoint('isQuestionnaireNameAvailable', '/api/Questionnaires/IsQuestionnaireNameAvailable');
                export const CLONE_QUESTIONNAIRE = new Endpoint('cloneQuestionnaire', '/api/Questionnaires/CloneQuestionnaire');
                export const CLONE_QUESTIONNAIRE_AND_RETURN_NEW_ID = new Endpoint('cloneQuestionnaireAndReturnNewId', '/api/Questionnaires/CloneQuestionnaireAndReturnNewId');
                export const CONVERT_QUESTIONNAIRE = new Endpoint('convertVendorQuestionnaireToStandard', '/api/Questionnaires/ConvertVendorQuestionnaireToStandard');
                export const DELETE_QUESTIONNAIRE = new Endpoint('deleteQuestionnaire', '/api/Questionnaires/DeleteQuestionnaire');
                export const DECLINE_QUESTIONNAIRE = new Endpoint('declineQuestionnaire', '/api/Questionnaires/DeclineQuestionnaire');
                export const GET_QUESTIOINNAIRES_RESPONSE_PAGE_INFO = new Endpoint('getQuestionnairesResponsePageInfo', '/api/Questionnaires/GetQuestionnairesResponsePageInfo');
                export const SAVE_QUESTIONNAIRE_REQUEST = new Endpoint('saveQuestionnaireRequest', '/api/Questionnaires/SaveQuestionnaireRequest');
                export const LOCK_QUESTIONNAIRE_REQUEST = new Endpoint('lockQuestionnaireRequest', '/api/Questionnaires/LockQuestionnaireRequest');
                export const UNLOCK_QUESTIONNAIRE_REQUEST = new Endpoint('unlockQuestionnaireRequest', '/api/Questionnaires/UnlockQuestionnaireRequest');
                export const ADD_QUESTIONNAIRE_CONTRIBUTORS = new Endpoint('addQuestionnaireContributors', '/api/Questionnaires/AddContributors');
                export const DELETE_QUESTIONNAIRE_CONTRIBUTOR = new Endpoint('deleteQuestionnaireContributor', '/api/Questionnaires/DeleteContributor');
                export const GET_QUESTIONNAIRE_CONTACTS = new Endpoint('GetContacts', '/api/Questionnaires/GetContacts');
                export const GET_QUESTIONNAIRE_VENDORS = new Endpoint('getVendors', '/api/Questionnaires/GetVendors', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('isOnboarding', true)]);
                export const GET_QUESTIONNAIRE_PRODUCTS = new Endpoint('getProducts', '/api/Questionnaires/GetProducts', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('id', true), new QueryStringParameterRule('isOnboarding', true)]);
                export const GET_QUESTIONNAIRE_INTERNAL_CONTACTS = new Endpoint('getinternalContacts', '/api/Questionnaires/GetInternalContacts');
                export const GET_QUESTIONNAIRE_INTERNAL_CONTACTS_FOR_BU_PRODUCTS = new Endpoint('getinternalContactsForBUProducts', '/api/Questionnaires/GetInternalContactsForBusinessUnitProducts');
                export const GET_ACTIVE_QUESTIONNAIRES = new Endpoint('getActiveQuestionnaires', '/api/Questionnaires/GetActiveQuestionnaires');
                export const SEND_QUESTIONNAIRE = new Endpoint('sendQuestionnaire', '/api/Questionnaires/SendQuestionnaire');
                export const GET_SEND_REQUEST_DATA = new Endpoint('getSendRequestData', '/api/Questionnaires/GetSendRequestData');
                export const REASSIGN_QUESTIONNAIRE = new Endpoint('reassignQuestionnaire', '/api/Questionnaires/ReassignQuestionnaireRequest');
                export const CANCEL_QUESTIONNAIRE = new Endpoint('cancelQuestionnaire', '/api/Questionnaires/CancelQuestionnaireRequest');
                export const SEND_REMINDER_QUESTIONNAIRE = new Endpoint('sendReminderQuestionnaire', '/api/Questionnaires/SendReminderQuestionnaire');
                export const ARCHIVE_QUESTIONNAIRE = new Endpoint('archiveQuestionnaire', '/api/Questionnaires/ArchiveQuestionnaire');
                export const GET_INVITE_MODEL = new Endpoint('getEmailModel', '/api/Questionnaires/GetEmailModel');
                export const GET_CLIENT_USERS = new Endpoint('getClientUsers', '/api/Questionnaires/GetClientUsers');
                export const GET_QUESTIONNAIRE_POCS = new Endpoint('getQuestionnairePOCs', '/api/Questionnaires/GetQuestionnairePOCs');
                export const GET_QUESTIONNAIRE_RESPONSE_FILTERS = new Endpoint('getQuestionnaireResponseFilters', '/api/Questionnaires/GetQuestionnaireResponseFilters');
                export const SAVE_QUESTIONNAIRE_RESPONSE_FILTERS = new Endpoint('saveQuestionnaireResponseFilters', '/api/Questionnaires/SaveQuestionnaireResponseFilters');
                export const LOCK_QUESTIONNAIRE = new Endpoint('lockQuestionnaire', '/api/Questionnaires/LockQuestionnaire');
                export const UNLOCK_QUESTIONNAIRE = new Endpoint('unlockQuestionnaire', '/api/Questionnaires/UnlockQuestionnaire');
                export const DOWNLOAD_CURRENT_VIEW = new Endpoint('downloadCurrentView', '/api/Questionnaires/downloadCurrentView');
                export const GET_CONTACT_INFO = new Endpoint('getContactInfo', '/api/Questionnaires/GetContactInfo');
                export const GET_TEMPLATE_FOR_FI = new Endpoint('getTemplateForFI', '/api/Questionnaires/GetTemplateForFI');
                export const SAVE_TEMPLATE = new Endpoint('saveTemplate', '/api/Questionnaires/SaveTemplate');
                export const GET_QUESTIONNAIRE_REQUEST_FOR_SENDER = new Endpoint('getQuestionnaireRequest', '/api/Questionnaires/GetQuestionnaireRequestForSender');
                export const GET_QUESTIONNAIRE_REQUEST_FOR_RECIPIENT = new Endpoint('getQuestionnaireRequestForVendor', '/api/Questionnaires/GetQuestionnaireRequestForRecipient');
                export const EDIT_QUESTIONNAIRE_REQUEST = new Endpoint('editQuestionnaireRequest', '/api/Questionnaires/EditQuestionnaireRequest');
                export const RESEND_QUESTIONNAIRE_REQUEST = new Endpoint('resendQuestionnaireRequest', '/api/Questionnaires/ResendQuestionnaireRequest');
                export const COPY_STANDARD_QUESTIONNAIRE_TEMPLATE = new Endpoint('copyStandardQuestionnaireTemplate', '/api/Questionnaires/CopyStandardQuestionnaireTemplate');
                export const GET_QUESTIONNAIRE_HEADER_INFO = new Endpoint('getQuestionnaireHeaderInfo', '/api/Questionnaires/GetQuestionnaireHeaderInfo');
                export const GET_ALL_ACTIVE_QUESTIONNAIRE_TEMPLATES = new Endpoint('getAllActiveQuestionaireTemplates', '/api/Questionnaires/GetAllActiveQuestionnaireTemplates');
                export const IMPORT_SIG_QUESTIONNAIRE_ANSWERS_FROM_FILE = new Endpoint('importSigQuestionnaireAnswers', '/api/Questionnaires/ImportSigQuestionnaireAnswersFromFile');
                export const IMPORT_SIG_QUESTIONNAIRE_ANSWERS_FROM_VENMINDER = new Endpoint('importSigQuestionnaireAnswers', '/api/Questionnaires/ImportSigQuestionnaireAnswersFromVenminder');
                export const GET_QUESTIONNAIRE_REQUEST_COVER_PAGE = new Endpoint('getQuestionnaireRequestCoverPage', '/api/Questionnaires/GetQuestionnaireRequestCoverPage');
                export const REFRESH_QUESTIONNAIRE_REQUEST = new Endpoint('refreshQuestionnaire', '/api/Questionnaires/RefreshQuestionnaire');
                export const GET_QUESTIONNAIRE_REQUEST_EMAIL_LOGS = new Endpoint('getQuestionnaireRequestEmailLogs', '/api/Questionnaires/GetQuestionnaireRequestEmailLogs');
                export const HAS_ADVANCED_QUESTIONNAIRES = new Endpoint('hasAdvancedQuestionnaires', '/api/Questionnaires/HasAdvancedQuestionnaires', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true)]);
                export const CLIENT_HAS_ISSUE_MANAGEMENT = new Endpoint('clientHasIssueManagement', '/api/Questionnaires/ClientHasIssueManagement');
                export const GET_LINKED_ISSUE_FOR_QUESTION = new Endpoint('getLinkedIssueForQuestion', '/api/Questionnaires/GetLinkedIssueForQuestion');
                export const GET_QUESTIONNAIRE_USEDBY_WORKFLOWS = new Endpoint('getQuestionnaireUsedByWorkflows', '/api/Questionnaires/GetQuestionnaireUsedByWorkflows');
                export const GET_DELETE_QUESTIONNAIRE_CONFLICTS = new Endpoint('getDeleteQuestionnaireConflicts', '/api/Questionnaires/GetDeleteQuestionnaireConflicts');
                export const GET_INACTIVE_VENDOR_QUESTIONNAIRES = new Endpoint('getInActiveVendorQuestionnaires', '/api/Questionnaires/GetInActiveVendorQuestionnaires');
                export const GET_QUESTIONNAIRE_IS_INTERNAL = new Endpoint('getQuestionnaireIsInternal', '/api/Questionnaires/GetQuestionnaireIsInternal');
            }

            export namespace ProfileSyncRequest {
                export const GET_PROFILE_SYNC_REQUEST_BY_RECIPIENTID = new Endpoint('getProfileSyncRequestByRecipientID', '/api/ProfileSync/GetProfileSyncRequestByRecipientID');
                export const GET_PROFILE_SYNC_REQUEST_STATUS = new Endpoint('getProfileSyncRequestStatus', '/api/ProfileSync/GetProfileSyncRequestStatus');
            }

            export namespace OversightAutomation {
                export const GET_PAIRING_INFORMATION_OVERSIGHT = new Endpoint('getPairingInformation', '/api/OversightAutomation/GetPairingTypeInfo');
                export const GET_FREQUENCY_LIST_OVERSIGHT = new Endpoint('getReviewPeriodFrequencies', '/api/OversightAutomation/GetReviewPeriodFrequencies');
                export const GET_OVERSIGHT_AUTOMATION_SETTING = new Endpoint('getPairingInformation', '/api/OversightAutomation/GetOversightAutomationSetting');
                export const GET_OVERSIGHT_AUTOMATION_TASK_DETAILS = new Endpoint('getPairingInformation', '/api/OversightAutomation/GetOversightAutomationTaskDetails');
                export const POST_PAIRING_INFORMATION_OVERSIGHT = new Endpoint('PostPairingInformation', '/api/OversightAutomation/CreateOrUpdatePairingType');
                export const GET_OVERSIGHT_AUTOMATIONS_FOR_PAIRING = new Endpoint('getOversightAutomationsForPairing', '/api/OversightAutomation/GetOversightAutomationsForPairing');
                export const SAVE_OVERSIGHT_AUTOMATION_REQUIREMENT = new Endpoint('saveOversightAutomationRequirementPairing', '/api/OversightAutomation/SaveOversightAutomationRequirementPairing');
                export const UNPAIR_OVERSIGHT_AUTOMATION_REQUIREMENT = new Endpoint('saveOversightAutomationRequirementPairing', '/api/OversightAutomation/UnpairOversightAutomationRequirement');
                export const GET_OVERSIGHT_AUTOMATION_LAST_SAVED_DETAILS = new Endpoint('getLastSavedDetails', '/api/OversightAutomation/GetLastUpdatedDetails');
                export const GET_OVERSIGHT_AUTOMATION_PAIRING_INFO = new Endpoint('getLastSavedDetails', '/api/OversightAutomation/GetOversightAutomationPairingInfo');
            }

            export namespace RiskAssessment {
                export const GET_ALL_IN_PROGRESS_ASSESSMENTS_FOR_FI_CONTACT = new Endpoint('getInProgressAssessment', '/api/RiskAssessment/InProgressRiskAssessments/GetAllInProgressAssessmentsForFIContact', true);
                export const GET_ASSESSMENTS_PENDING_APPROVAL_FOR_CONTACT = new Endpoint('getPendingRiskAssessment', '/api/RiskAssessment/GetAssessmentsPendingApprovalForContact');
                export const REASSIGN_IN_PROGRESS_RISK_ASSESSMENT = new Endpoint('postInProgressAssessment', '/api/RiskAssessment/InProgressRiskAssessments/ReassignInProgressRiskAssessment', true);
                export const REASSIGN_RISK_ASSESSMENT_APPROVAL = new Endpoint('reassignRiskAssessmentApproval', '/api/RiskAssessment/ReassignRiskAssessmentApproval');
                export const GET_ASSESSMENT_STATUS_INFO = new Endpoint('clientHasInProgressRiskAssessments', '/api/RiskAssessment/GetAssessmentStatusInfo', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', false, 1), new QueryStringParameterRule('assessmentId', false, 2)]);
                export const START_ASSESSMENT = new Endpoint('startAssessment', '/api/RiskAssessment/StartAssessment');
                export const START_ASSESSMENT_DASHBOARD = new Endpoint('startAssessmentDashboard', '/api/FI/RiskAssessments/StartAssessment', true);
                export const GET_ASSESSMENT = new Endpoint('getAssessment', '/api/FI/RiskAssessments/GetAssessmentForEdit', true);

                export const GET_LATEST_ASSESSMENT_SUMMARIES_FOR_CLIENT = new Endpoint('getLatestAssessmentSummariesForClient', '/api/FI/RiskAssessments/GetLatestAssessmentSummariesForClient', true);
                export const GET_VENDOR_PRODUCTS_SUMMARY = new Endpoint('getVendorProductsSummary', '/api/FI/VendorProducts/GetVendorProductsSummary', true);
                export const GET_ASSESSMENT_IMPORT_INFORMATION = new Endpoint('getAssessmentImportInformation', '/api/FI/RiskAssessments/GetAssessmentImportInformation', true);

                export const GET_ASSESSMENT_SLOT_DETAIL = new Endpoint('getAssessmentSlotDetails', '/api/RiskAssessment/GetAssessmentSlotDetails');
                export const GET_CLIENT_PRODUCTS = new Endpoint('GetClientProducts', '/api/RiskAssessment/GetClientProducts');

                export const GET_VENDOR_AND_PRODUCTS_FOR_RISK = new Endpoint('GetProductListByRiskLevel', '/api/OversightAutomation/GetProductListByRiskLevel');

                export namespace Questionnaire {
                    export const GET_QUESTIONNAIRE_FOR_EDIT = new Endpoint('getQuestionnaireForEdit', '/api/RiskAssessmentQuestionnaire/GetQuestionnaireForEdit');
                    export const GET_STANDARD_RISK_QUESTIONNAIRES = new Endpoint('getStandardRiskQuestionnaires', '/api/RiskAssessmentQuestionnaire/GetStandardRiskQuestionnaires');
                    export const DELETE_RISK_QUESTIONNAIRE = new Endpoint('deleteRiskQuestionnaire', '/api/RiskAssessmentQuestionnaire/DeleteRiskQuestionnaire');
                    export const CREATE_RISK_QUESTIONNAIRE_FROM_SAMPLE = new Endpoint('createRiskQuestionnaireFromSample', '/api/RiskAssessmentQuestionnaire/CreateRiskQuestionnaireFromSample');
                    export const SAVE_QUESTIONNAIRE_CONTRIBUTORS = new Endpoint('saveQuestionnaireContributors', '/api/RiskAssessmentQuestionnaire/SaveQuestionnaireContributors');
                    export const GET_PROBABILITY_IMPACT_ANSWER_SET = new Endpoint('getProbabilityImpactAnswerSetForEdit', '/api/RiskAssessmentQuestionnaire/GetProbabilityImpactAnswerSet');
                    export const CREATE_PROBABILITY_IMPACT_ANSWER_SET = new Endpoint('createProbabilityImpactAnswerSetForEdit', '/api/RiskAssessmentQuestionnaire/CreateProbabilityImpactAnswerSet');
                    export const SAVE_RISK_QUESTIONNAIRE = new Endpoint('saveRiskQuestionnaire', '/api/RiskAssessmentQuestionnaire/SaveRiskQuestionnaire');
                    export const PUBLISH_RISK_QUESTIONNAIRE = new Endpoint('publishRiskQuestionnaire', '/api/RiskAssessmentQuestionnaire/PublishRiskQuestionnaire');
                    export const GENERATE_ZIP = new Endpoint('generateZip', '/api/RiskAssessmentQuestionnaire/GenerateZip', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('questionnaireId')]);
                }

                export namespace Template {
                    export const GET_TEMPLATE = new Endpoint('getRiskAssessmentTemplate', '/api/RiskAssessmentTemplate/GetTemplate');
                    export const SAVE_TEMPLATE = new Endpoint('saveTemplate', '/api/RiskAssessmentTemplate/SaveTemplate');
                }

                export namespace Inherent {
                    export const GET_INHERENT_ASSESSMENT_FOR_EDIT = new Endpoint('getInherentAssessmentForEdit', '/api/RiskAssessment/GetInherentAssessmentForEdit');
                    export const INVITE_CONTRIBUTORS = new Endpoint('inviteContributors', '/api/RiskAssessment/InviteContributors');
                    export const SAVE_CONTRIBUTORS = new Endpoint('saveContributors', '/api/RiskAssessment/SaveContributors');
                    export const MARK_ASSESSMENT_VIEWED = new Endpoint('markAssessmentViewed', '/api/RiskAssessment/MarkAssessmentViewed');
                    export const CALC_INHERENT_RATING = new Endpoint('calcInherentRating', '/api/RiskAssessment/CalcInherentRating');
                    export const UPDATE_ASSESSMENT = new Endpoint('updateAssessment', '/api/RiskAssessment/UpdateAssessment');
                    export const PROCEED_TO_RESIDUAL_RISK = new Endpoint('proceedToResidualRisk', '/api/RiskAssessment/ProceedToResidualRisk');
                    export const COMMIT_INHERENT_AND_PROCEED_TO_RESIDUAL_RISK = new Endpoint('commitInherentAndProceedToResidualRisk', '/api/RiskAssessment/CommitInherentAndProceedToResidualRisk');
                    export const DISMISS_CONTRIBUTOR_INFO_MODAL = new Endpoint('dismissContributorInfoModal', '/api/RiskAssessment/DismissContributorInfoModal');
                    export const SEND_CONTRIBUTOR_REMINDER = new Endpoint('sendContributorReminder', '/api/RiskAssessment/SendContributorReminder');
                    export const SUBMIT_FOR_APPROVAL = new Endpoint('submitForApproval', '/api/RiskAssessment/SubmitForApproval');
                    export const SUBMIT_FOR_APPROVAL_TO_COMMIT_INHERENT = new Endpoint('submitForApprovalToCommitInherent', '/api/RiskAssessment/SubmitForApprovalToCommitInherent');
                    export const RESUBMIT_FOR_APPROVAL = new Endpoint('resubmitForApproval', '/api/RiskAssessment/ResubmitForApproval');
                    export const RESUBMIT_FOR_APPROVAL_TO_COMMIT_INHERENT = new Endpoint('resubmitForApprovalToCommitInherent', '/api/RiskAssessment/ResubmitForApprovalToCommitInherent');
                    export const APPROVE_INHERENT_ASSESSMENT = new Endpoint('approveInherentAssessment', '/api/RiskAssessment/ApproveInherentAssessment');
                    export const NOT_APPROVE_INHERENT_ASSESSMENT = new Endpoint('notApproveInherentAssessment', '/api/RiskAssessment/NotApproveInherentAssessment');
                    export const COMPLETE_ASSESSMENT = new Endpoint('CompleteAssessment', '/api/RiskAssessment/CompleteAssessment');
                    export const APPROVE_RESIDUAL_CONTRIBUTOR_CONVERSION_TO_OPTIONAL = new Endpoint('approveInherentContributorConversionToOptional', '/api/RiskAssessment/ApproveInherentContributorConversionToOptional');
                    export const NOT_APPROVE_INHERENT_CONTRIBUTOR_CONVERSION_TO_OPTIONAL = new Endpoint('notApproveInherentContributorConversionToOptional', '/api/RiskAssessment/NotApproveInherentContributorConversionToOptional');
                }

                export namespace Residual {
                    export const GET_RESIDUAL_ASSESSMENT_FOR_EDIT = new Endpoint('getResidualAssessmentForEdit', '/api/RiskAssessment/GetResidualAssessmentForEdit');
                    export const CALC_ENTERPRISE_RESIDUAL_RATING = new Endpoint('calcEnterpriseResidualRating', '/api/RiskAssessment/CalcEnterpriseResidualRating');
                    export const UPDATE_ENTERPRISE_RESIDUAL_ASSESSMENT = new Endpoint('updateEnterpriseResidualAssessment', '/api/RiskAssessment/UpdateEnterpriseResidualAssessment');
                    export const BACK_TO_ENTERPRISE_INHERENT_RISK = new Endpoint('backToEnterpriseInherentRisk', '/api/RiskAssessment/BackToEnterpriseInherentRisk');
                    export const COMPLETE_ENTERPRISE_RESIDUAL_ASSESSMENT = new Endpoint('completeEnterpriseResidualAssessment', '/api/RiskAssessment/CompleteEnterpriseResidualAssessment');
                    export const SUBMIT_ENTERPRISE_RESIDUAL_FOR_APPROVAL = new Endpoint('submitEnterpriseResidualForApproval', '/api/RiskAssessment/SubmitEnterpriseResidualForApproval');
                    export const RESUBMIT_ENTERPRISE_RESIDUAL_FOR_APPROVAL = new Endpoint('resubmitEnterpriseResidualForApproval', '/api/RiskAssessment/ResubmitEnterpriseResidualForApproval');
                    export const APPROVE_ENTERPRISE_RESIDUAL_ASSESSMENT = new Endpoint('approveEnterpriseResidualAssessment', '/api/RiskAssessment/ApproveEnterpriseResidualAssessment');
                    export const NOT_APPROVE_RESIDUAL_ASSESSMENT = new Endpoint('notApproveResidualAssessment', '/api/RiskAssessment/NotApproveResidualAssessment');
                    export const APPROVE_RESIDUAL_CONTRIBUTOR_CONVERSION_TO_OPTIONAL = new Endpoint('approveResidualContributorConversionToOptional', '/api/RiskAssessment/ApproveResidualContributorConversionToOptional');
                    export const NOT_APPROVE_RESIDUAL_CONTRIBUTOR_CONVERSION_TO_OPTIONAL = new Endpoint('notApproveResidualContributorConversionToOptional', '/api/RiskAssessment/NotApproveResidualContributorConversionToOptional');
                    export const GET_COMPLETED_OVERSIGHT_TASKS = new Endpoint('getCompletedOversightTasks', '/api/RiskAssessment/GetCompletedOversightTasks');
                }

                export namespace View {
                    export const GET_IN_PROGRESS_ASSESSMENT = new Endpoint('getInProgressAssessment', '/api/RiskAssessment/GetInProgressAssessment');
                    export const GET_IN_PROGRESS_ASSESSMENTS = new Endpoint('getInProgressAssessments', '/api/RiskAssessment/GetInProgressAssessments');
                    export const GET_COMPLETED_ASSESSMENT = new Endpoint('getCompletedAssessment', '/api/RiskAssessment/GetCompletedAssessment');
                    export const GET_COMPLETED_ASSESSMENTS = new Endpoint('getCompletedAssessments', '/api/RiskAssessment/GetCompletedAssessments');
                    export const CANCEL_ASSESSMENT = new Endpoint('cancelAssessment', '/api/RiskAssessment/CancelAssessment');
                    export const UPDATE_NEXT_ASSESSMENT_DUE_DATE = new Endpoint('updateNextAssessmentDueDate', '/api/RiskAssessment/UpdateNextAssessmentDueDate');
                    export const GET_ASSESSMENT_DOCUMENTS = new Endpoint('getAssessmentDocuments', '/api/RiskAssessment/GetAssessmentDocuments');
                    export const ADD_COMMENT_TO_COMPLETED = new Endpoint('addCommentToCompletedAssessment', '/api/RiskAssessment/AddCommentToCompleted');
                    export const DELETE_COMMENT_FROM_COMPLETED = new Endpoint('deleteCommentFromCompleted', '/api/RiskAssessment/DeleteCommentFromCompleted');
                    export const UPDATE_COMMENT_FROM_COMPLETED = new Endpoint('updateCommentFromCompleted', '/api/RiskAssessment/UpdateCommentFromCompleted');
                    export const REGENERATE_PDFS = new Endpoint('regeneratePDFs', '/api/RiskAssessment/RegeneratePDFs');
                    export const DOWNLOAD_IN_PROGRESS_PDF = new Endpoint('regeneratePDFs', '/api/RiskAssessment/DownloadInProgressPdf');
                }

                export namespace OversightAutomationByQuestion {
                    export const GET_OVERSIGHT_AUTOMATION_BY_QUESTION = new Endpoint('getRiskAssessmentQuestionOversightAutomation', '/api/AssessmentQuestionOversightRequirement/GetByQuestionID');
                    export const SAVE_OVERSIGHT_AUTOMATION_BY_QUESTION = new Endpoint('saveRiskAssessmentQuestionOversightAutomation', '/api/AssessmentQuestionOversightRequirement');
                }
            }

            export namespace Users {
                export const GET_ACTIVE_AND_ENROLLED_CONTACTS = new Endpoint('getActiveAndEnrolledContacts', '/api/FI/MainDashboard/GetActiveContacts', true);
                export const GET_ACTIVE_AND_ENROLLED_USERS_FOR_CLIENT = new Endpoint('GetActiveEnrolledUsersForClient', '/api/FI/VendorProfile/GetActiveEnrolledUsersForClient', true);
            }

            export namespace VendorOffboarding {
                export const GET_OFFBOARDING_SETTINGS = new Endpoint('getSettings', '/api/OffboardingSettings/GetSettings');
                export const SAVE_OFFBOARDING_SETTINGS = new Endpoint('saveSettings', '/api/OffboardingSettings/SaveSettings');
                export const GET_FILTERED_REQUESTS = new Endpoint('getFilteredRequests', '/api/OffboardingFilter/GetFilteredRequests');
                export const DOWNLOAD_FILTERED_REQUESTS = new Endpoint('downloadFilteredRequests', '/api/OffboardingFilter/DownloadFilteredRequests');
                export const GET_OFFBOARDING_FORMS = new Endpoint('getOffboardingForms', '/api/OffboardingSettings/GetOffboardingForms');
                export const GET_OFFBOARDING_EDIT_FORM_DETAILS = new Endpoint('getOffboardingFormDetails', '/api/OffboardingSettings/GetOffboardingFormDetails');
                export const EDIT_OFFBOARDING_FORM = new Endpoint('saveSettings', '/api/OffboardingSettings/EditForm');
                export const GET_OFFBOARDING_DASHBOARD_QUICK_STATS_BAR_COUNT = new Endpoint('getOffboardingDashboardQuickStatsBarCount', '/api/OffboardingFilter/GetOffboardingDashboardQuickStatsBarCount');
                export const GET_OFFBOARDING_FORM_DEFAULT_TIMEFRAMES = new Endpoint('getOffboardingFormDefaultTimeframes', '/api/OffboardingSettings/GetOffboardingFormDefaultTimeframes');
                export const GET_OFFBOARDING_FORM_SELECTED_TIMEFRAMES = new Endpoint('getAllSelectedTimeframes', '/api/OffboardingSettings/GetAllSelectedTimeframes');
                export const GET_OFFBOARDING_FORM_CUSTOM_TIMEFRAMES = new Endpoint('getAllCustomTimeframes', '/api/OffboardingSettings/GetAllCustomTimeframes');
                export const ADD_OFFBOARDING_FORM_TIMEFRAME = new Endpoint('addTimeframe', '/api/OffboardingSettings/AddTimeframe');
                export const GET_OFFBOARDING_REQUEST = new Endpoint('getOffboardingRequest', '/api/OffboardingRequests/GetOffboardingRequestDetails');
                export const GET_ACTIVE_FORM_QUESTIONS = new Endpoint('getActiveFormQuestions', '/api/OffboardingRequests/GetActiveFormQuestions');
                export const GET_OFFBOARDING_REQUEST_SECTION_DETAILS = new Endpoint('getOffboardingRequestSectionDetails', '/api/OffboardingRequests/GetOffboardingRequestSectionDetails');
                export const GET_OFFBOARDING_REQUEST_STAKEHOLDER_NOTIFICATIONS = new Endpoint('getOffboardingRequestStakeholderNotifications', '/api/OffboardingRequests/GetOffboardingRequestStakeholderNotifications');
                export const SAVE_OFFBOARDING_REQUEST_SECTION_DETAILS = new Endpoint('saveOffboardingRequestSectionDetails', '/api/OffboardingRequests/SaveOffboardingRequestSectionDetails');
                export const SAVE_OFFBOARDING_REQUEST_NOTE = new Endpoint('saveOffboardingRequestNote', '/api/OffboardingRequests/SaveOffboardingRequestNote');
                export const CREATE_OFFBOARDING_REQUEST = new Endpoint('createOffboardingRequest', '/api/OffboardingRequests/CreateOffboardingRequest');
                export const UPDATE_OFFBOARDING_REQUEST = new Endpoint('updateOffboardingRequest', '/api/OffboardingRequests/UpdateOffboardingRequest');
                export const UPDATE_OFFBOARDING_REQUEST_QUESTIONS = new Endpoint('updateOffboardingRequestQuestions', '/api/OffboardingRequests/UpdateOffboardingRequestQuestions');
                export const GET_VMO_USERS = new Endpoint('getVMOUsers', '/api/OffboardingRequests/GetVMOUsers');
                export const ADD_QUESTIONS_FOR_NEW_CONTRACT = new Endpoint('addQuestionsForNewContract', '/api/OffboardingRequests/AddQuestionsForNewContract');
                export const OFFBOARD_PRODUCT_REQUEST = new Endpoint('offboardProductRequest', '/api/OffboardingRequests/OffboardProductRequest');
                export const SEND_STAKEHOLDER_NOTIFICATION = new Endpoint('sendStakeholderNotification', '/api/OffboardingRequests/SendStakeholderNotification');
                export const DECLINE_OFFBOARDING_REQUEST = new Endpoint('declineOffboardingRequest', '/api/OffboardingRequests/DeclineOffboardingRequest');
                export const UPLOAD_REQUEST_ATTACHMENTS = new Endpoint('uploadRequestAttachments', '/api/OffboardingRequests/UploadRequestAttachments');
                export const DELETE_REQUEST_ATTACHMENTS = new Endpoint('uploadRequestAttachments', '/api/OffboardingRequests/DeleteRequestAttachments');
                export const GET_REQUEST_ATTACHMENTS = new Endpoint('getRequestAttachments', '/api/OffboardingRequests/GetRequestAttachments');
                export const GET_ACTIVE_REQUESTS_BY_CONTACT_ID = new Endpoint('getActiveRequestsByContactID', '/api/OffboardingRequests/GetActiveRequestsByContactID');
                export const REASSIGN_REQUEST_RESPONSIBILITIES = new Endpoint('ReassignRequestResponsibilities', '/api/OffboardingRequests/ReassignRequestResponsibilities');
            }

            export namespace VendorOnboarding {
                export const GET_ONBOARDING_FORMS = new Endpoint('getOnboardingForms', '/api/OnboardingForms/GetOnboardingForms');
                export const GET_ONBOARDING_FORM_DETAILS = new Endpoint('getVendorOnboardingFormDetails', '/api/OnboardingForms/GetVendorOnboardingFormDetails');
                export const GET_VENDOR_PROFILE_ITEMS = new Endpoint('GetVendorProfileItems', '/api/OnboardingForms/GetVendorProfileItems');
                export const GET_PRODUCT_PROFILE_ITEMS = new Endpoint('GetProductProfileItems', '/api/OnboardingForms/GetProductProfileItems');
                export const GET_MODAL_DISMISSAL = new Endpoint('GetModalDismissal', '/api/OnboardingForms/GetModalDismissal');
                export const GET_BITSIGHT_BANNER_DISMISSAL = new Endpoint('GetBitSightBannerDismissal', '/api/OnboardingForms/GetBitSightBannerDismissal');
                export const DISMISS_BITSIGHT_BANNER = new Endpoint('DismissBitSightBanner', '/api/OnboardingForms/DismissBitSightBanner');
                export const GET_ONBOARDING_APPROVAL_SETTINGS_DETAILS = new Endpoint('getConfigurations', '/api/OnboardingSettings/GetConfigurations');
                export const UPDATE_VMO_AND_EXEMPTED_CATEGORIES = new Endpoint('updateVMOAndExemptedCategories', '/api/OnboardingSettings/UpdateVMOAndExemptedCategories');
                export const UPDATE_VENDOR_ONBOARDING_STATUS = new Endpoint('updateVendorOnboardingStatus', '/api/OnboardingSettings/UpdateOnboardingSettings');
                export const UPDATE_ONBOARDING_FORM_DETAILS = new Endpoint('updateVendorOnboardingFormDetails', '/api/OnboardingForms/CreateOrEditOnboardingForm');
                export const IS_FORMNAME_DUPLICATE = new Endpoint('IsFormNameDuplicate', '/api/OnboardingForms/IsFormNameDuplicate');
                export const CREATE_OR_EDIT_CUSTOMFORM = new Endpoint('CreateOrEditCustomForm', '/api/OnboardingForms/CreateOrEditCustomForm');
                export const DELETE_CUSTOMFORM = new Endpoint('DeleteCustomForms', '/api/OnboardingSettings/DeleteCustomForm');
                export const ACTIVE_MASTERFORM = new Endpoint('MakeMasterFormActive', '/api/OnboardingSettings/MakeMasterFormActive');
                export const GET_PRODUCT_CATEGORIES = new Endpoint('GetProductCategories', '/api/OnboardingSettings/GetProductCategories');
                export const GET_REQUEST_REASONS = new Endpoint('GetRequestReason', '/api/OnboardingRequests/GetRequestReasons');
                export const GET_ONBOARDING_REQUEST_FORM = new Endpoint('getFormDetailsBasedOnCategory', '/api/OnboardingRequests/GetFormDetailsBasedOnCategory');
                export const CREATE_VENDOR_REQUEST = new Endpoint('Create', '/api/OnboardingRequests/Create');
                export const CREATE_VENDOR_DRAFT_REQUEST = new Endpoint('CreateDraftRequest', '/api/OnboardingRequests/CreateDraftRequest');
                export const DELETE_VENDOR_DRAFT_REQUEST = new Endpoint('DeleteDraftRequest', '/api/OnboardingRequests/DeleteDraftRequest');
                export const VALIDATE_VENDOR_PRODUCT_RELATIONSHIP = new Endpoint('ValidateVendorProductRelationship', '/api/OnboardingRequests/ValidateVendorProductRelationship');
                export const GET_REQUEST_STATUSES = new Endpoint('GetOnboardingRelationshipStatuses', '/api/OnboardingRequests/GetOnboardingRelationshipStatuses');
                export const GET_ASSIGNED_USERS = new Endpoint('GetOnboardingRequestAssignedUsers', '/api/OnboardingRequests/GetOnboardingRequestAssignedUsers');
                export const GET_VMO_USERS = new Endpoint('GetVMOUsers', '/api/OnboardingRequests/GetVMOUsers');
                export const ASSIGN_VMO_TO_VENDOR_REQUEST = new Endpoint('AssignVMOToVendorRequest', '/api/OnboardingRequests/AssignVMOToVendorRequest');
                export const GET_REQUEST_RELATIONSHIP = new Endpoint('GetOnboardingRequestRelationships', '/api/OnboardingRequests/GetOnboardingRequestRelationships');
                export const GET_DASHBOARD_QUICK_STATS_BAR_COUNT = new Endpoint('GetOnboardingDashboardQuickStatsBarCount', '/api/OnboardingRequests/GetOnboardingDashboardQuickStatsBarCount');
                export const DOWNLOAD_ONBOARDING_REQUEST_RELATIONSHIPS = new Endpoint('DownloadOnboardingRequestRelationships', '/api/OnboardingRequests/DownloadOnboardingRequestRelationships');
                export const GET_DEFAULT_FILTER = new Endpoint('GetOnboardingRequestsDefaultFilter', '/api/OnboardingRequests/GetOnboardingRequestsDefaultFilter');
                export const REASSIGN_VMO_TO_VENDOR_REQUEST = new Endpoint('ReAssignVMOToVendorRequest', '/api/OnboardingRequests/ReAssignVMOToVendorRequest');
                export const GET_REQUEST_REQUIREMENT_DETAILS = new Endpoint('GetRelationshipSectionDetails', '/api/OnboardingRequests/GetRelationshipSectionDetails');
                export const GET_RELATIONSHIP_DETAILS_DATA = new Endpoint('GetRelationshipDetailsData', '/api/OnboardingRequests/GetRelationshipDetailsData');
                export const GET_RELATIONSHIP_STATUS_DATA = new Endpoint('GetRelationshipStatusData', '/api/OnboardingRequests/GetRelationshipStatusDetails');
                export const GET_VENDOR_ONBOARDING_RELATIONSHIPS = new Endpoint('GetVendorOnboardingRelationships', '/api/OnboardingRequests/GetVendorOnboardingRelationships');
                export const GET_VENDOR_FOR_RELATIONSHIPS = new Endpoint('GetVendorForRelationships', '/api/OnboardingRequests/GetVendorForRelationships');
                export const UPDATE_VENDOR_RELATIONSHIPS = new Endpoint('UpdateOnboardingVendorRelationships', '/api/OnboardingRequests/UpdateOnboardingVendorRelationships');
                export const GET_CUSTOM_SAVED_FILTERS = new Endpoint('GetAllSavedFiltersForUser', '/api/OnboardingRequests/GetAllSavedFiltersForUser');
                export const SAVE_CUSTOM_FILTER = new Endpoint('SaveFilterForUser', '/api/OnboardingRequests/SaveFilterForUser');
                export const DELETE_CUSTOM_FILTER = new Endpoint('DeleteFilterForUser', '/api/OnboardingRequests/DeleteFilterForUser');
                export const ONBOARDINGNOTES_GETALL = new Endpoint('ONBOARDINGNOTES_GETALL', '/api/OnboardingNotes/GetAll');
                export const ONBOARDINGNOTES_ADD = new Endpoint('ONBOARDINGNOTES_ADD', '/api/OnboardingNotes/Add');
                export const ONBOARDINGNOTES_UPDATE = new Endpoint('ONBOARDINGNOTES_UPDATE', '/api/OnboardingNotes/Update');
                export const UPDATE_VENDOR_REQUEST_ANSWERS = new Endpoint('UpdateAnswers', '/api/OnboardingRequests/UpdateAnswers');
                export const GET_PENDING_VENDORS = new Endpoint('GetPendingVendorDetails', '/api/OnboardingRequests/GetPendingVendorDetails');
                export const GET_SECTION_INFORMATION = new Endpoint('GetSectionInformation', '/api/OnboardingRequests/GetSectionInformation');
                export const MARK_SECTION_AS_COMPLETED = new Endpoint('MarkSectionAsCompleted', '/api/OnboardingRequests/MarkSectionAsCompleted');
                export const MARK_SECTION_AS_NOT_REQUIRED = new Endpoint('MarkSectionAsNotRequired', '/api/OnboardingRequests/MarkSectionAsNotRequired');
                export const ASSIGN_SECTION = new Endpoint('AssignSection', '/api/OnboardingRequests/AssignSection');
                export const UPDATE_CONTRACTS = new Endpoint('Upload', '/api/OnboardingContract/Upload');
                export const GET_CONTRACTS = new Endpoint('GetContracts', '/api/OnboardingContract/GetContracts');
                export const DOWNLOAD_CONTRACT = new Endpoint('DownloadContract', '/api/OnboardingContract/DownloadContract');
                export const ADD_OR_EDIT_REFERENCE = new Endpoint('AddOrEditReference', '/api/OnboardingReferences/AddOrEditReference');
                export const GET_REFERENCES = new Endpoint('GetReferences', '/api/OnboardingReferences/GetReferences');
                export const DELETE_REFERENCE = new Endpoint('DeleteReference', '/api/OnboardingReferences/DeleteReference');
                export const GET_RISK_LEVELS = new Endpoint('GetRiskLevels', '/api/OnboardingRequests/GetRiskLevels');
                export const GET_RELATIONSHIP_COMPARE_DATA = new Endpoint('GetRelationshipCompareData', '/api/OnboardingRequests/GetRelationshipCompareData');
                export const GENERATE_COMPARISON_EXCEL_REPORT = new Endpoint('GenerateComparisionExcelReport', '/api/OnboardingRequests/GenerateComparisionExcelReport');
                export const GET_ONBOARDING_CLIENT_VENDORS = new Endpoint('GetOnboardingClientVendors', '/api/OnboardingRequests/GetOnboardingClientVendors');
                export const GET_ONBOARDING_CLIENT_PRODUCTS = new Endpoint('GetOnboardingClientProducts', '/api/VendorProducts/GetOnboardingClientProducts');
                export const GET_VENDOR_PROFILE_FOR_ONBOARDING_FORM = new Endpoint('GetVendorProfileForOnboardingForm', '/api/OnboardingRequests/GetVendorProfileForOnboardingForm');
                export const GET_PRODUCT_PROFILE_FOR_ONBOARDING_FORM = new Endpoint('GetProductProfileForOnboardingForm', '/api/OnboardingRequests/GetProductProfileForOnboardingForm');
                export const DELETE_REQUEST_RELATIONSHIP = new Endpoint('DeclineRequestRelationship', '/api/OnboardingRequests/Decline');
                export const REACTIVATE = new Endpoint('Reactivate', '/api/OnboardingRequests/Reactivate');
                export const GET_DUE_DILIGENCES = new Endpoint('GetDueDiligence', '/api/OversightRequirement/GetOnboardingOversightRequirements');
                export const GET_QUESTIONNAIRES = new Endpoint('GetOnboardingQuestionnaireList', '/api/OnboardingRequests/GetOnboardingQuestionnaireList');
                export const GET_ASSESSMENTQUESTIONNAIRE = new Endpoint('GetOnboardingAssessmentQuestionnaireList', '/api/OnboardingRequests/GetOnboardingAssessmentQuestionnaireList');
                export const GET_INPROGRESS_ASSESSMENT = new Endpoint('GetInProgressAssessment', '/api/OnboardingRequests/GetInProgressAssessment');
                export const GET_OVERSIGHT_MANAGEMENT = new Endpoint('GetOversightManagement', '/api/OversightManagement/GetOversightManagement');
                export const SNOOZE_OVERSIGHT_MANAGEMENT = new Endpoint('SnoozeOversightManagement', '/api/OversightManagement/SnoozeOversightManagement');
                export const APPROVE_REQUEST = new Endpoint('ApproveRequest', '/api/OnboardingRequests/ApproveRequest');
                export const MARK_AS_COMPLETE_OR_SAVE = new Endpoint('MarkAsCompleteOrSave', '/api/OversightManagement/UpdateOversightManagement');
                export const IS_EMAIL_VALID = new Endpoint('IsEmailBlacklisted', '/api/FI/VendorContact/IsEmailBlacklisted', true);
                export const ADD_ADDRESS_BOOK = new Endpoint('AddAddressBook', '/api/FI/VendorContact/AddAddressBook', true);
                export const RENEW_INVITE_QUESTIONNAIRE = new Endpoint('RenewInvite', '/api/Questionnaires/RenewInvite');
                export const GENERATE_PDFZIP_FILE = new Endpoint('GenerateQuestionnairePDFZipFile', '/api/OnboardingRequests/GenerateQuestionnairePDFZipFile');
                export const GENERATE_ZIP_FILE = new Endpoint('GenerateQuestionnaireZipFile', '/api/OnboardingRequests/GenerateQuestionnaireZipFile');
                export const GENERATE_DOCUMENT_ZIP_FILE = new Endpoint('GenerateDocumentZipFile', '/api/OnboardingRequests/GenerateDocumentZipFile');
                export const GET_REQUEST_REPORT_DATA = new Endpoint('GetOnboardingRequestReportData', '/api/OnboardingRequests/GetOnboardingRequestReportData');
                export const GENERATE_PDF_REQUEST_REPORT = new Endpoint('GenerateRequestPDFReport', '/api/OnboardingRequests/GenerateRequestPDFReport');
                export const DOWNLOAD_PDF_REQUEST_REPORT = new Endpoint('DownloadOnboardingReport', '/FI/VendorDashboardReport/DownloadOnboardingReport', true);
                export const DOWNLOAD_COMPARISON_EXCEL_REPORT = new Endpoint('DownloadComparisionExcelReport', '/api/OnboardingRequests/DownloadComparisionExcelReport');
                export const GET_PENDING_VENDOR_REQUESTS_RESPONSIBILITIES = new Endpoint('GetPendingVendorRequestsResponsibilities', '/api/OnboardingRequests/GetPendingVendorRequestsResponsibilities');
                export const REASSIGN_VENDOR_REQUEST_RESPONSIBILITIES = new Endpoint('ReassignVendorRequestResponsibilities', '/api/OnboardingRequests/ReassignVendorRequestResponsibilities');
                export const GET_PENDING_REQUESTS_RESPONSIBILITIES_FOR_VMO = new Endpoint('GetPendingResponsibilitiesForVMO', '/api/OnboardingRequests/GetPendingResponsibilitiesForVMO');
                export const CHECK_IF_CLIENT_HAS_QUESTIONNAIRE_TEMPLATE = new Endpoint('CheckIfClientHasQuestionnaireTemplate', '/api/OnboardingRequests/CheckIfClientHasQuestionnaireTemplate');
                export const GET_VENDOR_CRITICALITY = new Endpoint('GetVendorCriticality', '/api/OnboardingRequests/GetVendorCriticality');
                export const GET_REQUESTS_RELATIONSHIPS = new Endpoint('GetRequestRelationship', '/api/OnboardingRequests/GetRequestRelationship');
                export const GET_ONBOARDING_REQUEST_RELATIONSHIP_ID = new Endpoint('GetRequestRelationshipId', '/api/OnboardingRequests/GetVendorOnboardingRequestRelationshipID');
                export const APPROVE_CONTRACTS = new Endpoint('MarkContractAsApproved', '/api/OnboardingContract/MarkContractAsApproved');
                export const DECLINE_CONTRACTS = new Endpoint('MarkContractAsDeclined', '/api/OnboardingContract/MarkContractAsDeclined');
                export const MARK_REVIEW_COMPLETE_CONTRACTS = new Endpoint('MarkContractAsReviewed', '/api/OnboardingContract/MarkContractAsReviewed');
                export const CONTRACT_SUBMITTED_FOR_APPROVAL = new Endpoint('ContractSubmittedForApproval', '/api/OnboardingContract/ContractSubmittedForApproval');
                export const GET_PENDING_REQUESTS = new Endpoint('GetPendingRequestData', '/api/OnboardingRequests/GetPendingRequestData');
                export const GET_PENDING_REQUEST_RELATIONSHIPS = new Endpoint('GetOnboardingRequestDetails', '/api/OnboardingRequests/GetOnboardingRequestDetails');
                export const CANCEL_VENDOR_REQUEST = new Endpoint('CancelVendorRequest', '/api/OnboardingRequests/CancelVendorRequest');
                export const GET_ONBOARDING_SAVED_DRAFTS = new Endpoint('GetOnboardingSavedDrafts', '/api/OnboardingRequests/GetOnboardingSavedDrafts');
                export const GET_DRAFT_REQUEST_DETAILS = new Endpoint('GetDraftRequestDetails', '/api/OnboardingRequests/GetDraftRequestDetails');
                export const ADD_NEW_FOURTH_PARTY_VENDOR = new Endpoint('AddNewOnboardingFourthPartyVendor', '/api/OnboardingRequests/AddNewOnboardingFourthPartyVendor');
                export const UPDATE_BULK_OWNER_FOR_ONBOARDING = new Endpoint('UpdateBulkOwnerForOnboarding', '/api/OnboardingRequests/UpdateBulkOwnerForOnboarding');
                export const UPDATE_BULK_TASK_DATE_FOR_ONBOARDING = new Endpoint('UpdateBulkOwnerForOnboarding', '/api/OnboardingRequests/UpdateBulkTaskDateForOnboarding');
                export const GET_FOURTH_PARTY_VENDOR_PRODUCTS_BY_REQUEST_RELATIONSHIP = new Endpoint('GetFourthPartyVendorProducts', '/api/OnboardingRequests/GetFourthPartyVendorProducts');
                export const MARK_SECTION_SUBMIT_FOR_APPROVAL = new Endpoint('MarkSectionSubmitForApproval', '/api/OnboardingRequests/MarkSectionSubmitForApproval');
                export const MARK_SECTION_AS_APPROVED = new Endpoint('MarkSectionAsApproved', '/api/OnboardingRequests/MarkSectionAsApproved');
                export const MARK_SECTION_AS_DECLINED = new Endpoint('MarkSectionAsDeclined', '/api/OnboardingRequests/MarkSectionAsDeclined');
                export const ReopenSection = new Endpoint('ReopenSection', '/api/OnboardingRequests/ReopenSection');
                export const MODIFY_REQUEST_DEADLINE = new Endpoint('ModifyRequestDeadline', '/api/OnboardingRequests/ModifyRequestDeadline');

                export const REMOVE_VENDOR_RELATIONSHIPS = new Endpoint('RemoveRelationship', '/api/OnboardingRequests/RemoveRelationship');

                export const GET_RISK_ASSESSMENT_SCORES = new Endpoint('GetRiskAssessmentScores', '/api/OnboardingRequests/GetRiskAssessmentScores');
                export const DELETE_DOCUMENT_REQUEST_MAPPING = new Endpoint('DeleteDocumentRequestMapping', '/api/OnboardingRequests/DeleteDocumentRequestMapping');
                export const CREATE_DOCUMENT_REQUEST_MAPPING = new Endpoint('CreateDocumentFourthPartyRequestMapping', '/api/OnboardingRequests/CreateDocumentFourthPartyRequestMapping');
                export const GET_REQUEST_TO_DO_LIST = new Endpoint('GetRequestToDoList', '/api/OnboardingRequests/GetRequestToDoList');
                export const GET_REQUEST_TO_DO_LIST_COUNT = new Endpoint('GetRequestToDoListResultCount', '/api/OnboardingRequests/GetRequestToDoListResultCount');
                export const GET_REQUEST_DOCUMENTS = new Endpoint('GetRequestDocuments', '/api/OnboardingRequests/GetRequestDocuments');
                export const DELETE_REQUEST_DOCUMENT = new Endpoint('DeleteRequestDocument', '/api/OnboardingRequests/DeleteRequestDocument');
                export const UPLOAD_REQUEST_ATTACHMENTS = new Endpoint('uploadRequestAttachments', '/api/OnboardingRequests/UploadRequestAttachments');
                export const GET_ONBOARDING_OVERSIGHT_TASKDOCUMENTS_AND_COMMENTS = new Endpoint('GetOnboardingOversightTaskDocumentsAndComments', '/api/OversightRequirement/GetOnboardingOversightTaskDocumentsAndComments');
                export const GET_OVERSIGHT_RESULTS_AND_INTERNALREVIEWERS_LIST = new Endpoint('GetOversightResultsAndInternalReviewersList', '/api/OversightRequirement/GetOversightResultsAndInternalReviewersList');
                export const CONTRACT_SEND_FOR_REVIEW = new Endpoint('ContractSendForReview', '/api/OnboardingContract/ContractSendForReview');
                export const CONTRACT_GET_STARTED = new Endpoint('ContractGetStarted', '/api/OnboardingContract/ContractGetStarted');
                export const CONTRACT_FORWARD = new Endpoint('ContractForward', '/api/OnboardingContract/ContractForward');
                export const CONTRACT_REPLY = new Endpoint('ContractReply', '/api/OnboardingContract/ContractReply');
                export const CONTRACT_APPROVED = new Endpoint('ContractApproved', '/api/OnboardingContract/ContractApproved');
                export const CONTRACT_DECLINED = new Endpoint('ContractDeclined', '/api/OnboardingContract/ContractDeclined');
                export const CONTRACT_VIEWED = new Endpoint('ContractViewed', '/api/OnboardingContract/ContractViewed');
                export const GET_VENDOR_ONBOARDING_ACTIVE_ENROLLED_USERS = new Endpoint('GetVendorOnboardingActiveEnrolledUsers', '/api/OnboardingRequests/GetVendorOnboardingActiveEnrolledUsers');
                export const GET_ACTIVE_ONBOARDING_WORKFLOW_TEMPLATES = new Endpoint('GetActiveOnboardingWorkflowTemplates', '/api/OnboardingRequests/GetActiveOnboardingWorkflowTemplates');
                export const KICK_OFF_WORKFLOW = new Endpoint('KickOffWorkflow', '/api/OnboardingRequests/KickOffWorkflow');
                export const ARE_REQUIRED_WORKFLOW_COMPLETE_TO_APPROVE_VENDOR = new Endpoint('AreRequiredWorkflowsCompleteToApproveVendor', '/api/OnboardingRequests/AreRequiredWorkflowsCompleteToApproveVendor');
                export const GET_SECTION_APPROVAL_INFORMATION = new Endpoint('getSectionApprovalInformation', '/api/OnboardingSettings/GetSectionApprovalInformation');
                export const GET_ONBOARDING_SECTIONS = new Endpoint('getVendorOnboardingSections', '/api/OnboardingRequests/GetVendorOnboardingSections');
                export const GET_ONBOARDING_STATUES = new Endpoint('getVendorOnboardingSectionStatuses', '/api/OnboardingRequests/GetVendorOnboardingSectionStatuses');
                export const MARK_SECTION_AS_UPDATED = new Endpoint('markSectionAsUpdated', '/api/OnboardingRequests/MarkSectionAsUpdated');
                export const GET_REQUEST_STATUS = new Endpoint('checkRequestStatus', '/api/OnboardingRequests/CheckRequestStatus');
                export const GET_ONBOARDING_VENDOR_DOCUMENTS = new Endpoint('GetOnboardingClientVendorDocuments', '/api/OnboardingRequests/GetOnboardingClientVendorDocuments');

                export const GET_QUICK_VIEW_PDF = new Endpoint('getQuickViewPdf', '/api/OnboardingRequests/GetQuickViewPdf');

                export const UPDATE_ONBOARDING_REQUEST_PRIORITY = new Endpoint('SaveRequestPriorityForOnboardingRequest', '/api/OnboardingRequests/SaveRequestPriorityForOnboardingRequest');
                export const IS_DUPLICATE_SUMISSION = new Endpoint('IsDuplicateSubmission', '/api/OnboardingRequests/IsDuplicateSubmission');
            }

            export namespace FulfillmentVendors {
                export const GET_VENDOR_BY_ID = new Endpoint('getFulfillmentVendor', '/api/FulfillmentVendor/GetVendorByID');
                export const SAVE_FULFILLMENT_VENDOR = new Endpoint('saveFulfillmentVendor', '/api/FulfillmentVendor/SaveFulfillmentVendor');
                export const GET_VENDOR_PRODUCTS = new Endpoint('getVendorProducts', '/api/FulfillmentVendor/GetVendorProducts');
                export const CHECK_FOR_EXISTING_VENDOR = new Endpoint('CheckForExistingVendor', '/api/FulfillmentVendor/CheckForExistingVendor');
                export const GET_VENDOR_ORDER_HISTORY = new Endpoint('GetVendorOrderHistory', '/api/FulfillmentVendor/GetVendorOrderHistory');
                export const CANCEL_CUSTOMER_ORDER = new Endpoint('CancelCustomerOrder', '/api/FulfillmentVendor/CancelCustomerOrder');
                export const GET_VENDOR_CONTACTS = new Endpoint('GetVendorContacts', '/api/FulfillmentVendor/GetVendorContacts');
                export const DEACTIVATE_CONTACT = new Endpoint('DeactivateContact', '/api/FulfillmentVendor/DeactivateContact');
                export const REACTIVATE_CONTACT = new Endpoint('ReactivateContact', '/api/FulfillmentVendor/ReactivateContact');
                export const UPDATE_CONTACT = new Endpoint('UpdateContact', '/api/FulfillmentVendor/UpdateContact');
                export const ADD_ADDRESSBOOK_NOTE = new Endpoint('UpdateContact', '/api/FulfillmentVendor/AddAddressBookNote');
                export const GET_PRODUCTS_BY_VENDOR_ID = new Endpoint('getVendorProductByVendorId', '/api/FulfillmentVendor/GetVendorProductByVendorId');
            }

            export namespace Vendors {
                export const CHECK_DUPLICATE_LABEL_PRODUCT = new Endpoint('checkDuplicateLabelForProduct', '/api/VendorProducts/CheckForDuplicateLabel');
                export const CHECK_DUPLICATE_LABEL_VENDOR = new Endpoint('checkDuplicateLabelForVendor', '/api/vendorProfile/CheckForDuplicateLabel');
                export const GET_VENDORS_WITH_QUESTIONNAIRE_REQUESTS = new Endpoint('getVendorsWithQuestionnaire', '/api/Questionnaires/GetVendorsWithQuestionnaireRequests');
                export const GET_CATEGORIES = new Endpoint('getCategories', '/api/VendorProducts/GetCategories');
                export const GET_CATEGORY_FOR_VENDOR = new Endpoint('getCategoryForVendor', '/api/VendorProducts/GetCategoryForVendor');
                export const GET_DUPLICATE_QUESTIONS_VENDOR = new Endpoint('getDuplicateQuestionForVendor', '/api/vendorProfile/GetProfileItemsForPredictiveType');
                export const GET_DUPLICATE_QUESTIONS_PRODUCT = new Endpoint('getDuplicateQuestionForProduct', '/api/vendorProducts/GetProfileItemsForPredictiveType');
                export const GET_VENDORS = new Endpoint('getVendors', '/api/VendorProducts/GetVendors');
                export const IS_THIRD_PARTY_VENDOR = new Endpoint('isThirdPartyVendor', '/api/VendorProducts/IsThirdPartyVendor');
                export const GET_VENDORS_BY_NICKNAME_ID = new Endpoint('getVendorsByNicknameId', '/api/VendorProducts/GetVendorsByNicknameId');
                export const GET_CLIENT_VENDORS = new Endpoint('getClientVendors', '/api/VendorProducts/GetClientVendors');
                export const GET_CLIENT_VENDORS_FOR_ORDER_VERIFICATION_DOC_STORAGE = new Endpoint('getClientVendorsForOrderVerificationDocStorage', '/api/VendorProducts/GetClientVendorsForOrderVerificationDocStorage');
                export const DELETE_VENDOR = new Endpoint('deleteVendor', '/api/FI/EnterpriseVendorDashboard/DeleteVendor', true);
                export const GET_ARE_ANY_PRODUCTS_AVAILABLE_FOR_CONTRACTS = new Endpoint('getProductAvailableforContractInformation', '/api/FI/EnterpriseVendorDashboard/GetAreAnyProductsAvailableForContracts', true);
                export const GET_COMPLIANCE_AND_OVERSIGHT_TASKS = new Endpoint('getVendorComplianceTasks', '/api/Client/EnterpriseVendorDashboard/GetComplianceAndOversight', true);
                export const GET_VENDOR_SCORECARD_DETAILS = new Endpoint('GetVendorScorecardDetails', '/api/VendorDashboard/GetVendorScorecardDetails');
                export const GET_CONTRACTS = new Endpoint('getVendorContractInformation', '/api/FI/EnterpriseVendorDashboard/GetContracts', true);
                export const GET_CONFIDENCE_LEVEL = new Endpoint('getConfidenceLevel', '/api/Client/VendorDashboard/GetConfidenceLevel', true);
                export const SET_CONFIDENCE_LEVEL = new Endpoint('setConfidenceLevel', '/api/Client/VendorDashboard/SetConfidenceLevel', true);
                export const GET_PRODUCTS = new Endpoint('getVendorProducts', '/api/VendorProducts/GetVendorProducts');
                export const GET_VENDOR_INFORMATION = new Endpoint('getVendorInformation', '/api/VendorDashboard/GetVendorInformation', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('vendorNicknameId', true, 2)]);
                export const GET_VENDORS_WITH_RELATIONSHIP = new Endpoint('getVendorsWithRelationship', '/api/FI/EnterpriseVendorDashboard/GetVendors', true);
                export const GET_VENDORS_PRODUCTS = new Endpoint('getVendorsWithRelationship', '/api/FI/EnterpriseVendorDashboard/GetProducts', true);
                export const UPDATE_THIRD_FOURTH_PARTY = new Endpoint('postRelationshipUpdate', '/api/FI/EnterpriseVendorDashboard/UpdateThirdFourthParty', true);
                export const GET_DASHBOARD_REPORT_DATA = new Endpoint('getDashboardReportData', '/api/VendorDashboardReport/GetReport');
                export const GET_DASHBOARD_REPORT_GET_ACTIVE_MODULES = new Endpoint('getActiveModules', '/api/VendorDashboardReport/GetActiveModules');
                export const GENERATE_DASHBOARD_REPORT = new Endpoint('generateDashboardReport', '/api/VendorDashboardReport/GenerateReport');
                export const GENERATE_TASK_REPORT = new Endpoint('generateTaskReport', '/api/OversightRequirement/GenerateTaskReport');
                export const DOWNLOAD_TASK_REPORT = new Endpoint('downloadTaskReport', '/api/VendorDashboardReport/DownloadOversightTaskReport', true);
                export const VENDOR_ASSESSMENTS = new Endpoint('VendorAssessments', '/api/VendorAssessment/GetVendorAssessmentsForContact');
                export const SEND_CONTROL_ASSESSMENT_ASSISSTANCE_EMAIL = new Endpoint('VendorAssessments', '/api/VendorAssessment/SendControlAssessmentAssistanceEmail');
                export const VENDOR_ASSESSMENTS_CLIENT = new Endpoint('VendorAssessments', '/api/VendorAssessment/GetVendorAssessments');
                export const VENDOR_ASSESSMENTS_CLIENT_BY_ASSESSMENT_ID = new Endpoint('VendorAssessmentsByAsssessmentID', '/api/VendorAssessment/GetVendorAssessmentsByAssessmentID');
                export const VENDOR_ASSESSMENT = new Endpoint('VendorAssessment', '/api/VendorAssessment/GetVendorAssessment');
                export const IMPROVE_ASSESSMENT_SCORE_REQUEST = new Endpoint('ImproveAssessmentScoreRequest', '/api/VendorAssessment/CreateImproveAssessmentScoreRequest');
                export const UNMUTE_ASSESSMENT = new Endpoint('UmuteAssessment', '/api/VendorAssessment/UnMuteAssessmentScoreByID');
                export const GET_COMPLETED_FULFILLMENT_VENDORS = new Endpoint('GetCompletedFulfillmentVendors', '/api/ControlAssessment/GetFulfillmentVendorsForCompletedAssessments');
                export const GET_EXCHANGE_VENDORS_LIST = new Endpoint('getExchangeVendorsList', '/api/ControlAssessment/GetExchangeVendorsList');
                export const GET_INVITED_FULFILLMENT_VENDORS = new Endpoint('GetInvitedFulfillmentVendorsForClient', '/api/ControlAssessment/GetInvitedFulfillmentVendorsForClient');
                export const GET_VENDOR_ASSESSMENT_DETAILS = new Endpoint('GetAssessmentDataResult', '/api/VendorAssessment/GetAssessmentDataResult');
                export const GET_VENDOR_PERMISSIONS = new Endpoint('VendorAssessments', '/api/VendorAssessment/GetVendorPermissions');
                export const GET_VENDOR_ASSESSMENT_ORDER_HISTORY = new Endpoint('getServiceOrdersForNCClient', '/api/ServiceOrders/GetServiceOrdersForNCClient');
                export const REMOVE_PENDING_SERVICE_ORDERS = new Endpoint('removePendingServiceOrders', '/api/OrderHistory/RemovePendingServiceOrders');
                export const GET_FULFILLMENT_VENDORS_FOR_CONTACT = new Endpoint('VendorAssessments', '/api/VendorAssessment/GetFulfillmentVendorsForContact');
                export const VENDOR_INFORMATION_WITH_BU = new Endpoint('VendorInformationWithBU', '/api/VendorDashboard/VendorInformationWithBU');

                export const GET_IS_SECURITY_SCORECARD_TOKEN_VALID = new Endpoint('getIsSecurityScorecardTokenValid', '/api/VendorScorecard/GetIsSecurityScorecardTokenValid', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true), new QueryStringParameterRule('token', true)]);
                export const GET_SECURITY_SCORECARD_COMPANY_SCORES = new Endpoint('getSecurityScorecardCompanyScores', '/api/VendorScorecard/GetSecurityScorecardCompanyScores', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('vendorNicknameId', true)]);
                export const GET_SECURITY_SCORECARD_DOMAINS = new Endpoint('getSecurityScorecardDomains', '/api/VendorScorecard/GetSecurityScorecardDomains');
                export const ADD_SECURITY_SCORECARD_NICKNAME_DOMAIN = new Endpoint('addSecurityScorecardNicknameDomain', '/api/VendorScorecard/AddSecurityScorecardNicknameDomain');
                export const DELETE_SECURITY_SCORECARD_NICKNAME_DOMAIN = new Endpoint('deleteSecurityScorecardNicknameDomain', '/api/VendorScorecard/DeleteSecurityScorecardNicknameDomain', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('vendorNicknameId', true, 1), new QueryStringParameterRule('domain', true, 2)]);

                export const GET_ARGOS_COMPANIES_FOR_NICKNAME = new Endpoint('getArgosCompaniesForNickname', '/api/VendorScorecard/GetArgosCompaniesForNickname', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('vendorNicknameId', true)]);
                export const GET_ARGOS_COMPANY_SCORES = new Endpoint('getArgosCompanyScores', '/api/VendorScorecard/GetArgosCompanyScores');
                export const ADD_ARGOS_NICKNAME_COMPANY = new Endpoint('addArgosNicknameCompany', '/api/VendorScorecard/AddArgosNicknameCompany');
                export const DELETE_ARGOS_NICKNAME_COMPANY = new Endpoint('deleteArgosNicknameCompany', '/api/VendorScorecard/DeleteArgosNicknameCompany', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('vendorNicknameId', true, 1), new QueryStringParameterRule('companyId', true, 2)]);

                export const GET_BITSIGHT_INTEGRATION_STATUS_ASYNC = new Endpoint('getBitSightIntegrationStatusAsync', '/api/OnboardingBitSight/GetBitSightIntegrationStatusAsync', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1)]);
                export const GET_BITSIGHT_INTEGRATION_STATUS_WITH_TOKEN_ASYNC = new Endpoint('getBitSightIntegrationStatusWithTokenAsync', '/api/OnboardingBitSight/GetBitSightIntegrationStatusWithTokenAsync', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('token', true)]);
                export const GET_BITSIGHT_ONBOARDING_LICENSE_USAGE_ASYNC = new Endpoint('getBitSightOnboardingLicenseUsageAsync', '/api/OnboardingBitSight/GetBitSightOnboardingLicenseUsageAsync', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1)]);
                export const SEARCH_BITSIGHT_FOR_COMPANIES_FOR_ONBOARDING_ASYNC = new Endpoint('searchBitSightForCompaniesForOnboardingAsync', '/api/OnboardingBitSight/SearchBitSightForCompaniesForOnboardingAsync', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('vendorId', true, 2), new QueryStringParameterRule('domain', true, 3)]);
                export const GET_BITSIGHT_OUTSTANDING_REQUEST_FOR_ONBOARDING_ASYNC = new Endpoint('getBitSightOutstandingRequestAsync', '/api/OnboardingBitSight/GetBitSightOutstandingRequestAsync', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('vendorId', true, 2)]);
                export const GET_AND_PERSIST_COMPANY_RATINGS_FROM_BITSIGHT_FOR_ONBOARDING_ASYNC = new Endpoint('getAndPersistCompanyRatingsFromBitSightForOnboardingAsync', '/api/OnboardingBitSight/GetAndPersistCompanyRatingsFromBitSightForOnboardingAsync');
                export const REFRESH_RISK_RATINGS_FROM_BITSIGHT_FOR_ONBOARDING_ASYNC = new Endpoint('refreshRiskRatingsFromBitSightForOnboardingAsync', '/api/OnboardingBitSight/RefreshRiskRatingsFromBitSightForOnboardingAsync');
                export const GET_COMPANY_RATINGS_FOR_VENDOR_NICKNAME_FOR_ONBOARDING_ASYNC = new Endpoint('getCompanyRatingsForVendorNicknameForOnboardingAsync', '/api/OnboardingBitSight/GetCompanyRatingsForVendorNicknameForOnboardingAsync', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('vendorNicknameId', true, 2)]);
                export const DELETE_DOMAIN_LINK_FOR_ONBOARDING = new Endpoint('deleteDomainLinkForOnboarding', '/api/OnboardingBitSight/RemoveDomainLink', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('vendorNicknameId', true, 2)]);

                export const GET_IS_BITSIGHT_TOKEN_VALID = new Endpoint('getIsBitSightTokenValid', '/api/VendorScorecard/GetIsBitSightTokenValid', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true), new QueryStringParameterRule('token', true)]);
                export const GET_IS_BITSIGHT_TOKEN_VALID_FOR_ONBOARDING = new Endpoint('getIsBitSightTokenValidForOnboarding', '/api/VendorScorecard/GetIsBitSightTokenValidForOnboarding', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true), new QueryStringParameterRule('token', true)]);
                export const GET_BITSIGHT_COMPANIES = new Endpoint('getBitSightCompanies', '/api/VendorScorecard/GetBitSightCompanies');
                export const GET_BITSIGHT_RATINGS_FOR_VENDOR_NICKNAME = new Endpoint('getRatingsForVendorNickname', '/api/VendorScorecard/GetBitSightRatingsForVendorNickname', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('vendorNicknameId', true)]);
                export const GET_IS_VENDOR_LINKED_TO_BITSIGHT_COMPANY = new Endpoint('getIsVendorLinkedToBitsightCompany', '/api/VendorScorecard/GetIsVendorLinkedToBitsightCompany', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('vendorNicknameId', true)]);
                export const ADD_BITSIGHT_NICKNAME_COMPANY = new Endpoint('addBitSightNicknameCompany', '/api/VendorScorecard/AddBitSightNicknameCompany');
                export const DELETE_BITSIGHT_NICKNAME_COMPANY = new Endpoint('deleteBitSightNicknameCompany', '/api/VendorScorecard/DeleteBitSightNicknameCompany', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('vendorNicknameId', true, 1), new QueryStringParameterRule('companyId', true, 2)]);

                export const GENERATE_ASSESSMENT_ORDER_DOCUMENT_ZIP = new Endpoint('generateAndDownloadZipFile', '/api/ServiceOrders/GenerateAndDownloadZipFile');
                export const DOWNLOAD_ASSESSMENT_ORDER_DOCUMENT_ZIP = new Endpoint('downloadFileByName', '/FI/VendorDashboardReport/DownloadFileByName', true);
                export const SAVE_DATA_FROM_VM_EXCHANGE = new Endpoint('saveDataFromRedirectFromVenminderExchange', '/api/VendorAssessment/SaveDataFromRedirectFromVenminderExchange');
                export const GET_VENDORS_BY_INDUSTRY = new Endpoint('getVendorsByIndustry', '/api/VendorAssessment/GetVendorsByIndustry');
                export const CLIENT_HAS_VENDOR_INVITE_TOKEN = new Endpoint('clientHasVendorInviteToken', '/api/VendorAssessment/ClientHasVendorInviteToken');
                export const GET_VENDOR_DETAILS_FOR_DIALOG = new Endpoint('getVendorDetailsForDialog', '/api/VendorProducts/GetVendorDetailsForDialog');

                export namespace Checklist {
                    export const GET_ALL = new Endpoint('getVendorChecklistItems', '/api/VendorChecklistItem/GetAll');
                    export const ADD = new Endpoint('postChecklistItemData', '/api/VendorChecklistItem/Add');
                    export const REMOVE = new Endpoint('removeChecklistItemData', '/api/VendorChecklistItem/Remove');
                    export const IS_CLIENT_SERVICES_ONLY = new Endpoint('select-services-isClientServicesOnly', '/api/Client/IsClientServicesOnly');
                    export const IS_CLIENT_SERVICES_ONLY_BY_ID = new Endpoint('select-services-IsClientServicesOnlyByServiceOrderClientID', '/api/Client/IsClientServicesOnlyByServiceOrderClientID');
                    export const UPDATE = new Endpoint('updateChecklistItem', '/api/VendorChecklistItem/Update');
                }

                export namespace Contacts {
                    export const GET_ACTIVE_CONTACTS = new Endpoint('getActiveContacts', '/api/Contact/GetActiveContactsForFI');
                    export const DELETE_PRODUCT_CONTACT = new Endpoint('deleteContactForProduct', '/api/Client/VendorContact/DeleteForProduct', true);
                    export const UPDATE_PRODUCT_CONTACT = new Endpoint('updateProductContact', '/api/Client/VendorContact', true);
                }

                export namespace Products {
                    export const ADD_NEW_VENDOR_PRODUCTS = new Endpoint('addNewVendors', '/api/VendorProducts/AddNewVendors');
                    export const GET_ADDED_PRODUCTS_FOR_VENDOR = new Endpoint('getAddedProductsForVendor', '/api/VendorProducts/GetAddedProductsForVendor');
                    export const GET_CLIENT_CRITICAL_VENDOR_PRODUCTS = new Endpoint('getClientCriticalVendorProducts', '/api/VendorProducts/GetClientCriticalVendorProduct');
                    export const GET_CLIENT_CRITICAL_VENDOR_PRODUCTS_FOR_ORDER_VERIFICATION_SERVICE_ORDER = new Endpoint('getCriticalProductsForOrderVerificationServiceOrderClient', '/api/VendorProducts/GetCriticalProductsForOrderVerificationServiceOrderClient');
                    export const GET_CLIENT_PRODUCTS = new Endpoint('getClientProducts', '/api/VendorProducts/GetClientProducts');
                    export const GET_CLIENT_PRODUCTS_RELATIONSHIPS = new Endpoint('getClientProductsRelationships', '/api/VendorProducts/GetClientProductRelationships');
                    export const GET_CLIENT_PRODUCTS_FOR_ORDER_VERIFICATION_SERVICE_ORDER = new Endpoint('getVendorProductsForOrderVerificationServiceOrderClient', '/api/VendorProducts/GetVendorProductsForOrderVerificationServiceOrderClient');
                    export const GET_MANAGERS = new Endpoint('getManagers', '/api/VendorProducts/GetManagers');
                    export const GET_PRODUCT_TYPES = new Endpoint('getProductTypes', '/api/VendorProducts/GetProductTypes');
                    export const IS_PRODUCT_MANAGER_OR_COLLABORATOR_FOR_VENDOR = new Endpoint('isProductManagerOrCollaboratorForVendor', '/api/VendorProducts/IsProductManagerOrCollaboratorForVendor');
                    export const HAS_SPECIFIED_ROLE_ACCESS_TO_VENDOR = new Endpoint('hasSpecifiedRoleAccessForVendor', '/api/VendorProducts/HasSpecifiedRoleAccessForVendor');
                    export const IS_PRODUCT_MANAGER_OR_COLLABORATOR_FOR_PRODUCT = new Endpoint('isProductManagerOrCollaboratorForProduct', '/api/VendorProducts/IsProductManagerOrCollaboratorForProduct');
                    export const SAVE_PRODUCT_AS_COLLABORATOR = new Endpoint('saveProductAsCollaborator', '/api/VendorProducts/SaveProductAsCollaborator');
                    export const SAVE_USER_AS_PRODUCT_MANAGER = new Endpoint('saveUserAsProductManager', '/api/VendorProducts/SaveUserAsProductManager');
                    export const GET_PRODUCT_DETAILS_FOR_EDIT = new Endpoint('getProductRiskDetails', '/api/FI/EnterpriseVendorDashboard/GetEditProductDetails', true);
                    export const UPDATE_PRODUCT_RISK_RATING = new Endpoint('postProductRiskAssessment', '/api/VendorProducts/UpdateProductRiskRating');
                    export const GET_DATA_CENTER_LOCATIONS = new Endpoint('GetDataCenterLocations', '/api/VendorProducts/GetDataCenterLocations');
                    export const GET_AVAILABLE_ASSESSMENTS_FOR_VENDOR = new Endpoint('GetAvailableAssessmentsForVendor', '/api/VendorProducts/GetAvailableAssessmentsForVendor');
                    export const REMOVE_COLLABORATOR_FROM_PRODUCT: Endpoint = new Endpoint('removeCollaboratorFromProduct', '/api/VendorProducts/RemoveCollaboratorFromProduct');
                    export const GET_REVIEW_DATE = new Endpoint('GetDataCenterLocations', '/api/VendorProducts/GetAnnualReviewDate');
                    export const GET_AVAILABLE_CONTROL_ASSESSMENTS: Endpoint = new Endpoint('getAvailableControlAssessments', '/api/ControlAssessments/GetAvailableControlAssessments');
                    export const GET_CARTED_SERVICE_ORDER_ITEMS_COUNT: Endpoint = new Endpoint('getCartedServiceOrderItemsCount', '/api/ControlAssessments/GetCartedServiceOrderItemsCount');
                    export const GET_CARTED_SERVICE_ORDER_ITEMS: Endpoint = new Endpoint('getCartedServiceOrderItems', '/api/ControlAssessments/GetCartedServiceOrderItems');
                    export const ADD_CONTROL_ASSESSMENT_TO_CART: Endpoint = new Endpoint('addControlAssessmentToCart', '/api/ControlAssessments/AddControlAssessmentToCart');
                    export const REMOVE_SERVICE_ORDER_ITEM_FROM_CART: Endpoint = new Endpoint('removeServiceOrderItemFromCart', '/api/ControlAssessments/RemoveServiceOrderItemFromCart');
                    export const SUBMIT_CONTROL_ASSESSMENT_ORDER: Endpoint = new Endpoint('submitControlAssessmentOrder', '/api/ControlAssessments/SubmitControlAssessmentOrder');
                    export const SEND_SUPPORT_REQUEST: Endpoint = new Endpoint('sendSupportRequest', '/api/ControlAssessments/SendSupportRequest');
                    export const USER_CAN_ADD_SELF_AS_COLLABORATOR: Endpoint = new Endpoint('canUserAddSelfAsCollaborator', '/api/VendorProducts/CanUserAddSelfAsCollaborator');
                    export const UPDATE_VENDOR_NICKNAME = new Endpoint('updateVendorNickname', '/api/VendorProducts/UpdateVendorNickname');
                    export const UPDATE_PRODUCT_NICKNAME = new Endpoint('updateProductNickname', '/api/VendorProducts/UpdateProductNickname');
                    export const UPDATE_PRODUCT_STATUS = new Endpoint('updateProductStatus', '/api/VendorProducts/UpdateProductStatus');
                    export const UPDATE_PRODUCT_VENDOR = new Endpoint('updateProductVendor', '/api/VendorProducts/UpdateProductVendor');

                    export namespace ProductProfile {
                        export const GET_PRODUCT_PROFILE = new Endpoint('getProductProfileInformation', '/api/VendorProducts/GetProductProfile');
                        export const UPDATE_PRODUCT_PROFILE = new Endpoint('updateProductProfile', '/api/VendorProducts/UpdateProductProfile');
                        export const DELETE_PRODUCT_RELATIONSHIP = new Endpoint('deleteProductRelationship', '/api/VendorProducts/DeleteProductRelationship');
                        export const POST_COMPLEX_PRODUCT_PROFILE_QUESTION = new Endpoint('postComplexProductProofileQuestion', '/api/VendorProducts/CreateProductProfileQuestion');
                        export const EDIT_COMPLEX_PRODUCT_PROFILE_QUESTION = new Endpoint('postComplexProductProofileQuestion', '/api/VendorProducts/UpdateProductProfileQuestion');
                        export const AFFECTED_PROFILE_COUNT_ON_DELETE_RULE = new Endpoint('postComplexProductProofileQuestion', '/api/vendorProducts/GetAnsweredSubQuestionCountOnRuleDelete');
                        export const UPDATE_NPI_ANSWER = new Endpoint('updateNPIAccessAnswer', '/api/vendorProducts/AnswerProductProfileQuestion');
                        export const UPDATE_NPI_AND_RISK_ANSWER = new Endpoint('updateNpiAndRisk', '/api/vendorProducts/SetRiskAndNpiAccess');
                        export const GET_PRODUCT_PROFILE_QUESTION = new Endpoint('getProductProfileInformation', '/api/VendorProducts/GetProductProfileQuestion', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('questionId', true, 2)]);
                        export const DELETE_PRODUCT_PROFILE_QUESTION = new Endpoint('deleteProductProfileInformation', '/api/VendorProducts/DeleteProductProfileQuestion', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 1), new QueryStringParameterRule('questionId', true, 2)]);
                    }
                }

                export namespace VendorProfile {
                    export const GET_VENDOR_PROFILE = new Endpoint('getVendorInformation', '/api/FI/VendorProfile/GetVendorProfile', true);
                    export const UPDATE_VENDOR_PROFILE = new Endpoint('updateProfile', '/api/VendorProfile/UpdateVendorProfile');
                    export const GET_CONTRACTS_FOR_VENDOR = new Endpoint('getContractsForVendor', '/api/VendorProfile/GetContractData');
                    export const GET_VENDOR_PROFILE_DATA = new Endpoint('getVendorInformationData', '/api/VendorProfile/GetVendorProfile');
                    export const GET_VENDOR_PROFILE_QUESTIONS_FOR_SYNC = new Endpoint('getVendorInformationData', '/api/VendorProfile/GetVendorProfileQuestionsForSyncRequest');
                    export const IS_QUESTION_ON_QUESTIONNAIRE = new Endpoint('IsVendorOrProductProfileQuestionInUseInQuestionnaires', '/api/VendorProfile/IsVendorOrProductProfileQuestionInUseInQuestionnaires');
                    export const GET_QUESTIONNAIRES_FOR_QUESTION = new Endpoint('IsVendorOrProductProfileQuestionInUseInQuestionnaires', '/api/VendorProfile/GetQuestionnairesForQuestion');
                    export const POST_COMPLEX_VENDOR_PROFILE_QUESTION = new Endpoint('postComplexVendorProfileQuestion', '/api/vendorProfile/CreateVendorProfileQuestion');
                    export const EDIT_COMPLEX_VENDOR_PROFILE_QUESTION = new Endpoint('postComplexVendorProfileQuestion', '/api/vendorProfile/UpdateVendorProfileQuestion');
                    export const AFFECTED_PROFILE_COUNT_ON_DELETE_RULE = new Endpoint('postComplexProductProofileQuestion', '/api/vendorProfile/GetAnsweredSubQuestionCountOnRuleDelete');
                    export const AFFECTED_PROFILE_COUNT_ON_DELETE_RESPONSE = new Endpoint('postComplexProductProofileQuestion', '/api/vendorProfile/GetAnsweredResponseCount');
                    export const GET_VENDOR_PROFILE_FOR_DASHBOARD = new Endpoint('getVendorInformationData', '/api/VendorProfile/GetVendorProfileForDashboard');
                    export const GET_VENDOR_CRITICALITY_STATUS = new Endpoint('getVendorInformationData', '/api/VendorProfile/GetCriticalityStatus');
                    export const UPDATE_CRITICALITY_ANSWER = new Endpoint('getVendorInformationData', '/api/VendorProfile/SetVendorProfileAnswer');
                    export const GET_COUNTRY_CODES = new Endpoint('getCountryCodes', '/api/VendorProfile/GetCountryCodes');
                }

                export namespace VendorSpend {
                    export const GET_ALL_BUDGETS = new Endpoint('getAllVendorSpendBudgetsForVendor', '/api/VendorSpend/GetAllVendorSpendBudgetsForVendor');
                    export const GET_SPEND_BUDGET_SUMMARY_FOR_CURRENT_YEAR = new Endpoint('getVendorSpendBudgetSummaryForCurrentYear', '/api/VendorSpend/GetVendorSpendBudgetSummaryForCurrentYear');
                    export const GET_VENDOR_SPEND_BUDGET_SUMMARY_FOR_BUDGET = new Endpoint('getVendorSpendBudgetSummaryForBudget', '/api/VendorSpend/GetVendorSpendBudgetSummaryForBudget');
                    export const GET_VENDOR_PRODUCTS = new Endpoint('getVendorProducts', '/api/VendorSpend/GetVendorProducts');
                    export const ADD_VENDOR_SPEND_BUDGET = new Endpoint('addVendorSpendBudget', '/api/VendorSpend/AddVendorSpendBudget');
                    export const UPDATE_VENDOR_SPEND_BUDGET = new Endpoint('updateVendorSpendBudget', '/api/VendorSpend/UpdateVendorSpendBudget');
                    export const DELETE_VENDOR_SPEND_BUDGET = new Endpoint('deleteVendorSpendBudget', '/api/VendorSpend/DeleteVendorSpendBudget');
                    export const ADD_VENDOR_SPEND_INVOICE_DETAIL = new Endpoint('addVendorSpendInvoiceDetail', '/api/VendorSpend/AddVendorSpendInvoiceDetail');
                    export const UPDATE_VENDOR_SPEND_INVOICE_DETAIL = new Endpoint('updateVendorSpendInvoiceDetail', '/api/VendorSpend/UpdateVendorSpendInvoiceDetail');
                    export const BULK_UPDATE_VENDOR_SPEND_INVOICE_DETAIL = new Endpoint('bulkUpdateVendorSpendInvoiceDetails', '/api/VendorSpend/BulkUpdateVendorSpendInvoiceDetails');
                    export const GET_ALL_VENDOR_SPEND_INVOICE_DETAILS = new Endpoint('getAllVendorSpendInvoiceDetails', '/api/VendorSpend/GetAllVendorSpendInvoiceDetails');
                    export const GET_NON_BUDGETED_VENDOR_SPEND_INVOICES_FOR_DATE_RANGE = new Endpoint('GetNonBudgetedVendorSpendInvoicesForDateRange', '/api/VendorSpend/GetNonBudgetedVendorSpendInvoicesForDateRange');
                    export const DELETE_VENDOR_SPEND_INVOICE = new Endpoint('deleteVendorSpendInvoiceDetail', '/api/VendorSpend/DeleteVendorSpendInvoiceDetail');
                }

                export namespace Contracts {
                    export const UPLOAD_CONTRACTS_FOR_PRODUCTS = new Endpoint('uploadContractsForProducts', '/api/UploadContract/UploadContractsForProducts');
                    export const ACTIVE_CLIENT_USERS_FOR_CONTRACT_UPLOAD = new Endpoint('activeClientUsersForContractUpload', '/api/UploadContract/ActiveClientUsersForContractUpload');
                    export const GET_RELATIONSHIP_INFO = new Endpoint('getRelationshipInfo', '/api/UploadContract/GetRelationshipInfo');
                    export const GET_INFORMATION_BASED_ON_CONTRACT = new Endpoint('GetInformationBasedOnContract', '/api/UploadContract/GetInformationBasedOnContract');
                }
            }

            export namespace Workflows {
                export const CANCEL_WORKFLOW = new Endpoint('cancelWorkflow', '/api/Workflows/CancelWorkflow');
                export const DOWNLOAD_NOTE_DOCUMENT_ZIP = new Endpoint('downloadNoteDocumentZip', '/api/Workflows/DownloadNoteDocumentZip');
                export const GET_WORKFLOWS_FOR_RELATIONSHIP_ID = new Endpoint('getWorkflowsForRelationshipID', '/api/Workflows/GetWorkflowsForRelationshipID');
                export const GET_ONBOARDING_WORKFLOWS_FOR_RELATIONSHIP_ID = new Endpoint('getOnboardingWorkflowsForRelationshipID', '/api/Workflows/GetOnboardingWorkflowsForRelationshipID');
                export const GET_PROUCTS_WITH_WORKFLOWS_FOR_VENDOR_NICKNAME = new Endpoint('getProductsWithWorkflowsForVendorNickname', '/api/Workflows/GetProductsWithWorkflowsForVendorNickname');
                export const GET_PROUCT_WITH_WORKFLOWS_FOR_ONBOARDING_REQUEST = new Endpoint('getProductWithWorkflowsForOnboardingRequest', '/api/Workflows/GetProductWithWorkflowsForOnboardingRequest');
                export const GET_PROUCT_WITH_WORKFLOWS_FOR_OFFBOARDING_REQUEST = new Endpoint('getProductWithWorkflowsForOffboardingRequest', '/api/Workflows/GetProductWithWorkflowsForOffboardingRequest');
                export const GET_WORKFLOW_STEP_BY_ID = new Endpoint('getWorkflowStepByID', '/api/Workflows/GetWorkflowStepByID');
                export const GetVendorDashboardWidgetData = new Endpoint('getVendorDashboardWidgetData', '/api/Workflows/GetVendorDashboardWidgetData');
                export const LINK_STEP_NOTE_DOCUMENT = new Endpoint('linkStepNoteDocument', '/api/Workflows/LinkStepNoteDocument');
                export const UPLOAD_STEP_NOTE_DOCUMENT = new Endpoint('uploadStepNoteDocument', '/api/Workflows/UploadStepNoteDocument');
                export const UPDATE_WORKFLOW_STEP = new Endpoint('updateWorkflowStep', '/api/Workflows/UpdateWorkflowStep');
                export const UPDATE_WORKFLOW_STEP_CLAIMED_BY = new Endpoint('updateWorkflowStepClaimedBy', '/api/Workflows/UpdateWorkflowStepClaimedBy');
                export const GetRouteUrlForWorkflowStep = new Endpoint('getRouteUrlForWorkflowStep', '/api/Workflows/GetRouteUrlForWorkflowStep');
                export const GetIsUploadContractStepAbleToMoveToApproval = new Endpoint('getIsUploadContractStepAbleToMoveToApproval', '/api/Workflows/GetIsUploadContractStepAbleToMoveToApproval');
                export const GET_STEP_QUESTIONNAIRE_INFO = new Endpoint('getStepQuestionnaireResponsesInfo', '/api/Workflows/GetStepQuestionnaireResponsesInfo');
                export const GET_QUESTIONNAIRE_STEP_INFO = new Endpoint('getQuestionnaireStepInfo', '/api/Workflows/GetQuestionnaireStepInfo');
                export const GET_ACTIVE_WORKFLOWS_FOR_RELATIONSHIP_REPORT = new Endpoint('getActiveWorkflowsForRelationshipReport', '/api/Workflows/GetActiveWorkflowsForRelationshipReport');
                export const GET_ACTIVE_WORKFLOWS_FOR_RELATIONSHIP = new Endpoint('getActiveWorkflowsForRelationship', '/api/Workflows/GetActiveWorkflowsForRelationship');
                export const GET_ACTIVE_WORKFLOWS_FOR_RELATIONSHIP_ONBOARDING_REPORT = new Endpoint('getActiveWorkflowsForRelationshipOnboardingReport', '/api/Workflows/GetActiveWorkflowsForRelationshipOnboardingReport');
                export const GET_ACTIVE_WORKFLOWS_FOR_RELATIONSHIP_ONBOARDING = new Endpoint('getActiveWorkflowsForRelationshipOnboarding', '/api/Workflows/GetActiveWorkflowsForRelationshipOnboarding');
                export const REASSIGN_WORKFLOW_STEPS = new Endpoint('reassignWorkflowSteps', '/api/Workflows/ReassignWorkflowSteps');
                export const GET_ACTIVE_WORKFLOW_STEPS_CLAIMED_OR_ASSIGNED_BY_CONTACT_ID = new Endpoint('getActiveWorkflowStepsClaimedOrAssignedByContactID', '/api/Workflows/GetActiveWorkflowStepsClaimedOrAssignedByContactID');
                export const UPDATE_WORKFLOW_STEP_EDIT_FILES = new Endpoint('updateWorkflowStepNoteFiles', '/api/Workflows/UpdateWorkflowStepNoteFiles');
                export const GetIsCreateWorkflowForAllActiveProductsJobRunning = new Endpoint('getIsCreateWorkflowForAllActiveProductsJobRunning', '/api/Workflows/GetIsCreateWorkflowForAllActiveProductsJobRunning');
                export const GET_OVERSIGHT_STEP_SNAPSHOT = new Endpoint('getOversightStepSnapshot ', '/api/Workflows/GetOversightStepSnapshot');
                export const CREATE_SNAPSHOT = new Endpoint('createSnapshot', '/api/Workflows/CreateSnapshot');
                export const GET_ONDEMAND_WORKFLOW_TEMPLATES = new Endpoint('getAllNonRecurringOnDemandWorkflowTemplatesByClientID', '/api/Workflows/GetAllOnDemandWorkflowTemplatesByClientID');
                export const CREATE_ONDEMAND_WORKFLOW = new Endpoint('createNonRecurringOnDemandWorkflow', '/api/Workflows/CreateOnDemandWorkflow');
            }

            export namespace ServiceLevelAgreement {
                export namespace Dashboard {
                    export const ACTIVE_SLA_COUNTS = new Endpoint('activeSlaCounts', '/api/sladashboard/GetActiveSLACounts');
                }

                export namespace SETUP_SLA {
                    export const VENDOR_SELECTION = new Endpoint('slaVendorSelection', '/api/SetupSLA/GetFIVendors');
                    export const GET_FI_ACTIVE_VENDOR_BY_VENDORNICKNAME_ID = new Endpoint('getFIActiveVendorByVendorNicknameID', '/api/SetupSLA/GetFIActiveVendorByVendorNicknameID');
                    export const GET_PRODUCTS_AND_CONTRACTS = new Endpoint('getProductsAndContracts', '/api/SetupSLA/GetProductsAndContracts');
                    export const SLA_CATEGORY = new Endpoint('SlaCategories', '/api/SetupSLA/GetCategories');
                    export const ACTIVE_ENROLLED_USER_FOR_CLIENT_WITH_USER_LOG_IN = new Endpoint('slaActiveEnrolledUserForClient', '/api/SetupSLA/GetActiveEnrolledUsersForClientWithLoggedInUser');
                    export const ACTIVE_ENROLLED_USER_FOR_CLIENT = new Endpoint('slaActiveEnrolledUserForClient', '/api/SetupSLA/GetActiveEnrolledUsersForClient');
                    export const UPLOAD_CONTRACTS_FOR_PRODUCTS = new Endpoint('uploadContractsForProducts', '/api/SetupSLA/UploadContractsForProducts');
                    export const HAS_CONTRACT_MANAGEMENT_SLOTS = new Endpoint('hasContractManagementSlots', '/api/SetupSLA/HasContractManagementSlots');
                    export const FREQUENCY_MONITORING_LIST = new Endpoint('getFrequencyMonitoringList', '/api/SetupSLA/GetSLAFrequencies');
                    export const GET_VENDOR_CONTACTS = new Endpoint('getVendorContacts', '/api/SetupSLA/GetVendorContacts');
                    export const CREATE_SLA = new Endpoint('postCreateSla', '/api/SetupSLA/CreateSLA');
                    export const GET_SLA_BOUNDARY_IDS = new Endpoint('getSLABoundaries', '/api/SetupSLA/GetSLABoundaries');
                }

                export namespace RECORD_SLA {
                    export const RECORD_GET_TABLE_DATA = new Endpoint('getTableData', '/api/SLAMonitoring/MonitoredSLAs');
                    export const RECORD_GET_MONITORING_DETAILS = new Endpoint('getDetailsSLAMonitoring', '/api/SLAMonitoring/GetDetails');
                    export const RECORD_GET_SLA_MONITOR_CONTACTS = new Endpoint('getSlasMonitorContacts', '/api/SLAMonitoring/GetSlasMonitorContacts');
                    export const RECORD_GET_FILTER_SLA_MONITORED = new Endpoint('getMonitoredSLAsFilter', '/api/SLAMonitoring/MonitoredSLAsFilter');
                    export const RECORD_POST_MONITORING_RECORD_SLA = new Endpoint('sLAMonitoringRecordSLA', '/api/SLAMonitoring/RecordSLA');
                }

                export namespace REMEDIATE_SLA {
                    export const REMEDIATE_DETAILS = new Endpoint('getRemediationDetails', '/api/SLARemediation/GetDetail');
                    export const REMEDIATE_GET_TABLE_DATA_LIST = new Endpoint('getTableDataRemediate', '/api/SLARemediation/GetRemediatedSLAs');
                    export const REMEDIATE_GET_SLA_MANAGERS_CONTACTS = new Endpoint('getSlasManagerContacts', '/api/SLARemediation/GetSlasManagerContacts');
                    export const REMEDIATE_GET_FILTER_SLA_MANAGERS = new Endpoint('getRemediatedSLAsFilter', '/api/SLARemediation/GetRemediatedSLAsFilter');
                    export const REMEDIATE_GET_REMEDIATION_LOGS = new Endpoint('getRemediationLogs', '/api/SLARemediation/GetRemediationLogs');
                    export const REMEDIATE_POST_ADD_REMEDIATE_LOG = new Endpoint('addRemediateLog', '/api/SLARemediation/AddRemediateLog');
                }

                export namespace MANAGE_SLA {
                    export const GET_SLA_DETAILS = new Endpoint('getSLADetails', '/api/ManageSLA/GetSLADetails');
                    export const GET_EDIT_SLA_DATA = new Endpoint('getEditSlaData', '/api/ManageSLA/GetEditSlaData');
                    export const PUT_UPDATE_SLA = new Endpoint('ViewSlaUpdateSla', '/api/ManageSLA/UpdateSLA');
                    export const GET_SLA_HISTORY = new Endpoint('GetSLAHistory', '/api/ManageSLA/GetSLAHistory');
                    export const DOWNLOAD_SLA_VIEW_REPORT = new Endpoint('downloadSlaViewReport', '/FI/SLAReport/Download', true);
                    export const GENERATE_SLA_VIEW_REPORT = new Endpoint('generateSlaViewReport', '/api/FI/SLAReport/GenerateReport', true);
                    export const GET_SLA_FILTER_DATA = new Endpoint('getSLAFilterData', '/api/ManageSLA/GetSLAFilterData');
                    export const GET_SLA_BY_FILTER = new Endpoint('GetSLAByFilter', '/api/ManageSLA/GetSLAByFilter');
                    export const DOWNLOAD_SLA_FILTER_DATA = new Endpoint('downloadSLAFilterData', '/api/ManageSLA/GetSLAReportByFilter');
                }

                export namespace VIEW_VENDOR {
                    export const GET_SLA_BY_VENDOR = new Endpoint('getSLAByVendor', '/api/ViewVendor/GetSLAByVendor');
                    export const PUT_UPDATE_SLA_STATUS = new Endpoint('updateSlaStatus', '/api/ViewVendor/UpdateSlaStatus');
                    export const DELETE_SLA = new Endpoint('deleteSla', '/api/ViewVendor/DeleteSla');
                }
            }

            export namespace IssueManagement {
                export namespace DASHBOARD {
                    export const GET_IM_DASHBOARD_STATUS = new Endpoint('getIMDashboardStatus', '/api/IMDashboard/GetIMDashboardStatus');
                }

                export namespace CUSTOMIZE_ISSUE {
                    export const GET_CUSTOMIZE_ISSUE_FORM = new Endpoint('getIssueForm', '/api/IssueForm/GetIssueForm');
                    export const POST_CUSTOMIZE_ISSUE_FORM = new Endpoint('saveIssueForm', '/api/IssueForm/SaveIssueForm');
                    export const PUT_ISSUE_MANAGEMENT_ENABLE = new Endpoint('toggleIssueForm', '/api/IssueForm/ToggleIssueForm');
                    export const PUT_ISSUE_MANAGEMENT_DISABLE_SEVERITY_LEVELS = new Endpoint('disableSeverityLevels', '/api/IssueForm/DisableSeverityLevels');
                    export const GET_RESET_CUSTOMIZE_ISSUE_FORM = new Endpoint('getDefaultFormFields', '/api/IssueForm/GetDefaultFormFields');
                    export const POST_SEVERITY_LEVELS = new Endpoint('saveSevearityLevels', '/api/IssueForm/SaveSevearityLevels');
                    export const UPDATE_ISSUE_FORM_LASTUPDATED = new Endpoint('updateLastUpdated', '/api/IssueForm/UpdateLastUpdated');
                }

                export namespace CREATE_ISSUE {
                    export const GET_FI_VENDORS = new Endpoint('GetFIVendors', '/api/Issue/GetFIVendors');
                    export const GET_PRODUCTS = new Endpoint('getProducts', '/api/Issue/GetProducts');
                    export const POST_CREATE_ISSUE = new Endpoint('create-issue', '/api/Issue/CreateIssue');
                    export const GET_POTENTIAL_DUPLICATE_ISSUES = new Endpoint('GetPotentialDuplicateIssues', '/api/Issue/GetPotentialDuplicateIssues');
                    export const GET_BU_USERS = new Endpoint('GetActiveUsersAsPerSelectedBusinessUnits', '/api/Issue/GetActiveUsersAsPerSelectedBusinessUnits');
                }

                export namespace MANAGE_ISSUE {
                    export const GET_MANAGE_ISSUE_SEARCH_FILTER = new Endpoint('getManageIssueSearchFilter', '/api/ManageIssues/GetManageIssueSearchFilter');
                    export const POST_MANAGE_ISSUE_SEARCH_RESULT = new Endpoint('getManageIssueSearchResult', '/api/ManageIssues/GetManageIssueSearchResult');
                }

                export namespace UPDATE_ISSUE {
                    export const POST_SEND_REMINDER = new Endpoint('sendReminderToApproveIssue', '/api/ManageIssues/SendReminderToApproveIssue');
                    export const GET_ISSUE_VIEW = new Endpoint('issueView', '/api/ManageIssues/IssueView');
                    export const PUT_UPDATE_ISSUE = new Endpoint('UpdateIssue', '/api/ManageIssues/UpdateIssue');
                    export const GET_ISSUE_COMMENTS = new Endpoint('getIssueComments', '/api/ManageIssues/GetIssueComments');
                    export const POST_ISSUE_COMMENTS = new Endpoint('createIssueComment', '/api/ManageIssues/CreateIssueComment');
                    export const PUT_REOPEN_ISSUE = new Endpoint('reopenIssue', '/api/IssueHistory/ReopenIssue');
                }

                export namespace ISSUE_HISTORY {
                    export const GET_ISSUE_HISTORY_SEARCH_FILTER = new Endpoint('getIssueHistorySearchFilter', '/api/IssueHistory/GetIssueHistorySearchFilter');
                    export const POST_ISSUE_HISTORY_SEARCH_RESULT = new Endpoint('getIssueHistorySearchResult', '/api/IssueHistory/GetIssueHistorySearchResult');
                    export const GET_ISSUE_VIEW = new Endpoint('issueView', '/api/IssueHistory/IssueView');
                    export const GENERATE_IM_VIEW_REPORT = new Endpoint('generateIMViewReport', '/api/IMReport/GenerateReport', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('issueID', true, 1), new QueryStringParameterRule('titleName', true, 2), new QueryStringParameterRule('downloadZip', false, 3)]);
                    export const ISSUE_PRODUCT_DETAILS = new Endpoint('issueProductsDetails', '/api/IssueHistory/IssueProductsDetails');
                }

                export namespace ISSUE_TAB {
                    export const POST_MANAGE_ISSUE_SEARCH_RESULT_BY_VENDOR_ID = new Endpoint('getManageIssueSearchResultByVendorID', '/api/ManageIssues/GetManageIssueSearchResultByVendorID');
                    export const GET_MANAGE_ISSUE_SEARCH_FILTER_BY_VENDOR_ID = new Endpoint('getManageIssueSearchFilterByVendorID', '/api/ManageIssues/GetManageIssueSearchFilterByVendorID');
                }
            }

            export namespace ShoppingCart {
                export const ADD_CART_ITEMS = new Endpoint('addCartItems', '/api/ShoppingCart/AddCartItems');
                export const GET_CART_ITEMS_COUNT = new Endpoint('getCartItemCount', '/api/ShoppingCart/GetItemsCount');
                export const GET_CHECKOUT_ASSESSMENT_DETAILS = new Endpoint('getCheckOutAssessmentDetails', '/api/ShoppingCart/GetELACheckoutDetails');
                export const REMOVE_CART_ITEMS = new Endpoint('removeCartItems', '/api/ShoppingCart/RemoveCartItems');
                export const GET_FAILED_ORDER_DETAILS = new Endpoint('getPaymentFailedDetails', '/api/ShoppingCart/GetPaymentFailedDetails');
            }

            export namespace GeneralInformation {
                export const GET_CLIENT_COMMENTS = new Endpoint('getClientComments', '/api/Client/GetClientComments', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('clientId', true, 0)]);
            }
        }

        export namespace BusinessUnit {
            export namespace Admin {
                export const GET_SETUP_DATA_FOR_BUSINESS_UNIT = new Endpoint('GetSetupDataForASingleBusinessUnit', '/api/BusinessUnitAdmin/GetSetupDataForASingleBusinessUnit');
                export const GET_SETUP_DATA = new Endpoint('getBusinessUnitSetupData', '/api/BusinessUnitAdmin/GetBusinessUnitSetupData');
                export const SAVE_SETUP_DATA = new Endpoint('saveBusinessUnitSetupData', '/api/BusinessUnitAdmin/SaveBusinessUnitSetupData');
                export const LOCK_SETUP = new Endpoint('lockBusinessUnitSetup', '/api/BusinessUnitAdmin/LockBusinessUnitSetup');
                export const CHECK_FOR_SETUP_AND_BUSINESS_UNITS: Endpoint = new Endpoint('checkForSetupAndBusinessUnits', '/api/BusinessUnitAdmin/CheckForSetupAndBusinessUnits');
                export const GET_SETUP_USER_ROLES = new Endpoint('getBusinessUnitSetupUserRoles', '/api/BusinessUnitAdmin/GetBusinessUnitSetupUserRoles');
                export const GET_BUSINESS_UNIT_INFORMATION: Endpoint = new Endpoint('getBusinessUnitInformation', '/api/BusinessUnitAdmin/GetBusinessUnitInformation');
                export const GET_BUSINESS_UNIT_HEADER_INFORMATION: Endpoint = new Endpoint('getBusinessUnitHeaderInformation', '/api/BusinessUnitAdmin/GetBusinessUnitHeaderInformation');
                export const FINALIZE_BUSINESS_UNIT_SETUP: Endpoint = new Endpoint('finalizeBusinessUnitSetup', '/api/BusinessUnitAdmin/FinalizeBusinessUnitSetup');
                export const GET_SYSTEM_SETTINGS = new Endpoint('getBusinessUnitsSystemSettings', '/api/BusinessUnitAdmin/GetBusinessUnitsSystemSettings');
                export const GET_BUSINESS_UNIT_PDF: Endpoint = new Endpoint('GetBusinessUnitPdf', '/api/BusinessUnitAdmin/GetBusinessUnitPdf');
                export const GET_UNASSIGNED_PRODUCTS: Endpoint = new Endpoint('GetUnassignedProductList', '/api/BusinessUnitAdmin/GetUnassignedProductList');
                export const GET_UNASSIGNED_USERS: Endpoint = new Endpoint('GetUnassignedUserList', '/api/BusinessUnitAdmin/GetUnassignedUserList');
                export const GET_BUSINESS_UNITS_FOR_USER: Endpoint = new Endpoint('GetAllBusinessUnitsForUser', '/api/BusinessUnitAdmin/GetAllBusinessUnitsForUser');
                export const GET_VENDOR_RELATIONSHIPS: Endpoint = new Endpoint('GetBusinessUnitSetupVendorRelationships', '/api/BusinessUnitAdmin/GetBusinessUnitSetupVendorRelationships');
                export const UPDATE_BUSINESS_UNITS_FOR_USER: Endpoint = new Endpoint('AddOrUpdateBusinessUnitUsers', '/api/BusinessUnitAdmin/AddOrUpdateBusinessUnitUsers');
                export const UPDATE_BUSINESS_UNITS: Endpoint = new Endpoint('AddOrUpdateBusinessUnits', '/api/BusinessUnitAdmin/AddOrUpdateBusinessUnits');
                export const GET_ALL_BUSINESS_UNITS_FOR_PRODUCT: Endpoint = new Endpoint('GetAllBusinessUnitsForProduct', '/api/BusinessUnitAdmin/GetAllBusinessUnitsForProduct');
                export const VALIDATE_BUSINESS_UNIT_UPDATES_FOR_PRODUCT: Endpoint = new Endpoint('ValidateBusinessUnitUpdatesForProduct', '/api/BusinessUnitAdmin/ValidateBusinessUnitUpdatesForProduct');
                export const SAVE_BUSINESS_UNIT_UPDATES_FOR_PRODUCT: Endpoint = new Endpoint('SaveBusinessUnitUpdatesForProduct', '/api/BusinessUnitAdmin/SaveBusinessUnitUpdatesForProduct');
                export const GET_USERS_FOR_BUSINESS_UNIT_WITH_NO_OTHER_BU: Endpoint = new Endpoint('GetAllUsersForBusinessUnit', '/api/BusinessUnitAdmin/GetUsersForBusinessUnitWithNoOtherBusinessUnits');
                export const GET_IS_BUSINESS_UNIT_NAME_UNIQUE: Endpoint = new Endpoint('IsBusinessUnitNameUnique', '/api/BusinessUnitAdmin/IsBusinessUnitNameUnique');
                export const GET_PRODUCT_MANAGER_FOR_PRODUCT: Endpoint = new Endpoint('GetProductManager', '/api/BusinessUnitAdmin/GetProductManager');
                export const VALIDATE_BUSINESS_UNIT_UPDATES_FOR_USER: Endpoint = new Endpoint('ValidateBusinessUnitUpdatesForUser', '/api/BusinessUnitAdmin/ValidateBusinessUnitUpdatesForUser');
                export const VALIDATE_BUSINESS_UNIT_DELETE: Endpoint = new Endpoint('ValidateBusinessUnitDelete', '/api/BusinessUnitAdmin/ValidateBusinessUnitDelete');

                //  NOTE: some of these enpoints need to be remove as the API methods called are obsolete
                export const ADD_USER_TO_BUSINESS_UNITS: Endpoint = new Endpoint('addUserToBusinessUnits', '/api/BusinessUnitAdmin/AddUserToBusinessUnits');
                export const DISMISS_WELCOME_DIALOG: Endpoint = new Endpoint('dismissWelcomeDialog', '/api/BusinessUnitAdmin/DismissWelcomeDialog');
                export const GET_ALL_BUSINESS_UNITS: Endpoint = new Endpoint('getAllBusinessUnits', '/api/BusinessUnitAdmin/GetAllBusinessUnits');
                export const GET_BUSINESS_UNITS_SETTINGS: Endpoint = new Endpoint('getBusinessUnitsSettings', '/api/BusinessUnitAdmin/GetBusinessUnitsSettings');
                export const GET_BUSINESS_UNIT_USER_SEARCH_RESULTS: Endpoint = new Endpoint('getBusinessUnitUserSearchResults', '/api/BusinessUnitAdmin/GetBusinessUnitUserSearchResults');
                export const GET_BUSINESS_UNIT_VENDOR_SEARCH_RESULTS: Endpoint = new Endpoint('getBusinessUnitVendorSearchResults', '/api/BusinessUnitAdmin/GetBusinessUnitVendorSearchResults');
                export const GET_MASTER_BUSINESS_UNIT_REPORT: Endpoint = new Endpoint('getMasterBusinessUnitReport', '/api/BusinessUnitAdmin/GetMasterBusinessUnitReport');
                export const GET_WELCOME_DIALOG_DISMISSAL: Endpoint = new Endpoint('getWelcomeDialogDismissal', '/api/BusinessUnitAdmin/GetWelcomeDialogDismissal');
                export const REMOVE_ADMIN_FROM_BUSINESS_UNITS: Endpoint = new Endpoint('removeAdminFromBusinessUnits', '/api/BusinessUnitAdmin/RemoveAdminFromBusinessUnits');
                export const UPDATE_BUSINESS_UNIT_STATUS: Endpoint = new Endpoint('updateBusinessUnitStatus', '/api/BusinessUnitAdmin/UpdateBusinessUnitStatus');
                export const UPDATE_CONTACTS_TO_BUSINESSUNIT: Endpoint = new Endpoint('updateContactsToBusinessUnit', '/api/BusinessUnitAdmin/UpdateContactsToBusinessUnit');
            }

            export const GET_BUSINESS_UNITS_STATUS: Endpoint = new Endpoint('getBusinessUnitsStatus', '/api/BusinessUnit/GetBusinessUnitsStatus');
            export const GET_ALL_BUSINESS_UNITS_FOR_CLIENT: Endpoint = new Endpoint('getAllBusinessUnitsForClient', '/api/BusinessUnit/GetAllBusinessUnitsForClient');
            export const GET_ALL_BUSINESS_UNITS_FOR_CONTACT: Endpoint = new Endpoint('getAllBusinessUnitsForContact', '/api/BusinessUnit/GetAllBusinessUnitsForContact');
            export const GET_ALL_BUSINESS_UNIT_VIEWS: Endpoint = new Endpoint('getAllBusinessUnitViews', '/api/BusinessUnit/GetAllBusinessUnitViews');
            export const GET_BUSINESS_UNITS_FOR_PRODUCT: Endpoint = new Endpoint('getBusinessUnitsForProduct', '/api/BusinessUnit/GetBusinessUnitsForProduct');
            export const GET_USERS_LINKED_TO_PRODUCTS_VIA_BUSINESS_UNITS: Endpoint = new Endpoint('getUsersLinkedToProductsViaBusinessUnits', '/api/BusinessUnit/GetUsersLinkedToProductsViaBusinessUnits');
            export const UPDATE_BUSINESS_UNIT_VIEWS: Endpoint = new Endpoint('updateBusinessUnitViews', '/api/BusinessUnit/UpdateBusinessUnitViews');
            export const SEND_BUSINESS_UNIT_WORKFLOW_ISSUES_EMAIL: Endpoint = new Endpoint('sendBusinessUnitWorkflowIssuesEmail', '/api/AdminPanelWorkflows/SendBusinessUnitWorkflowIssuesEmail');
            export const GET_BU_BASED_RELATIONSHIPs_WITH_OWNERS_APPROVERS: Endpoint = new Endpoint('getRelationshipsWithOwnerApproverBU', '/api/BusinessUnit/GetRelationshipsWithOwnerApproverBU');
        }

        export namespace AdminPanelWorkflowsTab {
            export const ADD_WORKFLOW_TEMPLATE_STEPS = new Endpoint('addWorkflowTemplateStep', '/api/AdminPanelWorkflows/AddWorkflowTemplateStep');
            export const ADD_WORKFLOW_TEMPLATE_STEP_DOCUMENT_STORAGE_ATTACHMENT = new Endpoint('uploadWorkflowTemplateStepDocumentStorageFile', '/api/AdminPanelWorkflows/UploadWorkflowTemplateStepDocumentStorageFile');
            export const ADD_WORKFLOW_TEMPLATE_STEP_LOCAL_ATTACHMENT = new Endpoint('uploadWorkflowTemplateStepLocalFile', '/api/AdminPanelWorkflows/UploadWorkflowTemplateStepLocalFile');
            export const DELETE_WORKFLOW_TEMPLATE = new Endpoint('deleteWorkflowTemplate', '/api/AdminPanelWorkflows/DeleteWorkflowTemplate');
            export const DELETE_WORKFLOW_TEMPLATE_STEP = new Endpoint('deleteWorkflowTemplateStep', '/api/AdminPanelWorkflows/DeleteWorkflowTemplateStep');
            export const DELETE_WORKFLOW_TEMPLATE_STEP_ATTACHMENTS = new Endpoint('deleteWorkflowTemplateStepAttachments', '/api/AdminPanelWorkflows/DeleteWorkflowTemplateStepAttachments');
            export const UPDATE_WORKFLOW_TEMPLATE_STEP_SORT_ORDER = new Endpoint('updateWorkflowTemplateStepSortOrder', '/api/AdminPanelWorkflows/UpdateWorkflowTemplateStepSortOrder');
            export const EDIT_WORKFLOW_TEMPLATE_STEP = new Endpoint('editWorkflowTemplateStep', '/api/AdminPanelWorkflows/EditWorkflowTemplateStep');
            export const SAVE_WORKFLOWS = new Endpoint('saveWorkflowDetails', '/api/AdminPanelWorkflows/SaveWorkflowDetails');
            export const SAVE_WORKFLOW_TEMPLATE_STEPS_ORDER = new Endpoint('saveSortOrderForSteps', '/api/AdminPanelWorkflows/SaveSortOrderForSteps');
            export const UPDATE_WORKFLOWS_ACTIVATION = new Endpoint('updateWorkflowActivationStatus', '/api/AdminPanelWorkflows/UpdateWorkflowActivationStatus');
            export const GET_CLIENT_PRODUCTS = new Endpoint('getClientProductsForWorkflowTemplate', '/api/AdminPanelWorkflows/GetClientProductsForWorkflowTemplate');
            export const GET_FI_WORKFLOWS_RENEWAL_FREQUENCIES = new Endpoint('getFinancialInstitutionWorkflowRenewalFrequencies', '/api/AdminPanelWorkflows/GetFinancialInstitutionWorkflowRenewalFrequencies');
            export const GET_FI_WORKFLOWS_SUB_TYPES = new Endpoint('getFinancialInstitutionWorkflowSubTypes', '/api/AdminPanelWorkflows/GetFinancialInstitutionWorkflowSubTypes');
            export const GET_FI_WORKFLOWS_TYPES = new Endpoint('getFinancialInstitutionWorkflowTypes', '/api/AdminPanelWorkflows/GetFinancialInstitutionWorkflowTypes');
            export const GET_RISK_LEVEL_IDS = new Endpoint('getAssessmentRiskLevelIdsByWorkflowTemplateID', '/api/AdminPanelWorkflows/GetAssessmentRiskLevelIdsByWorkflowTemplateID');
            export const GET_VENMINDER_WORKFLOW_TEMPLATE_STEPS = new Endpoint('getAllFIWorkflowTemplateSteps', '/api/AdminPanelWorkflows/GetAllFIWorkflowTemplateSteps');
            export const GET_VENMINDER_AVAILABLE_WORKFLOW_TEMPLATE_STEPS = new Endpoint('getAvailableFIWorkflowTemplateSteps', '/api/AdminPanelWorkflows/GetAvailableFIWorkflowTemplateSteps');
            export const GET_WORKFLOW_ASSIGNMENTTYPES = new Endpoint('getFinancialInstitutionWorkflowAssignmentTypes', '/api/AdminPanelWorkflows/GetFinancialInstitutionWorkflowAssignmentTypes');
            export const GET_WORKFLOW_TEMPLATE_ALL_RISK_LEVELS = new Endpoint('getActiveRiskAssessmentTemplateForWorkflowTemplate', '/api/AdminPanelWorkflows/GetActiveRiskAssessmentTemplateForWorkflowTemplate');
            export const GET_WORKFLOW_TEMPLATE_BY_TEMPLATE_ID = new Endpoint('getWorkflowTemplateByTemplateID', '/api/AdminPanelWorkflows/GetWorkflowTemplateByTemplateID');
            export const GET_WORKFLOW_TEMPLATE_CATEGORIES = new Endpoint('getWorkflowTemplateCategoriesByClientID', '/api/AdminPanelWorkflows/GetWorkflowTemplateCategoriesByClientID');
            export const GET_WORKFLOW_TEMPLATE_CATEGORY_IDS = new Endpoint('getCategoryIdsByWorkflowTemplateID', '/api/AdminPanelWorkflows/getCategoryIdsByWorkflowTemplateID');
            export const GET_WORKFLOW_TEMPLATE_LINKED_COUNT = new Endpoint('getWorkflowTemplateLinkedCount', '/api/AdminPanelWorkflows/GetWorkflowTemplateLinkedCount');
            export const GET_WORKFLOW_TEMPLATE_STEP_FILES = new Endpoint('getDocumentsListByWorkflowTemplateStepID', '/api/AdminPanelWorkflows/GetDocumentsListByWorkflowTemplateStepID');
            export const GET_WORKFLOW_TEMPLATE_STEPS_BY_TEMPLATE_ID = new Endpoint('getWorkflowTemplateStepsByWorkflowTemplateID', '/api/AdminPanelWorkflows/GetWorkflowTemplateStepsByWorkflowTemplateID');
            export const GET_WORKFLOWS_BY_CLIENT_ID = new Endpoint('getAllWorkflowsByClientID', '/api/AdminPanelWorkflows/GetAllWorkflowsByClientID');
            export const GET_WORKFLOWS_WITH_BUSINESS_UNIT_ERRORS_BY_CLIENT_ID = new Endpoint('getWorkflowsWithBusinessUnitErrorsByClientId', '/api/AdminPanelWorkflows/GetWorkflowsWithBusinessUnitErrorsByClientId');
            export const GET_ACTIVE_WORKFLOWS_REPORT = new Endpoint('getActiveWorkflowsReport', '/api/AdminPanelWorkflows/GetActiveWorkflowsReport');
            export const GET_ACTIVE_WORKFLOW_TEMPLATES_FOR_REPORT = new Endpoint('getActiveWorkflowTemplatesForReport', '/api/AdminPanelWorkflows/GetActiveWorkflowTemplatesForReport');
            export const UPDATE_DEPENDENT_STEP = new Endpoint('updateDependentStep', '/api/AdminPanelWorkflows/UpdateDependentStep');
            export const GET_VENMINDER_TEMPLATE_SEND_QUESTIONNAIRE_STEP_OPTIONS = new Endpoint('getVenminderTemplateQuestionnaireStepOptions', '/api/AdminPanelWorkflows/GetVenminderTemplateQuestionnaireStepOptions');
            export const GET_PRODUCTCATEGORY_QUESTIONNAIRE_LINKS = new Endpoint('getProductCategoryQuestionnaireLink', '/api/AdminPanelWorkflows/GetProductCategoryQuestionnaireLink');
            export const GET_RISKLEVEL_QUESTIONNAIRE_LINKS = new Endpoint('geRiskLevelQuestionnaireLink', '/api/AdminPanelWorkflows/GeRiskLevelQuestionnaireLink');
            export const GET_CRITICALITY_QUESTIONNAIRE_LINKS = new Endpoint('getCriticalityQuestionnaireLink', '/api/AdminPanelWorkflows/GetCriticalityQuestionnaireLink');
            export const GET_ALL_ASSIGN_APPROVAL_FI_CONTACTS = new Endpoint('getAllAssignApprovalFIContacts', '/api/AdminPanelWorkflows/GetAllAssignApprovalFIContacts');
            export const DOWNLOAD_WORKFLOW_TEMPLATE_STEP_FILES_ZIP = new Endpoint('downloadWorkflowTemplateStepFilesZip', '/api/AdminPanelWorkflows/DownloadWorkflowTemplateStepFilesZip');
        }

        export namespace AdminPanel {
            export const GET_ADMIN_PANEL_TABS = new Endpoint('getAdminPanelTabs', '/api/AdminPanel/GetAdminPanelTabs');
            export const REMOVE_CONTACT_API_KEY = new Endpoint('removeContactApiKey', '/api/AdminPanel/RemoveContactApiKey');
            export const REMOVE_CLIENT_API_KEYS = new Endpoint('removeClientApiKeys', '/api/AdminPanel/RemoveClientApiKeys');
            export const GET_INTEGRATION_PARTNER_API_USER_ID = new Endpoint('getIntegrationPartnerApiUserID', '/api/AdminPanel/GetIntegrationPartnerApiUserID');
        }

        export namespace CriticalityAssessment {
            export const GET_QUESTIONS_TO_CRITICAL = new Endpoint('getQuestionsToCritical', '/api/criticalityAssessment/getquestionstocritical');
            export const UPDATE_QUESTIONS_TO_CRITICAL = new Endpoint('updateQuestionsToCritical', '/api/criticalityAssessment/updatequestionstocritical');
            export const GET_QUESTIONS = new Endpoint('getQuestions', '/api/criticalityAssessment/GetQuestions');
            export const SAVE_QUESTIONS = new Endpoint('saveQuestions', '/api/criticalityAssessment/SaveQuestions');
            export const DELETE_QUESTIONS = new Endpoint('deleteQuestions', '/api/criticalityAssessment/DeleteQuestions');
            export const IS_VENDOR_CRITICAL = new Endpoint('isVendorCritical', '/api/criticalityAssessment/IsVendorCritical');
            export const IS_VENDOR_CRITICAL_RELATIONSHIP = new Endpoint('isVendorCritical', '/api/criticalityAssessment/IsVendorCriticalWithRelationship');
        }

        export namespace Payment {
            export const GET_TOKEN = new Endpoint('getPaymentToken', '/api/Payment/GetToken');
            export const CREATE_PURCHASE = new Endpoint('createPaymentPurchase', '/api/Payment/CreateELAPurchase');
            export const COMPLETE_ELA_PURCHASE = new Endpoint('completeELAPurchase', '/api/Payment/MakePaymentAndCompleteOrder');
            export const VAULT_CARD = new Endpoint('saveCardDetails', '/api/Payment/SavePaymentMethodForCustomer');
            export const CHARGE_CARD_AND_CREATE_CUSTOMER = new Endpoint('chargeCardAndCreateCustomer', '/api/Payment/UpdateCardAndSettlePaymentForFailedOrders');
        }

        export namespace OnlineReview {
            export const GET_ONLINE_REVIEW_PDF_DOCUMENT_ID = new Endpoint('getOnlineReviewPdfDocumentID', '/api/RSDPDF/GetOnlineReviewPDFDocumentID');
        }

        export namespace Questionnaires {
            export namespace Download {
                export const GENERATE_COMPLETED_QUESTIONNAIRE_CLIENT = new Endpoint('generateCompletedQuestionnaireDownloadForClient', '/api/QuestionnaireDownload/GenerateCompletedQuestionnaireDownloadForClient');
                export const GENERATE_COMPLETED_QUESTIONNAIRE_VENDOR = new Endpoint('generateCompletedQuestionnaireDownloadForVendor', '/api/QuestionnaireDownload/GenerateCompletedQuestionnaireDownloadForVendor');
                export const GENERATE_QUESTIONNAIRE_EXCEL_CLIENT = new Endpoint('generateQuestionnaireExcelDownloadForClient', '/api/QuestionnaireDownload/GenerateQuestionnaireExcelDownloadForClient');
                export const GENERATE_QUESTIONNAIRE_EXCEL_VENDOR = new Endpoint('generateQuestionnaireExcelDownloadForVendor', '/api/QuestionnaireDownload/GenerateQuestionnaireExcelDownloadForVendor');
                export const GENERATE_QUESTIONNAIRE_ZIP = new Endpoint('generateQuestionnaireZip', '/api/QuestionnaireDownload/GenerateQuestionnaireZip');
            }

            export const GET_STANDARD_QUESTIONNAIRE_TEMPLATE_LIST_FOR_CLIENTS = new Endpoint('GetStandardQuestionnaireTemplateListForClients', '/api/Questionnaires/GetStandardQuestionnaireTemplateListForClients');
            export const GET_STANDARD_QUESTIONNAIRE_TEMPLATE = new Endpoint('getStandardQuestionnaireTemplate', '/api/Questionnaires/GetStandardQuestionnaireTemplate');
        }

        export namespace Vendors {
            export namespace Exchange {
                export const GET_EXCHANGE_VENDOR_PRODUCTS = new Endpoint('getVendorProducts', '/api/ExchangeVendorProducts/GetVendorProducts');
                export const ARCHIVE_VENDOR_PRODUCT = new Endpoint('archiveVendorProduct', '/api/ExchangeVendorProducts/ArchiveVendorProduct');
                export const UNARCHIVE_VENDOR_PRODUCT = new Endpoint('unarchiveVendorProduct', '/api/ExchangeVendorProducts/UnarchiveVendorProduct');
                export const ADD_EXCHANGE_VENDOR_PRODUCT = new Endpoint('adVendorProduct', '/api/ExchangeVendorProducts/AddVendorProduct');
                export const EDIT_EXCHANGE_VENDOR_PRODUCT = new Endpoint('editVendorProduct', '/api/ExchangeVendorProducts/EditVendorProduct');
                export const DELETE_EXCHANGE_VENDOR_PRODUCT = new Endpoint('deleteVendorProduct', '/api/ExchangeVendorProducts/DeleteVendorProduct');
                export const GET_EXCHANGE_VENDOR_CUSTOMER_SEARCH_RESULTS = new Endpoint('getExchangeVendorCustomerSearchResults', '/api/VendorSale/GetExchangeVendorCustomerSearchResults');

                export namespace Questionnaires {
                    export const Upload_Exchange_Questionnaire = new Endpoint('uploadQuestionnaireDocument', '/api/ExchangeQuestionnaireDocumentController/UploadQuestionnaireDocument');
                    export const GET_QUESTIONNAIRES_FOR_EXCHANGE_LIBRARY = new Endpoint('getQuestionnairesForVendorContact', '/api/ExchangeVendorQuestionnaires/GetQuestionnairesForExchangeLibrary');
                    export const GET_STANDARD_QUESTIONNAIRE_TEMPLATE_LIST_FOR_VENDORS = new Endpoint('GetStandardQuestionnaireTemplateListForVendors', '/api/ExchangeVendorQuestionnaires/GetStandardQuestionnaireTemplateListForVendors');
                    export const CREATE_NEW_QUESTIONNAIRE_FROM_STANDARD_TEMPLATE_FOR_VENDOR = new Endpoint('createNewQuestionnaireFromStandardTemplateForVendor', '/api/ExchangeVendorQuestionnaires/CreateNewQuestionnaireFromStandardTemplateForVendor');
                    export const ARCHIVE_EXCHANGE_QUESTIONNAIRE = new Endpoint('archiveQuestionnaire', '/api/ExchangeVendorQuestionnaires/ArchiveQuestionnaire');
                    export const UNARCHIVE_EXCHANGE_QUESTIONNAIRE = new Endpoint('unarchiveQuestionnaire', '/api/ExchangeVendorQuestionnaires/UnarchiveQuestionnaire');
                    export const GET_EXCHANGE_QUESTIONNAIRE_FOR_EDIT = new Endpoint('getVenminderExchangeQuestionnaireForEdit', '/api/ExchangeVendorQuestionnaires/GetVenminderExchangeQuestionnaireForEdit');
                    export const ADD_CONTRIBUTORS_FOR_EXCHANGE_QUESTIONNAIRE = new Endpoint('addContributorForExchangeQuestionnaire', '/api/ExchangeVendorQuestionnaires/AddContributorForExchangeQuestionnaire');
                    export const DELETE_CONTRIBUTOR_FOR_EXCHANGE_QUESTIONNAIRE = new Endpoint('deleteContributorForExchangeQuestionnaire', '/api/ExchangeVendorQuestionnaires/DeleteContributorForExchangeQuestionnaire');
                    export const UPDATE_QUESTIONNAIRE_PRODUCTS = new Endpoint('updateExchangeQuestionnaireProducts', '/api/ExchangeVendorQuestionnaires/UpdateExchangeQuestionnaireProducts');
                    export const DELETE_EXCHANGE_QUESTIONNAIRE = new Endpoint('deleteQuestionnaire', '/api/ExchangeVendorQuestionnaires/DeleteQuestionnaire');
                    export const SAVE_EXCHANGE_QUESTIONNAIRE = new Endpoint('saveExchangeQuestionnaire', '/api/ExchangeVendorQuestionnaires/SaveExchangeQuestionnaire');
                    export const CREATE_NEW_DRAFT_FOR_EXCHANGE_QUESTIONNAIRE = new Endpoint('createNewDraftForExchangeQuestionnaire', '/api/ExchangeVendorQuestionnaires/CreateNewDraftForExchangeQuestionnaire');
                    export const UPDATE_UPLOADED_EXCHANGE_QUESTIONNAIRE = new Endpoint('updateUploadedExchangeQuestionnaire', '/api/ExchangeVendorQuestionnaires/UpdateUploadedExchangeQuestionnaire');
                    export const GET_PRODUCTS_IN_EXCHANGE_QUESTIONNAIRE_DRAFTS = new Endpoint('getProductsInExchangeQuestionnaireDrafts', '/api/ExchangeVendorQuestionnaires/GetProductsInExchangeQuestionnaireDrafts');
                }

                export namespace Documents {
                    export const GET_VENDOR_DOCUMENTS = new Endpoint('getVendorDocuments', '/api/ExchangeVendorDocuments/GetVendorDocuments');
                    export const UPLOAD_VENDOR_DOCUMENT = new Endpoint('uploadVendorDocument', '/api/ExchangeVendorDocuments/UploadVendorDocument');
                    export const UPDATE_VENDOR_DOCUMENT = new Endpoint('updateVendorDocument', '/api/ExchangeVendorDocuments/UpdateVendorDocument');
                    export const DELETE_VENDOR_DOCUMENT = new Endpoint('deleteVendorDocument', '/api/ExchangeVendorDocuments/DeleteVendorDocument', true, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('documentId', true)]);
                    export const GET_ALL_DOCUMENT_TAGS_FOR_VENDOR = new Endpoint('getAllDocumentTagsForVendor', '/api/DocumentTags/GetAllDocumentTagsForVendor');
                    export const UPDATE_DOCUMENT_TAGS_FOR_VENDOR = new Endpoint('updateDocumentTagsForVendor', '/api/DocumentTags/UpdateDocumentTagsForVendor');
                    export const ARCHIVE_VENDOR_DOCUMENT = new Endpoint('archiveVendorDocument', '/api/ExchangeVendorDocuments/ArchiveVendorDocument', true, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('documentId', true)]);
                }

                export namespace RequestAccess {
                    export const GET_ALL_PENDING_ACCESS_REQUESTS_FOR_VENDOR = new Endpoint('getAllPendingAccessRequestsForVendor', '/api/ExchangeClientAccessRequest/GetAllPendingAccessRequestsForVendor');
                    export const GET_PENDING_ACCESS_REQUESTS_NOTIFICATIONS = new Endpoint('getPendingAccessRequestNotifications', '/api/ExchangeClientAccessRequest/GetPendingAccessRequestNotifications');
                    export const MARK_ALL_NOTIFICATIONS_AS_READ = new Endpoint('markAllNotificationsAsRead', '/api/ExchangeClientAccessRequest/MarkAllNotificationsAsRead');
                    export const PROCESS_PENDING_ACCESS_REQUEST = new Endpoint('processPendingAccessRequest', '/api/ExchangeClientAccessRequest/ProcessPendingAccessRequest');
                    export const GET_ALL_CLIENT_ACCESS_REQUEST = new Endpoint('getAllClientAccessRequest', '/api/ExchangeClientAccessRequest/GetAllClientAccessRequestNotifications');
                    export const GET_CLIENT_ACCESS_REQUEST = new Endpoint('getClientAccessRequest', '/api/ExchangeClientAccessRequest/GetClientAccessRequest');
                }

                export namespace ShareHistory {
                    export const GET_EXCHANGE_SHARE_HISTORY = new Endpoint('GetExchangeShareHistory', '/api/ExchangeShare/GetExchangeShareHistory');
                    export const GET_ACTIVITES_FOR_CONTACT_BY_VENDOR = new Endpoint('getExchangeShareHistoryActivitiesForContactByVendor', '/api/ExchangeShare/GetExchangeShareHistoryActivitiesForContactByVendor');
                    export const REMOVE_EXCHANGE_PRODUCT_ACCESS_FOR_CONTACT = new Endpoint('GetExchangeShareHistory', '/api/ExchangeShare/RemoveExchangeProductAccessForContact');
                    export const REMOVE_EXCHANGE_ACCESS_FROM_INVITATION = new Endpoint('removeExchangeAccessFromInvitation', '/api/ExchangeShare/RemoveExchangeAccessFromInvitation');
                    export const GET_EXCHANGE_SHARE_HISTORY_FROM_INVITATION = new Endpoint('getExchangeShareHistoryFromInvitation', '/api/ExchangeShare/GetExchangeShareHistoryFromInvitation');
                    export const GET_SHARED_DOCUMENTS_LIST_BY_CONTACT = new Endpoint('getSharedDocumentsListByContact', '/api/ExchangeShare/GetSharedDocumentsListByContact');
                }

                export namespace UserManagement {
                    export const GET_VENDOR_USERS = new Endpoint('GetVendorUsers', '/api/ExchangeUserManagement/GetVendorUsers');
                    export const ADD_VENDOR_USER = new Endpoint('AddVendorUserToExchange', '/api/ExchangeUserManagement/AddVendorUserToExchange');
                    export const EDIT_VENDOR_USER = new Endpoint('EditVendorUser', '/api/ExchangeUserManagement/EditVendorUser');
                }

                export namespace Share {
                    export const SEND_EXCHANGE_SHARE_INVITE = new Endpoint('sendExchangeShareInvite', '/api/ExchangeShare/SendExchangeShareInvite');
                    export const GET_COMPANY_NAME_FOR_EMAIL_DOMAIN = new Endpoint('getCompanyNameForEmailDomain', '/api/ExchangeShare/GetCompanyNameForEmailDomain');
                }

                export namespace CompanyManagement {
                    export const GET_ALL_COMPANY_MANAGEMENTS = new Endpoint('getAllCompanyManagements', '/api/ExchangeCompanyManagement/GetAllCompanyManagements');
                    export const GET_COMPANY_CONTACTS_LIST = new Endpoint('getCompanyContactsList', '/api/ExchangeCompanyManagement/GetCompanyContactsList');
                    export const SET_EXCHANGE_SHARE_COMPANY_ACCESS = new Endpoint('setExchangeShareCompanyAccess', '/api/ExchangeCompanyManagement/SetExchangeShareCompanyAccess');
                }
            }
        }

        export namespace Exchange {
            export const GET_SHARED_QUESTIONNAIRES_FOR_CONTACT = new Endpoint('getSharedQuestionnaire', '/api/Questionnaires/GetSharedQuestionnairesForLoggedInUser');
            export const GET_SHARED_DOCUMENTS_FOR_CONTACT = new Endpoint('getSharedDocuments', '/api/ExchangeVendorDocuments/GetSharedDocumentsForLoggedInUser');
            export const ADD_NEW_EXCHANGE_ACTIVITY = new Endpoint('addNewExchangeActivity', '/api/ExchangeShare/AddNewExchangeActivity');
            export const COMPLETE_EXCHANGE_SHARE = new Endpoint('completeExchangeShare', '/api/ExchangeShare/CompleteExchangeShare', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('token', true, 1)]);
        }

        export namespace InvitationAdmin {
            export const GET_INVITATION_STATUS = new Endpoint('getInvitationStatus', '/api/InvitationAdmin/GetInvitationStatus');
            export const RESEND_INVITATION = new Endpoint('resendInvitation', '/api/InvitationAdmin/ResendInvitation');
        }

        export namespace VendorSnapshot {
            export namespace Client {
                export const GET_SECURITY_SCORECARD_INTEGRATION_SCORE = new Endpoint('getSecurityScorecardIntegrationScore', '/api/VendorSnapshotIntegration/GetSecurityScorecardIntegrationScore');

                export const GET_AWAITING_DATA_PARTNER = new Endpoint('getAwaitingDataPartners', '/api/VendorSnapshot/GetAwaitingDataPartners');
                export const GET_VENDOR_SNAPSHOT_PROFILE = new Endpoint('getVendorSnapshotProfile', '/api/VendorSnapshot/GetVendorSnapshotProfile');
                export const UPDATE_VENDOR_SNAPSHOT_PROFILE = new Endpoint('updateVendorSnapshotProfile', '/api/VendorSnapshot/UpdateVendorSnapshotProfile');
                export const ACTIVATE_SNAPSHOT = new Endpoint('activateSnapshot', '/api/VendorSnapshot/ActivateSnapshot');
                export const GET_ACTIVATED_WIDGETS = new Endpoint('getActivatedSnapshotDataPartnersData', '/api/VendorSnapshot/GetActivatedSnapshotDataPartnersData');
                export const VALIDATE_VENDOR_PORTFOLIO = new Endpoint('validateVendorPortfolio', '/api/VendorSnapshot/ValidateVendorPortfolio');
                export const GET_SNAPSHOT_STATE = new Endpoint('getSnapShotStateAsync', '/api/VendorSnapshot/GetSnapShotStateAsync');
                export const GET_PROCESSING_DATA_PARTNERS = new Endpoint('getProcessingDataPartners', '/api/VendorSnapshot/GetProcessingDataPartners');
            }
        }
    }
    export namespace Pages {
        export const DEFAULT_HOMEPAGE = new Endpoint('defaultHomepage', '/Account/RedirectToDefault', true);
        export const DOWNLOAD_DOCUMENT_BY_ID = new Endpoint('downloadById', '/Document/DownloadByID', true, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('DocumentID')]);
        export const GET_CONTENT_FOR_USER = new Endpoint('getContentForUser', '/Content/GetForUser', true, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('fileName')]);
        export const DOWNLOAD_TEMP_DOCUMENT_FOR_USER = new Endpoint('downloadTempDocumentForUser', '/Documents/DownloadTempDocumentForUser', false, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('tempFileName', true, 0), new QueryStringParameterRule('friendlyFileName', true, 1), new QueryStringParameterRule('type', true, 2)]);

        export namespace RiskAssessment {
            export const DASHBOARD = new Endpoint('riskAssessmentHomepage', '/FI/RiskAssessment/Dashboard', true);
            export const EDIT_ASSESSMENT_V1 = new Endpoint('editAssessment_V1', '/FI/RiskAssessment/EditAssessment', true, QueryStringParameterReplacementRule.nameEqualsValue, [new QueryStringParameterRule('ID', true, 0), new QueryStringParameterRule('fromVendorDashboard', false, 1)]);
            export const IN_PROGRESS_PAGE = new Endpoint('inProgressAssessmentsPage', '/FI/RiskAssessment/ContinueAssessment', true);
            export const QUESTIONNAIRE_LIBRARY = new Endpoint('questionnaireLibrary', '/FI/RiskAssessment/RiskQuestionnaireLibrary', true);
        }
    }
}
