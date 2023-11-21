import { OpenIdToken } from '../models/openIdToken';
import type { IApiService } from "shared/interfaces/IApiService";

export interface IAuthService {
    isLoggedIn(): Promise<boolean>;
}