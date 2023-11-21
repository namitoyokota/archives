import { OidcSigninResponse } from "./OidcSigninResponse";

export interface IOidcClientService
{
    signIn() : Promise<OidcSigninResponse>;
    clearSession() : Promise<void>;
    signinCallback() : Promise<void>;    
}
