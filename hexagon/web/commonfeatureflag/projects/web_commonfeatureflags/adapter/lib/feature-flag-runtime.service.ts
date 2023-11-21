import { Injectable } from '@angular/core';
import { FeatureFlag$v2 } from '@galileo/web_commonfeatureflags/_common';

@Injectable({providedIn: 'root'})
export class FeatureFlagRuntimeService {

  /** Loads the feature flag ids that has been set in the window scope */
  private flagIds: string[] = (window as any).activeFeatureFlags;

  /** Enabled flags */
  private flags: FeatureFlag$v2[] = [];

  constructor() {
      // Process flags
    this.flags = this.flagIds.map(flagId => new FeatureFlag$v2({flagId}));
  }

  /**
   * Returns true if the feature flag is active
   * @param flags Flag to check if they are active
   */
  isActive(flags: string | string[]): boolean {
    if (!Array.isArray(flags)) {
      flags = [flags];
    }

    return flags.every(flag => {
      return !!this.flags?.find(f => f.flagId === flag);
    });
  }

}
