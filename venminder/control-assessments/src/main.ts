import { DOMPurifySanitizer } from "@venminder/vm-library";
import { Aurelia } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { HTMLSanitizer } from "aurelia-templating-resources";
import appsettings from "../config/appsettings.json";
import {
  DateTimeKind,
  installDatePolyfills,
} from "./shared-from-dcdev/shared/utilities/date-helpers";

installDatePolyfills();

declare global {
  interface Array<T> {
    fill(value: T, start?: number, end?: number): this;
  }
  interface Date {
    kind: DateTimeKind;

    getTimezoneOffset_Save(): number;
    toString(format?: string): string;
    specifyKind(kind: DateTimeKind): Date;
    createDate(dateTimeString?: string, dateTimeKind?: DateTimeKind): Date;
    addDays(days: number): Date;
    subtractDays(days: number): Date;
    addMonths(days: number): Date;
    convertFromUTCtoLocal(): void;
  }
  interface String {
    hashCode(): number;
  }
  interface JQuery {
    tipTip(options: any, value: any): JQuery;
  }
  interface AdBlockDetector {
    init(options: {
      debug: boolean;
      complete?: (findResult: boolean) => void;
      found?: () => void;
      notFound?: () => void;
    }): void;
  }
  var adblockDetector: AdBlockDetector;
}

export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .singleton(HTMLSanitizer, DOMPurifySanitizer)
    .feature(PLATFORM.moduleName("resources/index"))
    .feature(PLATFORM.moduleName("shared-from-dcdev/resources/index", "global"))
    .feature(PLATFORM.moduleName("shared-from-dcdev/shared/index", "global"))
    .plugin(PLATFORM.moduleName("aurelia-dialog", "global"))
    .plugin(PLATFORM.moduleName("aurelia-validation"))
    .plugin(
      PLATFORM.moduleName("aurelia-bootstrap-datetimepicker", "global"),
      (config) => {
        // Information here: https://www.npmjs.com/package/aurelia-bootstrap-datetimepicker
        config.extra.iconBase = "font-awesome";
        config.extra.withDateIcon = true;
        config.options.allowInputToggle = true;
      }
    )
    //.plugin(PLATFORM.moduleName('aurelia-bootstrap-tagsinput', 'global'), config => {
    //    config.extra.bootstrapVersion = 3;
    //})
    .plugin(PLATFORM.moduleName("aurelia-bootstrap", "global"))
    // There were a couple bugs in abp-select that were causing problems.
    // I fixed them and submitted pull requests.  Once accepted, we can go back to using the npm package.
    // https://github.com/ghiscoding/Aurelia-Bootstrap-Plugins/pull/74
    // https://github.com/ghiscoding/Aurelia-Bootstrap-Plugins/pull/75
    //.plugin(PLATFORM.moduleName('aurelia-bootstrap-select', 'global'))
    .plugin(PLATFORM.moduleName("@venminder/vm-library"));

  aurelia.use.developmentLogging(appsettings.debug ? "debug" : "warn");

  if (appsettings.testing) {
    aurelia.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName("app")));
}
