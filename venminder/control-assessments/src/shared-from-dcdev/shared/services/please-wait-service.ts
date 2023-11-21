import {
  DialogCancellableOpenResult,
  DialogController,
  DialogOpenPromise,
  DialogOpenResult,
  DialogService,
} from "aurelia-dialog";
import { inject, Lazy, PLATFORM } from "aurelia-framework";
import { ApiUrlService } from "shared-from-dcdev/shared/services/apiUrlService";
import { isNullOrUndefined } from "shared-from-dcdev/shared/utilities/globals";
import { IApiService } from "shared/interfaces/IApiService";
import { GetApiRequest } from "shared/models/api-service-model";
import { ContentType } from "../content-type";
import { PleaseWaitViewModel } from "../dialogs/please-wait-dialog-models";
import { QueryStringParameter } from "../endpoint-base";
import { Endpoints } from "../endpoints";
import type { IApiUrlService } from "../interfaces/IApiUrlService";
import type {
  IPleaseWait,
  IPleaseWaitOpenPromise,
} from "../interfaces/please-wait-interface";
import { ProgressBO } from "../models/progress-models";

export class PleaseWaitService implements IPleaseWait {
  timer: number = null;
  dialogController: DialogController = null;
  openPromise: DialogOpenPromise<DialogCancellableOpenResult> = null;
  statusModel: PleaseWaitViewModel = null;
  progressPromise: Promise<boolean> = null;
  isCancelled: boolean = false;
  isCompleted: boolean = false;
  watchProgressResolver: (value?: boolean | PromiseLike<boolean>) => void =
    null;

  pleaseWaitPromise: PleaseWaitOpenPromise = null;
  openResolver: (value: boolean | PromiseLike<boolean>) => void;
  cancelResolver: (value: void | PromiseLike<void>) => void;

  constructor(
    @inject(DialogService) private dlgService: DialogService,
    @inject(ApiUrlService) private apiUrlService: IApiUrlService,
    @inject(Lazy.of(IApiService)) private getApiService: () => IApiService
  ) {}

  isActive(): boolean {
    return (
      !isNullOrUndefined(this.progressPromise) ||
      !isNullOrUndefined(this.timer) ||
      !isNullOrUndefined(this.openPromise) ||
      !isNullOrUndefined(this.dialogController)
    );
  }

  isVisible(): boolean {
    return (
      !isNullOrUndefined(this.openPromise) ||
      !isNullOrUndefined(this.dialogController)
    );
  }

  set(waitMilliseconds: number = 500): IPleaseWaitOpenPromise {
    // People like to call pleaseWait.set(0) inside of activate() methods.  The DOM isn't always ready and this causes problems.
    if (waitMilliseconds === 0) {
      const routerView = document.getElementsByTagName("router-view");
      if (routerView.length === 0) {
        waitMilliseconds = 500;
      }
    }

    if (this.isActive()) return this.pleaseWaitPromise;

    this.pleaseWaitPromise = new PleaseWaitOpenPromise(
      new Promise<boolean>((resolve) => {
        this.openResolver = resolve;
      }),
      new Promise<void>((resolve) => {
        this.cancelResolver = resolve;
      })
    );

    this.isCompleted = false;
    this.isCancelled = false;
    if (isNullOrUndefined(this.timer)) {
      this.statusModel = new PleaseWaitViewModel(this);
      this.timer = window.setTimeout(() => {
        this.displayWait();
      }, waitMilliseconds);
    }

    return this.pleaseWaitPromise;
  }

  cancel(): void {
    this.done(true);
    if (!isNullOrUndefined(this.watchProgressResolver))
      this.watchProgressResolver(false);
  }

  completeProgress(): void {
    if (!isNullOrUndefined(this.watchProgressResolver))
      this.watchProgressResolver(true);
  }

  private done(isProgressCancelled: boolean): Promise<void> {
    if (!this.isActive()) return Promise.resolve();

    this.isCompleted = true;

    if (this.progressPromise != null) {
      this.isCancelled = isProgressCancelled;
    } else {
      if (this.timer != null) {
        window.clearTimeout(this.timer);
        this.timer = null;
        this.openResolver(false);
        this.cancelResolver();
      }
      if (this.dialogController != null) {
        this.dialogController.ok();
        this.dialogController = null;
      }
      if (this.openPromise != null) {
        this.openPromise.then(() => this.cancel());
        this.openPromise = null;
      }
      this.statusModel = null;
    }

    return isNullOrUndefined(this.pleaseWaitPromise)
      ? Promise.resolve()
      : this.pleaseWaitPromise.cancelPromise;
  }

