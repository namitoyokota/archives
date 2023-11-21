import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { TokenManager$v1 } from '../token-manager.v1';
import { WindowMessage$v1 } from '../window-communication/window-communication-msg.v1';
import { WindowCommunication$v1 } from '../window-communication/window-communication.v1';

import { HubManager$v1 } from './hub-manager.v1';
import {
  AddEventsAsyncRequest$v1,
  CommonHubConnection$v1,
  CommonNotificationEvent$v1,
  ConnectionStatusMsg$v1,
  InvokeMethodRequest$v1,
} from './notification-hub-interfaces.v1';

/**
 * Common hub for connection to signalR
 */
export abstract class NotificationHub$v1<T> {
  /** Event when a notification event is triggered */
  protected event$ = new Subject<CommonNotificationEvent$v1<T>>();

  /**The connection to the signalR hub*/
  private signalRHubConnection: CommonHubConnection$v1 = {
    hub: null,
    accessToken: null,
  };

  /**The url to the signalR Hub.*/
  private signalRHubRootUrl: string | Promise<string> = '';

  /**
   * Collection of events that should be listen to
   * NOTE: the event should match the signalR hub event and window event.
   */
  private events: string[] = [];

  /**Buffer to hold correlation ids to filter out dup messages*/
  private correlationIdBuffer: string[] = [];

  /** Flag that is true when initialization has been completed */
  private initCompleted$ = new BehaviorSubject<boolean>(false);

  /** Flag that is true when evens are ready to have notifications fired on */
  private isReady$ = new BehaviorSubject<boolean>(false);

  /** Bus for connection established event */
  private connectionEstablished = new BehaviorSubject<boolean>(false);

  /** Bus for connection closed event*/
  private connectionClosed = new Subject<void>();

  /**Const that is appended to the context for notifications*/
  private readonly contextConst = 'COMMONNOTIFICATIONHUB';

  /** Message channel for addEventSync to listen to */
  private readonly addEventSyncContextId = '@hxgn/common-http:add-event-sync';

  /** Bus for receiving messages from the window service */
  private receiveMessageSub: Subscription;

  /** Event that is raised when the notification connection is established  */
  readonly connectionEstablished$ = this.connectionEstablished.asObservable();

  /** Event that is raised when the notification connection is closed */
  readonly connectionClosed$ = this.connectionClosed.asObservable();

  /**
   * Constructs a new notification hub
   * @param signalRRootUrl Root url for the signalr hub
   * @param tokenManager Token manager that will provide the active access token
   * @param capabilityId Id of the capability that owns the notification hub
   * @param windowComm Optional window communication to support multi-window environments
   * @param manager Optional hub manager to support multi-window environments
   */
  constructor(
    signalRRootUrl: string | Promise<string>,
    private tokenManager: TokenManager$v1,
    private capabilityId: string,
    private windowComm: WindowCommunication$v1 = null,
    private manager: HubManager$v1 = null
  ) {
    if (this.onHubInit) {
      this.onHubInit();
    }

    this.signalRHubRootUrl = signalRRootUrl;
    // Wait for event names to come back
    Promise.resolve(this.eventNames() as Promise<string[]>).then((events) => {
      this.events = events;

      this.event$.subscribe(async (event: CommonNotificationEvent$v1<T>) => {
        await this.isReadyAsync();
        this.onEvent(event.eventName, event.data);
      });

      if (windowComm?.isChildWindow()) {
        this.initNotificationConnection();
      } else {
        this.tokenManager.authenticationToken$
          .pipe(filter((token) => !!token))
          .subscribe((token) => {
            if (this.initCompleted$.getValue()) {
              this.refreshAccessToken(token);
            } else {
              this.initNotificationConnection(token);
            }
          });
      }
    });
  }

  /**
   * Mark hub as being ready to process notification events
   */
  hubEventsReady(): void {
    this.isReady$.next(true);
  }

  /**
   * Fired first thing when service is being stood up
   */
  protected onHubInit?();

  /**
   * Returns a list of event names
   */
  protected abstract eventNames(): Promise<string[]> | string[];

  /**
   * Fired when a connection is established
   */
  protected onConnectionEstablished(): void {
    this.connectionEstablished.next(true);
  }

  /**
   * Fired when a connection is closed
   */
  protected onConnectionClosed(): void {
    this.connectionEstablished.next(false);
    this.connectionClosed.next();
  }

