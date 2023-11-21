import { Container } from "aurelia-dependency-injection";
import type { IAppSettingsService } from "../interfaces/IAppSettingsService";
import { PublicAppSettings } from '../models/app-settings';
import type { IOidcClientService } from "../interfaces/IOidcClientService";
import { OidcSigninResponse } from "../interfaces/OidcSigninResponse";
import type { UserManagerSettings } from "oidc-client-ts";
import { User, UserManager, WebStorageStateStore } from "oidc-client-ts";
import * as _ from "lodash";
import { AppSettingsService } from "./appSettingsService";
import appsettingsV2 from '../../../../config/appsettings.json';

export class OidcClientService implements IOidcClientService {

    public readonly OidcSpaClientName = "venminderSpaApp";

    private appSettings: PublicAppSettings;
    private user: User;
    private stateStore = window.sessionStorage;
    private readonly scopes = new Array(
        //"openid", 
        //"profile", 
        //"venminder-aspnetcore-webapi-template-webapi", 
        "controlAssessmentsApi"
    );

    constructor() { }

    signIn = async (): Promise<OidcSigninResponse> => {
        let renewed = false;
        if (!this.user || this.user.expired) {
            const manager = await this.getOidcManager();
            this.user = await manager.getUser();
            if (!this.user || this.user.expired) {
                this.user = await manager.signinSilent();
                renewed = true;
            }
        }
        return new OidcSigninResponse(renewed, this.user.token_type, this.user.access_token);
    }

    clearSession = async (): Promise<void> => {
        await this.removeOidcStateStorageKeys();
        await this.getOidcManager().then(mgr => mgr.clearStaleState());
    }

    signinCallback = async (): Promise<void> => {
        return await this.getOidcManager().then(mgr => mgr.signinSilentCallback());
    }


    private getOidcClientSettings(appSettings: PublicAppSettings): UserManagerSettings {
        if (!appSettings) return null;

        return {
            client_id: this.OidcSpaClientName,
            authority: appSettings.authUrl,
            redirect_uri: `${appsettingsV2.Control_Assessments_Templates}/user/auth/oidc/signin-redirect`,
            silent_redirect_uri: `${appsettingsV2.Control_Assessments_Templates}/user/auth/oidc/signin-redirect`,
            response_type: "code",
            scope: this.scopes.join(" "),
            filterProtocolClaims: true,
            userStore: new WebStorageStateStore({ store: this.stateStore }),
        };
    }

    private getOidcManager = async (): Promise<UserManager> => {
        const appSettings = await this.getAppSettings();
        const oidcSettings = this.getOidcClientSettings(appSettings);
        return new UserManager(oidcSettings);
    }

    private getAppSettings = async (): Promise<PublicAppSettings> => {
        if (this.appSettings) { return this.appSettings; }

        var appSettingsService = Container.instance.get(AppSettingsService);

        this.appSettings = await appSettingsService.getAppSettings();
        return this.appSettings;
    }

    private removeOidcStateStorageKeys = async (): Promise<void> => {
        const self = this;
        const keys = await self.getOidcStateStorageKeys();

        if (keys && keys.length > 0) {
            _.forEach(keys, (item) => self.stateStore.removeItem(item));
        }
    }

    private getOidcStateStorageKeys = async () => {
        const self = this;
        const keys = Object.keys(this.stateStore);
        if (keys && keys.length > 0) {
            return _.filter(keys, (key) => key.indexOf(self.OidcSpaClientName) >= 0);
        }
        return null;
    }

}
