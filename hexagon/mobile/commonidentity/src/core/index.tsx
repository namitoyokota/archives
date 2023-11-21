import { InjectionRequestListenerService } from './services/injection-request-listener.service';
import { ServiceManager$v1 } from '@galileo/mobile_dynamic-injection-engine';
import { AccessTokenService } from './services/access-token.service';

import { CoreService } from './services/core.service';
import { TokenManager$v1 } from '@galileo/platform_common-http';

/**
 * Init the core functions
 */
export function coreInit(): void {

  // Bootstrap service/listeners
  ServiceManager$v1.get(TokenManager$v1)
  new InjectionRequestListenerService();
  ServiceManager$v1.get(AccessTokenService);
  ServiceManager$v1.get(CoreService);
}


// TEMP Exports
export * from './components/user-info.component';

