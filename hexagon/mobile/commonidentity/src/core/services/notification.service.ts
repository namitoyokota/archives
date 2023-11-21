import { ServiceManager$v1 } from "@galileo/mobile_dynamic-injection-engine";
import { TokenManager$v1 } from "@galileo/platform_common-http";
import { IdentityNotificationHub$v1 } from "@galileo/platform_commonidentity";
import { filter, first } from "rxjs/operators";
import { EnvironmentService } from "./environment.service";

export class NotificationService extends IdentityNotificationHub$v1{

  constructor(
    tokenManager = ServiceManager$v1.get(TokenManager$v1),
    environmentSrv = ServiceManager$v1.get(EnvironmentService)
  ) {
    super(
      tokenManager,
      environmentSrv.baseURL$.pipe(
        filter(url => !!url),
        first()
      ).toPromise()
    );
  }

}
