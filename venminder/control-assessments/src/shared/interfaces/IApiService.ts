import {
  DeleteApiRequest,
  DeleteJsonRequest,
  FetchRequest,
  GetApiRequest,
  GetByIdJsonRequest,
  GetJsonRequest,
  PostApiRequest,
  PutApiRequest,
  PutPostJsonRequest,
} from "../models/api-service-model";

export abstract class IApiService {
  abstract get(request: GetApiRequest): Promise<any>;
  abstract get<T>(request: GetApiRequest): Promise<T>;
  abstract getAsGeneric<T>(request: GetApiRequest): Promise<T>;
  abstract getJson(request: GetJsonRequest): Promise<any>;
  abstract getJson<T>(request: GetJsonRequest): Promise<T>;
  abstract getJsonByID(request: GetByIdJsonRequest): Promise<any>;
  abstract getJsonByID<T>(request: GetByIdJsonRequest): Promise<T>;
  abstract displayModalWhenRemoteCallReturnsError(display: boolean);

  abstract put(request: PutApiRequest): Promise<any>;
  abstract put<T>(request: PutApiRequest): Promise<T>;
  abstract putAsGeneric<T>(request: PutApiRequest): Promise<T>;
  abstract putJson(request: PutPostJsonRequest): Promise<any>;
  abstract putJson<T>(request: PutPostJsonRequest): Promise<T>;
  abstract uploadPut(url: string, body: any): Promise<any>;
  abstract uploadPut<T>(url: string, body: any): Promise<T>;

  abstract post(request: PostApiRequest): Promise<any>;
  abstract post<T>(request: PostApiRequest): Promise<T>;
  abstract postAsGeneric<T>(request: PostApiRequest): Promise<T>;
  abstract postJson(request: PutPostJsonRequest): Promise<any>;
  abstract postJson<T>(request: PutPostJsonRequest): Promise<T>;

  abstract fetch(request: FetchRequest): Promise<any>;

  abstract upload(url: string, body: any): Promise<any>;
  abstract upload<T>(url: string, body: any): Promise<T>;

  abstract delete(request: DeleteApiRequest): Promise<any>;
  abstract deleteAsGeneric<T>(request: DeleteApiRequest): Promise<T>;
  abstract deleteJson(request: DeleteJsonRequest): Promise<any>;
  abstract deleteJson<T>(request: DeleteJsonRequest): Promise<T>;
}
