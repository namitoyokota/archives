import { PublicAppSettings, LayoutInformation } from "../models/app-settings";

export interface IAppSettingsService {
    getAppSettings(): Promise<PublicAppSettings>;
    getLayoutInformation(forceRefresh?: boolean): Promise<LayoutInformation>;
    getClientLayoutInformation(clientId: string): Promise<LayoutInformation>;
    useLiteWidgets(): Promise<boolean>;
    hasAccessToControlAssessments(): Promise<boolean>;
}