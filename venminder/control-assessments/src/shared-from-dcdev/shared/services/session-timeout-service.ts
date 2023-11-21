import { inject, TemplatingEngine, View } from "aurelia-framework";
import { Router } from "aurelia-router";
import moment from "moment";
import { AppSettingsService } from "shared-from-dcdev/shared/services/appSettingsService";
import {
  CookieHelper,
  CookieOptions,
} from "shared-from-dcdev/shared/utilities/cookie-helper";
import type { IApiService } from "shared/interfaces/IApiService";
import { GetJsonRequest } from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import toastr from "toastr";
import { Endpoints } from "../endpoints";
import type { IAppSettingsService } from "../interfaces/IAppSettingsService";
import type { ISessionTimeout } from "../interfaces/session-timeout-interface";
import { PublicAppSettings } from "../models/app-settings";
import { isNullOrUndefined } from "../utilities/globals";

export class SessionTimeoutService implements ISessionTimeout {
  private timeoutId: number = null;
  private toast: any = null;
  private millisecondsInSecond = 1000;
  private secondsInMinute = 60;
  private minutesInHour = 60;
  private fiveMinutes = this.millisecondsInSecond * this.secondsInMinute * 5;
  // For Testing
  //private timeoutInMillisecondsUntilLogout = this.secondsInMinute * 2;
  //private timeoutInMillisecondsUntilWarning = this.millisecondsInSecond * 10;
  private timeoutInMillisecondsUntilLogout =
    this.millisecondsInSecond * this.secondsInMinute * this.minutesInHour;
  private timeoutInMillisecondsUntilWarning =
    this.timeoutInMillisecondsUntilLogout - this.fiveMinutes;

  private accountLogoffUrl: string = "/user/logout";
  private timeString: string;
  private timeoutUrl: string = `${this.accountLogoffUrl}?sessionTimeout=true`;
  private dynamicView: View;
  private sessionHasTimedOut = false;
  private appSettings: PublicAppSettings;
  private appSettingsPromise: Promise<void>;
  private previousExpirationTime: number;

  constructor(
    @inject(ApiService) private api: IApiService,
    @inject(AppSettingsService) private appSettingsService: IAppSettingsService,
    @inject(Router) private router: Router,
    @inject(TemplatingEngine) private templatingEngine: TemplatingEngine
  ) {
    this.previousExpirationTime = moment().add(5, "minutes").toDate().getTime();
    this.getAppSettings();
  }

  private getAppSettings() {
    this.appSettingsPromise = this.appSettingsService
      .getAppSettings()
      .then((settings) => {
        this.appSettings = Object.assign(new PublicAppSettings(), settings);
        if (!this.appSettings.rsdUrl.endsWith("/"))
          this.appSettings.rsdUrl += "/";
      });
  }

  start(): void {
    this.sessionHasTimedOut = false;
    this.appSettingsPromise.then(() => {
      const isPdfPrinterAttached =
        (window as any).selectpdf &&
        typeof (window as any).selectpdf === "object";
      if (!isPdfPrinterAttached) {
        this.setupTimers();
      }
    });
  }

  private setupTimers() {
    //document.addEventListener("mousemove", ns.refreshSession, false);
    document.addEventListener("mousedown", this.refreshSession, false);
    document.addEventListener("keydown", this.refreshSession, false);
    document.addEventListener("scroll", this.refreshSession, false);
    document.addEventListener("touchmove", this.refreshSession, false);
    this.startTimer();
    window.setTimeout(
      () => this.refreshServerSession(),
      this.millisecondsInSecond * this.secondsInMinute * 30
    );
  }
  private refreshServerSession() {
    this.api
      .getJson(new GetJsonRequest(Endpoints.Api.Global.GET_GUID))
      .then(() => {
        window.setTimeout(
          () => this.refreshServerSession(),
          this.millisecondsInSecond * this.secondsInMinute * 30
        );
      });
  }

  hasTimedOut(): boolean {
    return this.sessionHasTimedOut;
  }
  private refreshSession = (e: Event = null) => {
    if (!isNullOrUndefined(e)) {
      const target = e.target || e.srcElement;
      if (
        !isNullOrUndefined(target) &&
        (target as any).id === "sessionTimeoutLogout"
      ) {
        this.logoff();
        return true;
      }
    }
    window.clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.clearToast();
    this.startTimer();
    return true;
  };
  private startTimer() {
    this.timeoutId = window.setTimeout(
      () => this.doInactive(),
      this.timeoutInMillisecondsUntilWarning
    );
    this.setTimeoutCookie(false);
  }
  private doInactive() {
    const remainingMsUntilTimeout = this.getRemainingMillisecondsUntilTimeout();
    if (remainingMsUntilTimeout > 0) {
      this.timeoutId = window.setTimeout(
        () => this.doInactive(),
        remainingMsUntilTimeout
      );
      return;
    } else if (remainingMsUntilTimeout === -9999) {
      this.logoff();
      return;
    }

    this.updateRemainingTimeAndSetNotice(this.fiveMinutes);
  }
  private updateRemainingTimeAndSetNotice(remainingTime) {
    const remainingMsUntilTimeout = this.getRemainingMillisecondsUntilTimeout();
    if (remainingMsUntilTimeout > 0) {
      this.refreshSession();
      return;
    } else if (remainingMsUntilTimeout === -9999) {
      this.logoff();
      return;
    }

    if (remainingTime <= 0) {
      this.sessionTimeout();
    } else {
      this.updateTimeoutNotice(remainingTime);
      this.timeoutId = window.setTimeout(() => {
        if (this.timeoutId !== null) {
          this.updateRemainingTimeAndSetNotice(remainingTime - 1000);
        }
      }, 1000);
    }
  }

