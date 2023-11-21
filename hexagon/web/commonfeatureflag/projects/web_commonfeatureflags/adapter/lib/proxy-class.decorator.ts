import { Injector } from '@angular/core';
import { FeatureFlagRuntimeService } from './feature-flag-runtime.service';

/**
 * Switch to using the provided feature class if the feature flags are enabled
 * @param featureClass The class to apply if the feature flag or flags are enabled
 * @param flags The flag or flags that activates the proxy class
 */
export function ProxyClass(featureClass: any, flags: string | string[]) {
  return (target: any) => {
    const injector = Injector.create({
      providers: [[ FeatureFlagRuntimeService]]
    });

    const ffRuntime = injector.get(FeatureFlagRuntimeService);

    if (ffRuntime.isActive(flags)) {
      return featureClass;
    }
  };
}
