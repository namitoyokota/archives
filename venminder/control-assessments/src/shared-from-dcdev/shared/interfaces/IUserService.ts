import { LoggedInUser, UserRole } from "../models/userInfo";
import { FIRoleForDisplayModel, PhoneTypeModel } from "shared-from-dcdev/shared/models/add-user/add-user-model";
import { FIContact } from "../models/contact";

export interface IUserService {
    clearUserInfo(): void;
    getUserInfo(forceRefresh?: boolean): Promise<LoggedInUser>;
    getUserRolesInfo(forceRefresh?: boolean): Promise<UserRole[]>;
    getUnreadInboxMessageCount(): Promise<number>;
    getFIRolesForUser(FIID: string, contactID: string): Promise<FIRoleForDisplayModel[]>;
    isFeatureOnForUser(featureID: number): Promise<boolean>;
    getPhoneTypes(): Promise<PhoneTypeModel[]>;
    areFeaturesOnForUser(featureIDs: number[]): Promise<Map<number, boolean>>;
    getZendeskChatToken(): Promise<string>;
    getUserInfoByContactID(contactID: string): Promise<FIContact>;
}