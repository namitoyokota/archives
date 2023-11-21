import { inject } from 'aurelia-framework';
import type { IOidcClientService } from 'shared-from-dcdev/shared/interfaces/IOidcClientService';
import { OidcClientService } from 'shared-from-dcdev/shared/services/oidc-client-service';

export class SigninRedirect {
  constructor(@inject(OidcClientService) private oidc: IOidcClientService) {}

    async activate() {
        await this.oidc.signinCallback();
  }
}
