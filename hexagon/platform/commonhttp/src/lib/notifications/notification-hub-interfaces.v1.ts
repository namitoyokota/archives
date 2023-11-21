import { HubConnection } from '@microsoft/signalr';

/**
 * Represents a notification event
 */
export interface CommonNotificationEvent$v1<T> {
  /**
   * The string name of the event. This should match
   * the signalR hub event name.
   */
  eventName: string;

  /**The data that is returned from the event.*/
  data: T;
}

/**
 * Interface for adding events request
 */
export interface AddEventsAsyncRequest$v1 {
  /** Event names */
  eventNames: string | string[];

  /** Child context id */
  childContextId: string;
}

/**
 * Connection to signalR hub
 */
export interface CommonHubConnection$v1 {
  /** The hub connection */
  hub: HubConnection;

  /** The access token */
  accessToken: string;
}

/**
 * Request to invoke a method request
 */
export interface InvokeMethodRequest$v1<T> {
  /** Method */
  methodName: string;

  /** Params */
  params: T;
}

export interface ConnectionStatusMsg$v1 {
  /** True if connection is open */
  connectionOpen: boolean;

  /** True if connection is closed */
  connectionClose: boolean;
}
