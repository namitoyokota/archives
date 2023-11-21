import { inject, PLATFORM } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";

export class TemplatesTab {
  constructor(@inject(Router) private router: Router) {}

  async configureRouter(
    config: RouterConfiguration,
    router: Router
  ): Promise<void> {
    const areTemplatesAllowed = true;

    config.map([
      {
        route: "",
        redirect: "template-list",
      },
      {
        route: "template-list",
        moduleId: PLATFORM.moduleName(
          "./templates/template-list/template-list",
          "control-assessments-templates"
        ),
        name: "template-list",
        nav: areTemplatesAllowed,
        settings: { auth: true },
        title: "Assessment Templates",
      },
      {
        route: "theme-list",
        moduleId: PLATFORM.moduleName(
          "./themes/theme-list/theme-list",
          "control-assessments-templates"
        ),
        name: "theme-list",
        nav: areTemplatesAllowed,
        settings: { auth: true },
        title: "Themes",
      },
    ]);

    this.router = router;
  }
}
