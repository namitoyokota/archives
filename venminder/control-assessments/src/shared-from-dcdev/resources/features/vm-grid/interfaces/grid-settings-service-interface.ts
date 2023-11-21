import { GridSettings } from "../models/vm-grid-models";

export interface IGridSettingsService {
    getGridSettingsForUser(clientID: string, gridName: string): Promise<GridSettings>;
    saveGridSettingsForUser(clientID: string, gridName: string, value: string): Promise<void>;
    deleteGridSettingsForUser(clientID: string, gridName: string): Promise<void>;
}