  /**
   * Fired when a new notification is evented
   * @param eventName The string name of the event
   * @param data An associated data with event
   */
  protected abstract onEvent(eventName: string, data: T);

  /**
   * Add a new event to list of events to listen to after the hub has been initialized
   * @param eventName String name of new event to listen to. Can be a list or single event
   */
  protected async addEventAsync(eventName: string | string[]) {
    const eventNames = Array.isArray(eventName) ? eventName : [eventName];

    // If this is a child window, return a promise that will resolve when the main window
    // has added the events to the SignalR hub.
    if (this.windowComm.isChildWindow()) {
      return new Promise<void>((resolve) => {
        const childContextId = `${this.contextConst
          }:${this.newGuid()}:addEventAsyncComplete`;
        const windowMsg: WindowMessage$v1<AddEventsAsyncRequest$v1> = {
          data: {
            eventNames,
            childContextId,
          } as AddEventsAsyncRequest$v1,
          contextId: this.addEventSyncContextId,
        } as WindowMessage$v1<AddEventsAsyncRequest$v1>;

        // Need to listen for the event from the main window that the events have been wired
        // up before we resolve this promise.  Do this before we send the message to the main window.
        this.windowComm.receiveMessage$
          .pipe(
            filter((event) => event.contextId === childContextId),
            first()
          )
          .subscribe(() => {
            resolve();
          });

        // Send message to main window
        this.windowComm.messageMaster(windowMsg);
      });
    } else {
      // The main window will wait for the initialization to be complete and then
      // wire up the events
      await this.initCompleted$
        .pipe(
          filter((initDone) => initDone),
          first()
        )
        .toPromise();

      this.wireUpSignalREvents(this.signalRHubConnection.hub, eventNames);
    }
  }

