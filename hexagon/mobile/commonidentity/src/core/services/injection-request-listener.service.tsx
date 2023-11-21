import { InjectionRequestListener$v1 } from '@galileo/mobile_dynamic-injection-engine';
import React from 'react';
import { Environment } from '../components/environment.component';
import { InjectableComponentNames, capabilityId } from '../../common';

import { ColorCircle } from '../components/color-circle.component';

/**
 * Listens to component injection request.
 */
export class InjectionRequestListenerService extends InjectionRequestListener$v1 {

  constructor() {
    super(capabilityId);
  }

  /**
   * Returns a given component
   * @param name String name of component
   * @param data Data to pass to component
   * @returns The component
   */
  getComponentFromName(name: InjectableComponentNames, data: string): JSX.Element {
    switch(name) {
      case InjectableComponentNames.colorComponent:
        return <ColorCircle color={data}></ColorCircle>;
      case InjectableComponentNames.environmentComponent:
        return <Environment/>
      default:
        throw new Error(`${capabilityId}:: No component found for ${name}`);
    }
  }

}
