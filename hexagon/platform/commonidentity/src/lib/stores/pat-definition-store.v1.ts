import { Store$v1 } from '@galileo/platform_common-libraries';

import { PatDefinition$v1 } from '../abstractions/pat-definition.v1';

export class PatDefinitionStore$v1 extends Store$v1<PatDefinition$v1> {
  constructor() {
    super('id', PatDefinition$v1);
  }
}
