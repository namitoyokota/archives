/**
 * The audio and video status of a user
 */
export enum AVStatus$v1 {
  /** User is not available for chat or video/audio calling */
  unavailable = 'Unavailable',

  /** User is available for chat or video/audio calling. */
  available = 'Available',

  /** Av Unknown  */
  unknown = 'Unknown',
}
