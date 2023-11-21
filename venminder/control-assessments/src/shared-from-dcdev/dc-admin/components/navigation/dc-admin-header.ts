import { containerless, inject } from "aurelia-framework";
import { AppSettingsService } from "shared-from-dcdev/shared/services/appSettingsService";
import { UserService } from "shared-from-dcdev/shared/services/userService";
import type { IAppSettingsService } from "../../../shared/interfaces/IAppSettingsService";
import type { IUserService } from "../../../shared/interfaces/IUserService";
import { PublicAppSettings } from "../../../shared/models/app-settings";
import { LoggedInUser } from "../../../shared/models/userInfo";

@containerless()
export class DcAdminHeader {
  userInfo: LoggedInUser;
  appSettings: PublicAppSettings;

  accountProfileUrl: string;
  accountLogoffUrl: string = "/user/logout";

  constructor(
    @inject(AppSettingsService) private envService: IAppSettingsService,
    @inject(UserService) private userService: IUserService
  ) {}

  attached() {
    Promise.all([this.envService.getAppSettings()]).then(([settings]) => {
      let appSettings = Object.assign(new PublicAppSettings(), settings);
      if (!appSettings.appUrl.endsWith("/")) appSettings.appUrl += "/";
      if (!appSettings.rsdUrl.endsWith("/")) appSettings.rsdUrl += "/";

      this.accountProfileUrl = `${appSettings.appUrl}Account/AccountProfile`;
    });

    this.userService.getUserInfo().then((userInfo) => {
      this.userInfo = userInfo;
    });
  }
}
