import { ContentType } from "shared-from-dcdev/shared/content-type";
import {
  EndpointBase,
  QueryStringParameter,
} from "shared-from-dcdev/shared/endpoint-base";

export abstract class BaseRequest {
  public timeout: number;
  public shouldAddBearerToken: boolean;
  constructor(timeout?: number, shouldAddBearerToken?: boolean) {
    this.timeout = timeout !== null ? timeout : 20000;
    this.shouldAddBearerToken =
      shouldAddBearerToken !== null ? shouldAddBearerToken : false;
  }
}

export class FetchRequest extends BaseRequest {
  constructor(
    public method: string,
    public url: string,
    public accept: ContentType[],
    public contentType: ContentType,
    timeout?: number,
    shouldAddBearerToken?: boolean,
    public body?: any
  ) {
    super(timeout, shouldAddBearerToken);
  }
}

export class GetApiRequest extends FetchRequest {
  constructor(
    url: string,
    accept: ContentType[],
    shouldAddBearerToken?: boolean,
    timeout?: number
  ) {
    super(
      "get",
      url,
      accept,
      ContentType.UrlEncoded,
      timeout,
      shouldAddBearerToken
    );
  }
}

export class PutApiRequest extends FetchRequest {
  constructor(
    url: string,
    accept: ContentType[],
    contentType: ContentType,
    body?: any,
    shouldAddBearerToken?: boolean,
    timeout?: number
  ) {
    super(
      "put",
      url,
      accept,
      contentType,
      timeout,
      shouldAddBearerToken,
      JSON.stringify(body)
    );
  }
}

export class PostApiRequest extends FetchRequest {
  constructor(
    url: string,
    accept: ContentType[],
    contentType: ContentType,
    body?: any,
    shouldAddBearerToken?: boolean,
    timeout?: number
  ) {
    super(
      "post",
      url,
      accept,
      contentType,
      timeout,
      shouldAddBearerToken,
      JSON.stringify(body)
    );
  }
}

export class DeleteApiRequest extends FetchRequest {
  constructor(
    url: string,
    accept: ContentType[] = [],
    body?: any,
    shouldAddBearerToken?: boolean,
    timeout?: number,
    contentType: ContentType = ContentType.UrlEncoded
  ) {
    super(
      "delete",
      url,
      accept,
      contentType,
      timeout,
      shouldAddBearerToken,
      body
    );
  }
}

export class BaseJsonRequest extends BaseRequest {
  constructor(
    public endpoint: EndpointBase,
    public remoteBaseUrl: string = null,
    timeout?: number,
    shouldAddBearerToken?: boolean
  ) {
    super(timeout, shouldAddBearerToken);
  }
}

export class GetJsonRequest extends BaseJsonRequest {
  constructor(
    endpoint: EndpointBase,
    public queryString?: string | QueryStringParameter[],
    remoteBaseUrl?: string,
    shouldAddBearerToken?: boolean,
    timeout?: number
  ) {
    super(endpoint, remoteBaseUrl, timeout, shouldAddBearerToken);
  }
}

export class GetByIdJsonRequest extends GetJsonRequest {
  constructor(
    endpoint: EndpointBase,
    public id: string,
    public idName: string = "id",
    shouldAddBearerToken?: boolean,
    timeout?: number
  ) {
    super(endpoint, `${idName}=${id}`, null, shouldAddBearerToken, timeout);
  }
}

export class PutPostJsonRequest extends BaseJsonRequest {
  constructor(
    endpoint: EndpointBase,
    public body: any,
    remoteBaseUrl?: string,
    shouldAddBearerToken?: boolean,
    timeout?: number
  ) {
    super(endpoint, remoteBaseUrl, timeout, shouldAddBearerToken);
  }
}

export class DeleteJsonRequest extends BaseJsonRequest {
  constructor(
    endpoint: EndpointBase,
    public body: any,
    remoteBaseUrl?: string,
    shouldAddBearerToken?: boolean,
    timeout?: number
  ) {
    super(endpoint, remoteBaseUrl, timeout, shouldAddBearerToken);
  }
}
