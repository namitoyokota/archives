export enum HTTPCode$v1 {
  Ok = 200,
  Created = 201,
  MultiStatus = 207,
  NotModified = 304,
  BadRequest = 400,
  NotFound = 404,
  Unauthorized = 401,
  Forbidden = 403,
  Conflict = 409,
  PreconditionFailed = 412,
  InternalServiceError = 500,
}

export interface BaseResultResponse$v1<T> {
  /** Return data */
  result: T;

  /** Extra messages from the backend */
  messages: string[];

  /** Http status code */
  statusCode: HTTPCode$v1;
}

export interface PageResponse$v1<T> {
  /** Where to start the next page */
  continuationToken: string;

  /** Page of data */
  page: T;
}
