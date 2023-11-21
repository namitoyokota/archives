import { Group$v1 } from './group.v1';
import { UserInfo$v1 } from './user-info.v1';

export class UsersGroup$v1 {
  /** The group the users belong to */
  group: Group$v1;

  /** The users in the group */
  users: UserInfo$v1[];

  constructor(params: UsersGroup$v1 = {} as UsersGroup$v1) {
    const { group = null, users = [] } = params;

    this.group = group ? new Group$v1(group) : group;
    this.users = users?.length
      ? users.map((user) => new UserInfo$v1(user))
      : users;
  }
}