  /**
   * Waits for everything to be ready
   */
  private isReadyAsync(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.isReady$.pipe(filter((isReady) => isReady)).subscribe(() => {
        resolve();
      });
    });
  }

  /**
   * Used to refresh the access token without causing a disconnect
   * @param token New access token
   */
  private refreshAccessToken(token: string): void {
    //If child window do nothing
    if (this.windowComm?.isChildWindow()) {
      return;
    }

    // Only the main window should do this
    this.hubInvoke<boolean, string>('RefreshAccessTokenAsync', token)
      .then((isValid) => {
        if (!isValid) {
          throw new Error('Invalid access token');
        }
      })
      .catch((err) => {
        this.stopConnection(this.signalRHubConnection.hub);
        console.error(
          `Common notification hub ${this.capabilityId}:: refreshAccessToken: Could not refresh token!`,
          err
        );

        // Need to go through the whole reconnection logic now
        this.initNotificationConnection(token);
      });
  }

  /**
   * Invokes a method on the hub.
   * @param methodName name of the method to invoke
   * @param params The params to pass to the method
   */
  async hubInvoke<T, E>(methodName: string, params: E): Promise<T> {
    if (this.windowComm && this.windowComm.isChildWindow()) {
      return new Promise((resolve) => {
        const windowMsg: WindowMessage$v1<InvokeMethodRequest$v1<E>> = {
          data: {
            methodName,
            params,
          } as InvokeMethodRequest$v1<E>,
          contextId: `${this.contextConst}:${this.capabilityId}:method`,
        } as WindowMessage$v1<InvokeMethodRequest$v1<E>>;
        this.windowComm.messageMaster(windowMsg);
        resolve(null);
      });
    } else {
      await this.initCompleted$
        .pipe(
          filter((initDone) => initDone),
          first()
        )
        .toPromise();

      return this.signalRHubConnection.hub.invoke(methodName, params);
    }
  }

  /**
   * Sets up the correct connection based on if the windows is a child window.
   * Will wait for after authentication is ready before setting up a connection.
   * @param accessToken The access token used to create hub connection
   */
  private async initNotificationConnection(accessToken: string = null) {
    if (this.windowComm && this.windowComm.isChildWindow()) {
      if (this.manager) {
        this.manager.initHub(this.capabilityId);
      }

      this.wireUpWindowCommSrvEvents();
      return;
    } else if (this.windowComm) {
      // Make sure to service invoke method request from child windows
      this.listenToChildWindowMethodInvokeRequest();

      // Service addEventAsync requests
      this.listenToChildWindowAddEventsAsyncRequest();
    }

    if (!this.windowComm || !this.windowComm?.isChildWindow()) {
      if (this.signalRHubConnection.accessToken) {
        await this.stopConnection(this.signalRHubConnection.hub);
      }

      this.signalRHubConnection.hub = await this.initSignalRConnection(accessToken);
      this.signalRHubConnection.accessToken = accessToken;
    }
  }

  /**
   * Wire up all the signalR events to the connection
   * @param hubConn The signalR hub connection
   */
  private wireUpSignalREvents(hubConn: HubConnection, events: string[]) {
    // Warn that there are no events
    if (!events.length) {
      console.warn(
        '"events" are empty! No notification events created.',
        this.signalRHubRootUrl,
        this.events
      );
    }

    events.forEach((event) => {
      hubConn.on(event, (data) => {
        const notificationEvent: CommonNotificationEvent$v1<T> = {
          eventName: event,
          data: data,
        };

        if (
          !data.systemCorrelationId ||
          this.isNewMsg(data.systemCorrelationId)
        ) {
          // Trigger events for this window
          this.event$.next(notificationEvent);

          // Pass events to window service
          // Pass events to window service
          if (this.windowComm?.hasHandles()) {
            this.notifyChildWindows(notificationEvent);
          }
        }
      });
    });
  }

  /**
   * Sets up connection to the signalR hub
   */
  private async initSignalRConnection(accessToken: string): Promise<HubConnection> {
    let hubURL = await this.signalRHubRootUrl;
    if (hubURL.includes('?')) {
      hubURL = hubURL + `&access_token=${accessToken}`;
    } else {
      hubURL = hubURL + `?access_token=${accessToken}`;
    }

    // Create the connection if this if first time through
    const signalRHubConnection = new HubConnectionBuilder()
      .withUrl(hubURL, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .configureLogging(LogLevel.Critical)
      .build();

    // Handle signalR close events
    signalRHubConnection.onclose((err) => {
      this.onHubClosed(err);
    });

    // Wire up the events
    this.wireUpSignalREvents(signalRHubConnection, this.events);

    //  Start the signalR hub connection
    this.startSignalRHub({
      hub: signalRHubConnection,
      accessToken: accessToken,
    });

    return signalRHubConnection;
  }

  /**
   * Stops a hub connection if is is connected
   * @param conn The connection to stop
   */
  private async stopConnection(conn: HubConnection) {
    if (conn.state === HubConnectionState.Connected) {
      await conn.stop().catch((err) => {
        console.error('Could not stop old connection', err);

        // Wait a second and try again
        setTimeout(async () => {
          await this.stopConnection(conn);
        }, 1000);
      });
    } else {
      console.warn('SignalR: Could not close an already closed connection');
    }
  }

  /**
   * What should be done when a signalR hub connection dies
   * @param err Error that closed the signalR connection
   */
  private async onHubClosed(err?: Error) {
    if (err) {
      console.error('SignalR connection closed with error:', err);
    }

    this.onConnectionClosed();
    // Pass events to window service
    if (this.windowComm?.hasHandles()) {
      this.notifyChildWindows<ConnectionStatusMsg$v1>({
        connectionClose: true,
      } as ConnectionStatusMsg$v1);
    }

    timer(1000)
      .pipe(first())
      .subscribe(() => {
        if (
          this.signalRHubConnection.hub.state ===
          HubConnectionState.Disconnected
        ) {
          this.startSignalRHub(this.signalRHubConnection);
        }
      });
  }

  /**
   * Starts a signalR hub connection
   * @param hubConn The signalR hub connection
   */
  private startSignalRHub(hubConn: CommonHubConnection$v1): void {
    hubConn.hub.serverTimeoutInMilliseconds = 1800000;
    hubConn.hub
      .start()
      .then(() => {
        this.onConnectionEstablished();

        if (!this.initCompleted$.getValue()) {
          this.initCompleted$.next(true);
        }

        // Pass events to window service
        if (this.windowComm?.hasHandles()) {
          this.notifyChildWindows({
            connectionOpen: true,
          });
        }
      })
      .catch((err) => {
        console.error('Error while establishing signalR connection:', err);
        // Don't try to start the connection if the error is the connection is not disconnected
        if (
          err.message !==
          `Cannot start a connection that is not in the 'Disconnected' state.`
        ) {
          // Try to connect again after 1 second
          setTimeout(() => {
            if (hubConn.hub.state === HubConnectionState.Disconnected) {
              this.startSignalRHub(hubConn);
            }
          }, 1000);
        } else {
          console.warn('SignalR: Do not start an open connection');
        }
      });
  }

  /**
   * Checks the event buffer to make sure the message has not already been sent
   * This is needed since we have a sliding signalR connection. It is possible to have
   * two different connection to the same hub open at once during authentication refresh.
   * @param correlationId The id the check if is in buffer
   */
  private isNewMsg(correlationId: string): boolean {
    // Return true for messages that do not have a correlation id
    if (!correlationId) {
      return true;
    }

    const foundId = this.correlationIdBuffer.find((id) => id === correlationId);

    if (foundId) {
      return false;
    } else {
      this.correlationIdBuffer.unshift(correlationId); // Add to correlation buffer
      this.correlationIdBuffer = this.correlationIdBuffer.slice(0, 50); // Keep buffer small
      return true;
    }
  }

  /**
   * Set up the window communication service channel
   */
  private wireUpWindowCommSrvEvents() {
    if (!this.receiveMessageSub) {
      this.receiveMessageSub = this.windowComm.receiveMessage$
        .pipe(
          filter((event) => {
            if (
              !event.contextId ||
              event.contextId !== `${this.contextConst}:${this.capabilityId}`
            ) {
              return false;
            }
            return true;
          })
        )
        .subscribe((msg: WindowMessage$v1<ConnectionStatusMsg$v1>) => {
          // Check for connection life cycle events
          if (msg.data.connectionOpen) {
            this.onConnectionEstablished();
          } else if (msg.data.connectionClose) {
            this.onConnectionClosed();
          } else {
            this.event$.next(msg.data as never);
          }
        });

      // Window comm channel is connected
      setTimeout(() => {
        this.onConnectionEstablished();
      });
    }
  }

  /**
   * Listens for child window messages to invoice a hub method
   */
  private listenToChildWindowMethodInvokeRequest(): void {
    this.windowComm.receiveMessage$
      .pipe(
        filter((event) => {
          if (
            !event.contextId ||
            event.contextId !==
            `${this.contextConst}:${this.capabilityId}:method`
          ) {
            return false;
          }
          return true;
        })
      )
      .subscribe((msg: WindowMessage$v1<InvokeMethodRequest$v1<unknown>>) => {
        // Check for connection life cycle events
        if (msg.data.methodName) {
          this.hubInvoke(msg.data.methodName, msg.data.params);
        } else {
          console.error(
            `Common notification hub ${this.capabilityId}:: invokeMethod: Can not invoke a method on a closed connection`
          );
          // Not connected so method invoke can't happen
        }
      });
  }

  /**
   * Listens for child window messages to addEventsAsync so that the events can be
   * hooked up to the SignalR hub.
   */
  private listenToChildWindowAddEventsAsyncRequest(): void {
    this.windowComm.receiveMessage$
      .pipe(
        filter((event) => {
          if (
            !event.contextId ||
            event.contextId !== this.addEventSyncContextId
          ) {
            return false;
          }
          return true;
        })
      )
      .subscribe(async (msg: WindowMessage$v1<AddEventsAsyncRequest$v1>) => {
        // Call the hubs addEventSync method to hook up the events with the signalR hub.
        await this.addEventAsync(msg.data.eventNames);
        // Notify the child window that sent the addEventAsync call
        this.notifyChildWindows(true, msg.data.childContextId);
      });
  }

  /**
   * Sends event to child windows through the common window communication service.
   * @param event The event to send to child windows
   */
  private notifyChildWindows<T>(event: T, contextId?: string) {
    if (!contextId) {
      contextId = `${this.contextConst}:${this.capabilityId}`;
    }
    this.windowComm.getHandleIds().forEach((handleId) => {
      const windowMsg: WindowMessage$v1<T> = {
        handleId: handleId,
        data: event,
        contextId: contextId,
      };

      this.windowComm.messageWindow(windowMsg);
    });
  }

  /**
   * Creates a new GUID
   */
  private newGuid(): string {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return (
      s4() +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      s4() +
      s4()
    );
  }
}
