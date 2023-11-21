import { inject } from "aurelia-dependency-injection";
import { HttpClient } from "aurelia-fetch-client";
import type { IOidcClientService } from "../interfaces/IOidcClientService";
import { OidcSigninResponse } from "../interfaces/OidcSigninResponse";
import { OidcClientService } from "./oidc-client-service";

export class HttpAuthClient extends HttpClient
{
    public httpConfigured = false;

    constructor(
        @inject(OidcClientService) private oidc: IOidcClientService
    ) {
        super();
    }

    addAuth = async (): Promise<HttpAuthClient> => {
        const response: OidcSigninResponse = await this.oidc.signIn();
        if (response.tokenRenewed || !this.httpConfigured) { 
            this.setConfiguration(response.tokenType, response.accessToken); 
        }
        return this;
    }

    removeAuth = async (): Promise<HttpAuthClient> => {
        const response: OidcSigninResponse = await this.oidc.signIn();
        if (this.httpConfigured) { 
            this.unsetConfiguration(); 
        }
        return this;
    }

    private setConfiguration = (tokenType : string, accessToken : string) : void => {
        this.configure(config => {
            config
                .useStandardConfiguration()
                .withInterceptor({
                    request(request) {
                        request.headers.delete("Authorization");
                        request.headers.append("Authorization", `${tokenType} ${accessToken}`);                     
                        return request;
                    }
                });
        });
        this.httpConfigured = true;     
    }  

    private unsetConfiguration = (): void => {
        this.configure(config => {
            config.withDefaults({
                credentials: 'include',
                headers: { 'X-Requested-With': 'Fetch' }
            });
        });
        this.httpConfigured = false;     
    }     
}
