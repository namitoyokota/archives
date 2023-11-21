import { TokenManager$v1 } from "@galileo/platform_common-http";
import { ServiceManager$v1 } from '@galileo/mobile_dynamic-injection-engine';
import { AccessTokenDataAccessor$v1, PersonalAccessTokenDataAccessor$v1, UserDataAccessor$v1 } from "@galileo/platform_commonidentity";
import { EnvironmentService } from "./environment.service";


/**
 * Provides access to REST api
 */
export class DataService {

  /** Access v1 of access token REST API */
	accessToken?: AccessTokenDataAccessor$v1;

  /** Access v1 of personal access token REST api */
  pat?: PersonalAccessTokenDataAccessor$v1;

  /** Access v1 of user REST api */
  user?: UserDataAccessor$v1;

  constructor(
    private environmentSrv = ServiceManager$v1.get(EnvironmentService),
    private tokenManager = ServiceManager$v1.get(TokenManager$v1)
  ) {
    this.environmentSrv.baseURL$.subscribe((url: string) => {
      this.accessToken = new AccessTokenDataAccessor$v1(this.tokenManager, url);
      this.pat = new PersonalAccessTokenDataAccessor$v1(this.tokenManager, url);
      this.user = new UserDataAccessor$v1(this.tokenManager, url);
    });

  }

}