  private displayWait(): void {
    if (this.timer != null) {
      this.timer = null;
      this.openPromise = this.dlgService.open({
        viewModel: PLATFORM.moduleName(
          "shared-from-dcdev/shared/dialogs/please-wait-dialog",
          "global"
        ),
        model: this.statusModel,
      });

      this.openPromise
        .then((result: DialogOpenResult) => {
          this.dialogController = result.controller;
          this.openPromise = null;
          this.openResolver(true);
          //if(this.isCompleted) // it's possible it was completed between the open call and the resolution of the open promise.
          //    this.done(this.isCancelled);
          return result.closeResult;
        })
        .then(() => {
          this.cancelResolver();
        });
    }
  }

  setStatusText(status: string): boolean {
    if (!this.isActive()) return false;

    this.statusModel.statusText = status;
    return true;
  }

  setProgress(
    statusText: string,
    totalWork: number,
    workCompleted: number
  ): boolean {
    if (!this.isActive()) return false;

    this.statusModel.statusText = statusText;
    this.statusModel.workCompleted = workCompleted;
    this.statusModel.totalWork = totalWork;
    return true;
  }

  watchProgress(progressId: string): Promise<boolean> {
    this.set(0);

    this.progressPromise = new Promise<boolean>((resolve) => {
      this.watchProgressResolver = resolve;
      this.checkStatus(progressId);
    }).then(async (result) => {
      this.progressPromise = null;
      this.watchProgressResolver = null;
      let wasCancelled = this.isCancelled;
      this.isCancelled = false;
      this.isCompleted = false;
      await this.done(wasCancelled);
      return result;
    });
    return this.progressPromise;
  }

  lastStatusDate: Date = null;
  async checkStatus(progressId: string) {
    let lastStatusDateParam = JSON.stringify(this.lastStatusDate).replace(
      /"/g,
      ""
    );
    this.lastStatusDate = new Date();
    let result = await this.getApiService().get<ProgressBO[]>(
      new GetApiRequest(
        this.apiUrlService.getUrl(Endpoints.Api.Global.GET_PROGRESS, [
          new QueryStringParameter("id", progressId),
          new QueryStringParameter("lastStatusDate", lastStatusDateParam),
        ]),
        [ContentType.Json]
      )
    );
    let progressRecords = result || [];
    let completedRecord = progressRecords.find((p) => p.isComplete);
    let totalWaitMilliseconds = 2000;
    let waitMilliseconds = totalWaitMilliseconds / progressRecords.length;
    let recordsProcessed = progressRecords.length > 0;

    while (progressRecords.length > 0) {
      let progressRecord = progressRecords.shift();
      await this.processProgressRecord(progressRecord, waitMilliseconds);
    }

    if (!this.isActive()) return;

    if (
      !isNullOrUndefined(completedRecord) &&
      !isNullOrUndefined(this.watchProgressResolver)
    ) {
      if (this.isCompleted) this.watchProgressResolver(true);
      else if (this.isCancelled) this.watchProgressResolver(false);
      else window.setTimeout(() => this.watchProgressResolver(true), 100);
    } else {
      if (this.isCompleted) {
        if (!isNullOrUndefined(this.watchProgressResolver))
          this.watchProgressResolver(true);
      } else if (this.isCancelled) {
        if (!isNullOrUndefined(this.watchProgressResolver))
          this.watchProgressResolver(false);
      } else {
        if (recordsProcessed)
          // If there weren't any records, then we didn't pause to draw them on the screen and we need to wait a couple seconds before asking the server for more status info
          this.checkStatus(progressId);
        else
          window.setTimeout(
            () => this.checkStatus(progressId),
            totalWaitMilliseconds
          );
      }
    }
  }

  processProgressRecord(
    progressRecord: ProgressBO,
    waitMilliseconds: number = 100
  ): Promise<void> {
    this.setProgress(
      progressRecord.statusText,
      progressRecord.totalWork,
      progressRecord.workCompleted
    );
    if (this.isCompleted || this.isCancelled) return Promise.resolve();
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, waitMilliseconds);
    });
  }
}

// This isn't intended to be used outside of this module, so it's not exported.
class PleaseWaitOpenPromise implements IPleaseWaitOpenPromise {
  constructor(
    public openPromise: Promise<boolean>,
    public cancelPromise: Promise<void>
  ) {}
  get [Symbol.toStringTag]() {
    return "PleaseWaitOpenPromise";
  }
  whenOpened(
    onfulfilled?: () => void,
    onrejected?: (reason: any) => void
  ): IPleaseWaitOpenPromise {
    this.openPromise.then(
      () => {
        onfulfilled();
      },
      (reason) => {
        onrejected(reason);
      }
    );
    return this;
  }
  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: (value: void) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ): PromiseLike<TResult1 | TResult2> {
    return this.cancelPromise.then(() => onfulfilled());
  }
}
