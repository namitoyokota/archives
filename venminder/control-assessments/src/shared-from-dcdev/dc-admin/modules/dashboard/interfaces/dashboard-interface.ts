import { ButtonInfo } from "../models/models";

export interface IDashboardInterface {
    getButtons(): Promise<ButtonInfo[]>;
    toggleFavoriteButton(buttonID : string): void;
}