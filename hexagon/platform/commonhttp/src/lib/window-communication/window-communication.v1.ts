/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { WindowMessage$v1 } from './window-communication-msg.v1';

/**
 * Allows communication between different windows in an applications. On windows
 * is designated the master windows and all the others are child windows. This
 * class should be instantiated as a global singleton to avoid have multiple processors
 * of window messages.
 */
export class WindowCommunication$v1 {
  /**
   * Event that a new message has been received
   */
  receiveMessage$ = new ReplaySubject<WindowMessage$v1<any>>(100, 2000);

  /**
   * The origin a message came from or sent to.
   * For security reasons only messages with correct origins
   * will be processed.
   */
  private originUrl = '';

  /**
   * Collection of window handles.
   * Key is the handle id. Value is the window reference.
   */
  private windowHandles = new Map<string, Window>();

  constructor() {
    this.originUrl = this.buildOriginUrl();
    this.initWindowListener();

    // Set up for child to child window comm
    if (!this.isChildWindow()) {
      this.receiveMessage$
        .pipe(filter((msg) => !!msg.handleId))
        .subscribe((msg) => {
          // Push this msg to a child window
          this.messageWindow(msg);
        });
    }
  }

  /**
   * Returns true if window is controlled by a master window
   */
  isChildWindow(): boolean {
    return !!window.opener;
  }

  /**
   * Returns true if the window had child window handles
   */
  hasHandles(): boolean {
    return !!this.windowHandles.size;
  }

  /**
   * Returns true if the handle exists and is open
   * @param handleId The handle id to check if exists
   */
  hasHandle(handleId: string): boolean {
    if (this.windowHandles.has(handleId)) {
      // Check if the window reference is closed
      if (this.windowHandles.get(handleId).closed) {
        // Destroy the window handle
        this.destroyHandle(handleId);
      } else {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns a list of window handle ids
   */
  getHandleIds(): string[] {
    const handleIdList: string[] = [];
    this.windowHandles.forEach((_value, key) => {
      handleIdList.push(key);
    });

    return handleIdList;
  }

  /**
   * Sets a window as having focus
   * @param handleId The handle id to set as focused window
   */
  setFocus(handleId: string): void {
    if (this.hasHandle(handleId)) {
      this.windowHandles.get(handleId).focus();
    }
  }

  /**
   * Create a new handle to a window
   * @param handleId The id of the window handle
   * @param windowHandle The handle reference to a window
   */
  createHandle(handleId: string, windowHandle: Window): void {
    if (!this.hasHandle(handleId)) {
      this.windowHandles.set(handleId, windowHandle);
    } else {
      throw new Error(`Handle id ${handleId} already exists.`);
    }
  }

  /**
   * Destroys a window handle
   * @param handleId The handle id to the window handle to destroy
   */
  destroyHandle(handleId: string): void {
    if (this.windowHandles.has(handleId)) {
      if (!this.windowHandles.get(handleId).closed) {
        this.windowHandles.get(handleId).close();
      }
      this.windowHandles.delete(handleId);
    }
  }

  /**
   * Destroy all child windows
   */
  destroyAll(): void {
    this.windowHandles.forEach((_handle: Window, handleId: string) => {
      this.destroyHandle(handleId);
    });
  }

  /**
   * Sends a message to window
   * @param message The message to send to a window
   */
  messageWindow<T>(message: WindowMessage$v1<T>): void {
    if (this.hasHandle(message.handleId)) {
      this.windowHandles
        .get(message.handleId)
        .postMessage(message, this.originUrl);
    } else if (this.isChildWindow()) {
      this.messageMaster(message);
    }
  }

  /**
   * Sends a message to the master window
   * @param message The message to send to a window
   */
  messageMaster<T>(message: WindowMessage$v1<T>): void {
    window.opener.postMessage(message, this.originUrl);
  }

  /**
   * Fired when a message is received from a window.
   * @param msg The message received through the window event channel.
   */
  private messageReceived(msg: WindowMessage$v1<never>): void {
    if (msg.origin !== this.originUrl) {
      console.warn('Window Communication Service: Message from unknown origin');
    } else {
      this.receiveMessage$.next(msg.data);
    }
  }

  /**
   * Build the url string that will be used as the origin
   */
  private buildOriginUrl(): string {
    const pathArray = location.href.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    return protocol + '//' + host;
  }

  /**
   * Listen to window events for messages
   */
  private initWindowListener(): void {
    if (window.addEventListener) {
      window.addEventListener(
        'message',
        this.messageReceived.bind(this),
        false
      );
    } else {
      // The use of any here is a work around for a known issue. https://github.com/Microsoft/TypeScript/issues/3953
      (<any>window).attachEvent('onmessage', this.messageReceived.bind(this));
    }
  }
}
