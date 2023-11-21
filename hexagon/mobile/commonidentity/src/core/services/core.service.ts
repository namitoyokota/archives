import { ServiceManager$v1 } from '@galileo/mobile_dynamic-injection-engine';
import { TokenManager$v1 } from '@galileo/platform_common-http';
import { UserInfo$v1, UserStore$v1 } from '@galileo/platform_commonidentity';
import { filter } from 'rxjs/operators';
import { DataService } from './data.service';
import { EnvironmentService } from './environment.service';
import { NotificationService } from './notification.service';
import { PostOffice$v1 } from '../../common';

/**
 * Core service for the capability. This services as an integration point.
 */
export class CoreService {
  constructor(
    private userStoreSrv = ServiceManager$v1.get(UserStore$v1),
    private tokenManagerSrv = ServiceManager$v1.get(TokenManager$v1),
    private dataSrv = ServiceManager$v1.get(DataService),
    private notificationSrv = ServiceManager$v1.get(NotificationService),
    private environmentSrv = ServiceManager$v1.get(EnvironmentService),
    private postOffice = ServiceManager$v1.get(PostOffice$v1)
  ) {

    // Keep user updated when token changes
    this.tokenManagerSrv.authenticationToken$.subscribe(() => {
      this.dataSrv.user?.getInfo$().subscribe((info: UserInfo$v1) => {
        this.userStoreSrv.setActiveUser(info);
      });
    });

    this.listenConnectionEstablished();
    this.initListenerForPresencesChange();
    this.initListenerForBaseUrlChange();
  }

  /**
   * Listens to the connection established event on the notification service
   */
  private listenConnectionEstablished(): void {
    this.notificationSrv?.connectionEstablished$.pipe(
      filter(isConnected => isConnected)
    ).subscribe(() => {
      this.userStoreSrv.clear();
      // TODO - Need way to get abbreviated user by id. This way only the user's that are needed
      // can be loaded.
      this.dataSrv?.user?.getAbbreviated$().subscribe((users: UserInfo$v1[]) => {
        this.userStoreSrv.upsert(users);
      }, (err) => {
        console.error('HxgnConnect:: CommonIdentity: An unexpected error occurred getting user data', err);
      });
    });
  }

  /**
   * Listen for the active user's presence to change
   */
  private initListenerForPresencesChange() {
    this.notificationSrv.presencesChange$.pipe(
      filter(notification => {
        return !!this.userStoreSrv.snapshot(notification.id);
      })
    ).subscribe((notification) => {
      // Refresh user
      this.dataSrv?.user?.getAbbreviated$([notification.id]).subscribe(users => {
        // Merge with the user that is already in the store if there is one
        const user = this.userStoreSrv.snapshot(users[0]?.id as string);

        if (user) {
          // Only update presence
          this.userStoreSrv.upsert(new UserInfo$v1({ ...user, status: users[0]?.status }));
        } else {
          // User is not in the store so need to update it
          this.userStoreSrv.upsert(new UserInfo$v1(users[0]));
        }
      });
    });
  }

  /**
   * Listen for base URL change and let the adapter know about it
   */
  private initListenerForBaseUrlChange() {
    this.environmentSrv.baseURL$.subscribe((url) => {
      this.postOffice.baseUrl$.next(url);
    });
  }

}
