import { Store$v1 } from '@galileo/platform_common-libraries';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { UserInfo$v1 } from '../abstractions/user-info.v1';

export class UserStore$v1 extends Store$v1<UserInfo$v1> {
  /** The currently logged in user */
  private activeUser = new BehaviorSubject<UserInfo$v1>(null);

  /** The currently logged in user. Is combined with the current user in the store
   * to get the user status since it does not come down on the user info call
   */
  activeUser$ = combineLatest([
    this.activeUser.asObservable(),
    this.entity$,
  ]).pipe(
    filter(([user, users]) => !!user && !!users?.length),
    map(([user, users]) => {
      const foundUser = users.find((u) => u.id === user?.id);

      if (!user || !foundUser) {
        return null;
      }

      return new UserInfo$v1({ ...user, status: foundUser?.status });
    })
  );

  constructor() {
    super('id', UserInfo$v1);
  }

  /**
   * Sets the currently logged in user
   * @param user The currently logged in user
   */
  setActiveUser(user: UserInfo$v1): void {
    this.activeUser.next(new UserInfo$v1(user));
  }

  /**
   * Returns a snapshot of the active user data
   */
  activeUserSnapshot(): UserInfo$v1 {
    const user = this.activeUser.getValue();
    if (user) {
      return new UserInfo$v1(this.activeUser.getValue());
    } else {
      return null;
    }

  }
}
