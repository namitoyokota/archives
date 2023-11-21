import { UserInfo$v1 } from './user-info.v1';
import { UsersGroup$v1 } from './users-group.v1';

export class UsersGroups$v1 {
  /** A list of users */
  users?: UserInfo$v1[];

  /** A list of groups and users in the groups */
  groups?: UsersGroup$v1[];

  constructor(params: UsersGroups$v1 = {} as UsersGroups$v1) {
    const { users = [], groups = [] } = params;

    this.users = users?.length
      ? users.map((user) => new UserInfo$v1(user))
      : users;
    this.groups = groups?.length
      ? groups.map((usersGroup) => new UsersGroup$v1(usersGroup))
      : groups;
  }
}
