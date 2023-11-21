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

  attached() {
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
    const templatesListBreadcrumb = {
      name: "templates",
      title: "Assessments By Venminder",
    };

    config.map([
      {
        route: "",
        redirect: "template-new",
      },
      {
        route: "template-new",
        breadcrumbs: [
          homeBreadcrumb,
          templatesListBreadcrumb,
          { name: "template-new", title: "Assessment Template" },
        ],
        name: "template-new",
        moduleId: PLATFORM.moduleName(
          "./template-builder/template-builder",
          "control-assessments-templates"
        ),
        settings: { auth: true },
        title: "Assessment Template",
      },
      {
        route: "template-edit/:templateTitle",
        breadcrumbs: [
          homeBreadcrumb,
          templatesListBreadcrumb,
          { name: "template-edit", title: "Assessment Template" },
        ],
        name: "template-edit",
        moduleId: PLATFORM.moduleName(
          "./template-builder/template-builder",
          "control-assessments-templates"
        ),
        settings: { auth: true },
        title: "Assessment Template",
      },
    ]);

    this.router = router;
  }
}
