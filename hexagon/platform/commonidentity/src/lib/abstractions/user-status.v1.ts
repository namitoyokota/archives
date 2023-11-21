import { AVStatus$v1 } from './av-status.v1';
import { UserPresence$v1 } from './user-presence.v1';

export class UserStatus$v1 {
  /** The user's status for audio video calling */
  avStatus: AVStatus$v1;

  /** The user's presence status */
  userPresence: UserPresence$v1;

  constructor(param: UserStatus$v1 = {} as UserStatus$v1) {
    const {
      avStatus = AVStatus$v1.unknown,
      userPresence = UserPresence$v1.unknown,
    } = param;

    this.avStatus = avStatus;
    this.userPresence = userPresence;
  }
}
