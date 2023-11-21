import { inject } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";
import { inlineView } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { EventNames } from "shared-from-dcdev/shared/event-names";
import type { IAppSettingsService } from "shared-from-dcdev/shared/interfaces/IAppSettingsService";
import { PublicAppSettings } from "shared-from-dcdev/shared/models/app-settings";
import { AppSettingsService } from "shared-from-dcdev/shared/services/appSettingsService";

@inlineView(`<template><router-view></router-view></template>`)
export class Main {
  router: Router;

  constructor(
    @inject(AppSettingsService)
    private readonly appSettingsService: IAppSettingsService,
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

    config.map([
      {
        route: "",
        redirect: "complete-assessment",
      },
      {
        route: "complete-assessment/:orderId",
        breadcrumbs: [
          homeBreadcrumb,
          { name: "complete-assessment", title: "Perform Review" },
        ],
        name: "complete-assessment",
        moduleId: PLATFORM.moduleName(
          "./complete-assessment/complete-assessment",
          "control-assessments-complete"
        ),
        settings: { auth: true },
        title: "Perform Review",
      },
      {
        route: "perform-assessment/:orderId",
        breadcrumbs: [
          homeBreadcrumb,
          { name: "perform-assessment", title: "Perform Assessment" },
        ],
        name: "perform-assessment",
        moduleId: PLATFORM.moduleName(
          "./perform-assessment/perform-assessment",
          "control-assessments-perform"
        ),
        settings: { auth: true },
        title: "Perform Assessment",
      },
    ]);

    this.router = router;
  }
}
