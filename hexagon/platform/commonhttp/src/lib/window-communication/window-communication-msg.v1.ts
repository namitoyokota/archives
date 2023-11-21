/**
 * Describes what a message between windows looks like.
 */
export interface WindowMessage$v1<T> {
  /**
   * Unique id to a window handle
   */
  handleId: string;

  /**
   * Data payload of window message
   */
  data: T;

  /**
   * An id that can be used to filter on messages between windows
   */
  contextId?: string;

  /**
   * Url of the origin of the message
   */
  origin?: string;
}
