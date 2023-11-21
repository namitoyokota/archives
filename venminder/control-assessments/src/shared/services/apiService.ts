import { DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { RequestInit as AureliaRequestInit } from "aurelia-fetch-client";
import { inject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import {
  ContentType,
  ContentTypeConverter,
} from "shared-from-dcdev/shared/content-type";
import { ErrorDialogModel } from "shared-from-dcdev/shared/dialogs/error-dialog-models";
import { TimeoutError } from "shared-from-dcdev/shared/errors";
import type { IApiUrlService } from "shared-from-dcdev/shared/interfaces/IApiUrlService";
import {
  ApiError,
  TypedResult,
} from "shared-from-dcdev/shared/models/viewModelResponse";
import { ApiUrlService } from "shared-from-dcdev/shared/services/apiUrlService";
import { HttpAuthClient } from "shared-from-dcdev/shared/services/http-auth-client";
import {
  AppLog,
  isNullOrWhitespace,
} from "shared-from-dcdev/shared/utilities/globals";
import type { IApiService } from "shared/interfaces/IApiService";
import "whatwg-fetch";
import { EventNames } from "../event-names";
import {
  DeleteApiRequest,
  FetchRequest,
  GetApiRequest,
  GetByIdJsonRequest,
  GetJsonRequest,
  PostApiRequest,
  PutApiRequest,
  PutPostJsonRequest,
} from "../models/api-service-model";

export class ApiService implements IApiService {
  private callId: string = "A";
  private pageIsUnloading: boolean = false;
  private displayErrorModal: boolean = true;

  constructor(
    @inject(HttpAuthClient) private httpClient: HttpAuthClient,
    @inject(ApiUrlService) private apiURLService: IApiUrlService,
    @inject(DialogService) private dlgService: DialogService,
    @inject(EventAggregator) private ea: EventAggregator
  ) {
    this.httpClient.configure((config) => {
      config.withDefaults({
        credentials: "include",
        headers: { "X-Requested-With": "Fetch" },
      });
    });

    window.addEventListener("beforeunload", () => {
      this.pageIsUnloading = true;
      // DO NOT RETURN ANYTHING!
    });
  }

  public displayModalWhenRemoteCallReturnsError(display: boolean) {
    this.displayErrorModal = display;
  }

  public get(request: GetApiRequest): Promise<any>;
  public get<T>(request: GetApiRequest): Promise<T> {
    return this.getAsGeneric<T>(request);
  }

  public getAsGeneric<T>(request: GetApiRequest): Promise<T> {
    return this.fetch(request);
  }

  public getJson(request: GetJsonRequest): Promise<any>;
  public getJson<T>(request: GetJsonRequest): Promise<T> {
    return this.get(
      new GetApiRequest(
        this.apiURLService.getUrl(
          request.endpoint,
          request.queryString,
          request.remoteBaseUrl
        ),
        [ContentType.Json],
        request.shouldAddBearerToken
      )
    );
  }

  public getJsonByID(request: GetByIdJsonRequest): Promise<any>;
  public getJsonByID<T>(request: GetByIdJsonRequest): Promise<T> {
    return this.getJson(request);
  }

  public put(request: PutApiRequest): Promise<any>;
  public put<T>(request: PutApiRequest): Promise<T> {
    return this.putAsGeneric<any>(request);
  }

  public putAsGeneric<T>(request: PutApiRequest): Promise<T> {
    return this.fetch(request);
  }

  public putJson(request: PutPostJsonRequest): Promise<any>;
  public putJson<T>(request: PutPostJsonRequest): Promise<T> {
    return this.put(
      new PutApiRequest(
        this.apiURLService.getUrl(
          request.endpoint,
          null,
          request.remoteBaseUrl
        ),
        [ContentType.Json],
        ContentType.Json,
        request.body,
        request.shouldAddBearerToken
      )
    );
  }

  public post(request: PostApiRequest): Promise<any>;
  public post<T>(request: PostApiRequest): Promise<T> {
    return this.postAsGeneric<any>(request);
  }

  public postAsGeneric<T>(request: PostApiRequest): Promise<T> {
    return this.fetch(request);
  }

  public postJson(request: PutPostJsonRequest): Promise<any>;
  public postJson<T>(request: PutPostJsonRequest): Promise<T> {
    return this.post(
      new PostApiRequest(
        this.apiURLService.getUrl(
          request.endpoint,
          null,
          request.remoteBaseUrl
        ),
        [ContentType.Json],
        ContentType.Json,
        request.body,
        request.shouldAddBearerToken
      )
    );
  }

  public delete(request: DeleteApiRequest): Promise<any> {
    return this.deleteAsGeneric<any>(request);
  }

  public deleteAsGeneric<T>(request: DeleteApiRequest): Promise<T> {
    return this.fetch(request);
  }

  public fetch(request: FetchRequest): Promise<any> {
    let headers = new Headers();
    headers.append(
      "Content-Type",
      ContentTypeConverter.getContentTypeString(request.contentType)
    );
    this.addAcceptHeader(headers, request.accept);

    let init: AureliaRequestInit = {
      method: request.method,
      headers: headers,
    };
    if (request.body) init.body = request.body;

    return this.callRemoteService(
      request.url,
      init,
      request.timeout,
      request.shouldAddBearerToken
    );
  }

  public upload(url: string, body: any): Promise<any>;
  public upload<T>(url: string, body: any): Promise<T> {
    let init: AureliaRequestInit = {
      method: "POST",
      headers: new Headers(),
      body: body,
    };

    return this.callRemoteService(url, init, 0, false);
  }

  public uploadPut(url: string, body: any): Promise<any>;
  public uploadPut<T>(url: string, body: any): Promise<T> {
    let init: AureliaRequestInit = {
      method: "PUT",
      headers: new Headers(),
      body: body,
    };
    return this.callRemoteService(url, init, 0, false);
  }

  private waitForServer(timeout: number, callId: string) {
    return new Promise((resolve, reject) =>
      window.setTimeout((_) => reject(new TimeoutError()), timeout)
    );
  }

  private getResult(response: Response): Promise<string | any> {
    return new Promise((resolve, reject) => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        response.json().then((data) => {
          resolve(data);
        });
      } else {
        response.text().then((text) => {
          resolve(text);
        });
      }
    });
  }

  private getTypedResult(response: Response): Promise<TypedResult> {
    return new Promise((resolve, reject) => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        response.json().then((data) => {
          if (!data) resolve(new TypedResult(null, "null"));
          else resolve(new TypedResult(data, "json"));
        });
      } else {
        response.text().then((text) => {
          if (isNullOrWhitespace(text)) resolve(new TypedResult(null, "null"));
          else resolve(new TypedResult(text, "string"));
        });
      }
    });
  }

  private callRemoteService(
    url: string,
    init: AureliaRequestInit,
    timeout,
    shouldAddBearerToken
  ): Promise<string | any> {
    let callId = this.callId;
    this.callId = this.nextChar(this.callId);

    let callPromise = new Promise(async (resolve, reject) => {
      if (shouldAddBearerToken) {
        await this.httpClient.addAuth();
      } else if (this.httpClient.httpConfigured) {
        await this.httpClient.removeAuth();
      }

      return this.httpClient
        .fetch(url, init)
        .then(
          (r) => {
            if (r.ok) {
              this.getResult(r).then((result) => resolve(result));
            } else {
              return this.getTypedResult(r).then((result) => {
                let message: string;

                try {
                  let json =
                    result.type === "null"
                      ? { message: "" }
                      : result.type === "string"
                      ? JSON.parse(result.result)
                      : result.type == "json"
                      ? result.result
                      : { message: "" };
                  message = json.message || json.Message;
                } catch (ex) {}

                let url = r.url || "";
                const queryParamsIdx = url.indexOf("?");
                if (queryParamsIdx > -1) {
                  url = url.substr(0, queryParamsIdx);
                }
                const error = new ApiError(
                  r.status,
                  r.statusText,
                  url,
                  message,
                  result
                );

                if (this.displayErrorModal) {
                  this.dlgService
                    .open({
                      viewModel: PLATFORM.moduleName(
                        "shared-from-dcdev/shared/dialogs/error-dialog",
                        "global"
                      ),
                      model: new ErrorDialogModel(error.getHtmlMessage()),
                    })
                    .whenClosed(() => {
                      this.ea.publish(EventNames.Api.API_ERROR_DIALOG_CLOSED);
                      reject(error);
                    });
                } else {
                  reject(error);
                }
              });
            }
            return null;
          },
          (r) => {
            if (r instanceof Error) {
              this.handleError(r, reject);
            } else {
              r.text().then((text) => {
                this.handleError(new Error(text), reject);
              });
            }
            return null;
          }
        )
        .catch((e) => {
          this.handleError(e, reject);
          return null;
        });
    });

    return callPromise;
  }

  private handleError(error: Error, reject: (reason: Error) => void): void {
    if (!this.pageIsUnloading) {
      AppLog.error("Error caught: " + error.message);
      this.dlgService
        .open({
          viewModel: PLATFORM.moduleName(
            "shared-from-dcdev/shared/dialogs/error-dialog",
            "global"
          ),
          model: new ErrorDialogModel(error.message),
        })
        .whenClosed(() => {
          this.ea.publish(EventNames.Api.API_ERROR_DIALOG_CLOSED);
          reject(error);
        });
    } else {
      AppLog.error("Error ignored: " + error.message);
    }
  }

  private addAcceptHeader(headers: Headers, accept: ContentType[]) {
    let acceptHeaderStrings: String[] = [];
    accept.sort((a: ContentType, b: ContentType) =>
      a == b ? 0 : a < b ? -1 : 1
    );
    accept.forEach((element) =>
      acceptHeaderStrings.push(ContentTypeConverter.getAcceptString(element))
    );
    if (acceptHeaderStrings.length)
      headers.append("Accept", acceptHeaderStrings.join(", "));
  }

  private nextChar(c: string) {
    var u = c.toUpperCase();
    if (this.same(u, "Z")) {
      var txt = "";
      var i = u.length;
      while (i--) {
        txt += "A";
      }
      return txt + "A";
    } else {
      var p = "";
      var q = "";
      if (u.length > 1) {
        p = u.substring(0, u.length - 1);
        q = String.fromCharCode(p.slice(-1).charCodeAt(0));
      }
      var l = u.slice(-1).charCodeAt(0);
      var z = this.nextLetter(l);
      if (z === "A") {
        return p.slice(0, -1) + this.nextLetter(q.slice(-1).charCodeAt(0)) + z;
      } else {
        return p + z;
      }
    }
  }

  private nextLetter(l: number) {
    if (l < 90) {
      return String.fromCharCode(l + 1);
    } else {
      return "A";
    }
  }

  private same(str: string, char: string) {
    var i = str.length;
    while (i--) {
      if (str[i] !== char) {
        return false;
      }
    }
    return true;
  }
}
