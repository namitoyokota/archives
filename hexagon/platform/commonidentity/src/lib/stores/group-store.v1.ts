import { StatefulStore$v1 } from '@galileo/platform_common-libraries';

import { Group$v1 } from '../abstractions/group.v1';

export class GroupStore$v1 extends StatefulStore$v1<Group$v1> {
  constructor() {
    super('id', Group$v1);
  }

  /**
   * Returns true if the source and the entity are the same
   * @param source
   * @param entity
   */
  protected isEqual(source: Group$v1, entity: Group$v1): boolean {
    const strSource = JSON.stringify(source);
    const strEntity = JSON.stringify(entity);

    return strSource === strEntity;
  }
}
