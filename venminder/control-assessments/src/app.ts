import { SessionTimeoutService } from "shared-from-dcdev/shared/services/session-timeout-service";
import { UserService } from "shared-from-dcdev/shared/services/userService";
import { AppSettingsService } from "shared-from-dcdev/shared/services/appSettingsService";
import { AuthService } from "shared-from-dcdev/shared/services/authService";
import { Router, RouterConfiguration } from "aurelia-router";
import { inject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import type { IAuthService } from "shared-from-dcdev/shared/interfaces/IAuthService";
import type { IUserService } from "shared-from-dcdev/shared/interfaces/IUserService";
import type { IAppSettingsService } from "shared-from-dcdev/shared/interfaces/IAppSettingsService";
import type { ISessionTimeout } from "shared-from-dcdev/shared/interfaces/session-timeout-interface";
import { AuthorizeStep } from "shared-from-dcdev/shared/pipeline-steps/authorize-step";
import { PublicAppSettings } from "shared-from-dcdev/shared/models/app-settings";
import { LoggedInUser } from "shared-from-dcdev/shared/models/userInfo";
import { VendorUserRoles } from "./shared-from-dcdev/shared/enums/vendor-user-roles";

export class App {
  private router: Router;
  //private pendoLoadAttempts: number = 0;
  //private pdfGeneratorIsAttached: boolean = false;
  private settings: PublicAppSettings = null;
  private dfpLoaded = false;
  //private pendoLoaded: boolean = false;
  private user: LoggedInUser = null;
  private isLoggedIn = false;

  constructor(
    @inject(AuthService) private auth: IAuthService,
    @inject(AppSettingsService) private appSettings: IAppSettingsService,
    @inject(UserService) private userService: IUserService,
    @inject(SessionTimeoutService) private sessionTimeout: ISessionTimeout
  ) {}

  activate() {
    this.initialize();
  }

  async getUserInfo(): Promise<void> {
    this.isLoggedIn = await this.auth.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = await this.userService.getUserInfo();
    }
  }

  private async initialize(): Promise<void> {
    this.sessionTimeout.start();
    //this.pdfGeneratorIsAttached = !isNullOrUndefined((<any>window).selectpdf) && !isNullOrUndefined((<any>window).selectpdf.start);
    const userInfoPromise = this.getUserInfo();
    this.settings = await this.appSettings.getAppSettings();
    await userInfoPromise;
    //this.initializePendo();
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.addAuthorizeStep(AuthorizeStep);

    config.options.pushState = true;
    config.options.root = "/";

    config.map([
      { route: "", redirect: "templates" },
      {
        route: "templates",
        name: "templates",
        moduleId: PLATFORM.moduleName(
          "areas/dashboard/dashboard",
          "control-assessments-templates"
        ),
        settings: {
          roles: ["DC"],
          venminderRoles: [VendorUserRoles.DCAdmin_Area_ControlAssessments],
        },
      },
      {
        route: "templates/template-builder",
        name: "template-builder",
        moduleId: PLATFORM.moduleName(
          "areas/dashboard/templates-tab/templates/main",
          "control-assessments-templates"
        ),
        settings: {
          roles: ["DC"],
          venminderRoles: [VendorUserRoles.DCAdmin_Area_ControlAssessments],
        },
      },
      {
        route: "assessments",
        name: "complete-assessment",
        moduleId: PLATFORM.moduleName(
          "areas/assessments/main",
          "control-assessments-complete"
        ),
        settings: {
          roles: ["DC"],
          venminderRoles: [VendorUserRoles.DCAdmin_Area_ControlAssessments],
        },
      },
      {
        route: "user/auth/oidc/signin-redirect",
        name: "signin-redirect",
        moduleId: PLATFORM.moduleName(
          "shared-from-dcdev/user/components/auth/oidc/signin-redirect",
          "user-shared"
        ),
      },
    ]);

    this.router = router;
  }
}