  private getMinutesUntilTimeout(millisecondDifference: number): number {
    return Math.floor(millisecondDifference / 60000);
  }
  private clearToast() {
    if (!isNullOrUndefined(this.toast)) {
      toastr.clear(this.toast, { force: true });
      this.toast = null;
      this.cleanupDynamicView();
      this.setTimeoutCookie(false);
    }
  }
  private setTimeoutCookie(expire) {
    const opts: CookieOptions = {
      path: "/",
      domain: ".venminder.com",
      expiry: 2,
      secure: true,
      sameSite: "Lax",
    };
    const dt = new Date();
    const nextTimeoutMilliseconds = expire
      ? -9999 // Magic number indicating one tab has already logged out.
      : dt.getTime() + this.timeoutInMillisecondsUntilWarning;
    CookieHelper.delete("nextTimeoutMs");
    CookieHelper.set("nextTimeoutMs", nextTimeoutMilliseconds.toString(), opts);
  }
  private getRemainingMillisecondsUntilTimeout(): number {
    const nextTimeoutMs = CookieHelper.get("nextTimeoutMs");
    if (!isNullOrUndefined(nextTimeoutMs)) {
      const num = parseInt(nextTimeoutMs);
      if (num === -9999) return -9999; // Magic number indicating one tab has already logged out.
      const currTime = new Date().getTime();
      return num - currTime;
    }
    return 0;
  }

  private updateTimeoutNotice(millisecondDifference: number): void {
    const mins = this.getMinutesUntilTimeout(millisecondDifference);
    const secs = this.getSecondsUntilTimeout(millisecondDifference, mins);
    let secsString = secs.toString();
    if (secsString.length === 1) secsString = "0" + secsString;

    this.timeString = mins.toString() + ":" + secsString;
    const $elem = $("#sessionTimeoutToast");
    if ($elem.length === 0) this.showTimeoutNotice();
  }
  private showTimeoutNotice() {
    // Waiting until now because doing this in the constructor was causing problems during redirect navigation.
    this.getAppSettings();

    this.setToastrOptions(0, 0);
    this.toast = toastr.warning(
      `<div id="sessionTimeoutToast"><b>Your session is about to expire</b><br/><br/>You will be logged out in \${timeString} minutes. Do you want to stay logged in?<br/><br/><input style="color:black;" class="lightButton smallBtn" type="button" value="Yes, stay logged in" click.call="stayLoggedIn()">&nbsp;&nbsp;<input style="color:black;" class="lightButton smallBtn" type="button" value="No, log out" click.call="logoff()" id="sessionTimeoutLogout"></div>`
    );
    const elem = $("#sessionTimeoutToast");
    // https://ilikekillnerds.com/2016/01/enhancing-at-will-using-aurelias-templating-engine-enhance-api/
    if (elem.find(".au-target").length === 0) {
      if (!isNullOrUndefined(this.dynamicView)) this.cleanupDynamicView();
      this.dynamicView = this.templatingEngine.enhance({
        bindingContext: this,
        element: elem[0],
      });
    }
  }
  private cleanupDynamicView() {
    try {
      if (this.dynamicView) {
        this.dynamicView.detached();
        this.dynamicView.unbind();
      }
    } catch (e) {
      // Ignore, we don't care.
    } finally {
      this.dynamicView = null;
    }
  }
  private getSecondsUntilTimeout(
    millisecondDifference: number,
    mins: number
  ): number {
    return Math.floor(((millisecondDifference - mins * 60000) % 60000) / 1000);
  }
  private setToastrOptions(timeout: number, extendedTimeout: number) {
    toastr.options = {
      closeButton: false,
      debug: false,
      newestOnTop: false,
      progressBar: false,
      positionClass: "toast-top-center",
      preventDuplicates: false,
      onclick: null,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: timeout,
      extendedTimeOut: extendedTimeout,
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  }
  private sessionTimeout() {
    this.sessionHasTimedOut = true;
    this.router.navigate(this.timeoutUrl);
  }

  private stayLoggedIn() {
    this.refreshSession();
    return true;
  }

  private logoff() {
    this.setTimeoutCookie(true);
    this.router.navigate(this.accountLogoffUrl);
  }
}
