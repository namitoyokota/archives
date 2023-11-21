import { EventAggregator } from "aurelia-event-aggregator";
import { inject, PLATFORM } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import { EventNames } from "shared-from-dcdev/shared/event-names";
import type { IAppSettingsService } from "shared-from-dcdev/shared/interfaces/IAppSettingsService";
import { PublicAppSettings } from "shared-from-dcdev/shared/models/app-settings";
import { AppSettingsService } from "shared-from-dcdev/shared/services/appSettingsService";

export class Dashboard {
  constructor(
    @inject(AppSettingsService)
    private readonly appSettingsService: IAppSettingsService,
    @inject(Router) private router: Router,
    @inject(EventAggregator) private readonly eventAggregator: EventAggregator
  ) {}

  attached(): void {
    this.eventAggregator.publish(
      EventNames.Navigation.ON_MAIN_LAYOUT_TEMPLATE_READY,
      {
        leftNavTemplate: PLATFORM.moduleName(
          "shared-from-dcdev/dc-admin/components/navigation/dc-admin-navigation",
          "dc-admin-shared"
        ),
        topNavTemplate: PLATFORM.moduleName(
          "shared-from-dcdev/dc-admin/components/navigation/dc-admin-header",
          "dc-admin-shared"
        ),
        termsAndConditionsUrl: "Policies/TermsAndConditions",
      }
    );
  }

  async configureRouter(
    config: RouterConfiguration,
    router: Router
  ): Promise<void> {
    const appSettings: PublicAppSettings =
      await this.appSettingsService.getAppSettings();
    const homeBreadcrumb = {
      href: appSettings.rsdUrl,
      title: "Administration Panel",
    };
    const templatesBreadcrumb = {
      name: "templates-tab",
      title: "Assessments By Venminder",
    };

    const areTemplatesAllowed = true;

    config.map([
      {
        route: "",
        redirect: "templates-tab",
      },
      {
        route: "templates-tab",
        breadcrumbs: [homeBreadcrumb, templatesBreadcrumb],
        moduleId: PLATFORM.moduleName(
          "areas/dashboard/templates-tab/templates-tab",
          "control-assessments-templates"
        ),
        name: "templates-main",
        nav: areTemplatesAllowed,
        settings: { auth: true },
        title: "Templates",
      },
    ]);

    this.router = router;
  }
}
