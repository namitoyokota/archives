import { Injector } from '@angular/core';
import { FeatureFlagRuntimeService } from './feature-flag-runtime.service';

/**
 * Switch to using a different method if feature flags are enabled
 * @param methodName The string name of the method to activate if the feature flags are enabled
 * @param flags The flag or flags that activates the proxy method
 */
export function ProxyMethod(methodName: string, flags: string | string[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const newInjector = Injector.create({
      providers: [[FeatureFlagRuntimeService]]
    });

    const ffRuntime = newInjector.get(FeatureFlagRuntimeService);

    if (ffRuntime.isActive(flags)) {
      descriptor.value = (...args: any[]) => {
        target[methodName](args);
      };
    }

  };
}
