import { WindowMessage$v1 } from '@galileo/platform_common-http';

/**
 * Describes what a message between windows looks like.
 */
export interface WindowMessage<T> extends WindowMessage$v1<T> { }
